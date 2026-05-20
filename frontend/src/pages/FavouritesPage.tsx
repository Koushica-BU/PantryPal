import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import RecipeCard from '../components/features/RecipeCard'
import { useStore } from '../store/useStore'
import './FavouritesPage.css'

export default function FavouritesPage() {
  const { favourites } = useStore()
  return (
    <div className="page-shell">
      <div className="favourites-header">
        <h1 className="favourites-title">Saved recipes</h1>
        {favourites.length > 0 && <span className="favourites-count">{favourites.length}</span>}
      </div>
      {!favourites.length ? (
        <div className="favourites-empty">
          <Heart size={32} strokeWidth={1} color="var(--text-4)" className="favourites-empty-icon" />
          <h2 className="favourites-empty-title">Nothing saved yet</h2>
          <p className="favourites-empty-sub">Save recipes you love and they'll appear here.</p>
          <Link to="/app" className="btn-primary hero-cta-link">Find recipes</Link>
        </div>
      ) : (
        <div className="stagger favourites-grid">
          {favourites.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  )
}
