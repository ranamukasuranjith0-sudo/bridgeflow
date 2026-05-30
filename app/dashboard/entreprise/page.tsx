import { redirect } from 'next/navigation'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import Topbar from '@/components/Topbar'
import EntrepriseScreen from '@/components/screens/EntrepriseScreen'

export default async function EntreprisePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'entreprise' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const supabaseAdmin = createSupabaseAdminClient()

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (!company) redirect('/dashboard/register')

  const { data: missions } = await supabaseAdmin
    .from('missions')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Pour chaque mission, récupérer les likes (candidatures)
  const missionIds = (missions ?? []).map((m: any) => m.id)
  const { data: likes } = missionIds.length > 0
    ? await supabaseAdmin
        .from('likes')
        .select('target_id, user_id')
        .in('target_id', missionIds)
        .eq('target_type', 'mission')
    : { data: [] }

  // Récupérer les candidats qui ont postulé
  const candidateUserIds = [...new Set((likes ?? []).map((l: any) => l.user_id))]
  const { data: candidates } = candidateUserIds.length > 0
    ? await supabaseAdmin
        .from('candidates')
        .select('id, user_id, name, role_function, tjm, location, availability, mobility, cv_url')
        .in('user_id', candidateUserIds)
    : { data: [] }

  return (
    <>
      <Topbar title="Mes Missions" />
      <div className="content">
        <EntrepriseScreen
          company={company}
          missions={missions ?? []}
          likes={likes ?? []}
          candidates={candidates ?? []}
        />
      </div>
    </>
  )
}
