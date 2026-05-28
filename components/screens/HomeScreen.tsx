import Link from 'next/link'

interface KPIs {
  activeManagers: number
  openMissions: number
  activeMatches: number
  avgDays: string
}

interface HomeScreenProps {
  kpis: KPIs
  role: string
}

export default function HomeScreen({ kpis, role }: HomeScreenProps) {
  return (
    <div className="screen">
      <div className="hero-card">
        <h1>
          Là où les grandes décisions<br />
          <em>se préparent.</em>
        </h1>
        <p>
          Chaque profil a sa mission. Trouvez la vôtre. Plateforme de management de transition par
          sélection humaine — pas d&apos;algorithme sans intervention.
        </p>
        <div className="hero-btns">
          <Link href="/dashboard/match">
            <button className="btn-primary">Découvrir les missions →</button>
          </Link>
          {role === 'admin' && (
            <Link href="/dashboard/admin">
              <button className="btn-secondary">Tableau de bord Admin</button>
            </Link>
          )}
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-val">{kpis.activeManagers}</div>
          <div className="kpi-lbl">Managers actifs</div>
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
          <div className="kpi-val">{kpis.avgDays}</div>
          <div className="kpi-lbl">Délai moyen placement</div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <div className="feature-title">Placement en 72h</div>
          <div className="feature-sub">
            Matching sur compétences, TJM et zone géographique. Résultat : 2-3 profils ciblés, pas
            20 CVs.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <div className="feature-title">Match mutuel</div>
          <div className="feature-sub">
            Candidat postule + Recruteur valide = Calendly automatique déclenché pour les deux
            parties.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <div className="feature-title">Sélection humaine</div>
          <div className="feature-sub">
            Chaque profil passe par un entretien de qualification avec notre équipe avant d&apos;être
            publié.
          </div>
        </div>
      </div>
    </div>
  )
}
