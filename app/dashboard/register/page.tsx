import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Topbar from '@/components/Topbar'
import RegisterScreen from '@/components/screens/RegisterScreen'

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const role = profile?.role ?? 'manager'

  return (
    <>
      <Topbar title="Nouvelle inscription" />
      <div className="content">
        <RegisterScreen userRole={role} />
      </div>
    </>
  )
}
