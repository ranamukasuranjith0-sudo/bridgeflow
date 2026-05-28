'use client'

import { useState, useEffect, useRef } from 'react'
import Topbar from '@/components/Topbar'
import type { Mission, Candidate } from '@/types'

// Static seed missions to use as fallback
const STATIC_MISSIONS: Mission[] = [
  {
    id: '1', company_id: null,
    title: 'DAF de transition', role: 'Directeur Financier',
    location: 'Paris 8e', tjm: 1100, duration: '9 mois', urgency: 'Urgent',
    tags: ['Restructuration', 'M&A', 'Reporting'],
    summary: '→ Sécuriser le closing d\'une acquisition européenne (cible 60M€)\n→ Mettre en place le reporting consolidé groupe\n→ Piloter la relation avec les partenaires financiers\n→ Accompagner la direction dans les arbitrages stratégiques',
    context: 'ETI familiale · 450 salariés · CA 180M€ · Distribution alimentaire',
    initials: 'GL', color: '#7c3aed', status: 'active', created_at: new Date().toISOString(),
  },
  {
    id: '2', company_id: null,
    title: 'DRH de transition', role: 'Directeur RH',
    location: 'Lyon', tjm: 950, duration: '6 mois', urgency: 'Sous 2 sem.',
    tags: ['Change mgmt', 'GPEC', 'SIRH'],
    summary: '→ Structurer la fonction RH (200 à 600 collaborateurs en 18 mois)\n→ Déployer un SIRH (Workday) sur l\'ensemble des entités\n→ Mettre en place une politique GPEC et onboarding\n→ Accompagner le management dans la transformation culturelle',
    context: 'Startup Series B · 600 salariés · Levée récente 40M€ · MedTech',
    initials: 'MS', color: '#059669', status: 'active', created_at: new Date().toISOString(),
  },
  {
    id: '3', company_id: null,
    title: 'Directeur des Opérations', role: 'COO',
    location: 'Boulogne', tjm: 1300, duration: '12 mois', urgency: 'Immédiat',
    tags: ['Supply chain', 'Lean', 'International'],
    summary: '→ Déployer un programme lean manufacturing sur 5 sites européens\n→ Réduire les niveaux de stocks de 25% en 6 mois\n→ Sécuriser les approvisionnements critiques\n→ Manager une équipe de 8 responsables de site',
    context: 'Grand groupe · 5 usines (FR, DE, ES, PL) · 2 000 personnes en scope',
    initials: 'RS', color: '#b45309', status: 'active', created_at: new Date().toISOString(),
  },
  {
    id: '4', company_id: null,
    title: 'DSI de transition', role: 'Directeur SI',
    location: 'Remote+Paris', tjm: 1050, duration: '6 mois', urgency: 'Sous 1 mois',
    tags: ['ERP', 'SAP', 'Transfo digitale'],
    summary: '→ Reprendre le leadership d\'un projet SAP S/4HANA en retard de 4 mois\n→ Recadrer les équipes internes et l\'intégrateur externe\n→ Assurer le go-live sur 3 entités du groupe\n→ Mettre en place la gouvernance SI post-déploiement',
    context: 'Groupe de services · 3 filiales · 300 utilisateurs SAP · Full remote + Paris 2j/mois',
    initials: 'DV', color: '#be185d', status: 'active', created_at: new Date().toISOString(),
  },
  {
    id: '5', company_id: null,
    title: 'DG de transition', role: 'Directeur Général',
    location: 'Bordeaux', tjm: 1500, duration: '18 mois', urgency: 'Urgent',
    tags: ['Turnaround', 'Immobilier', 'Direction générale'],
    summary: '→ Stabiliser l\'organisation après départ de l\'actionnaire majoritaire\n→ Restructurer la dette bancaire et négocier avec les créanciers\n→ Piloter la cession de 3 actifs non stratégiques (VNI ~40M€)\n→ Préparer la recapitalisation et l\'entrée d\'un nouvel investisseur',
    context: 'Foncière privée · 12 actifs · VNI ~120M€ · Équipe de 15 · Bordeaux',
    initials: 'FN', color: '#0369a1', status: 'active', created_at: new Date().toISOString(),
  },
]

// Static candidates fallback
const STATIC_CANDIDATES: Candidate[] = [
  {
    id: '1', user_id: null,
    name: 'Jean-Marc Rousseau', email: 'jm@example.com',
    phone: null, role_function: 'DAF / CFO',
    tjm: 1050, location: 'Paris', availability: 'Immédiate',
    legal_status: 'SASU', mobility: 'France entière',
    experience_summary: 'Ex-DAF Danone Europe. Spécialisé restructurations financières et M&A. 4 acquisitions >50M€.',
    sectors: ['Finance', 'Industrie'], cv_url: null,
    status: 'validated', created_at: new Date().toISOString(),
  },
  {
    id: '2', user_id: null,
    name: 'Sophie Lefevre', email: 'sl@example.com',
    phone: null, role_function: 'DRH',
    tjm: 850, location: 'Lyon / Paris', availability: 'Sous 2 sem.',
    legal_status: 'SASU', mobility: 'France entière',
    experience_summary: 'Ancienne DRH startups tech (Séries A-C). Expert SIRH Workday, GPEC, transformation culturelle.',
    sectors: ['Tech / IT', 'Santé'], cv_url: null,
    status: 'validated', created_at: new Date().toISOString(),
  },
  {
    id: '3', user_id: null,
    name: 'Pierre Audibert', email: 'pa@example.com',
    phone: null, role_function: 'COO / Supply Chain',
    tjm: 1200, location: 'Île-de-France', availability: 'Immédiate',
    legal_status: 'EURL', mobility: 'Europe',
    experience_summary: 'Ex-VP Operations Michelin Europe. Expert lean manufacturing, certifié Six Sigma Black Belt.',
    sectors: ['Industrie'], cv_url: null,
    status: 'validated', created_at: new Date().toISOString(),
  },
]

interface MatchScreenProps {
  role: string
  missions: Mission[]
  candidates: Candidate[]
  userId: string
}

interface LikedMission {
  mission: Mission
  isMatch: boolean
}

interface MatchInfo {
  mission: Mission
  candidate: Candidate
}

// Manager / Tinder View
function ManagerView({ missions, userId }: { missions: Mission[]; userId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedMissions, setLikedMissions] = useState<LikedMission[]>([])
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [showMatch, setShowMatch] = useState(false)

  const cardRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const remaining = missions.slice(currentIndex)

  const doSwipe = async (dir: 'left' | 'right') => {
    const top = document.querySelector('.tinder-card.top') as HTMLElement
    if (!top) return

    if (dir === 'right') {
      const mission = missions[currentIndex]
      if (mission) {
        try {
          const res = await fetch('/api/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_id: mission.id, target_type: 'mission', user_id: userId }),
          })
          const data = await res.json()
          const isMatch = data.matched === true
          setLikedMissions(prev => [...prev, { mission, isMatch }])
          if (isMatch && data.match) {
            const candidate: Candidate = STATIC_CANDIDATES[0]
            setMatchInfo({ mission, candidate })
            setTimeout(() => setShowMatch(true), 500)
          }
        } catch {
          setLikedMissions(prev => [...prev, { mission, isMatch: false }])
        }
        top.classList.add('fly-right')
      }
    } else {
      top.classList.add('fly-left')
    }

    setTimeout(() => setCurrentIndex(i => i + 1), 420)
    currentX.current = 0
  }

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    const top = document.querySelector('.tinder-card.top') as HTMLElement
    if (top) top.classList.add('dragging')
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return
    const top = document.querySelector('.tinder-card.top') as HTMLElement
    if (!top) return
    currentX.current = e.clientX - startX.current
    top.style.transform = `translateX(${currentX.current}px) rotate(${currentX.current * 0.07}deg)`
    const mission = missions[currentIndex]
    if (mission) {
      const likeEl = document.getElementById(`like-${mission.id}`)
      const passEl = document.getElementById(`pass-${mission.id}`)
      if (likeEl) likeEl.style.opacity = String(Math.max(0, currentX.current / 70))
      if (passEl) passEl.style.opacity = String(Math.max(0, -currentX.current / 70))
    }
  }

  const onMouseUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    const top = document.querySelector('.tinder-card.top') as HTMLElement
    if (!top) return
    top.classList.remove('dragging')
    if (currentX.current > 90) doSwipe('right')
    else if (currentX.current < -90) doSwipe('left')
    else {
      top.style.transform = ''
      const mission = missions[currentIndex]
      if (mission) {
        const likeEl = document.getElementById(`like-${mission.id}`)
        const passEl = document.getElementById(`pass-${mission.id}`)
        if (likeEl) likeEl.style.opacity = '0'
        if (passEl) passEl.style.opacity = '0'
      }
    }
    currentX.current = 0
  }

  const visibleMissions = remaining.slice(0, 3)

  return (
    <div className="match-layout">
      <div className="tinder-wrap">
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 3 }}>Missions disponibles</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Swipez ou utilisez les boutons pour postuler ✦</div>
        </div>

        <div className="tinder-stack">
          {remaining.length === 0 ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--text2)', textAlign: 'center' }}>
              <div style={{ fontSize: 44 }}>🎯</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Plus de missions pour l&apos;instant</div>
            </div>
          ) : (
            [...visibleMissions].reverse().map((m, i) => {
              const isTop = i === visibleMissions.length - 1
              return (
                <div
                  key={m.id}
                  className={`tinder-card${isTop ? ' top' : ''}`}
                  onMouseDown={isTop ? onMouseDown : undefined}
                >
                  <div className="swipe-indicator swipe-like" id={`like-${m.id}`}>POSTULER</div>
                  <div className="swipe-indicator swipe-pass" id={`pass-${m.id}`}>PASSER</div>
                  <div className="tc-header">
                    <div className="tc-avatar" style={{ background: m.color ?? '#7c3aed' }}>
                      {m.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="tc-company">{m.title}</div>
                      <div className="tc-role">{m.role}</div>
                      <div className="tc-badge">⚡ {m.urgency}</div>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
                  <div className="tc-slabel">Résumé</div>
                  <div className="tc-summary">
                    {m.summary?.split('\n').map((line, idx) => (
                      <span key={idx}>{line}<br /></span>
                    ))}
                  </div>
                  <div className="tc-slabel">Contexte</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>{m.context}</div>
                  <div className="tc-slabel">Mots-clés</div>
                  <div className="tc-tags">
                    {(m.tags ?? []).map(t => <span key={t} className="tc-tag">{t}</span>)}
                  </div>
                  <div className="tc-info">
                    <div className="tc-info-item">
                      <div className="tc-info-val">{(m.tjm ?? 0).toLocaleString('fr-FR')} €/j</div>
                      <div className="tc-info-lab">TJM</div>
                    </div>
                    <div className="tc-info-item">
                      <div className="tc-info-val">{m.duration}</div>
                      <div className="tc-info-lab">Durée</div>
                    </div>
                    <div className="tc-info-item">
                      <div className="tc-info-val">{m.location}</div>
                      <div className="tc-info-lab">Lieu</div>
                    </div>
                    <div className="tc-info-item">
                      <div className="tc-info-val">{m.role}</div>
                      <div className="tc-info-lab">Profil</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="actions-bar">
          <button className="action-btn btn-pass" onClick={() => doSwipe('left')} title="Passer">✕</button>
          <button className="action-btn btn-like" onClick={() => doSwipe('right')} title="Postuler">♥</button>
          <button className="action-btn btn-info-btn" title="Mes candidatures">≡</button>
        </div>
        <div className="hint-text">← Passer &nbsp;&nbsp;&nbsp; Postuler →</div>
      </div>

      <div className="match-right">
        <div className="card">
          <div className="card-title"><span className="dot"></span>Mes candidatures</div>
          {likedMissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32 }}>🎯</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Swipez pour postuler</div>
            </div>
          ) : (
            <>
              {likedMissions.map(({ mission, isMatch }) => (
                <div key={mission.id} className="candidature-item">
                  <div className="ci-av" style={{ background: mission.color ?? '#7c3aed' }}>
                    {mission.initials}
                  </div>
                  <div className="ci-info">
                    <div className="ci-name">{mission.title} — {mission.role}</div>
                    <div className="ci-detail">{mission.location} · {(mission.tjm ?? 0).toLocaleString('fr-FR')} €/j</div>
                  </div>
                  <span className={`status-badge ${isMatch ? 'badge-matched' : 'badge-pending'}`}>
                    {isMatch ? '✓ Match' : 'En attente'}
                  </span>
                </div>
              ))}
              {likedMissions.some(l => l.isMatch) && (
                <div className="calendly-strip">
                  <div>
                    <div className="cs-text">Entretien disponible</div>
                    <div className="cs-sub">Match mutuel confirmé</div>
                  </div>
                  <button className="btn-cal-sm">📅 Planifier</button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title"><span className="dot"></span>Comment ça marche</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Swipez à droite pour postuler à une mission',
              "L'entreprise examine votre profil de son côté",
              'Si les deux valident → Calendly automatique',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(200,169,110,0.15)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Overlay */}
      {showMatch && matchInfo && (
        <div className="match-overlay show">
          <div className="mo-emoji">🎯</div>
          <div className="mo-title">Match Mutuel !</div>
          <div className="mo-sub">{matchInfo.candidate.name} × {matchInfo.mission.role}</div>
          <div className="mo-detail">
            <div className="mo-row">
              <span style={{ color: 'var(--text2)' }}>Mission</span>
              <span style={{ fontWeight: 600 }}>{matchInfo.mission.title}</span>
            </div>
            <div className="mo-row">
              <span style={{ color: 'var(--text2)' }}>TJM</span>
              <span>{(matchInfo.mission.tjm ?? 0).toLocaleString('fr-FR')} €/j · {matchInfo.mission.duration}</span>
            </div>
            <div className="mo-row">
              <span style={{ color: 'var(--text2)' }}>Lieu</span>
              <span>{matchInfo.mission.location}</span>
            </div>
          </div>
          <div className="mo-actions">
            <button className="btn-calendly">📅 Planifier l&apos;entretien</button>
            <button className="btn-secondary" onClick={() => setShowMatch(false)}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Entreprise / Recruiter View
function EntrepriseView({ candidates, userId }: { candidates: Candidate[]; userId: string }) {
  const [statuses, setStatuses] = useState<Record<string, 'new' | 'approved' | 'declined'>>({})
  const [matchInfo, setMatchInfo] = useState<{ candidate: Candidate } | null>(null)
  const [showMatch, setShowMatch] = useState(false)
  const COLORS = ['#7c3aed', '#059669', '#b45309', '#be185d', '#0369a1']

  const handleAction = async (candidate: Candidate, action: 'approve' | 'decline') => {
    if (action === 'approve') {
      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_id: candidate.id, target_type: 'candidate', user_id: userId }),
        })
        const data = await res.json()
        setStatuses(prev => ({ ...prev, [candidate.id]: 'approved' }))
        if (data.matched) {
          setMatchInfo({ candidate })
          setTimeout(() => setShowMatch(true), 600)
        }
      } catch {
        setStatuses(prev => ({ ...prev, [candidate.id]: 'approved' }))
      }
    } else {
      setStatuses(prev => ({ ...prev, [candidate.id]: 'declined' }))
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 3 }}>Candidats en attente de validation</div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>Validez les profils qui correspondent à vos missions ouvertes</div>
      </div>

      {candidates.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">👥</div>
          <div className="es-title">Aucun candidat disponible</div>
          <div className="es-sub">Les candidats validés apparaîtront ici</div>
        </div>
      ) : (
        candidates.map((c, idx) => {
          const status = statuses[c.id] ?? 'new'
          const color = COLORS[idx % COLORS.length]
          const initials = getInitials(c.name)
          const borderStyle = status === 'approved' ? { borderColor: 'rgba(74,222,128,0.3)' } :
            status === 'declined' ? { opacity: 0.5 } : {}
          const badgeClass = status === 'approved' ? 'badge-matched' : status === 'declined' ? 'badge-declined' : 'badge-pending'
          const badgeText = status === 'approved' ? '✓ Validé' : status === 'declined' ? 'Décliné' : 'Nouveau'

          return (
            <div key={c.id} className="cand-card" style={borderStyle}>
              <div className="cand-header">
                <div className="cand-av" style={{ background: color }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div className="cand-name">{c.name}</div>
                  <div className="cand-role-txt">{c.role_function} · {c.location}</div>
                </div>
                <span className={`status-badge ${badgeClass}`}>{badgeText}</span>
              </div>
              <div className="cand-bio">{c.experience_summary}</div>
              <div className="cand-grid">
                <div className="cand-item">
                  <div className="cand-val">{(c.tjm ?? 0).toLocaleString('fr-FR')} €/j</div>
                  <div className="cand-lab">TJM</div>
                </div>
                <div className="cand-item">
                  <div className="cand-val">{c.availability ?? 'N/A'}</div>
                  <div className="cand-lab">Disponibilité</div>
                </div>
                <div className="cand-item">
                  <div className="cand-val">{c.mobility ?? 'N/A'}</div>
                  <div className="cand-lab">Mobilité</div>
                </div>
                <div className="cand-item">
                  <div className="cand-val">{c.legal_status ?? 'N/A'}</div>
                  <div className="cand-lab">Statut</div>
                </div>
              </div>
              {status === 'new' && (
                <div className="cand-actions">
                  <button className="btn-approve" onClick={() => handleAction(c, 'approve')}>✓ Valider le profil</button>
                  <button className="btn-decline" onClick={() => handleAction(c, 'decline')}>✕ Décliner</button>
                  {c.cv_url && (
                    <a href={c.cv_url} target="_blank" rel="noopener noreferrer" className="btn-cv-btn">📄 Voir CV</a>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      {showMatch && matchInfo && (
        <div className="match-overlay show">
          <div className="mo-emoji">🎯</div>
          <div className="mo-title">Match Mutuel !</div>
          <div className="mo-sub">{matchInfo.candidate.name} — Match confirmé !</div>
          <div className="mo-detail">
            <div className="mo-row">
              <span style={{ color: 'var(--text2)' }}>Candidat</span>
              <span style={{ fontWeight: 600 }}>{matchInfo.candidate.name}</span>
            </div>
            <div className="mo-row">
              <span style={{ color: 'var(--text2)' }}>Fonction</span>
              <span>{matchInfo.candidate.role_function}</span>
            </div>
            <div className="mo-row">
              <span style={{ color: 'var(--text2)' }}>TJM</span>
              <span>{(matchInfo.candidate.tjm ?? 0).toLocaleString('fr-FR')} €/j</span>
            </div>
          </div>
          <div className="mo-actions">
            <button className="btn-calendly">📅 Planifier l&apos;entretien</button>
            <button className="btn-secondary" onClick={() => setShowMatch(false)}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MatchScreen({ role, missions: propMissions, candidates: propCandidates, userId }: MatchScreenProps) {
  const missions = propMissions.length > 0 ? propMissions : STATIC_MISSIONS
  const candidates = propCandidates.length > 0 ? propCandidates : STATIC_CANDIDATES

  const [view, setView] = useState<'manager' | 'entreprise'>(
    role === 'entreprise' ? 'entreprise' : 'manager'
  )

  const title = view === 'manager' ? 'Match — Missions' : 'Match — Candidats'

  return (
    <>
      <Topbar
        title={title}
        showViewPill={role === 'admin'}
        currentView={view}
        onViewChange={setView}
        userRole={role}
      />
      <div className="content">
        <div className="screen">
          {(role === 'manager' || (role === 'admin' && view === 'manager')) && (
            <ManagerView missions={missions} userId={userId} />
          )}
          {(role === 'entreprise' || (role === 'admin' && view === 'entreprise')) && (
            <EntrepriseView candidates={candidates} userId={userId} />
          )}
        </div>
      </div>
    </>
  )
}
