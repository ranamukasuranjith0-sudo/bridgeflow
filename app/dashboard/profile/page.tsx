import { createSupabaseServerClient } from '@/lib/supabase-server'
import Topbar from '@/components/Topbar'

function getRoleLabel(role: string): string {
  if (role === 'admin') return 'Administrateur'
  if (role === 'manager') return 'Manager de Transition'
  return 'Entreprise'
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single()

  const name = profile?.name ?? null
  const email = profile?.email ?? user?.email ?? ''
  const role = profile?.role ?? 'manager'
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'
  const initials = getInitials(name, email)

  return (
    <>
      <Topbar title="Mon profil" />
      <div className="content">
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
              <div
                className="user-av"
                style={{ width: 64, height: 64, fontSize: 22, borderRadius: '50%' }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{name || email}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                  {getRoleLabel(role)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 600 }}>
                  Nom complet
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{name || '—'}</div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 600 }}>
                  Email
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{email}</div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 600 }}>
                  Rôle
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{getRoleLabel(role)}</div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 600 }}>
                  Membre depuis
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{createdAt}</div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 600 }}>
                  ID utilisateur
                </div>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text3)' }}>{user?.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
