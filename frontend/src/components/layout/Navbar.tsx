import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Calendar, Sun, Moon, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import './Navbar.css'

const NAV = [
  { to: '/app',           label: 'Discover', icon: Search       },
  { to: '/favourites',    label: 'Saved',    icon: Heart        },
  { to: '/meal-plan',     label: 'Planner',  icon: Calendar     },
  { to: '/shopping-list', label: 'Shopping', icon: ShoppingCart },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, favourites, shoppingList, darkMode, toggleDarkMode } = useStore()

  return (
    <>
      {/* ── Floating pill navbar ── */}
      <div className="navbar-sticky-wrapper">
        <nav className="nav-pill nav-pill-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo-link">
            <div className="nav-logo-icon-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 .55.45 1 1 1h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1"/>
              </svg>
            </div>
            <span className="nav-logo-text">
              Pantry<span className="nav-logo-accent">Pal</span>
            </span>
          </Link>

          {/* Separator */}
          <div className="nav-separator hidden md:block" />

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              const badge = label === 'Saved' ? favourites.length : label === 'Shopping' ? shoppingList.filter(i => !i.checked).length : 0
              return (
                <Link key={to} to={to} className="nav-link-item">
                  <span className={`nav-link-label${active ? ' nav-link-label--active' : ''}`}>
                    <Icon size={13} strokeWidth={active ? 2.5 : 1.75} />
                    {label}
                  </span>
                  {badge > 0 && (
                    <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="nav-right-actions">
            <button onClick={toggleDarkMode} className="nav-dark-toggle">
              {darkMode ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
            </button>

            {user?.isAdmin && (
              <Link to="/admin" className="nav-link-item" title="Admin">
                <span className={`nav-link-label${pathname === '/admin' ? ' nav-link-label--active' : ''}`}>
                  <ShieldCheck size={13} strokeWidth={pathname === '/admin' ? 2.5 : 1.75} />
                  Admin
                </span>
              </Link>
            )}

            {user ? (
              <Link to="/profile" className="nav-user-link">
                <div className="nav-user-avatar">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="nav-user-name hidden sm:block">
                  {user.name}
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-login-link hidden md:block">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary btn-nav-cta">
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 mobile-nav-bar">
        <div className="mobile-nav-inner">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} className={`mobile-nav-item${active ? ' mobile-nav-item--active' : ''}`}>
                <Icon size={19} strokeWidth={active ? 2.5 : 1.75} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
