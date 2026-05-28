import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Topbar from '@/components/Topbar'
import AdminScreen from '@/components/screens/AdminScreen'

export default async function AdminPage() {
  const supabase = createSupabaseServerClient()
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

  // Fetch real KPIs
  const [
    { count: candidatesCount },
    { count: missionsCount },
    { count: matchesCount },
    { count: interviewsCount },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('status', 'validated'),
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'todo'),
  ])

  const kpis = {
    activeCandidates: candidatesCount ?? 12,
    openMissions: missionsCount ?? 7,
    activeMatches: matchesCount ?? 3,
    plannedInterviews: interviewsCount ?? 2,
  }

  return (
    <>
      <Topbar title="Tableau de bord Admin" />
      <div className="content">
        <AdminScreen kpis={kpis} />
      </div>
    </>
  )
}
