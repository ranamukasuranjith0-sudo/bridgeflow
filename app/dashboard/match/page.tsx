import { redirect } from 'next/navigation'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import MatchScreen from '@/components/screens/MatchScreen'

export default async function MatchPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const role = profile?.role ?? 'manager'
  const supabaseAdmin = createSupabaseAdminClient()

  // Vérifier si le profil est validé (sauf admin)
  if (role === 'manager') {
    const { data: candidate } = await supabaseAdmin
      .from('candidates')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    if (!candidate || candidate.status !== 'validated') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Accès en attente de validation
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
              Pour accéder aux missions, vous devez d&apos;abord :
            </div>
            <div style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { step: '1', text: 'Compléter votre inscription via "Nouvelle inscription"' },
                  { step: '2', text: 'Passer un entretien de qualification avec notre équipe' },
                  { step: '3', text: 'Obtenir la validation de votre profil par BridgeFlow' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(200,169,110,0.15)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <div style={{ color: 'var(--text2)', paddingTop: 3 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <a
              href="/dashboard/register"
              style={{ display: 'inline-block', background: 'var(--accent)', color: '#0a0a0f', padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Compléter mon inscription →
            </a>
          </div>
        </div>
      )
    }
  }

  if (role === 'entreprise') {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    if (!company || company.status !== 'validated') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Accès en attente de validation
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
              Pour accéder aux candidats, vous devez d&apos;abord :
            </div>
            <div style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { step: '1', text: 'Soumettre votre besoin via "Nouvelle inscription"' },
                  { step: '2', text: 'Passer un appel de qualification avec notre équipe' },
                  { step: '3', text: 'Obtenir la validation de votre fiche mission par BridgeFlow' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(200,169,110,0.15)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <div style={{ color: 'var(--text2)', paddingTop: 3 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <a
              href="/dashboard/register"
              style={{ display: 'inline-block', background: 'var(--accent)', color: '#0a0a0f', padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Soumettre mon besoin →
            </a>
          </div>
        </div>
      )
    }
  }

  // Pour les managers → toutes les missions actives
  let missions: any[] = []
  let candidates: any[] = []

  if (role === 'manager' || role === 'admin') {
    const { data } = await supabaseAdmin
      .from('missions')
      .select('*')
      .eq('status', 'active')
    missions = data ?? []
  }

  if (role === 'entreprise') {
    // Récupérer la company de l'utilisateur
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (company) {
      // Récupérer les missions de cette entreprise
      const { data: companyMissions } = await supabaseAdmin
        .from('missions')
        .select('id')
        .eq('company_id', company.id)
        .eq('status', 'active')

      const missionIds = (companyMissions ?? []).map((m: any) => m.id)

      if (missionIds.length > 0) {
        // Récupérer les likes sur ces missions
        const { data: likes } = await supabaseAdmin
          .from('likes')
          .select('user_id')
          .in('target_id', missionIds)
          .eq('target_type', 'mission')

        const userIds = [...new Set((likes ?? []).map((l: any) => l.user_id))]

        if (userIds.length > 0) {
          // Récupérer les candidats qui ont postulé
          const { data } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .in('user_id', userIds)
            .eq('status', 'validated')
          candidates = data ?? []
        }
      }
    }
  }

  if (role === 'admin') {
    const { data } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('status', 'validated')
    candidates = data ?? []
  }

  return (
    <MatchScreen
      role={role}
      missions={missions}
      candidates={candidates}
      userId={session.user.id}
    />
  )
}
