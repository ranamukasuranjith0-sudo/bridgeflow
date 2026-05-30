'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import type { UserProfile } from '@/types'

interface NavItem {
  href: string
  icon: string
  label: string
  badge?: number | string
}

function getNavItems(role: string): NavItem[] {
  if (role === 'admin') {
    return [
      { href: '/dashboard', icon: '⌂', label: 'Accueil' },
      { href: '/dashboard/match', icon: '◈', label: 'Match', badge: 5 },
      { href: '/dashboard/simulator', icon: '⊞', label: 'Simulateur TJM' },
      { href: '/dashboard/admin', icon: '📊', label: 'Tableau de bord', badge: 4 },
      { href: '/dashboard/register', icon: '⊕', label: 'Nouvelle inscription' },
    ]
  }
  if (role === 'manager') {
    return [
      { href: '/dashboard', icon: '⌂', label: 'Accueil' },
      { href: '/dashboard/match', icon: '◈', label: 'Match — Missions', badge: 5 },
      { href: '/dashboard/simulator', icon: '⊞', label: 'Simulateur TJM' },
      { href: '/dashboard/register', icon: '⊕', label: 'Nouvelle inscription' },
    ]
  }
  // entreprise
  return [
    { href: '/dashboard', icon: '⌂', label: 'Accueil' },
    { href: '/dashboard/entreprise', icon: '📊', label: 'Mes missions' },
    { href: '/dashboard/match', icon: '◈', label: 'Candidats' },
    { href: '/dashboard/register', icon: '⊕', label: 'Nouvelle inscription' },
  ]
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

function getRoleLabel(role: string): string {
  if (role === 'admin') return 'Administrateur'
  if (role === 'manager') return 'Manager de Transition'
  return 'Entreprise'
}

interface SidebarProps {
  profile: UserProfile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const role = profile?.role ?? 'manager'
  const navItems = getNavItems(role)
  const initials = getInitials(profile?.name ?? null, profile?.email ?? 'BF')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.replace('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo">Bridge<span>Flow</span></div>
        <div className="logo-sub">Management de Transition</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Principal</div>
        {navItems.slice(0, role === 'admin' ? 3 : navItems.length - 1).map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge !== undefined && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </Link>
        ))}

        {role === 'admin' && (
          <>
            <div className="nav-section">Administration</div>
            <Link
              href="/dashboard/admin"
              className={`nav-item ${isActive('/dashboard/admin') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              Tableau de bord
              <span className="nav-badge">4</span>
            </Link>
            <Link
              href="/dashboard/admin#planning"
              className="nav-item"
            >
              <span className="nav-icon">📅</span>
              Planning entretiens
            </Link>
            <Link
              href="/dashboard/admin#pipeline"
              className="nav-item"
            >
              <span className="nav-icon">⇄</span>
              Pipeline matchs
            </Link>
          </>
        )}

        <div className="nav-section">Inscription</div>
        <Link
          href="/dashboard/register"
          className={`nav-item ${isActive('/dashboard/register') ? 'active' : ''}`}
        >
          <span className="nav-icon">⊕</span>
          Nouvelle inscription
        </Link>
      </nav>
      <div className="sidebar-footer">
        <Link href="/dashboard/profile" className="user-card" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <div className="user-av">{initials}</div>
          <div>
            <div className="user-name">{profile?.name || profile?.email || 'Utilisateur'}</div>
            <div className="user-role">{getRoleLabel(role)}</div>
          </div>
        </Link>
        <button className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
