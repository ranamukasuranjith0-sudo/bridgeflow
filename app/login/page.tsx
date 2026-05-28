'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

type Role = 'manager' | 'entreprise' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('manager')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (role === 'admin') {
      setError('Le rôle Admin est sur invitation uniquement.')
      return
    }
    setError('')
    setLoading(true)
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        name: name || null,
        role,
      })
      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">Bridge<span>Flow</span></div>
        <div className="login-sub">MANAGEMENT DE TRANSITION</div>

        <div className="login-tabs">
          <button
            className={`login-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Se connecter
          </button>
          <button
            className={`login-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Créer un compte
          </button>
        </div>

        <div className="login-card">
          {error && <div className="login-error">{error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="fgroup">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="fgroup">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="fgroup">
                <label>Nom complet</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="fgroup">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="fgroup">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="Min. 6 caractères"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="fgroup">
                <label>Votre profil</label>
                <div className="role-cards">
                  <div
                    className={`role-card disabled`}
                    onClick={() => setError('Le rôle Admin est sur invitation uniquement.')}
                  >
                    <div className="role-icon">🔒</div>
                    <div className="role-name">Admin</div>
                    <div className="role-note">Sur invitation uniquement</div>
                  </div>
                  <div
                    className={`role-card ${role === 'manager' ? 'selected' : ''}`}
                    onClick={() => setRole('manager')}
                  >
                    <div className="role-icon">👤</div>
                    <div className="role-name">Manager</div>
                    <div className="role-note">Je cherche des missions</div>
                  </div>
                  <div
                    className={`role-card ${role === 'entreprise' ? 'selected' : ''}`}
                    onClick={() => setRole('entreprise')}
                  >
                    <div className="role-icon">🏢</div>
                    <div className="role-name">Entreprise</div>
                    <div className="role-note">Je cherche un manager</div>
                  </div>
                </div>
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
