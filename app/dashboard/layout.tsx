'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import Sidebar from '@/components/Sidebar'
import type { UserProfile } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const sidebarRef = useRef<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
      setLoading(false)
    })
  }, [router])

  if (loading) return null

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <Sidebar profile={profile} />
      <div className="main">
        {children}
      </div>
    </div>
  )
}
