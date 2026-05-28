'use client'

import { useState } from 'react'

interface KPIs {
  activeCandidates: number
  openMissions: number
  activeMatches: number
  plannedInterviews: number
}

interface RealInterview {
  id: string
  type: string
  status: string
  calendly_link: string | null
  scheduled_at: string | null
  notes: string | null
  created_at: string
  candidates: {
    id: string
    name: string
    role_function: string
    tjm: number | null
    location: string | null
  } | null
  companies: {
    id: string
    company_name: string
    contact_name: string | null
    location: string | null
    budget_tjm: number | null
  } | null
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
  calendlyLink?: string | null
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
  interviews?: RealInterview[]
}

const STATIC_INTERVIEWS: Interview[] = [
  {
    id: 'e1', type: 'qual', typeLbl: 'Qualification candidat', typeClass: 'dp-type-qual',
    name: 'Jean-Marc Rousseau', role: 'DAF / CFO',
    date: 'Lundi 26 mai', heure: '09h00', duree: '30 min', format: 'Tel',
    tjm: '1 050 EUR/j', location: 'Paris',
    notes: 'Verifier : 2 dernieres references, disponibilite exacte, TJM negociable.',
    status: 'todo', actions: ['Appeler maintenant', 'Valider le profil', 'Refuser'],
    barClass: 'qual',
  },
  {
    id: 'e2', type: 'entreprise', typeLbl: 'Qualification entreprise', typeClass: 'dp-type-ent',
    name: 'Groupe Leclerc Industries', role: 'Marie Dupont - DG',
    date: 'Lundi 26 mai', heure: '14h00', duree: '30 min', format: 'Visio Google Meet',
    tjm: 'Budget 1 100 EUR/j', location: 'Paris 8e',
    notes: 'Comprendre le perimetre exact : restructuration pure ou acquisition ?',
    status: 'todo', actions: ['Rejoindre la visio', 'Envoyer des profils', 'Reporter'],
    barClass: 'entreprise',
  },
  {
    id: 'e3', type: 'match', typeLbl: 'Entretien de match', typeClass: 'dp-type-match',
    name: 'Sophie Lefevre x MedTech Solutions', role: 'DRH x Startup Series B',
    date: 'Mardi 27 mai', heure: '10h30', duree: '30 min', format: 'Calendly envoye aux deux parties',
    tjm: '950 EUR/j - 6 mois', location: 'Lyon',
    notes: 'Match mutuel confirme. Calendly envoye automatiquement.',
    status: 'confirmed', actions: ['Voir le Calendly', 'Contacter Sophie', 'Contacter MedTech'],
    barClass: 'match',
  },
]

const PIPELINE: PipelineItem[] = [
  {
    id: 'p1',
    names: 'Jean-Marc Rousseau x Renault Supply Chain',
    detail: 'DAF - 1 100 EUR/j - Paris - 9 mois',
    av1: { initials: 'JR', color: '#7c3aed' },
    av2: { initials: 'RS', color: '#b45309' },
    badge: { label: 'Entretien', className: 'pipe-badge-interview' },
    steps: [
      { label: 'Qualif. cand.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'done' },
      { label: 'Qualif. entrep.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'active' },
      { label: 'Entretien match', type: 'step', status: 'active' },
      { label: '', type: 'line', status: '' },
      { label: 'Place', type: 'step', status: '' },
    ],
  },
  {
    id: 'p2',
    names: 'Sophie Lefevre x MedTech Solutions',
    detail: 'DRH - 950 EUR/j - Lyon - 6 mois',
    av1: { initials: 'SL', color: '#059669' },
    av2: { initials: 'MS', color: '#059669' },
    badge: { label: 'En cours', className: 'pipe-badge-placed' },
    steps: [
      { label: 'Qualif. cand.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'done' },
      { label: 'Qualif. entrep.', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'done' },
      { label: 'Entretien match', type: 'step', status: 'done' },
      { label: '', type: 'line', status: 'active' },
      { label: 'Place', type: 'step', status: 'active' },
    ],
  },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'A planifier'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatHeure(dateStr: string | null): string {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function convertRealInterview(r: RealInterview): Interview {
  const candidateName = r.candidates?.name ?? 'Candidat'
  const companyName = r.companies?.company_name ?? 'Entreprise'
  const name = `${candidateName} x ${companyName}`
  const role = `${r.candidates?.role_function ?? ''} x ${r.companies?.contact_name ?? ''}`
  const tjm = r.candidates?.tjm ? `${r.candidates.tjm.toLocaleString('fr-FR')} EUR/j` : '--'
  const location = r.candidates?.location ?? r.companies?.location ?? '--'
  const date = formatDate(r.scheduled_at)
  const heure = formatHeure(r.scheduled_at)
  const format = r.calendly_link ? 'Calendly envoye aux deux parties' : 'En attente Calendly'
  const status: Interview['status'] = r.status === 'confirmed' ? 'confirmed' : r.status === 'pending' ? 'pending' : 'todo'

  const actions = r.calendly_link
    ? ['Voir le Calendly', `Contacter ${candidateName}`, `Contacter ${companyName}`]
    : [`Contacter ${candidateName}`, `Contacter ${companyName}`, 'Envoyer Calendly']

  return {
    id: r.id,
    type: 'match',
    typeLbl: 'Entretien de match',
    typeClass: 'dp-type-match',
    name,
    role,
    date,
    heure,
    duree: '30 min',
    format,
    tjm,
    location,
    notes: r.notes ?? '',
    status,
    actions,
    barClass: 'match',
    calendlyLink: r.calendly_link,
  }
}

export default function AdminScreen({ kpis, interviews: realInterviews = [] }: AdminScreenProps) {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)

  const interviews: Interview[] = realInterviews.length > 0
    ? realInterviews.map(convertRealInterview)
    : STATIC_INTERVIEWS

  const groupedByDate = interviews.reduce((acc, interview) => {
    const key = interview.date
    if (!acc[key]) acc[key] = []
    acc[key].push(interview)
    return acc
  }, {} as Record<string, Interview[]>)

  const dayGroups = Object.entries(groupedByDate).map(([label, items]) => ({
    label,
    count: items.length,
    ids: items.map(i => i.id),
  }))

  const getStatusBadge = (status: Interview['status']) => {
    if (status === 'confirmed') return { cls: 'pstatus-confirmed', lbl: 'Confirme' }
    if (status === 'pending') return { cls: 'pstatus-pending', lbl: 'En attente' }
    return { cls: 'pstatus-todo', lbl: 'A faire' }
  }

  return (
    <div className="screen">
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
        Tableau de bord
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        Vue d&apos;ensemble de votre activite BridgeFlow
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
          <div className="kpi-lbl">Entretiens planifies</div>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-left">

          <div className="card">
            <div className="card-title">
              <span className="dot"></span>
              Actions requises
              {interviews.filter(i => i.status !== 'confirmed').length > 0 && (
                <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 50, padding: '1px 7px', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>
                  {interviews.filter(i => i.status !== 'confirmed').length}
                </span>
              )}
            </div>
            {interviews.filter(i => i.status !== 'confirmed').slice(0, 4).map(interview => (
              <div
                key={interview.id}
                className={`alert-item ${interview.status === 'pending' ? 'alert-normal' : 'alert-urgent'}`}
                onClick={() => setSelectedInterview(interview)}
              >
                <div className="alert-icon">{interview.status === 'pending' ? '!' : '!!'}</div>
                <div className="alert-body">
                  <div className="alert-title">{interview.name}</div>
                  <div className="alert-sub">{interview.role} - {interview.tjm} - {interview.location}</div>
                </div>
                <div className="alert-action">{'>'}</div>
              </div>
            ))}
            {interviews.filter(i => i.status !== 'confirmed').length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text3)', fontSize: 13 }}>
                Aucune action requise
              </div>
            )}
          </div>

          <div className="card" id="planning">
            <div className="card-title">
              <span className="dot"></span>
              Planning entretiens
              {realInterviews.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--green)', marginLeft: 8 }}>Live</span>
              )}
              <span style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
                <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(74,222,128,0.1)', color: 'var(--green)', borderRadius: 3 }}>Entretien match</span>
              </span>
            </div>

            {dayGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                Aucun entretien planifie pour l&apos;instant.
                Les entretiens apparaitront ici lors des matchs mutuels.
              </div>
            ) : (
              dayGroups.map(day => (
                <div key={day.label}>
                  <div className="pday-header">
                    <div className="pday-label">{day.label}</div>
                    <div className="pday-count">{day.count} entretien{day.count > 1 ? 's' : ''}</div>
                  </div>
                  {day.ids.map(id => {
                    const interview = interviews.find(i => i.id === id)
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
                          <div className="pslot-type">{interview.typeLbl}</div>
                          <div className="pslot-name">{interview.name}</div>
                          <div className="pslot-detail">{interview.role} - {interview.tjm} - {interview.location}</div>
                          <div className="pslot-format">{interview.format}</div>
                        </div>
                        <div className={`pslot-status ${cls}`}>{lbl}</div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          <div className="card" id="pipeline">
            <div className="card-title"><span className="dot"></span>Pipeline matchs</div>
            {PIPELINE.map(p => (
              <div key={p.id} className="pipeline-item">
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
                <div className="dp-item"><div className="dp-val">{selectedInterview.heure} - {selectedInterview.duree}</div><div className="dp-lab">Heure</div></div>
                <div className="dp-item"><div className="dp-val">{selectedInterview.tjm}</div><div className="dp-lab">TJM</div></div>
                <div className="dp-item"><div className="dp-val">{selectedInterview.location}</div><div className="dp-lab">Lieu</div></div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{selectedInterview.format}</div>
              {selectedInterview.calendlyLink && (
                <div style={{ marginBottom: 12 }}>
                  <a
                    href={selectedInterview.calendlyLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    Lien Calendly: {selectedInterview.calendlyLink}
                  </a>
                </div>
              )}
              {selectedInterview.notes && (
                <>
                  <div className="dp-notes-lbl">Notes</div>
                  <div className="dp-notes">{selectedInterview.notes}</div>
                </>
              )}
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
                    onClick={() => {
                      if (action.includes('Calendly') && selectedInterview.calendlyLink) {
                        window.open(selectedInterview.calendlyLink, '_blank')
                      } else {
                        setSelectedInterview(null)
                      }
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 13 }}>Cliquez sur un entretien pour voir les details</div>
            </div>
          )}

          <div className="card">
            <div className="card-title"><span className="dot"></span>Activite recente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {interviews.slice(0, 4).map((interview, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, padding: 8, background: 'var(--surface2)', borderRadius: 'var(--radius-xs)' }}>
                  <span style={{ fontSize: 14 }}>🎯</span>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>Entretien match</div>
                    <div style={{ color: 'var(--text2)', marginTop: 2 }}>{interview.name}</div>
                  </div>
                </div>
              ))}
              {interviews.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 8 }}>
                  Aucune activite recente
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title"><span className="dot"></span>Revenus plateforme</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text2)' }}>Matchs actifs ({kpis.activeMatches})</span>
                <span style={{ fontWeight: 600 }}>{(kpis.activeMatches * 1800).toLocaleString('fr-FR')} EUR/mois</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text2)' }}>Marge moyenne</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>18%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text2)' }}>Projection annuelle</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>~{(kpis.activeMatches * 1800 * 12 * 0.18).toLocaleString('fr-FR')} EUR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
