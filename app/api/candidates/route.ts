import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name, email, phone, role_function, tjm,
      location, availability, legal_status, mobility,
      experience_summary, sectors, cv_url,
    } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { data: candidate, error: dbError } = await supabase
      .from('candidates')
      .insert({
        user_id: session?.user.id ?? null,
        name,
        email,
        phone: phone ?? null,
        role_function: role_function ?? null,
        tjm: tjm ?? null,
        location: location ?? null,
        availability: availability ?? null,
        legal_status: legal_status ?? null,
        mobility: mobility ?? null,
        experience_summary: experience_summary ?? null,
        sectors: sectors ?? [],
        cv_url: cv_url ?? null,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Send confirmation emails
    try {
      // Email to candidate
      await resend.emails.send({
        from: 'BridgeFlow <onboarding@resend.dev>',
        to: [email],
        subject: 'Votre dossier BridgeFlow a bien été reçu ✓',
        html: candidateConfirmationEmail(name),
      })

      // Email to admin
      const adminEmail = process.env.ADMIN_EMAIL ?? 'suranjith.ranamuka@hotmail.com'
      await resend.emails.send({
        from: 'BridgeFlow <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `Nouvelle candidature — ${name}`,
        html: adminCandidateEmail(name, email, role_function, tjm, location, availability),
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ candidate }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function candidateConfirmationEmail(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0f;color:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;padding:0;margin:0;">
  <div style="max-width:560px;margin:40px auto;background:#13131a;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#13131a,rgba(200,169,110,0.08));padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <div style="font-family:Georgia,serif;font-size:24px;color:#c8a96e;margin-bottom:4px;">Bridge<em>Flow</em></div>
      <div style="font-size:11px;color:#5a5870;letter-spacing:0.08em;">MANAGEMENT DE TRANSITION</div>
    </div>
    <div style="padding:32px;">
      <h1 style="font-family:Georgia,serif;font-size:26px;color:#f0ede8;margin:0 0 12px;">Félicitations, ${name} 🎉</h1>
      <p style="color:#8a8799;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Votre dossier BridgeFlow a bien été reçu et est en cours d'examen. Nous vous contacterons très prochainement pour planifier votre entretien de qualification.
      </p>
      <div style="background:#1c1c27;border-left:3px solid #c8a96e;border-radius:4px;padding:16px 20px;margin:0 0 24px;">
        <div style="font-size:13px;color:#c8a96e;font-weight:600;margin-bottom:8px;">Prochaines étapes</div>
        <div style="font-size:13px;color:#8a8799;line-height:1.8;">
          ✓ Dossier reçu et enregistré<br>
          ⏳ Entretien de qualification (20-30 min)<br>
          ○ Validation et accès aux missions BridgeFlow
        </div>
      </div>
      <p style="color:#5a5870;font-size:12px;margin:0;">
        Questions ? Répondez à cet email ou contactez-nous à <span style="color:#c8a96e;">contact@bridgeflow.io</span>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

function adminCandidateEmail(
  name: string, email: string, roleFunction?: string,
  tjm?: number, location?: string, availability?: string
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="background:#0a0a0f;color:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;padding:0;margin:0;">
  <div style="max-width:560px;margin:40px auto;background:#13131a;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
    <div style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <div style="font-family:Georgia,serif;font-size:20px;color:#c8a96e;">Bridge<em>Flow</em> — Admin</div>
    </div>
    <div style="padding:28px 32px;">
      <h2 style="font-size:20px;margin:0 0 16px;color:#f0ede8;">Nouvelle candidature reçue 📄</h2>
      <div style="background:#1c1c27;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <div style="display:grid;gap:8px;">
          <div style="font-size:14px;"><span style="color:#5a5870;">Nom :</span> <strong>${name}</strong></div>
          <div style="font-size:14px;"><span style="color:#5a5870;">Email :</span> ${email}</div>
          ${roleFunction ? `<div style="font-size:14px;"><span style="color:#5a5870;">Fonction :</span> ${roleFunction}</div>` : ''}
          ${tjm ? `<div style="font-size:14px;"><span style="color:#5a5870;">TJM :</span> ${tjm} €/j</div>` : ''}
          ${location ? `<div style="font-size:14px;"><span style="color:#5a5870;">Localisation :</span> ${location}</div>` : ''}
          ${availability ? `<div style="font-size:14px;"><span style="color:#5a5870;">Disponibilité :</span> ${availability}</div>` : ''}
        </div>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/admin"
         style="display:inline-block;background:#c8a96e;color:#0a0a0f;padding:10px 24px;border-radius:50px;font-size:13px;font-weight:600;text-decoration:none;">
        Voir dans le tableau de bord →
      </a>
    </div>
  </div>
</body>
</html>
  `
}
