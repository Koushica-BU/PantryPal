import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingCart, ExternalLink, ArrowLeft, CheckCircle2, Clock, Users, Share2, Flame, UtensilsCrossed, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRecipeById, getRecipeNutrition } from '../services/recipeService'
import { useStore } from '../store/useStore'
import type { Recipe } from '../types'
import './RecipeDetailPage.css'

function formatQty(n: number): string {
  if (n <= 0) return '0'
  const FRACS: [number, string][] = [
    [1/8, '1/8'], [1/4, '1/4'], [1/3, '1/3'], [1/2, '1/2'],
    [2/3, '2/3'], [3/4, '3/4'],
  ]
  const whole = Math.floor(n)
  const frac  = n - whole
  if (frac < 0.06)  return String(whole || '')
  if (frac > 0.94)  return String(whole + 1)
  for (const [val, sym] of FRACS) {
    if (Math.abs(frac - val) < 0.07) return whole > 0 ? `${whole} ${sym}` : sym
  }
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function scaleMeasure(measure: string, factor: number): string {
  if (!measure || Math.abs(factor - 1) < 0.001) return measure
  const m = measure.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.?\d*)(\s*)(.*)$/)
  if (!m) return measure
  const [, numStr, space, rest] = m
  let num: number
  if (numStr.includes(' ')) {
    const [w, f] = numStr.trim().split(/\s+/)
    const [a, b] = f.split('/'); num = parseInt(w) + parseInt(a) / parseInt(b)
  } else if (numStr.includes('/')) {
    const [a, b] = numStr.split('/'); num = parseInt(a) / parseInt(b)
  } else {
    num = parseFloat(numStr)
  }
  if (!num) return measure
  return formatQty(num * factor) + space + rest
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe,          setRecipe]          = useState<Recipe | null>(null)
  const [loading,         setLoading]         = useState(true)
  const [nutrition,       setNutrition]       = useState<any>(null)
  const [imgError,        setImgError]        = useState(false)
  const [currentServings, setCurrentServings] = useState(1)
  const { isFavourite, addFavourite, removeFavourite, addShoppingItems, pantryItems, ownedIngredients, toggleOwnedIngredient } = useStore()

  useEffect(() => {
    if (!id) return
    getRecipeById(id).then(setRecipe).finally(() => setLoading(false))
    getRecipeNutrition(id).then(setNutrition).catch(() => null)
  }, [id])

  useEffect(() => {
    if (recipe?.servings) setCurrentServings(recipe.servings)
  }, [recipe?.servings])

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
  const pantrySet = new Set(pantryItems.map(i => i.name.toLowerCase()))
  const isStaple = (name: string) =>
    name.toLowerCase().split(/[\s,()]+/).some(w => w === 'salt' || w === 'sugar' || w === 'water')
  const pantryMatch = (ingName: string) =>
    isStaple(ingName) || pantrySet.has(ingName.toLowerCase())
  const nonStapleIngredients = recipe.ingredients.filter(i => !isStaple(i.name))
  const pantryCount = nonStapleIngredients.filter(i => pantrySet.has(i.name.toLowerCase())).length
  const dietTags = [recipe.vegetarian && 'Vegetarian', recipe.vegan && 'Vegan', recipe.glutenFree && 'GF', recipe.dairyFree && 'Dairy Free'].filter(Boolean) as string[]
  const hasNutrition = nutrition && Object.values(nutrition).some((v: any) => v && String(v).trim())

  // Prefer structured sections; fall back to parsing the legacy flat string
  const instructionSections: { title?: string; steps: string[] }[] =
    recipe.instructionSections?.length
      ? recipe.instructionSections
      : recipe.instructions
        ? [{ steps: recipe.instructions.replace(/<[^>]*>/g, '').split(/\d+\./).map(s => s.trim()).filter(Boolean) }]
        : []

  const ownedNames = new Set((ownedIngredients[recipe.id] ?? []).map(n => n.toLowerCase()))

  const addToShopping = () => {
    const missing = recipe.ingredients
      .filter(ing => !pantryMatch(ing.name) && !ownedNames.has(ing.name.toLowerCase()))
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
            {recipe.thumbnail && !imgError
              ? <img src={recipe.thumbnail} alt={recipe.title} className="recipe-hero-img" onError={() => setImgError(true)} />
              : <div className="recipe-hero-placeholder"><UtensilsCrossed size={64} strokeWidth={1.2} /></div>
            }
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
              { icon: <CheckCircle2 size={14} color="var(--terra-d)" strokeWidth={2} />, text: `${pantryCount}/${nonStapleIngredients.length} in pantry`, pantry: true },
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

          {hasNutrition && (
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

          {instructionSections.length > 0 && (
            <div className="card instructions-card">
              {instructionSections.map((sec, si) => (
                <div key={si} className="instruction-section">
                  {sec.title && <h3 className="instruction-section-title">{sec.title}</h3>}
                  <ol className="instructions-list">
                    {sec.steps.map((step, i) => (
                      <li key={i} className="instruction-step">
                        <span className="instruction-num">{i + 1}</span>
                        <p className="instruction-text">{step}</p>
                      </li>
                    ))}
                  </ol>
                  {si < instructionSections.length - 1 && <hr className="instruction-section-divider" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="card ingredients-card">
            <div className="ingredients-header-row">
              <h2 className="ingredients-heading">
                Ingredients <span className="ingredients-count">({recipe.ingredients.length})</span>
              </h2>
              <div className="serving-scaler">
                <button
                  className="serving-btn"
                  onClick={() => setCurrentServings(s => Math.max(1, s - 1))}
                  disabled={currentServings <= 1}
                >
                  <Minus size={11} strokeWidth={2.5} />
                </button>
                <span className="serving-count">{currentServings} srv</span>
                <button
                  className="serving-btn"
                  onClick={() => setCurrentServings(s => s + 1)}
                >
                  <Plus size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, i) => {
                const have = pantryMatch(ing.name)
                const owned = ownedNames.has(ing.name.toLowerCase())
                const scaleFactor = recipe.servings > 0 ? currentServings / recipe.servings : 1
                return (
                  <li
                    key={i}
                    className={`ingredient-item${have ? ' ingredient-item--have' : ''}${owned ? ' ingredient-item--owned' : ''}${!have ? ' ingredient-item--tappable' : ''}`}
                    onClick={() => { if (!have) toggleOwnedIngredient(recipe.id, ing.name) }}
                  >
                    {ing.image
                      ? <img src={ing.image} alt={ing.name} className="ingredient-img" />
                      : have
                        ? <CheckCircle2 size={15} color="var(--terra-d)" strokeWidth={2.5} className="icon-no-shrink" />
                        : owned
                          ? <CheckCircle2 size={15} color="var(--text-4)" strokeWidth={2.5} className="icon-no-shrink" />
                          : <div className="ingredient-dot" />
                    }
                    <span className={`ingredient-name${have || owned ? ' ingredient-name--have' : ''}`}>{ing.name}</span>
                    <span className="ingredient-measure">{scaleMeasure(ing.measure, scaleFactor)}</span>
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
