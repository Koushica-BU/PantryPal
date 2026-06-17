import { useState } from 'react'
import { Plus, X, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { DayOfWeek, MealSlot, Recipe } from '../types'
import { searchRecipes } from '../services/recipeService'
import toast from 'react-hot-toast'
import './MealPlanPage.css'

function MealImg({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div className={`${className} meal-img-placeholder`}><UtensilsCrossed size={18} strokeWidth={1.2} /></div>
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />
}

const DAYS: DayOfWeek[] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const SLOTS: MealSlot[] = ['breakfast','lunch','dinner']
const SLOT_EMOJI: Record<MealSlot,string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }

function AddModal({ day, slot, onClose, onAdd }: { day: DayOfWeek; slot: MealSlot; onClose: () => void; onAdd: (r: Recipe) => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const { favourites } = useStore()
  const search = async () => { if (!q.trim()) return; setLoading(true); try { setResults(await searchRecipes(q)) } finally { setLoading(false) } }
  const display = q.trim() ? results : favourites

  return (
    <div className="add-modal-overlay">
      <div className="card add-modal">
        <div className="add-modal-header">
          <div>
            <p className="add-modal-title">{SLOT_EMOJI[slot]} {slot} · {day}</p>
            <p className="add-modal-subtitle">Pick a recipe</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-modal-close"><X size={15} strokeWidth={2.5} /></button>
        </div>
        <div className="add-modal-search-row">
          <input autoFocus type="text" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search recipes…" className="input-field" />
          <button onClick={search} disabled={loading} className="btn-primary add-modal-search-go-btn">{loading ? '…' : 'Go'}</button>
        </div>
        <div className="add-modal-results">
          {!display.length && <p className="add-modal-empty">No results</p>}
          {display.map(r => (
            <button key={r.id} onClick={() => onAdd(r)} className="add-modal-recipe-btn">
              <MealImg src={r.thumbnail} alt={r.title} className="add-modal-recipe-img" />
              <div className="add-modal-recipe-info">
                <p className="add-modal-recipe-title">{r.title}</p>
                <p className="add-modal-recipe-meta">{r.cuisine} · {r.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MealPlanPage() {
  const { weekPlan, setMealPlanEntry, removeMealPlanEntry, clearWeekPlan, addShoppingItems } = useStore()
  const [modal, setModal] = useState<{ day: DayOfWeek; slot: MealSlot } | null>(null)
  const mealCount = DAYS.reduce((a, d) => a + SLOTS.filter(s => weekPlan[d]?.[s]).length, 0)

  const addToShopping = () => {
    const items: any[] = []
    for (const d of DAYS) for (const s of SLOTS) {
      const r = weekPlan[d]?.[s]
      if (r) r.ingredients.forEach(ing => items.push({ id: `${Date.now()}-${Math.random()}`, name: ing.name, measure: ing.measure, checked: false, recipeId: r.id, recipeTitle: r.title }))
    }
    if (!items.length) { toast('No meals planned yet!', { icon: '📅' }); return }
    addShoppingItems(items); toast.success(`Added ${items.length} items to shopping list`)
  }

  return (
    <div className="page-shell">
      <div className="meal-plan-header">
        <div>
          <h1 className="meal-plan-title">Meal planner</h1>
          <p className="meal-plan-subtitle">{mealCount} meal{mealCount !== 1 ? 's' : ''} planned this week</p>
        </div>
        <div className="meal-plan-actions">
          <button onClick={addToShopping} className="btn-secondary btn-add-to-shopping">
            <ShoppingCart size={13} strokeWidth={2} />Add to shopping
          </button>
          {mealCount > 0 && (
            <button onClick={() => { clearWeekPlan(); toast('Plan cleared 🗑️') }} className="btn-ghost btn-clear-plan">
              <Trash2 size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="meal-plan-scroll-wrapper">
        <div className="meal-plan-grid-inner">
          <div className="meal-day-headers">
            <div />
            {DAYS.map(d => <div key={d} className="meal-day-label">{d}</div>)}
          </div>

          {SLOTS.map(slot => (
            <div key={slot} className="meal-slot-row">
              <div className="meal-slot-label-cell">
                <span className="meal-slot-label">{SLOT_EMOJI[slot]}<br />{slot}</span>
              </div>
              {DAYS.map(day => {
                const recipe = weekPlan[day]?.[slot]
                return (
                  <div key={day} className="meal-cell">
                    {recipe ? (
                      <div className="card meal-card">
                        <Link to={`/recipe/${recipe.id}`} className="meal-card-link">
                          <MealImg src={recipe.thumbnail} alt={recipe.title} className="meal-card-img" />
                          <div className="meal-card-body">
                            <p className="meal-card-title">{recipe.title}</p>
                          </div>
                        </Link>
                        <button onClick={() => { removeMealPlanEntry(day, slot); toast('Removed') }} className="meal-remove-btn">
                          <X size={9} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setModal({ day, slot })} className="meal-add-btn">
                        <Plus size={16} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {modal && <AddModal day={modal.day} slot={modal.slot} onClose={() => setModal(null)} onAdd={r => { setMealPlanEntry(modal.day, modal.slot, r); toast.success(`Added to ${modal.day} ${modal.slot}!`); setModal(null) }} />}
    </div>
  )
}
