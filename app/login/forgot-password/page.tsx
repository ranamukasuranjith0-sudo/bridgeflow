'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">Bridge<span>Flow</span></div>
        <div className="login-sub">MANAGEMENT DE TRANSITION</div>

        <div className="login-card" style={{ marginTop: 24 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Email envoyé !</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
                Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
              </div>
              <a
                href="/login"
                style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
              >
                ← Retour à la connexion
              </a>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Mot de passe oublié</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
              </div>
              {error && <div className="login-error">{error}</div>}
              <form onSubmit={handleSubmit}>
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
                <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien →'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <a
                  href="/login"
                  style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}
                >
                  ← Retour à la connexion
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
