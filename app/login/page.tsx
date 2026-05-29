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
  const [emailSent, setEmailSent] = useState(false)

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
    setLoading(false)
    setEmailSent(true)
  }

  // Ecran de confirmation email
  if (emailSent) {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-logo">Bridge<span>Flow</span></div>
          <div className="login-sub">MANAGEMENT DE TRANSITION</div>
          <div className="login-card" style={{ marginTop: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Confirmez votre email
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>
              Un email de confirmation a été envoyé à<br />
              <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </div>
            <div style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text2)', textAlign: 'left' }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Prochaines étapes :</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>1. Vérifiez votre boîte mail et cliquez sur le lien de confirmation</div>
                <div>2. Connectez-vous avec vos identifiants</div>
                <div>3. Complétez votre inscription via "Nouvelle inscription"</div>
                <div>4. Après validation par notre équipe, accédez aux missions</div>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => { setEmailSent(false); setTab('login') }}
            >
              Retour à la connexion
            </button>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12 }}>
              Pas reçu ? Vérifiez vos spams ou{' '}
              <span
                style={{ color: 'var(--accent)', cursor: 'pointer' }}
                onClick={() => supabase.auth.resend({ type: 'signup', email })}
              >
                renvoyer l&apos;email
              </span>
            </div>
          </div>
        </div>
      </div>
    )
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
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <a
                  href="/login/forgot-password"
                  style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
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
                    className="role-card disabled"
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
