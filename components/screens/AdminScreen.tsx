'use client'

import { useState } from 'react'

interface KPIs {
  activeCandidates: number
  openMissions: number
  activeMatches: number
  plannedInterviews: number
}

interface Interview {
  id: string
  type: string
  typeLbl: string
  typeClass: string
  name: string
  role: string
  date: string
  heure: string
  duree: string
  format: string
  tjm: string
  location: string
  notes: string
  status: 'todo' | 'confirmed' | 'pending'
  actions: string[]
  barClass: 'qual' | 'entreprise' | 'match'
}

interface PipelineItem {
  id: string
  names: string
  detail: string
  av1: { initials: string; color: string }
  av2: { initials: string; color: string }
  badge: { label: string; className: string }
  steps: Array<{ label: string; type: 'step' | 'line'; status: 'done' | 'active' | '' }>
}

interface AdminScreenProps {
  kpis: KPIs
}

const INTERVIEWS: Interview[] = [
  {
    id: 'e1', type: 'qual', typeLbl: 'Qualification candidat', typeClass: 'dp-type-qual',
    name: 'Jean-Marc Rousseau', role: 'DAF / CFO',
    date: 'Lundi 26 mai', heure: '09h00', duree: '30 min', format: '📞 Téléphone',
    tjm: '1 050 €/j', location: 'Paris',
    notes: 'Vérifier : 2 dernières références, disponibilité exacte, TJM négociable. Potentiel positioning sur Leclerc ou Renault.',
    status: 'todo', actions: ['📞 Appeler maintenant', '✓ Valider le profil', '✕ Refuser'],
    barClass: 'qual',
  },
  {
    id: 'e2', type: 'entreprise', typeLbl: 'Qualification entreprise', typeClass: 'dp-type-ent',
    name: 'Groupe Leclerc Industries', role: 'Marie Dupont — DG',
    date: 'Lundi 26 mai', heure: '14h00', duree: '30 min', format: '💻 Visio Google Meet',
    tjm: 'Budget 1 100 €/j', location: 'Paris 8e',
    notes: 'Comprendre le périmètre exact : restructuration pure ou acquisition ? Durée réelle vs. estimée. Budget confirmé ? Décideur en face ?',
    status: 'todo', actions: ['💻 Rejoindre la visio', '📋 Envoyer des profils', '📅 Reporter'],
    barClass: 'entreprise',
  },
  {
    id: 'e3', type: 'match', typeLbl: 'Entretien de match', typeClass: 'dp-type-match',
    name: 'Sophie Lefevre × MedTech Solutions', role: 'DRH × Startup Series B',
    date: 'Mardi 27 mai', heure: '10h30', duree: '30 min', format: '📅 Calendly envoyé aux deux parties',
    tjm: '950 €/j · 6 mois', location: 'Lyon',
    notes: 'Match mutuel confirmé. Calendly envoyé automatiquement. Suivre confirmation de présence avant demain matin.',
    status: 'confirmed', actions: ['🔗 Voir le Calendly', '✉️ Contacter Sophie', '✉️ Contacter MedTech'],
    barClass: 'match',
  },
  {
    id: 'e4', type: 'qual', typeLbl: 'Qualification candidat', typeClass: 'dp-type-qual',
    name: 'Pierre Audibert', role: 'COO / Supply Chain',
    date: 'Jeudi 29 mai', heure: '09h00', duree: '30 min', format: '💻 Visio Google Meet',
    tjm: '1 200 €/j', location: 'Île-de-France',
    notes: 'Ex-VP Michelin. Vérifier mobilité Europe et appétit missions PME vs. grands groupes. Lire CV avant l\'appel.',
    status: 'todo', actions: ['💻 Rejoindre la visio', '✓ Valider le profil', '✕ Refuser'],
    barClass: 'qual',
  },
  {
    id: 'e5', type: 'match', typeLbl: 'Entretien de match', typeClass: 'dp-type-match',
    name: 'Jean-Marc Rousseau × Foncière Nexus', role: 'DAF transition × DG Bordeaux',
    date: 'Jeudi 29 mai', heure: '15h30', duree: '30 min', format: '📅 En attente confirmation Calendly',
    tjm: '1 500 €/j · 18 mois', location: 'Bordeaux',
    notes: 'Calendly envoyé à JM Rousseau, en attente côté Foncière. Relancer si pas de réponse jeudi matin.',
    status: 'pending', actions: ['📞 Relancer Foncière Nexus', '🔗 Voir le match', '✕ Annuler'],
    barClass: 'match',
  },
]

const PIPELINE: PipelineItem[] = [
  {
    id: 'p1',
    names: 'Jean-Marc Rousseau × Renault Supply Chain',
    detail: 'DAF · 1 100 €/j · Paris · 9 mois',
    av1: { initials: 'JR', color: '#7c3aed' },
    av2: { initials: 'RS', color: '#b45309' },
    badge: { label: 'Entretien', className: 'pipe-badge-interview' },
    steps: [
      { label: '✓ Qualif. cand.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'done' },
      { label: '✓ Qualif. entrep.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'active' },
      { label: '⏳ Entretien match', type: 'step', status: 'active' },
      { label: '', type: 'line', status: '' },
      { label: 'Placé', type: 'step', status: '' },
    ],
  },
  {
    id: 'p2',
    names: 'Sophie Lefevre × MedTech Solutions',
    detail: 'DRH · 950 €/j · Lyon · 6 mois',
    av1: { initials: 'SL', color: '#059669' },
    av2: { initials: 'MS', color: '#059669' },
    badge: { label: 'En cours', className: 'pipe-badge-placed' },
    steps: [
      { label: '✓ Qualif. cand.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'done' },
      { label: '✓ Qualif. entrep.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'done' },
      { label: '✓ Entretien match', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'active' },
      { label: '⏳ Placé', type: 'step', status: 'active' },
    ],
  },
  {
    id: 'p3',
    names: 'Pierre Audibert × Foncière Nexus',
    detail: 'COO · 1 300 €/j · Bordeaux · 12 mois',
    av1: { initials: 'PA', color: '#b45309' },
    av2: { initials: 'FN', color: '#0369a1' },
    badge: { label: 'En attente', className: 'pipe-badge-pending' },
    steps: [
      { label: '✓ Qualif. cand.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'active' },
      { label: '⏳ Qualif. entrep.', type: 'step', status: 'active' },
      { label: '', type: 'line', status: '' },
      { label: 'Entretien match', type: 'step', status: '' },
      { label: '', type: 'line', status: '' },
      { label: 'Placé', type: 'step', status: '' },
    ],
  },
]

const dayGroups = [
  { label: 'Lundi 26 mai', count: 2, ids: ['e1', 'e2'] },
  { label: 'Mardi 27 mai', count: 1, ids: ['e3'] },
  { label: 'Jeudi 29 mai', count: 2, ids: ['e4', 'e5'] },
]

export default function AdminScreen({ kpis }: AdminScreenProps) {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)

  const getStatusBadge = (status: Interview['status']) => {
    if (status === 'confirmed') return { cls: 'pstatus-confirmed', lbl: 'Confirmé' }
    if (status === 'pending') return { cls: 'pstatus-pending', lbl: 'En attente' }
    return { cls: 'pstatus-todo', lbl: 'À faire' }
  }

  return (
    <div className="screen">
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
        Tableau de bord
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        Vue d&apos;ensemble de votre activité BridgeFlow
      </div>

      <div className="kpi-row" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-val">{kpis.activeCandidates}</div>
          <div className="kpi-lbl">Candidats actifs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-val">{kpis.openMissions}</div>
          <div className="kpi-lbl">Missions ouvertes</div>
        </div>
        <div className="kpi-card kpi-accent">
          <div className="kpi-val">{kpis.activeMatches}</div>
          <div className="kpi-lbl">Matchs en cours</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-val">{kpis.plannedInterviews}</div>
          <div className="kpi-lbl">Entretiens planifiés</div>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-left">
          {/* Alerts */}
          <div className="card">
            <div className="card-title">
              <span className="dot"></span>
              Actions requises
              <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 50, padding: '1px 7px', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>4</span>
            </div>
            {[
              { id: 'e1', cls: 'alert-urgent', icon: '🔴', title: 'Qualifier Jean-Marc Rousseau', sub: 'Entretien de qualification à planifier · DAF · Paris · TJM 1 050 €/j' },
              { id: 'e2', cls: 'alert-normal', icon: '🟡', title: 'Appel Groupe Leclerc en attente', sub: 'Qualification besoin entreprise · Demain 10h30 · Marie Dupont, DG' },
              { id: 'e3', cls: 'alert-normal', icon: '🟡', title: 'Match mutuel à confirmer', sub: 'Sophie Lefevre × MedTech Solutions · DRH · Lyon' },
              { id: 'e4', cls: 'alert-info', icon: '🔵', title: 'Pierre Audibert — CV reçu', sub: 'Profil COO Supply Chain à examiner avant validation · TJM 1 200 €/j' },
            ].map(a => (
              <div
                key={a.id}
                className={`alert-item ${a.cls}`}
                onClick={() => setSelectedInterview(INTERVIEWS.find(i => i.id === a.id) ?? null)}
              >
                <div className="alert-icon">{a.icon}</div>
                <div className="alert-body">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-sub">{a.sub}</div>
                </div>
                <div className="alert-action">→</div>
              </div>
            ))}
          </div>

          {/* Planning */}
          <div className="card" id="planning">
            <div className="card-title">
              <span className="dot"></span>
              Planning entretiens — Semaine du 26 mai
              <span style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
                <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(96,165,250,0.1)', color: 'var(--blue)', borderRadius: 3 }}>■ Qualif. candidat</span>
                <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(167,139,250,0.1)', color: 'var(--purple)', borderRadius: 3 }}>■ Qualif. entreprise</span>
                <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(74,222,128,0.1)', color: 'var(--green)', borderRadius: 3 }}>■ Entretien match</span>
              </span>
            </div>

            {dayGroups.map(day => (
              <div key={day.label}>
                <div className="pday-header">
                  <div className="pday-label">{day.label}</div>
                  <div className="pday-count">{day.count} entretien{day.count > 1 ? 's' : ''}</div>
                </div>
                {day.ids.map(id => {
                  const interview = INTERVIEWS.find(i => i.id === id)
                  if (!interview) return null
                  const { cls, lbl } = getStatusBadge(interview.status)
                  return (
                    <div
                      key={id}
                      className="planning-slot"
                      onClick={() => setSelectedInterview(interview)}
                    >
                      <div className="pslot-time">
                        <div className="pslot-hour">{interview.heure}</div>
                        <div className="pslot-dur">{interview.duree}</div>
                      </div>
                      <div className={`pslot-bar ${interview.barClass}`}></div>
                      <div className="pslot-body">
                        <div className="pslot-type">{interview.type === 'match' ? '🎯 ' : ''}{interview.typeLbl}</div>
                        <div className="pslot-name">{interview.name}</div>
                        <div className="pslot-detail">{interview.role} · {interview.tjm} · {interview.location}</div>
                        <div className="pslot-format">{interview.format}</div>
                      </div>
                      <div className={`pslot-status ${cls}`}>{lbl}</div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="card" id="pipeline">
            <div className="card-title"><span className="dot"></span>Pipeline matchs</div>
            {PIPELINE.map(p => (
              <div key={p.id} className="pipeline-item" onClick={() => setSelectedInterview(INTERVIEWS.find(i => i.id === 'e3') ?? null)}>
                <div className="pipe-header">
                  <div className="pipe-av" style={{ background: p.av1.color }}>{p.av1.initials}</div>
                  <div className="pipe-heart">♥</div>
                  <div className="pipe-av" style={{ background: p.av2.color }}>{p.av2.initials}</div>
                  <div style={{ marginLeft: 8 }}>
                    <div className="pipe-names">{p.names}</div>
                    <div className="pipe-detail-txt">{p.detail}</div>
                  </div>
                  <span className={`pipe-badge ${p.badge.className}`}>{p.badge.label}</span>
                </div>
                <div className="pipe-progress">
                  {p.steps.map((step, i) =>
                    step.type === 'step' ? (
                      <div key={i} className={`pipe-step${step.status === 'done' ? ' done' : step.status === 'active' ? ' active' : ''}`}>
                        {step.label}
                      </div>
                    ) : (
                      <div key={i} className={`pipe-line${step.status === 'done' ? ' done' : step.status === 'active' ? ' active' : ''}`}></div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="admin-right">
          {selectedInterview ? (
            <div className="detail-panel" style={{ display: 'block', animation: 'fadeIn 0.2s' }}>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`dp-type-badge ${selectedInterview.typeClass}`}>{selectedInterview.typeLbl}</span>
                <span className={`pslot-status ${getStatusBadge(selectedInterview.status).cls}`}>
                  {getStatusBadge(selectedInterview.status).lbl}
                </span>
              </div>
              <div className="dp-title">{selectedInterview.name}</div>
              <div className="dp-sub">{selectedInterview.role}</div>
              <div className="dp-grid">
                <div className="dp-item"><div className="dp-val">{selectedInterview.date}</div><div className="dp-lab">Date</div></div>
                <div className="dp-item"><div className="dp-val">{selectedInterview.heure} · {selectedInterview.duree}</div><div className="dp-lab">Heure</div></div>
                <div className="dp-item"><div className="dp-val">{selectedInterview.tjm}</div><div className="dp-lab">TJM</div></div>
                <div className="dp-item"><div className="dp-val">{selectedInterview.location}</div><div className="dp-lab">Lieu</div></div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{selectedInterview.format}</div>
              <div className="dp-notes-lbl">Mes notes</div>
              <div className="dp-notes">{selectedInterview.notes}</div>
              <div className="dp-actions">
                {selectedInterview.actions.map((action, i) => (
                  <button
                    key={i}
                    style={{
                      width: '100%', padding: 10, borderRadius: 50, fontSize: 13,
                      fontWeight: i === 0 ? 600 : 500, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      background: i === 0 ? 'var(--accent)' : 'transparent',
                      color: i === 0 ? '#0a0a0f' : 'var(--text)',
                      border: i === 0 ? 'none' : '1px solid var(--border2)',
                    }}
                    onClick={() => setSelectedInterview(null)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 13 }}>Cliquez sur un entretien pour voir les détails</div>
            </div>
          )}

          <div className="card">
            <div className="card-title"><span className="dot"></span>Activité récente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🎯', title: 'Match confirmé', sub: 'S. Lefevre × MedTech · il y a 2h' },
                { icon: '📄', title: 'CV reçu', sub: 'Pierre Audibert · il y a 3h' },
                { icon: '🏢', title: 'Nouvelle mission', sub: 'Foncière Nexus · DG · hier' },
                { icon: '📅', title: 'Entretien planifié', sub: 'S. Lefevre × MedTech · Mardi 10h30' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, padding: 8, background: 'var(--surface2)', borderRadius: 'var(--radius-xs)' }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{item.title}</div>
                    <div style={{ color: 'var(--text2)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title"><span className="dot"></span>Revenus plateforme</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text2)' }}>En cours (3 managers)</span>
                <span style={{ fontWeight: 600 }}>5 400 €/mois</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text2)' }}>Marge moyenne</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>18%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text2)' }}>Projection annuelle</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>~71 000 €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
