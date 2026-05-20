import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Heart, Calendar, ShoppingCart, ChefHat, Check, X, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'
import { authService } from '../services/authService'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, clearAuth, favourites, shoppingList, weekPlan, pantryItems } = useStore()
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')
  const mealCount = Object.values(weekPlan).reduce((a, d) => a + Object.values(d || {}).filter(Boolean).length, 0)
  const logout = async () => { await authService.logout(); clearAuth(); toast('Signed out'); navigate('/') }

  if (!user) return (
    <div className="page-shell profile-not-auth">
      <p className="profile-not-auth-code">401</p>
      <h2 className="profile-not-auth-title">Not authenticated</h2>
      <p className="profile-not-auth-sub">Sign in to sync your data across devices.</p>
      <div className="profile-not-auth-actions">
        <Link to="/login" className="btn-primary hero-cta-link">Sign in</Link>
        <Link to="/signup" className="btn-secondary hero-cta-link">Create account</Link>
      </div>
    </div>
  )

  return (
    <div className="page-shell profile-page">
      <h1 className="profile-header">Profile</h1>

      <div className="card profile-card">
        <div className="profile-user-info">
          <div className="profile-avatar">
            <span className="profile-avatar-letter">{(newName || user.name)[0].toUpperCase()}</span>
          </div>
          <div className="profile-user-details">
            {editing ? (
              <div className="profile-name-edit-row">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  className="input-field profile-name-input" />
                <button onClick={() => { setEditing(false); toast.success('Saved') }} className="profile-name-save-btn">
                  <Check size={13} strokeWidth={3} color="#fff" />
                </button>
                <button onClick={() => { setEditing(false); setNewName(user.name) }} className="profile-name-cancel-btn">
                  <X size={13} strokeWidth={2.5} color="var(--text-3)" />
                </button>
              </div>
            ) : (
              <div className="profile-name-display">
                <p className="profile-name-text">{newName || user.name}</p>
                <button onClick={() => setEditing(true)} className="profile-name-edit-btn"><Edit2 size={13} strokeWidth={2} /></button>
              </div>
            )}
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        {[
          { icon: ChefHat,      label: 'Pantry',   val: pantryItems.length  },
          { icon: Heart,        label: 'Saved',    val: favourites.length   },
          { icon: Calendar,     label: 'Planned',  val: mealCount           },
          { icon: ShoppingCart, label: 'Shopping', val: shoppingList.length },
        ].map(({ label, val }) => (
          <div key={label} className="card profile-stat-card">
            <p className="text-purple-gradient profile-stat-value">{val}</p>
            <p className="label">{label}</p>
          </div>
        ))}
      </div>

      <div className="profile-links">
        {[
          { to: '/favourites',    icon: Heart,        label: 'Saved Recipes',  count: favourites.length },
          { to: '/meal-plan',     icon: Calendar,     label: 'Meal Planner',   count: mealCount },
          { to: '/shopping-list', icon: ShoppingCart, label: 'Shopping List',  count: shoppingList.filter(i => !i.checked).length },
        ].map(({ to, icon: Icon, label, count }) => (
          <Link key={to} to={to} className="card-interactive profile-link-item">
            <div className="profile-link-icon-box">
              <Icon size={15} color="var(--terra)" strokeWidth={2} />
            </div>
            <span className="profile-link-label">{label}</span>
            {count > 0 && <span className="profile-link-count">{count}</span>}
          </Link>
        ))}
      </div>

      <button onClick={logout} className="profile-logout-btn">
        <LogOut size={14} strokeWidth={2} /> Sign out
      </button>
    </div>
  )
}
