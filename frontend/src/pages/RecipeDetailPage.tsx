import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingCart, ExternalLink, ArrowLeft, CheckCircle2, Clock, Users, Share2, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRecipeById, getRecipeNutrition } from '../services/recipeService'
import { useStore } from '../store/useStore'
import type { Recipe } from '../types'
import './RecipeDetailPage.css'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe,    setRecipe]    = useState<Recipe | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [nutrition, setNutrition] = useState<any>(null)
  const { isFavourite, addFavourite, removeFavourite, addShoppingItems, pantryItems } = useStore()

  useEffect(() => {
    if (!id) return
    getRecipeById(id).then(setRecipe).finally(() => setLoading(false))
    getRecipeNutrition(id).then(setNutrition).catch(() => null)
  }, [id])

  if (loading) return (
    <div className="page-shell">
      <div className="skeleton skeleton-hero" />
      <div className="skeleton skeleton-title" />
    </div>
  )

  if (!recipe) return (
    <div className="page-shell recipe-not-found">
      <div className="recipe-not-found-emoji">😕</div>
      <h2 className="recipe-not-found-title">Recipe not found</h2>
      <Link to="/app" className="btn-primary hero-cta-link">Back to search</Link>
    </div>
  )

  const fav = isFavourite(recipe.id)
  const pantryNames = new Set(pantryItems.map(i => i.name.toLowerCase()))
  const pantryCount = recipe.ingredients.filter(i => pantryNames.has(i.name.toLowerCase())).length
  const dietTags = [recipe.vegetarian && 'Vegetarian', recipe.vegan && 'Vegan', recipe.glutenFree && 'GF', recipe.dairyFree && 'Dairy Free'].filter(Boolean) as string[]
  const steps = recipe.instructions ? recipe.instructions.replace(/<[^>]*>/g, '').split(/\d+\./).map(s => s.trim()).filter(Boolean) : []

  const addToShopping = () => {
    const missing = recipe.ingredients.filter(i => !pantryNames.has(i.name.toLowerCase()))
      .map(i => ({ id: `${Date.now()}-${Math.random()}`, name: i.name, measure: i.measure, checked: false, recipeId: recipe.id, recipeTitle: recipe.title }))
    if (!missing.length) { toast('You have all the ingredients! 🎉'); return }
    addShoppingItems(missing); toast.success(`Added ${missing.length} items to shopping list`)
  }

  return (
    <div className="page-shell">
      <Link to="/app" className="recipe-back-link">
        <ArrowLeft size={15} strokeWidth={2.5} /> Back to search
      </Link>

      <div className="detail-grid">
        {/* Main column */}
        <div>
          <div className="recipe-hero-wrapper">
            <img src={recipe.thumbnail} alt={recipe.title} className="recipe-hero-img" />
            <div className="recipe-hero-gradient" />
            <div className="recipe-hero-content">
              <div className="recipe-hero-tags">
                {recipe.cuisine && <span className="recipe-cuisine-badge">{recipe.cuisine}</span>}
                {dietTags.map(t => <span key={t} className="recipe-diet-badge">{t}</span>)}
              </div>
              <h1 className="recipe-detail-title">{recipe.title}</h1>
            </div>
          </div>

          <div className="recipe-meta-row">
            {[
              recipe.readyInMinutes > 0 && { icon: <Clock size={14} color="var(--terra)" strokeWidth={2} />, text: `${recipe.readyInMinutes} min` },
              recipe.servings > 0       && { icon: <Users size={14} color="var(--terra)" strokeWidth={2} />, text: `${recipe.servings} servings` },
              { icon: <CheckCircle2 size={14} color="var(--terra-d)" strokeWidth={2} />, text: `${pantryCount}/${recipe.ingredients.length} in pantry`, pantry: true },
            ].filter(Boolean).map((m: any, i) => (
              <div key={i} className={`card recipe-meta-badge${m.pantry ? ' recipe-meta-badge--pantry' : ''}`}>
                {m.icon} {m.text}
              </div>
            ))}
          </div>

          <div className="recipe-actions-row">
            <button
              onClick={() => { if (fav) { removeFavourite(recipe.id); toast('Removed') } else { addFavourite(recipe); toast.success('Saved!') } }}
              className={`${fav ? 'btn-primary' : 'btn-secondary'} btn-recipe-action`}>
              <Heart size={14} strokeWidth={2.5} className={fav ? 'heart-fill-active' : 'heart-fill-inactive'} />
              {fav ? 'Saved ✓' : 'Save recipe'}
            </button>
            <button onClick={addToShopping} className="btn-secondary btn-recipe-action">
              <ShoppingCart size={14} strokeWidth={2} /> Add missing items
            </button>
            <button onClick={async () => {
              if (navigator.share) await navigator.share({ title: recipe.title, url: location.href })
              else { await navigator.clipboard.writeText(location.href); toast.success('Link copied!') }
            }} className="btn-ghost btn-recipe-share">
              <Share2 size={14} strokeWidth={2} /> Share
            </button>
          </div>

          {nutrition && (
            <div className="card nutrition-card">
              <h2 className="nutrition-heading">
                <Flame size={16} color="var(--terra)" strokeWidth={2} /> Nutrition per serving
              </h2>
              <div className="nutrition-grid">
                {[
                  { label: 'Calories', color: 'var(--terra)',   val: nutrition.calories },
                  { label: 'Protein',  color: 'var(--terra-d)', val: nutrition.protein  },
                  { label: 'Carbs',    color: 'var(--terra)',   val: nutrition.carbs    },
                  { label: 'Fat',      color: 'var(--text-3)',  val: nutrition.fat      },
                ].map(({ label, color, val }) => (
                  <div key={label} className="nutrition-item">
                    {/* color is per-nutrient data, cannot be static */}
                    <p className="nutrition-value" style={{ color }}>{val}</p>
                    <p className="nutrition-label">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div className="card instructions-card">
              <h2 className="instructions-heading">Instructions</h2>
              <ol className="instructions-list">
                {steps.map((step, i) => (
                  <li key={i} className="instruction-step">
                    <span className="instruction-num">{i + 1}</span>
                    <p className="instruction-text">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="card ingredients-card">
            <h2 className="ingredients-heading">
              Ingredients <span className="ingredients-count">({recipe.ingredients.length})</span>
            </h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, i) => {
                const have = pantryNames.has(ing.name.toLowerCase())
                return (
                  <li key={i} className={`ingredient-item${have ? ' ingredient-item--have' : ''}`}>
                    {ing.image
                      ? <img src={ing.image} alt={ing.name} className="ingredient-img" />
                      : have
                        ? <CheckCircle2 size={15} color="var(--terra-d)" strokeWidth={2.5} className="icon-no-shrink" />
                        : <div className="ingredient-dot" />
                    }
                    <span className={`ingredient-name${have ? ' ingredient-name--have' : ''}`}>{ing.name}</span>
                    <span className="ingredient-measure">{ing.measure}</span>
                  </li>
                )
              })}
            </ul>
            {recipe.sourceUrl && (
              <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="ingredient-source-link">
                <ExternalLink size={12} strokeWidth={2} /> View original recipe
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
