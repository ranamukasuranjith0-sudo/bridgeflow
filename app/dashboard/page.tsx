import { createSupabaseServerClient } from '@/lib/supabase-server'
import Topbar from '@/components/Topbar'
import HomeScreen from '@/components/screens/HomeScreen'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user.id ?? '')
    .single()

  // Fetch real KPIs
  const [
    { count: managersCount },
    { count: missionsCount },
    { count: matchesCount },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('status', 'validated'),
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
  ])

  const kpis = {
    activeManagers: managersCount ?? 247,
    openMissions: missionsCount ?? 83,
    activeMatches: matchesCount ?? 12,
    avgDays: '4.2j',
  }

  const role = profile?.role ?? 'manager'

  return (
    <>
      <Topbar title="Accueil" />
      <div className="content">
        <HomeScreen kpis={kpis} role={role} />
      </div>
    </>
  )
}
