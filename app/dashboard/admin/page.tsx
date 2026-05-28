import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Topbar from '@/components/Topbar'
import AdminScreen from '@/components/screens/AdminScreen'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch KPIs
  const [
    { count: candidatesCount },
    { count: missionsCount },
    { count: matchesCount },
    { count: interviewsCount },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('status', 'validated'),
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const kpis = {
    activeCandidates: candidatesCount ?? 0,
    openMissions: missionsCount ?? 0,
    activeMatches: matchesCount ?? 0,
    plannedInterviews: interviewsCount ?? 0,
  }

  // Fetch vrais entretiens avec infos candidat + entreprise
  const { data: interviews } = await supabase
    .from('interviews')
    .select(`
      id,
      type,
      status,
      calendly_link,
      scheduled_at,
      notes,
      created_at,
      candidates (
        id,
        name,
        role_function,
        tjm,
        location
      ),
      companies (
        id,
        company_name,
        contact_name,
        location,
        budget_tjm
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <>
      <Topbar title="Tableau de bord Admin" />
      <div className="content">
        <AdminScreen kpis={kpis} interviews={interviews ?? []} />
      </div>
    </>
  )
}

