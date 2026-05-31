'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

type RegistrationType = 'candidat' | 'entreprise' | null

const SECTORS = ['Industrie', 'Finance', 'Tech / IT', 'Santé', 'Retail', 'Énergie', 'Immobilier', 'Services', 'Agroalimentaire', 'Conseil']
const SKILLS = ['Restructuration', 'Turnaround', 'M&A', 'Transformation digitale', 'Levée de fonds', 'Change management', 'ERP / SAP', 'International']

const REQ = <span style={{ color: '#e74c3c', marginLeft: 2 }}>*</span>

const FUNCTIONS_OPTIONS = [
  { group: 'Finance & Gestion', options: [
    'CFO / Directeur Financier',
    'RAF / Responsable Administratif et Financier',
    'Directeur Contrôle de Gestion',
    'Directeur Comptable',
    'FP&A Manager',
    'Trésorier / Cash Management',
    'Responsable Comptable',
    'Directeur de la Trésorerie',
    'Consultant Finance',
  ]},
  { group: 'Ressources Humaines', options: [
    'DRH / Directeur RH',
    'HRBP Senior',
    'Responsable Paie & Administration RH',
    'Directeur Talent & Acquisition',
    'Responsable Formation & Développement',
    'Responsable Relations Sociales',
    'HR Manager',
    'Directeur Compensation & Benefits',
    'Consultant RH',
  ]},
  { group: 'Supply Chain & Industrie', options: [
    'Directeur Supply Chain',
    'Directeur des Achats',
    'Directeur Logistique',
    'Directeur de Production',
    'Responsable Planning & Approvisionnement',
    'Directeur Industriel',
    'Responsable Lean / Excellence Opérationnelle',
    'Directeur Qualité',
    'Consultant Supply Chain & Industrie',
  ]},
  { group: "Systèmes d'Information", options: [
    'DSI / Directeur SI',
    'CTO / Directeur Technique',
    'Directeur Digital & Transformation',
    'Directeur de Projet IT / PMO',
    'Responsable Cybersécurité / RSSI',
    'Consultant expert en logiciels',
    'Consultant IA',
    'Architecte SI',
    'Consultant Infrastructure & Cloud',
    'Product Manager Senior',
  ]},
  { group: 'Commerce & Marketing', options: [
    'Directeur Commercial',
    'VP Sales / Directeur des Ventes',
    'Head of Sales',
    'Directeur Marketing',
    'Directeur Développement Business',
    'Directeur CRM & Expérience Client',
    'Directeur Communication',
    'Responsable Marketing Digital',
  ]},
  { group: 'PMO & Gestion de Projet', options: [
    'Directeur de Programme',
    'PMO Manager',
    'Chef de Projet Senior',
    'Directeur Transformation',
    'Responsable Bureau des Projets',
    'Project Manager Senior',
  ]},
  { group: 'Autres', options: ['Autres'] },
]

function FunctionSelect({ value, onChange, otherValue, onOtherChange }: {
  value: string
  onChange: (v: string) => void
  otherValue: string
  onOtherChange: (v: string) => void
}) {
  return (
    <>
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Sélectionner...</option>
        {FUNCTIONS_OPTIONS.map(group => (
          <optgroup key={group.group} label={`── ${group.group}`}>
            {group.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {value === 'Autres' && (
        <input
          type="text"
          placeholder="Précisez votre poste..."
          value={otherValue}
          onChange={e => onOtherChange(e.target.value)}
          style={{ marginTop: 8 }}
        />
      )}
    </>
  )
}

function StepsBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="steps-bar">
      {steps.map((label, i) => {
        const idx = i + 1
        const dotCls = idx < current ? 'done' : idx === current ? 'active' : ''
        const lineCls = idx < current ? 'done' : idx === current ? 'active' : ''
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'unset' }}>
            <div className="step-wrap">
              <div className={`step-dot ${dotCls}`}>{idx < current ? '✓' : idx}</div>
              <div className="step-lbl" style={{ color: idx === current ? 'var(--accent)' : idx < current ? 'var(--green)' : 'var(--text3)' }}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && <div className={`step-line ${lineCls}`}></div>}
          </div>
        )
      })}
    </div>
  )
}

function TagSelector({ tags, selected, onToggle }: { tags: string[]; selected: string[]; onToggle: (t: string) => void }) {
  return (
    <div className="tags-wrap">
      {tags.map(tag => (
        <span
          key={tag}
          className={`tag${selected.includes(tag) ? ' active' : ''}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function ManagerForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [cvName, setCvName] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [otherFunction, setOtherFunction] = useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    function: '', tjm: '', location: '', availability: '',
    legalStatus: '', mobility: '', experienceSummary: '',
  })

  const toggleSector = (s: string) => {
    setSelectedSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError('Le CV ne doit pas dépasser 5MB.'); return }
      setCvFile(file)
      setCvName(file.name)
    }
  }

  const handleSubmit = async () => {
    if (!form.firstName.trim()) { setError('Le prénom est obligatoire.'); return }
    if (!form.lastName.trim()) { setError('Le nom est obligatoire.'); return }
    if (!form.email.trim()) { setError("L'email est obligatoire."); return }
    if (!form.phone.trim()) { setError('Le téléphone est obligatoire.'); return }
    if (!form.availability) { setError('La disponibilité est obligatoire.'); return }

    setLoading(true)
    setError('')

    try {
      let cvUrl: string | null = null
      if (cvFile) {
        const fileName = `${Date.now()}_${cvFile.name.replace(/\s+/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(fileName, cvFile, { upsert: false })
        if (uploadError) { setError("Erreur lors de l'upload du CV : " + uploadError.message); setLoading(false); return }
        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(uploadData.path)
        cvUrl = urlData.publicUrl
      }

      const finalFunction = form.function === 'Autres' ? otherFunction : form.function
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email, phone: form.phone,
          role_function: finalFunction,
          tjm: form.tjm ? parseInt(form.tjm) : null,
          location: form.location, availability: form.availability,
          legal_status: form.legalStatus, mobility: form.mobility,
          experience_summary: form.experienceSummary,
          sectors: selectedSectors, cv_url: cvUrl,
        }),
      })
      if (!res.ok) { const data = await res.json(); setError(data.error ?? "Erreur lors de l'envoi"); setLoading(false); return }
      setStep(2)
    } catch { setError('Erreur réseau') }
    setLoading(false)
  }

  return (
    <>
      <StepsBar steps={['Profil', 'Entretien', 'Confirmation']} current={step} />
      {step === 1 && (
        <div className="card">
          <div className="card-title"><span className="dot"></span>Étape 1 — Profil manager</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Les champs marqués <span style={{ color: '#e74c3c' }}>*</span> sont obligatoires</div>
          {error && <div className="login-error">{error}</div>}
          <div className="form-grid-2">
            <div className="form-group"><label>Prénom {REQ}</label><input type="text" placeholder="Jean" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div className="form-group"><label>Nom {REQ}</label><input type="text" placeholder="Dupont" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            <div className="form-group"><label>Email {REQ}</label><input type="email" placeholder="jean@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>Téléphone {REQ}</label><input type="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-group"><label>Fonction</label><FunctionSelect value={form.function} onChange={v => setForm(f => ({ ...f, function: v }))} otherValue={otherFunction} onOtherChange={setOtherFunction} /></div>
            <div className="form-group"><label>TJM souhaité (€/j)</label><input type="number" placeholder="900" value={form.tjm} onChange={e => setForm(f => ({ ...f, tjm: e.target.value }))} /></div>
            <div className="form-group"><label>Localisation</label><input type="text" placeholder="Paris, Île-de-France" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div className="form-group"><label>Disponibilité {REQ}</label>
              <select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}>
                <option value="">Sélectionner...</option>
                <option>Immédiate (72h)</option><option>Sous 2 semaines</option><option>Sous 1 mois</option>
              </select>
            </div>
            <div className="form-group"><label>Statut juridique</label>
              <select value={form.legalStatus} onChange={e => setForm(f => ({ ...f, legalStatus: e.target.value }))}>
                <option value="">Sélectionner...</option>
                <option>AE — BNC</option><option>AE — BIC</option><option>AE — Artisan</option>
                <option>SASU</option><option>EURL / SARL</option><option>Salarié porté</option>
              </select>
            </div>
            <div className="form-group"><label>Mobilité</label>
              <select value={form.mobility} onChange={e => setForm(f => ({ ...f, mobility: e.target.value }))}>
                <option value="">Sélectionner...</option>
                <option>Île-de-France</option><option>France entière</option><option>Europe</option><option>International</option>
              </select>
            </div>
            <div className="form-group full"><label>Résumé expérience</label><textarea placeholder="15 ans d'expérience en direction financière..." value={form.experienceSummary} onChange={e => setForm(f => ({ ...f, experienceSummary: e.target.value }))} /></div>
            <div className="form-group full"><label>Secteurs d&apos;expertise</label><TagSelector tags={SECTORS} selected={selectedSectors} onToggle={toggleSector} /></div>
            <div className="form-group full">
              <label>CV (PDF)</label>
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon">📄</div>
                <div className="upload-txt">{cvName ? `✓ ${cvName}` : 'Glissez votre CV ici ou cliquez pour uploader'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>PDF, max 5MB</div>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Envoi en cours...' : 'Continuer — Choisir un créneau →'}</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="card">
          <div className="card-title"><span className="dot"></span>Étape 2 — Entretien de qualification</div>
          <div className="human-badge">
            <div className="hb-icon">🤝</div>
            <div>
              <div className="hb-title">Un échange humain avant tout</div>
              <div className="hb-sub">Je rencontre personnellement chaque manager — vérification des références, challenge de l&apos;expertise. 20-30 min, téléphone ou visio.</div>
            </div>
          </div>
          <div className="section-label" style={{ marginBottom: 10 }}>Choisissez un créneau</div>
          <div style={{ minHeight: 650, borderRadius: 8, overflow: 'hidden' }}>
            <iframe src="https://calendly.com/suranjith-ranamuka/appel-de-qualification-bridgeflow" width="100%" height="650" frameBorder="0" style={{ border: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>← Retour</button>
            <button className="btn-primary" onClick={() => setStep(3)}>J&apos;ai réservé mon créneau →</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <div className="confirm-screen">
            <div className="confirm-emoji">✅</div>
            <div className="confirm-title">Demande envoyée !</div>
            <div className="confirm-sub">Votre profil et CV ont bien été reçus. Confirmation du créneau par email sous 2h.</div>
            <div className="pending-steps">
              <div className="pstep done">✓ Profil soumis</div>
              <div className="pstep active">⏳ Entretien de qualification à venir</div>
              <div className="pstep">○ Validation et accès à BridgeFlow</div>
            </div>
            <div className="contact-note">📧 Email de confirmation envoyé · <span style={{ color: 'var(--accent)' }}>contact@bridgeflow.consulting</span></div>
          </div>
        </div>
      )}
    </>
  )
}

function EntrepriseForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [otherRole, setOtherRole] = useState('')

  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    size: '', roleNeeded: '', missionType: '', duration: '9 mois', budgetTjm: '',
    location: '', startDate: 'Immédiat', context: '', calendlyLink: '',
  })

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = async () => {
    if (!form.companyName.trim()) { setError("Le nom de l'entreprise est obligatoire."); return }
    if (!form.contactName.trim()) { setError('Votre nom et fonction sont obligatoires.'); return }
    if (!form.email.trim()) { setError("L'email est obligatoire."); return }
    if (!form.phone.trim()) { setError('Le téléphone est obligatoire.'); return }

    setLoading(true)
    setError('')
    try {
      const finalRole = form.roleNeeded === 'Autres' ? otherRole : form.roleNeeded
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.companyName, contact_name: form.contactName,
          email: form.email, phone: form.phone, size: form.size,
          role_needed: finalRole, mission_type: form.missionType,
          duration: form.duration,
          budget_tjm: form.budgetTjm ? parseInt(form.budgetTjm) : null,
          location: form.location, start_date: form.startDate,
          context: form.context, required_skills: selectedSkills,
          calendly_link: form.calendlyLink,
        }),
      })
      if (!res.ok) { const data = await res.json(); setError(data.error ?? "Erreur lors de l'envoi"); setLoading(false); return }
      setStep(2)
    } catch { setError('Erreur réseau') }
    setLoading(false)
  }

  return (
    <>
      <StepsBar steps={['Besoin', 'Appel', 'Confirmation']} current={step} />
      {step === 1 && (
        <div className="card">
          <div className="card-title"><span className="dot"></span>Étape 1 — Votre besoin</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Les champs marqués <span style={{ color: '#e74c3c' }}>*</span> sont obligatoires</div>
          {error && <div className="login-error">{error}</div>}
          <div className="form-grid-2">
            <div className="form-group"><label>Nom de l&apos;entreprise {REQ}</label><input type="text" placeholder="Acme Corp" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
            <div className="form-group"><label>Votre nom et fonction {REQ}</label><input type="text" placeholder="Marie Martin, DG" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} /></div>
            <div className="form-group"><label>Email {REQ}</label><input type="email" placeholder="contact@acme.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>Téléphone direct {REQ}</label><input type="tel" placeholder="+33 1 23 45 67 89" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-group"><label>Taille entreprise</label>
              <select value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                <option value="">Sélectionner...</option>
                <option>TPE</option><option>PME (10-250)</option><option>ETI (250-5000)</option><option>Grand groupe</option>
              </select>
            </div>
            <div className="form-group"><label>Profil recherché</label>
              <FunctionSelect value={form.roleNeeded} onChange={v => setForm(f => ({ ...f, roleNeeded: v }))} otherValue={otherRole} onOtherChange={setOtherRole} />
            </div>
            <div className="form-group"><label>Type de mission</label>
              <select value={form.missionType} onChange={e => setForm(f => ({ ...f, missionType: e.target.value }))}>
                <option value="">Sélectionner...</option>
                <option>Management de transition</option><option>Remplacement temporaire</option><option>Interim management</option>
              </select>
            </div>
            <div className="form-group"><label>Durée estimée</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                <option>3 mois</option><option>6 mois</option><option>9 mois</option><option>12 mois</option><option>18 mois +</option>
              </select>
            </div>
            <div className="form-group"><label>TJM budget (€/j)</label><input type="number" placeholder="950" value={form.budgetTjm} onChange={e => setForm(f => ({ ...f, budgetTjm: e.target.value }))} /></div>
            <div className="form-group"><label>Localisation</label><input type="text" placeholder="Lyon, Auvergne-Rhône-Alpes" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div className="form-group"><label>Démarrage souhaité</label>
              <select value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}>
                <option>Immédiat</option><option>Sous 2 semaines</option><option>Sous 1 mois</option>
              </select>
            </div>
            <div className="form-group full"><label>Contexte et enjeux de la mission</label>
              <textarea style={{ minHeight: 100 }} placeholder="Dans le cadre d'une restructuration, nous cherchons un DAF pour piloter..." value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} />
            </div>
            <div className="form-group full"><label>Compétences requises</label><TagSelector tags={SKILLS} selected={selectedSkills} onToggle={toggleSkill} /></div>
            <div className="form-group full">
              <label>Votre lien Calendly <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(pour les entretiens avec les candidats)</span></label>
              <input type="url" placeholder="https://calendly.com/votre-nom/entretien" value={form.calendlyLink} onChange={e => setForm(f => ({ ...f, calendlyLink: e.target.value }))} />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                Créez votre lien sur <a href="https://calendly.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>calendly.com</a> — les candidats matchés pourront réserver directement un créneau.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Envoi...' : 'Continuer — Appel de qualification →'}</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="card">
          <div className="card-title"><span className="dot"></span>Étape 2 — Appel de qualification</div>
          {error && <div className="login-error">{error}</div>}
          <div className="human-badge">
            <div className="hb-icon">📞</div>
            <div>
              <div className="hb-title">Je prends chaque appel personnellement</div>
              <div className="hb-sub">Avant de vous présenter des profils, je comprends précisément votre contexte. 20-30 min. Résultat : 2-3 profils ciblés sous 24h — pas une liste de 20 CVs.</div>
            </div>
          </div>
          <div className="section-label" style={{ marginBottom: 10 }}>Choisissez un créneau</div>
          <div style={{ minHeight: 650, borderRadius: 8, overflow: 'hidden' }}>
            <iframe src="https://calendly.com/suranjith-ranamuka/appel-de-qualification-bridgeflow" width="100%" height="650" frameBorder="0" style={{ border: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>← Retour</button>
            <button className="btn-primary" onClick={() => setStep(3)}>J&apos;ai réservé mon créneau →</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <div className="confirm-screen">
            <div className="confirm-emoji">✅</div>
            <div className="confirm-title">Demande reçue !</div>
            <div className="confirm-sub">Votre besoin a bien été enregistré. Confirmation du créneau sous 1h. Après notre appel : 2-3 profils qualifiés sous 24h.</div>
            <div className="pending-steps">
              <div className="pstep done">✓ Besoin soumis</div>
              <div className="pstep active">⏳ Appel de qualification à venir</div>
              <div className="pstep">○ Réception de 2-3 profils ciblés</div>
            </div>
            <div className="contact-note">📧 Confirmation envoyée · <span style={{ color: 'var(--accent)' }}>contact@bridgeflow.consulting</span></div>
          </div>
        </div>
      )}
    </>
  )
}

interface RegisterScreenProps {
  userRole?: string
}

import React from 'react'

export default function RegisterScreen({ userRole }: RegisterScreenProps) {
  const defaultType: RegistrationType =
    userRole === 'entreprise' ? 'entreprise' :
    userRole === 'manager' ? 'candidat' : null

  const [selected, setSelected] = useState<RegistrationType>(defaultType)

  return (
    <div className="screen">
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
        Nouvelle inscription
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        Chaque inscription passe par un échange humain avec notre équipe. Pas de profil publié sans validation.
      </div>

      {!selected && (
        <div className="reg-choice">
          {userRole !== 'entreprise' && (
            <div className={`choice-card${selected === 'candidat' ? ' sel' : ''}`} onClick={() => setSelected('candidat')}>
              <div className="choice-icon">👤</div>
              <div className="choice-title">Je suis manager</div>
              <div className="choice-sub">Je cherche des missions de transition</div>
            </div>
          )}
          {userRole !== 'manager' && (
            <div className={`choice-card${selected === 'entreprise' ? ' sel' : ''}`} onClick={() => setSelected('entreprise')}>
              <div className="choice-icon">🏢</div>
              <div className="choice-title">Entreprise</div>
              <div className="choice-sub">Je cherche un manager de transition</div>
            </div>
          )}
        </div>
      )}

      {selected && userRole !== 'manager' && userRole !== 'entreprise' && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setSelected(null)}>
            ← Changer de type
          </button>
        </div>
      )}

      {selected === 'candidat' && <ManagerForm />}
      {selected === 'entreprise' && <EntrepriseForm />}
    </div>
  )
}
