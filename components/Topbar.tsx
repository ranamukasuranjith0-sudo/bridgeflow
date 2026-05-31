'use client'

interface TopbarProps {
  title: string
  showViewPill?: boolean
  currentView?: 'manager' | 'entreprise'
  onViewChange?: (view: 'manager' | 'entreprise') => void
  userRole?: string
  onMenuToggle?: () => void
}

export default function Topbar({ title, showViewPill, currentView, onViewChange, userRole, onMenuToggle }: TopbarProps) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Burger button — visible uniquement sur mobile */}
        <button
          className="burger-btn"
          onClick={onMenuToggle}
          style={{ display: 'none' }}
          id="burger-btn"
          aria-label="Menu"
        >
          ☰
        </button>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-right">
        {showViewPill && userRole === 'admin' && onViewChange && (
          <div className="view-pill">
            <button
              className={`vpill-btn ${currentView === 'manager' ? 'active' : ''}`}
              onClick={() => onViewChange('manager')}
            >
              Vue Manager
            </button>
            <button
              className={`vpill-btn ${currentView === 'entreprise' ? 'active' : ''}`}
              onClick={() => onViewChange('entreprise')}
            >
              Vue Recruteur{' '}
              <span style={{ display: 'inline-block', width: 7, height: 7, background: 'var(--red)', borderRadius: '50%', marginLeft: 4, verticalAlign: 'middle' }} />
            </button>
          </div>
        )}
        <div className="notif-btn" title="Notifications">
          🔔
          <div className="notif-dot-abs" />
        </div>
      </div>
    </div>
  )
}
