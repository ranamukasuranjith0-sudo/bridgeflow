import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { id, type, action } = await request.json()
    // type: 'candidate' | 'company'
    // action: 'validate' | 'reject'

    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const newStatus = action === 'validate' ? 'validated' : 'rejected'
    const table = type === 'candidate' ? 'candidates' : 'companies'

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('Validate error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
