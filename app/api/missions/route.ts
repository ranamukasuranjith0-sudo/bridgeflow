import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const supabaseAdmin = createSupabaseAdminClient()

    // Récupérer la company de l'utilisateur
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id, company_name')
      .eq('user_id', session.user.id)
      .eq('status', 'validated')
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée ou non validée' }, { status: 403 })
    }

    // Générer les initiales depuis le nom de la société
    const words = company.company_name.trim().split(' ')
    const initials = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : company.company_name.substring(0, 2).toUpperCase()

    const COLORS = ['#7c3aed', '#059669', '#b45309', '#be185d', '#0369a1', '#c8a96e']
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    const { data: mission, error } = await supabaseAdmin
      .from('missions')
      .insert({
        company_id: company.id,
        title: body.title,
        role: body.role,
        location: body.location,
        tjm: body.tjm ? parseInt(body.tjm) : null,
        duration: body.duration,
        urgency: body.urgency,
        tags: body.tags ?? [],
        summary: body.summary,
        context: body.context,
        initials,
        color,
        status: 'active',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, mission })
  } catch (err) {
    console.error('Mission create error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
