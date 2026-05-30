'use client'

import { useState } from 'react'

interface Mission {
  id: string
  title: string
  role: string
  location: string
  tjm: number | null
  duration: string
  urgency: string
  tags: string[]
  summary: string
  context: string
  status: string
  created_at: string
}

interface Candidate {
  id: string
  user_id: string | null
  name: string
  role_function: string
  tjm: number | null
  location: string | null
  availability: string | null
  mobility: string | null
  cv_url: string | null
}

interface Like {
  target_id: string
  user_id: string
}

interface Company {
  id: string
  company_name: string
  contact_name: string | null
  location: string | null
  size: string | null
}

interface EntrepriseScreenProps {
  company: Company
  missions: Mission[]
  likes: Like[]
  candidates: Candidate[]
}

const URGENCY_OPTIONS = ['Immédiat', 'Urgent', 'Sous 2 sem.', 'Sous 1 mois']
const DURATION_OPTIONS = ['3 mois', '6 mois', '9 mois', '12 mois', '18 mois +']
const SKILLS = ['Restructuration', 'Turnaround', 'M&A', 'Transformation digitale', 'Levée de fonds', 'Change management', 'ERP / SAP', 'International']

function AddMissionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (mission: Mission) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', role: '', location: '', tjm: '',
    duration: '6 mois', urgency: 'Urgent',
    summary: '', context: '',
  })

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return }
    if (!form.role.trim()) { setError('Le profil recherché est obligatoire.'); return }
    if (!form.location.trim()) { setError('La localisation est obligatoire.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags: selectedTags }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la création'); setLoading(false); return }
      onSuccess(data.mission)
    } catch {
      setError('Erreur réseau')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>➕ Nouvelle mission</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
        </div>

        {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="form-grid-2">
          <div className="form-group full">
            <label>Titre de la mission <span style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" placeholder="DAF de transition" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Profil recherché <span style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" placeholder="Directeur Financier" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Localisation <span style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" placeholder="Paris 8e" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>TJM budget (€/j)</label>
            <input type="number" placeholder="1000" value={form.tjm} onChange={e => setForm(f => ({ ...f, tjm: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Durée estimée</label>
            <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
              {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Urgence</label>
            <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
              {URGENCY_OPTIONS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label>Résumé de la mission</label>
            <textarea
              placeholder="→ Objectif 1&#10;→ Objectif 2&#10;→ Objectif 3"
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              style={{ minHeight: 100 }}
            />
          </div>
          <div className="form-group full">
            <label>Contexte entreprise</label>
            <textarea
              placeholder="ETI familiale · 450 salariés · CA 180M€"
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
            />
          </div>
          <div className="form-group full">
            <label>Compétences clés</label>
            <div className="tags-wrap">
              {SKILLS.map(tag => (
                <span
                  key={tag}
                  className={`tag${selectedTags.includes(tag) ? ' active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : 'Publier la mission →'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

export default function EntrepriseScreen({ company, missions: initialMissions, likes, candidates }: EntrepriseScreenProps) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [showAddMission, setShowAddMission] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  const getCandidatesForMission = (missionId: string) => {
    const userIds = likes
      .filter(l => l.target_id === missionId)
      .map(l => l.user_id)
    return candidates.filter(c => c.user_id && userIds.includes(c.user_id))
  }

  const handleMissionAdded = (mission: Mission) => {
    setMissions(prev => [mission, ...prev])
    setShowAddMission(false)
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
            {company.company_name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {company.contact_name} · {company.location}
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddMission(true)}
          style={{ whiteSpace: 'nowrap' }}
        >
          ➕ Nouvelle mission
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-val">{missions.filter(m => m.status === 'active').length}</div>
          <div className="kpi-lbl">Missions actives</div>
        </div>
        <div className="kpi-card kpi-accent">
          <div className="kpi-val">{likes.length}</div>
          <div className="kpi-lbl">Candidatures reçues</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-val">{candidates.length}</div>
          <div className="kpi-lbl">Profils uniques</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Liste des missions */}
        <div className="card" style={{ gridColumn: selectedMission ? '1' : '1 / -1' }}>
          <div className="card-title"><span className="dot"></span>Mes missions</div>
          {missions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Aucune mission publiée</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>Créez votre première mission pour recevoir des candidatures</div>
              <button className="btn-primary" onClick={() => setShowAddMission(true)}>➕ Créer une mission</button>
            </div>
          ) : (
            missions.map(mission => {
              const missionCandidates = getCandidatesForMission(mission.id)
              const isSelected = selectedMission?.id === mission.id
              return (
                <div
                  key={mission.id}
                  onClick={() => setSelectedMission(isSelected ? null : mission)}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(200,169,110,0.05)' : 'transparent',
                    borderRadius: isSelected ? 8 : 0,
                    paddingLeft: isSelected ? 12 : 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{mission.title}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 50,
                        background: mission.status === 'active' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.1)',
                        color: mission.status === 'active' ? 'var(--green)' : '#ef4444',
                        fontWeight: 600,
                      }}>
                        {mission.status === 'active' ? '● Active' : '○ Fermée'}
                      </span>
                      {missionCandidates.length > 0 && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, background: 'rgba(200,169,110,0.15)', color: 'var(--accent)', fontWeight: 600 }}>
                          {missionCandidates.length} candidat{missionCandidates.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                    {mission.role} · {mission.location} · {mission.tjm ? `${mission.tjm.toLocaleString('fr-FR')} €/j` : 'TJM non défini'} · {mission.duration}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>⚡ {mission.urgency}</div>
                </div>
              )
            })
          )}
        </div>

        {/* Détail mission + candidats */}
        {selectedMission && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title"><span className="dot"></span>Détail mission</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selectedMission.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
                {selectedMission.role} · {selectedMission.location} · {selectedMission.duration}
              </div>
              {selectedMission.summary && (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Résumé</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 12 }}>
                    {selectedMission.summary.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </div>
                </>
              )}
              {selectedMission.context && (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Contexte</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{selectedMission.context}</div>
                </>
              )}
              {selectedMission.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedMission.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(200,169,110,0.1)', color: 'var(--accent)', borderRadius: 50, border: '1px solid rgba(200,169,110,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Candidats pour cette mission */}
            <div className="card">
              <div className="card-title"><span className="dot"></span>
                Candidatures
                {getCandidatesForMission(selectedMission.id).length > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#0a0a0f', borderRadius: 50, padding: '1px 7px', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>
                    {getCandidatesForMission(selectedMission.id).length}
                  </span>
                )}
              </div>
              {getCandidatesForMission(selectedMission.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                  Aucune candidature pour cette mission pour l&apos;instant
                </div>
              ) : (
                getCandidatesForMission(selectedMission.id).map(c => (
                  <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {c.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.role_function} · {c.location}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                      <div style={{ fontSize: 11, background: 'var(--surface2)', borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{c.tjm ? `${c.tjm.toLocaleString('fr-FR')} €/j` : 'N/A'}</div>
                        <div style={{ color: 'var(--text3)' }}>TJM</div>
                      </div>
                      <div style={{ fontSize: 11, background: 'var(--surface2)', borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{c.availability ?? 'N/A'}</div>
                        <div style={{ color: 'var(--text3)' }}>Disponibilité</div>
                      </div>
                      <div style={{ fontSize: 11, background: 'var(--surface2)', borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{c.mobility ?? 'N/A'}</div>
                        <div style={{ color: 'var(--text3)' }}>Mobilité</div>
                      </div>
                      <div style={{ fontSize: 11, background: 'var(--surface2)', borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{c.location ?? 'N/A'}</div>
                        <div style={{ color: 'var(--text3)' }}>Localisation</div>
                      </div>
                    </div>
                    {c.cv_url && (
                      <a
                        href={c.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        📄 Voir le CV
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showAddMission && (
        <AddMissionModal
          onClose={() => setShowAddMission(false)}
          onSuccess={handleMissionAdded}
        />
      )}
    </div>
  )
}
