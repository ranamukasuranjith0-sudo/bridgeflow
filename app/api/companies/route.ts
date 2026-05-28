import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      company_name, contact_name, email, phone, size,
      role_needed, duration, budget_tjm, location,
      start_date, context, required_skills,
    } = body

    if (!company_name || !email) {
      return NextResponse.json({ error: "Nom de l'entreprise et email requis" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { data: company, error: dbError } = await supabase
      .from('companies')
      .insert({
        user_id: session?.user.id ?? null,
        company_name,
        contact_name: contact_name ?? null,
        email,
        phone: phone ?? null,
        size: size ?? null,
        role_needed: role_needed ?? null,
        duration: duration ?? null,
        budget_tjm: budget_tjm ?? null,
        location: location ?? null,
        start_date: start_date ?? null,
        context: context ?? null,
        required_skills: required_skills ?? [],
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
      // Email to company
      await resend.emails.send({
        from: 'BridgeFlow <onboarding@resend.dev>',
        to: [email],
        subject: 'BridgeFlow — Votre besoin a bien été enregistré ✓',
        html: companyConfirmationEmail(contact_name ?? company_name, company_name),
      })

      // Email to admin
      const adminEmail = process.env.ADMIN_EMAIL ?? 'suranjith.ranamuka@hotmail.com'
      await resend.emails.send({
        from: 'BridgeFlow <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `Nouvelle entreprise — ${company_name}`,
        html: adminCompanyEmail(company_name, contact_name, email, role_needed, budget_tjm, location),
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function companyConfirmationEmail(contactName: string, companyName: string): string {
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
      <h1 style="font-family:Georgia,serif;font-size:26px;color:#f0ede8;margin:0 0 12px;">Votre besoin est enregistré 📋</h1>
      <p style="color:#8a8799;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Bonjour ${contactName},<br><br>
        Votre besoin pour <strong>${companyName}</strong> a bien été enregistré. Je vous appellerai dans les <strong>24h</strong> avec 2-3 profils de managers ciblés.
      </p>
      <div style="background:#1c1c27;border-left:3px solid #c8a96e;border-radius:4px;padding:16px 20px;margin:0 0 24px;">
        <div style="font-size:13px;color:#c8a96e;font-weight:600;margin-bottom:8px;">Ce que vous recevrez</div>
        <div style="font-size:13px;color:#8a8799;line-height:1.8;">
          ✓ Besoin enregistré<br>
          ⏳ Appel de qualification (20-30 min)<br>
          ○ 2-3 profils ciblés sous 24h après l'appel
        </div>
      </div>
      <p style="color:#5a5870;font-size:12px;margin:0;">
        Pas 20 CVs. Uniquement les profils qui correspondent vraiment à votre contexte.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

function adminCompanyEmail(
  companyName: string, contactName?: string, email?: string,
  roleNeeded?: string, budgetTjm?: number, location?: string
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
      <h2 style="font-size:20px;margin:0 0 16px;color:#f0ede8;">Nouvelle entreprise 🏢</h2>
      <div style="background:#1c1c27;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <div style="display:grid;gap:8px;">
          <div style="font-size:14px;"><span style="color:#5a5870;">Entreprise :</span> <strong>${companyName}</strong></div>
          ${contactName ? `<div style="font-size:14px;"><span style="color:#5a5870;">Contact :</span> ${contactName}</div>` : ''}
          ${email ? `<div style="font-size:14px;"><span style="color:#5a5870;">Email :</span> ${email}</div>` : ''}
          ${roleNeeded ? `<div style="font-size:14px;"><span style="color:#5a5870;">Profil recherché :</span> ${roleNeeded}</div>` : ''}
          ${budgetTjm ? `<div style="font-size:14px;"><span style="color:#5a5870;">Budget TJM :</span> ${budgetTjm} €/j</div>` : ''}
          ${location ? `<div style="font-size:14px;"><span style="color:#5a5870;">Localisation :</span> ${location}</div>` : ''}
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
