import { redirect } from 'next/navigation'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
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

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const supabaseAdmin = createSupabaseAdminClient()

  const [
    { count: candidatesCount },
    { count: missionsCount },
    { count: matchesCount },
    { count: interviewsCount },
  ] = await Promise.all([
    supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('status', 'validated'),
    supabaseAdmin.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabaseAdmin.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const kpis = {
    activeCandidates: candidatesCount ?? 0,
    openMissions: missionsCount ?? 0,
    activeMatches: matchesCount ?? 0,
    plannedInterviews: interviewsCount ?? 0,
  }

  // Interviews
  const { data: interviewsRaw } = await supabaseAdmin
    .from('interviews')
    .select('id, type, status, calendly_link, meet_link, scheduled_at, notes, created_at, candidate_id, company_id, match_id')
    .order('created_at', { ascending: false })
    .limit(20)

  const rows = (interviewsRaw ?? []) as any[]
  const candidateIds = rows.map(i => i.candidate_id).filter(Boolean)
  const companyIds = rows.map(i => i.company_id).filter(Boolean)

  const [{ data: candidatesData }, { data: companiesData }] = await Promise.all([
    candidateIds.length > 0
      ? supabaseAdmin.from('candidates').select('id, name, role_function, tjm, location, phone').in('id', candidateIds)
      : Promise.resolve({ data: [] as any[] }),
    companyIds.length > 0
      ? supabaseAdmin.from('companies').select('id, company_name, contact_name, location, budget_tjm').in('id', companyIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const interviews = rows.map(i => ({
    id: i.id as string,
    type: i.type as string,
    status: i.status as string,
    calendly_link: i.calendly_link as string | null,
    meet_link: i.meet_link as string | null,
    scheduled_at: i.scheduled_at as string | null,
    notes: i.notes as string | null,
    created_at: i.created_at as string,
    candidates: ((candidatesData ?? []) as any[]).find(c => c.id === i.candidate_id) ?? null,
    companies: ((companiesData ?? []) as any[]).find(c => c.id === i.company_id) ?? null,
  }))

  // Google Calendar
  const { data: googleSetting } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .single()
  const googleConnected = !!googleSetting?.value

  // Profils en attente
  const [{ data: pendingCandidates }, { data: pendingCompanies }] = await Promise.all([
    supabaseAdmin.from('candidates').select('id, name, email, role_function, tjm, location, phone, cv_url, created_at').eq('status', 'pending'),
    supabaseAdmin.from('companies').select('id, company_name, contact_name, email, location, budget_tjm, created_at').eq('status', 'pending'),
  ])

  // Pipeline matchs — données réelles
  const { data: matchesRaw } = await supabaseAdmin
    .from('matches')
    .select('id, status, candidate_id, company_id, mission_id, created_at')
    .in('status', ['pending', 'confirmed'])
    .order('created_at', { ascending: false })
    .limit(10)

  const matchCandidateIds = (matchesRaw ?? []).map((m: any) => m.candidate_id).filter(Boolean)
  const matchCompanyIds = (matchesRaw ?? []).map((m: any) => m.company_id).filter(Boolean)
  const matchMissionIds = (matchesRaw ?? []).map((m: any) => m.mission_id).filter(Boolean)

  const [{ data: matchCandidates }, { data: matchCompanies }, { data: matchMissions }] = await Promise.all([
    matchCandidateIds.length > 0
      ? supabaseAdmin.from('candidates').select('id, name, role_function, tjm, location').in('id', matchCandidateIds)
      : Promise.resolve({ data: [] as any[] }),
    matchCompanyIds.length > 0
      ? supabaseAdmin.from('companies').select('id, company_name').in('id', matchCompanyIds)
      : Promise.resolve({ data: [] as any[] }),
    matchMissionIds.length > 0
      ? supabaseAdmin.from('missions').select('id, title, tjm, duration, location').in('id', matchMissionIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const pipeline = (matchesRaw ?? []).map((m: any) => {
    const candidate = ((matchCandidates ?? []) as any[]).find(c => c.id === m.candidate_id)
    const company = ((matchCompanies ?? []) as any[]).find(c => c.id === m.company_id)
    const mission = ((matchMissions ?? []) as any[]).find(mi => mi.id === m.mission_id)
    return {
      id: m.id,
      candidate_name: candidate?.name ?? 'Candidat',
      company_name: company?.company_name ?? 'Entreprise',
      role: candidate?.role_function ?? mission?.title ?? '',
      tjm: mission?.tjm ?? candidate?.tjm ?? null,
      location: mission?.location ?? candidate?.location ?? '',
      duration: mission?.duration ?? '',
      status: m.status,
    }
  })

  return (
    <>
      <Topbar title="Tableau de bord Admin" />
      <div className="content">
        <AdminScreen
          kpis={kpis}
          interviews={interviews}
          googleConnected={googleConnected}
          pendingCandidates={(pendingCandidates ?? []) as any[]}
          pendingCompanies={(pendingCompanies ?? []) as any[]}
          pipeline={pipeline}
        />
      </div>
    </>
  )
}
