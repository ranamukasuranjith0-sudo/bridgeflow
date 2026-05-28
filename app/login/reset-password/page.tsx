'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase gère le token via le hash de l'URL automatiquement
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    // Fallback si déjà sur la page avec session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">Bridge<span>Flow</span></div>
        <div className="login-sub">MANAGEMENT DE TRANSITION</div>

        <div className="login-card" style={{ marginTop: 24 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Mot de passe mis à jour !</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                Redirection vers votre tableau de bord...
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Nouveau mot de passe</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
                Choisissez un nouveau mot de passe pour votre compte.
              </div>
              {error && <div className="login-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="fgroup">
                  <label>Nouveau mot de passe</label>
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
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading || !ready}>
                  {loading ? 'Mise à jour...' : 'Mettre à jour →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
