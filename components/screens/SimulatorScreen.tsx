'use client'

import { useState, useCallback } from 'react'

type Statut = 'ae' | 'sasu' | 'eurl' | 'portage'
type AEType = 'bnc' | 'bic' | 'artisan'

const aeInfo: Record<AEType, string> = {
  bnc: 'BNC (Bénéfices Non Commerciaux) : professions libérales non réglementées — consultants, formateurs, managers de transition. Taux cotisations : 22,2%. Plafond CA annuel : 77 700 €.',
  bic: 'BIC (Bénéfices Industriels et Commerciaux) : prestations de services commerciales. Taux cotisations : 22,2%. Plafond CA : 77 700 €/an.',
  artisan: 'Artisan / Commerçant : activités de transformation ou vente. Taux : 21,2% (services artisans). Plafond CA : 77 700 € (services) / 188 700 € (vente).',
}

const aeRates: Record<AEType, number> = { bnc: 0.222, bic: 0.222, artisan: 0.212 }

const advices: Record<Statut, string> = {
  ae: "L'AE est idéal pour démarrer mais le plafond de 77 700 €/an peut être vite atteint avec un TJM élevé. Au-delà, passez en SASU.",
  sasu: "La SASU avec dividendes est généralement la plus optimisée fiscalement pour des TJM > 600 €/j. La flat tax à 30% est avantageuse.",
  eurl: "L'EURL offre la protection TNS mais les charges sociales à 45% pèsent lourd. Recommandé si vous souhaitez un statut de gérant majoritaire.",
  portage: "Le portage salarial est idéal si vous débutez ou souhaitez garder le statut de salarié (chômage, retraite). Moins optimisé fiscalement mais plus sécurisant.",
}

interface DetailRow {
  n: string
  v: number | string
  raw?: boolean
  c: '' | 'neg' | 'pos'
}

function calcNet(statut: Statut, aeType: AEType, ca: number): { net: number; details: DetailRow[] } {
  if (statut === 'ae') {
    const r = aeRates[aeType]
    const cot = ca * r
    const net = ca - cot
    return {
      net,
      details: [
        { n: `CA mensuel (AE—${aeType.toUpperCase()})`, v: ca, c: '' },
        { n: `Cotisations (${(r * 100).toFixed(1)}%)`, v: -cot, c: 'neg' },
        { n: 'Net disponible / mois', v: net, c: 'pos' },
        { n: 'Plafond annuel', v: aeType === 'artisan' ? '188 700 €' : '77 700 €', raw: true, c: 'neg' },
      ],
    }
  }
  if (statut === 'sasu') {
    const f = ca * 0.03
    const is = (ca - f) * 0.15
    const div = ca - f - is
    const pfu = div * 0.30
    const net = div - pfu
    return {
      net,
      details: [
        { n: 'CA mensuel', v: ca, c: '' },
        { n: 'Frais & charges (3%)', v: -f, c: 'neg' },
        { n: 'IS PME 15%', v: -is, c: 'neg' },
        { n: 'Dividendes bruts', v: div, c: '' },
        { n: 'PFU / flat tax 30%', v: -pfu, c: 'neg' },
        { n: 'Net après flat tax', v: net, c: 'pos' },
      ],
    }
  }
  if (statut === 'eurl') {
    const cot = ca * 0.45
    const f = ca * 0.03
    const b = ca - cot - f
    const is = Math.max(0, b * 0.15)
    const net = b - is
    return {
      net,
      details: [
        { n: 'CA mensuel', v: ca, c: '' },
        { n: 'Charges TNS 45%', v: -cot, c: 'neg' },
        { n: 'Frais 3%', v: -f, c: 'neg' },
        { n: 'IS PME 15%', v: -is, c: 'neg' },
        { n: 'Net après IS', v: net, c: 'pos' },
      ],
    }
  }
  // portage
  const f = ca * 0.09
  const ch = (ca - f) * 0.515
  const net = (ca - f) * 0.485
  return {
    net,
    details: [
      { n: 'CA mensuel', v: ca, c: '' },
      { n: 'Frais portage 9%', v: -f, c: 'neg' },
      { n: 'Charges sociales 51,5%', v: -ch, c: 'neg' },
      { n: 'Salaire net mensuel', v: net, c: 'pos' },
      { n: '+ Protection salarié', v: 'Bulletin de paie', raw: true, c: 'pos' },
    ],
  }
}

export default function SimulatorScreen() {
  const [statut, setStatut] = useState<Statut>('ae')
  const [aeType, setAEType] = useState<AEType>('bnc')
  const [tjm, setTjm] = useState(900)
  const [jours, setJours] = useState(18)

  const ca = tjm * jours
  const { net, details } = calcNet(statut, aeType, ca)
  const taux = Math.round((net / ca) * 100)

  const getNetForStatut = useCallback((s: Statut): number => calcNet(s, aeType, ca).net, [aeType, ca])

  const all = [
    { l: `AE — ${aeType.toUpperCase()}`, v: getNetForStatut('ae'), k: 'ae' as Statut },
    { l: 'SASU (dividendes)', v: getNetForStatut('sasu'), k: 'sasu' as Statut },
    { l: 'EURL / SARL', v: getNetForStatut('eurl'), k: 'eurl' as Statut },
    { l: 'Salarié porté', v: getNetForStatut('portage'), k: 'portage' as Statut },
  ]
  const maxNet = Math.max(...all.map(x => x.v))

  return (
    <>
      <div className="screen">
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
          Simulateur TJM
        </div>
        <div className="sim-layout">
          <div className="sim-left">
            <div className="card">
              <div className="card-title"><span className="dot"></span>Statut juridique</div>
              <div className="statut-tabs">
                {(['ae', 'sasu', 'eurl', 'portage'] as Statut[]).map(s => (
                  <button
                    key={s}
                    className={`statut-btn${statut === s ? ' active' : ''}`}
                    onClick={() => setStatut(s)}
                  >
                    {s === 'ae' ? 'Auto-entrepreneur' : s === 'sasu' ? 'SASU' : s === 'eurl' ? 'EURL / SARL' : 'Salarié porté'}
                  </button>
                ))}
              </div>

              {statut === 'ae' && (
                <div id="ae-block">
                  <div className="ae-pills">
                    {(['bnc', 'bic', 'artisan'] as AEType[]).map(t => (
                      <button
                        key={t}
                        className={`ae-pill${aeType === t ? ' active' : ''}`}
                        onClick={() => setAEType(t)}
                      >
                        {t === 'bnc' ? 'BNC — Libéral' : t === 'bic' ? 'BIC — Prestations' : 'Artisan / Commerçant'}
                      </button>
                    ))}
                  </div>
                  <div className="ae-info">{aeInfo[aeType]}</div>
                </div>
              )}

              <div className="sim-slider-row">
                <div className="sim-top">
                  <span className="sim-lbl">TJM facturé (€/jour)</span>
                  <span className="sim-val">{tjm.toLocaleString('fr-FR')} €</span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={2000}
                  step={50}
                  value={tjm}
                  onChange={e => setTjm(Number(e.target.value))}
                />
              </div>

              <div className="sim-slider-row">
                <div className="sim-top">
                  <span className="sim-lbl">Jours travaillés / mois</span>
                  <span className="sim-val">{jours} j</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={22}
                  step={1}
                  value={jours}
                  onChange={e => setJours(Number(e.target.value))}
                />
              </div>
            </div>

            {/* KPI Results */}
            <div className="results-4">
              <div className="res-card">
                <div className="res-val">{Math.round(ca).toLocaleString('fr-FR')} €</div>
                <div className="res-lbl">CA / mois</div>
              </div>
              <div className="res-card">
                <div className="res-val" style={{ color: 'var(--accent)' }}>
                  {Math.round(net).toLocaleString('fr-FR')} €
                </div>
                <div className="res-lbl">Net / mois</div>
              </div>
              <div className="res-card">
                <div className="res-val">{taux}%</div>
                <div className="res-lbl">Taux net</div>
              </div>
              <div className="res-card">
                <div className="res-val">{Math.round(net * 11).toLocaleString('fr-FR')} €</div>
                <div className="res-lbl">Net / an</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="card">
              <div className="card-title"><span className="dot"></span>Décomposition détaillée</div>
              <div className="breakdown">
                {details.map((d, i) => (
                  <div key={i} className="br-row">
                    <span className="br-n">{d.n}</span>
                    <span className={`br-v ${d.c === 'neg' ? 'val-neg' : d.c === 'pos' ? 'val-pos' : ''}`}>
                      {d.raw ? String(d.v) : `${Math.round(d.v as number).toLocaleString('fr-FR')} €`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sim-right">
            {/* Comparison */}
            <div className="card">
              <div className="card-title"><span className="dot"></span>Comparaison tous statuts</div>
              {all.map(s => (
                <div key={s.k} className="compare-row">
                  <div
                    className="compare-lbl"
                    style={{
                      color: s.k === statut ? 'var(--accent)' : 'var(--text2)',
                      fontWeight: s.k === statut ? 600 : 400,
                    }}
                  >
                    {s.l}
                  </div>
                  <div className="compare-bar">
                    <div
                      className="compare-fill"
                      style={{
                        width: `${Math.round((s.v / maxNet) * 100)}%`,
                        background: s.k === statut ? 'var(--accent)' : 'var(--border2)',
                      }}
                    />
                  </div>
                  <div
                    className="compare-val"
                    style={{
                      color: s.k === statut ? 'var(--accent)' : 'var(--text)',
                      fontWeight: s.k === statut ? 600 : 400,
                    }}
                  >
                    {Math.round(s.v).toLocaleString('fr-FR')} €
                  </div>
                </div>
              ))}
            </div>

            {/* BridgeFlow Advice */}
            <div className="card" style={{ background: 'rgba(200,169,110,0.04)', borderColor: 'rgba(200,169,110,0.15)' }}>
              <div className="card-title"><span className="dot"></span>Conseil BridgeFlow</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                {advices[statut]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
