import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
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

  const [{ data: missions }, { data: candidates }] = await Promise.all([
    supabase.from('missions').select('*').eq('status', 'active'),
    supabase.from('candidates').select('*').eq('status', 'validated'),
  ])

  return (
    <MatchScreen
      role={role}
      missions={missions ?? []}
      candidates={candidates ?? []}
      userId={session.user.id}
    />
  )
}
