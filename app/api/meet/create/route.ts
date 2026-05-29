import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { candidateName, companyName, scheduledAt, interviewId } = await request.json()

    const supabase = await createSupabaseServerClient()

    // Récupérer le refresh token
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'google_refresh_token')
      .single()

    if (!setting?.value) {
      return NextResponse.json({ error: 'Google non connecté' }, { status: 400 })
    }

    const accessToken = await getAccessToken(setting.value)

    // Créer l'événement Google Calendar avec Meet
    const startTime = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000)

    const event = {
      summary: `BridgeFlow — ${candidateName} x ${companyName}`,
      description: `Entretien de match BridgeFlow\nCandidat: ${candidateName}\nEntreprise: ${companyName}`,
      start: { dateTime: startTime.toISOString(), timeZone: 'Europe/Paris' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Europe/Paris' },
      conferenceData: {
        createRequest: {
          requestId: `bridgeflow-${interviewId}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }

    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    const calData = await calRes.json()
    const meetLink = calData.hangoutLink

    if (!meetLink) {
      return NextResponse.json({ error: 'Impossible de créer le lien Meet' }, { status: 500 })
    }

    // Mettre à jour l'entretien avec le lien Meet
    await supabase
      .from('interviews')
      .update({ meet_link: meetLink })
      .eq('id', interviewId)

    return NextResponse.json({ meet_link: meetLink })
  } catch (error) {
    console.error('Meet create error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
