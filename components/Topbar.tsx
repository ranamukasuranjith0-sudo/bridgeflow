'use client'

interface TopbarProps {
  title: string
  showViewPill?: boolean
  currentView?: 'manager' | 'entreprise'
  onViewChange?: (view: 'manager' | 'entreprise') => void
  userRole?: string
}

export default function Topbar({ title, showViewPill, currentView, onViewChange, userRole }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
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
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  background: 'var(--red)',
                  borderRadius: '50%',
                  marginLeft: 4,
                  verticalAlign: 'middle',
                }}
              />
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
