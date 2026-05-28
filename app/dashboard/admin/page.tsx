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

  // Fetch entretiens sans jointure pour éviter les erreurs de type
  const { data: interviewsRaw } = await supabase
    .from('interviews')
    .select('id, type, status, calendly_link, scheduled_at, notes, created_at, candidate_id, company_id, match_id')
    .order('created_at', { ascending: false })
    .limit(20)

  const candidateIds = (interviewsRaw ?? []).map((i: any) => i.candidate_id).filter(Boolean)
  const companyIds = (interviewsRaw ?? []).map((i: any) => i.company_id).filter(Boolean)

  const [{ data: candidatesData }, { data: companiesData }] = await Promise.all([
    candidateIds.length > 0
      ? supabase.from('candidates').select('id, name, role_function, tjm, location').in('id', candidateIds)
      : Promise.resolve({ data: [] as any[] }),
    companyIds.length > 0
      ? supabase.from('companies').select('id, company_name, contact_name, location, budget_tjm').in('id', companyIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const interviews = (interviewsRaw ?? []).map((i: any) => ({
    ...i,
    candidates: (candidatesData ?? []).find((c: any) => c.id === i.candidate_id) ?? null,
    companies: (companiesData ?? []).find((c: any) => c.id === i.company_id) ?? null,
  }))

  return (
    <>
      <Topbar title="Tableau de bord Admin" />
      <div className="content">
        <AdminScreen kpis={kpis} interviews={interviews} />
      </div>
    </>
  )
}
