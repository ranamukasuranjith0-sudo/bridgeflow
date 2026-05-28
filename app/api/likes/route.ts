import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target_id, target_type, user_id } = body

    if (!target_id || !target_type) {
      return NextResponse.json({ error: 'target_id et target_type requis' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    const effectiveUserId = user_id ?? session?.user.id
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Insert the like (ignore conflict = already liked)
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .upsert({
        user_id: effectiveUserId,
        target_id,
        target_type,
      }, { onConflict: 'user_id,target_id,target_type' })
      .select()
      .single()

    if (likeError) {
      console.error('Like error:', likeError)
      // If it's a conflict error, proceed with match check anyway
    }

    // ── Match detection ──
    let matched = false
    let matchRecord = null

    if (target_type === 'mission') {
      // Manager liked a mission → check if the company owning that mission already liked this manager
      const { data: mission } = await supabase
        .from('missions')
        .select('id, company_id')
        .eq('id', target_id)
        .single()

      if (mission?.company_id) {
        // Get the candidate profile for the current user
        const { data: candidateProfile } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', effectiveUserId)
          .single()

        if (candidateProfile) {
          // Get the company's user_id to check their likes
          const { data: company } = await supabase
            .from('companies')
            .select('id, user_id')
            .eq('id', mission.company_id)
            .single()

          if (company?.user_id) {
            const { data: companyLike } = await supabase
              .from('likes')
              .select('id')
              .eq('user_id', company.user_id)
              .eq('target_id', candidateProfile.id)
              .eq('target_type', 'candidate')
              .single()

            if (companyLike) {
              matched = true
              // Create match record
              const { data: newMatch } = await supabase
                .from('matches')
                .upsert({
                  candidate_id: candidateProfile.id,
                  company_id: mission.company_id,
                  mission_id: mission.id,
                  status: 'confirmed',
                  calendly_sent: false,
                })
                .select()
                .single()

              matchRecord = newMatch

              // Send match notification emails
              if (newMatch) {
                await sendMatchEmails(supabase, candidateProfile.id, company.id, mission.id)
              }
            }
          }
        }
      }
    } else if (target_type === 'candidate') {
      // Company liked a candidate → check if that candidate liked any of this company's missions
      const { data: companyProfile } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', effectiveUserId)
        .single()

      if (companyProfile) {
        // Get the missions for this company
        const { data: companyMissions } = await supabase
          .from('missions')
          .select('id')
          .eq('company_id', companyProfile.id)

        const missionIds = (companyMissions ?? []).map(m => m.id)

        if (missionIds.length > 0) {
          // Get the candidate's user_id
          const { data: candidate } = await supabase
            .from('candidates')
            .select('id, user_id')
            .eq('id', target_id)
            .single()

          if (candidate?.user_id) {
            // Check if candidate liked any of company's missions
            const { data: candidateLike } = await supabase
              .from('likes')
              .select('id, target_id')
              .eq('user_id', candidate.user_id)
              .eq('target_type', 'mission')
              .in('target_id', missionIds)
              .limit(1)
              .single()

            if (candidateLike) {
              matched = true
              const { data: newMatch } = await supabase
                .from('matches')
                .upsert({
                  candidate_id: candidate.id,
                  company_id: companyProfile.id,
                  mission_id: candidateLike.target_id,
                  status: 'confirmed',
                  calendly_sent: false,
                })
                .select()
                .single()

              matchRecord = newMatch

              if (newMatch) {
                await sendMatchEmails(supabase, candidate.id, companyProfile.id, candidateLike.target_id)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ like, matched, match: matchRecord }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function sendMatchEmails(
  supabase: ReturnType<typeof import('@/lib/supabase-server').createSupabaseServerClient>,
  candidateId: string,
  companyId: string,
  missionId: string
) {
  try {
    const [{ data: candidate }, { data: company }, { data: mission }] = await Promise.all([
      supabase.from('candidates').select('name, email').eq('id', candidateId).single(),
      supabase.from('companies').select('company_name, email').eq('id', companyId).single(),
      supabase.from('missions').select('title, tjm, duration, location').eq('id', missionId).single(),
    ])

    if (candidate && company && mission) {
      const matchEmailHtml = matchNotificationEmail(
        candidate.name,
        company.company_name,
        mission.title,
        mission.tjm,
        mission.duration,
        mission.location
      )

      await Promise.all([
        resend.emails.send({
          from: 'BridgeFlow <onboarding@resend.dev>',
          to: [candidate.email],
          subject: `🎯 Match Mutuel ! ${company.company_name} — ${mission.title}`,
          html: matchEmailHtml,
        }),
        resend.emails.send({
          from: 'BridgeFlow <onboarding@resend.dev>',
          to: [company.email],
          subject: `🎯 Match Mutuel ! ${candidate.name} — ${mission.title}`,
          html: matchEmailHtml,
        }),
      ])
    }
  } catch (err) {
    console.error('Match email error:', err)
  }
}

function matchNotificationEmail(
  candidateName: string,
  companyName: string,
  missionTitle: string,
  tjm: number | null,
  duration: string | null,
  location: string | null
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0f;color:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;padding:0;margin:0;">
  <div style="max-width:560px;margin:40px auto;background:#13131a;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#13131a,rgba(200,169,110,0.12));padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
      <div style="font-size:52px;margin-bottom:12px;">🎯</div>
      <div style="font-family:Georgia,serif;font-size:32px;color:#c8a96e;margin-bottom:8px;">Match Mutuel !</div>
      <div style="font-size:14px;color:#8a8799;">Les deux parties ont validé ce profil</div>
    </div>
    <div style="padding:32px;">
      <div style="background:#1c1c27;border-radius:12px;padding:20px;margin:0 0 24px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;">
          <span style="color:#5a5870;">Manager</span><strong>${candidateName}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;">
          <span style="color:#5a5870;">Entreprise</span><strong>${companyName}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;">
          <span style="color:#5a5870;">Mission</span><strong>${missionTitle}</strong>
        </div>
        ${tjm ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;"><span style="color:#5a5870;">TJM</span><strong>${tjm.toLocaleString('fr-FR')} €/j${duration ? ` · ${duration}` : ''}</strong></div>` : ''}
        ${location ? `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;"><span style="color:#5a5870;">Lieu</span><strong>${location}</strong></div>` : ''}
      </div>
      <div style="text-align:center;margin:0 0 24px;">
        <a href="#" style="display:inline-block;background:linear-gradient(135deg,#60a5fa,#a78bfa);color:white;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;">
          📅 Planifier l'entretien via Calendly
        </a>
      </div>
      <p style="color:#5a5870;font-size:12px;text-align:center;margin:0;">
        Notre équipe BridgeFlow coordonne la prise de contact. Vous recevrez le lien Calendly séparément.
      </p>
    </div>
  </div>
</body>
</html>
  `
}
