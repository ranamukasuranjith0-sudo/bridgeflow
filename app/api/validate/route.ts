import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { id, type, action } = await request.json()

    // Client normal pour vérifier l'utilisateur
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Client admin qui bypasse les RLS pour l'update
    const supabaseAdmin = createSupabaseAdminClient()

    const newStatus = action === 'validate' ? 'validated' : 'rejected'
    const table = type === 'candidate' ? 'candidates' : 'companies'

    const { error } = await supabaseAdmin
      .from(table)
      .update({ status: newStatus })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Envoi d'email uniquement à la validation
    if (action === 'validate') {
      const { data: profileData } = await supabaseAdmin
        .from(table)
        .select(type === 'candidate' ? 'name, email' : 'company_name, contact_name, email')
        .eq('id', id)
        .single() as { data: any }

      if (profileData?.email) {
        const isCandidate = type === 'candidate'
        const recipientName = isCandidate
          ? profileData.name
          : `${profileData.contact_name ?? ''} (${profileData.company_name})`

        const subject = isCandidate
          ? '✅ Votre profil BridgeFlow est validé — accès au Match activé'
          : '✅ Votre compte BridgeFlow est validé — accès au Match activé'

        const html = isCandidate
          ? `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
              <div style="background: #0a0a0f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                <div style="font-size: 22px; font-weight: 700; color: #c8a96e; letter-spacing: 0.02em;">BridgeFlow</div>
                <div style="font-size: 12px; color: #888; margin-top: 2px;">Management de transition d'élite</div>
              </div>
              <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px; font-size: 20px;">Bonjour ${recipientName},</h2>
                <p style="color: #444; line-height: 1.6;">
                  Votre profil a été <strong>validé par notre équipe</strong> suite à votre entretien de qualification.
                </p>
                <p style="color: #444; line-height: 1.6;">
                  Vous avez désormais accès à l'espace <strong>Match</strong> — découvrez les missions disponibles et signalez votre intérêt en un clic.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="https://www.bridgeflow.consulting/dashboard/match"
                    style="background: #c8a96e; color: #0a0a0f; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block;">
                    Accéder à mes missions →
                  </a>
                </div>
                <p style="color: #888; font-size: 12px; line-height: 1.6;">
                  Si vous avez des questions, répondez directement à cet email ou écrivez-nous à
                  <a href="mailto:contact@bridgeflow.consulting" style="color: #c8a96e;">contact@bridgeflow.consulting</a>
                </p>
              </div>
            </div>
          `
          : `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
              <div style="background: #0a0a0f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                <div style="font-size: 22px; font-weight: 700; color: #c8a96e; letter-spacing: 0.02em;">BridgeFlow</div>
                <div style="font-size: 12px; color: #888; margin-top: 2px;">Management de transition d'élite</div>
              </div>
              <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px; font-size: 20px;">Bonjour ${recipientName},</h2>
                <p style="color: #444; line-height: 1.6;">
                  Votre compte entreprise a été <strong>validé par notre équipe</strong> suite à votre appel de qualification.
                </p>
                <p style="color: #444; line-height: 1.6;">
                  Vous avez désormais accès à l'espace <strong>Match</strong> — consultez les profils disponibles et validez ceux qui correspondent à vos besoins.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="https://www.bridgeflow.consulting/dashboard/match"
                    style="background: #c8a96e; color: #0a0a0f; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block;">
                    Accéder aux profils →
                  </a>
                </div>
                <p style="color: #888; font-size: 12px; line-height: 1.6;">
                  Si vous avez des questions, écrivez-nous à
                  <a href="mailto:contact@bridgeflow.consulting" style="color: #c8a96e;">contact@bridgeflow.consulting</a>
                </p>
              </div>
            </div>
          `

        await resend.emails.send({
          from: 'BridgeFlow <contact@bridgeflow.consulting>',
          to: profileData.email,
          subject,
          html,
        })
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('Validate error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
