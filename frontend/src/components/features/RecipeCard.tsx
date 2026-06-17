import { useState } from 'react'
import { Heart, Clock, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import type { Recipe } from '../../types'
import toast from 'react-hot-toast'
import './RecipeCard.css'

interface Props { recipe: Recipe; matchedIngredients?: number; totalIngredients?: number }

export default function RecipeCard({ recipe, matchedIngredients, totalIngredients }: Props) {
  const { isFavourite, addFavourite, removeFavourite } = useStore()
  const fav = isFavourite(recipe.id)
  const matchPct = matchedIngredients && totalIngredients ? Math.round((matchedIngredients / totalIngredients) * 100) : null
  const [imgError, setImgError] = useState(false)

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    if (fav) { removeFavourite(recipe.id); toast('Removed', { icon: '🤍' }) }
    else { addFavourite(recipe); toast.success('Saved to favourites') }
  }

  return (
    <Link to={`/recipe/${recipe.id}`} className="card-interactive recipe-card-link">
      {/* Image */}
      <div className="recipe-card-image">
        {recipe.thumbnail && !imgError
          ? <img src={recipe.thumbnail} alt={recipe.title}
              className="recipe-card-img"
              loading="lazy"
              onError={() => setImgError(true)} />
          : <div className="recipe-card-placeholder"><UtensilsCrossed size={40} strokeWidth={1.2} /></div>
        }
        <div className="recipe-card-gradient" />

        {/* Bottom row */}
        <div className="recipe-card-image-footer">
          {recipe.readyInMinutes > 0 && (
            <span className="recipe-time-badge">
              <Clock size={10} strokeWidth={2.5} /> {recipe.readyInMinutes}m
            </span>
          )}
          {matchPct !== null && (
            <span className={`recipe-match-badge${matchPct >= 80 ? ' recipe-match-badge--high' : ' recipe-match-badge--low'}`}>
              {matchPct}%
            </span>
          )}
        </div>

        {/* Fav button */}
        <button onClick={handleFav} className={`recipe-fav-btn${fav ? ' recipe-fav-btn--active' : ' recipe-fav-btn--inactive'}`}>
          <Heart size={14} strokeWidth={2.5} className={fav ? 'heart-card-active' : 'heart-card-inactive'} />
        </button>
      </div>

      {/* Content */}
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-tags">
          {recipe.cuisine && <span className="tag">{recipe.cuisine}</span>}
          {recipe.vegan ? <span className="tag-terra">Vegan</span>
            : recipe.vegetarian ? <span className="tag-terra">Veggie</span>
            : recipe.glutenFree ? <span className="tag-terra">GF</span> : null}
        </div>
        {matchedIngredients !== undefined && totalIngredients !== undefined && (
          <div className="recipe-pantry-count">
            ✓ {matchedIngredients}/{totalIngredients} in pantry
          </div>
        )}
      </div>
    </Link>
  )
}
