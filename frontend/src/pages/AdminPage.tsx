import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, ChevronDown, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'
import { adminService, type AdminRecipe, type RecipeFormData } from '../services/adminService'
import './AdminPage.css'

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert']
const CUISINES = [
  'American', 'British', 'Caribbean', 'Chinese', 'French', 'German',
  'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Korean',
  'Mediterranean', 'Mexican', 'Middle Eastern', 'Spanish', 'Thai', 'Vietnamese',
]

const BLANK: RecipeFormData = {
  title: '', category: 'dinner', cuisine: 'American', thumbnail: '',
  readyInMinutes: 30, servings: 2,
  vegetarian: false, vegan: false, glutenFree: false, dairyFree: false,
  tags: [], instructions: '',
  ingredients: [{ name: '', measure: '' }],
  nutrition: { calories: '', protein: '', carbs: '', fat: '' },
}

function parseInstructions(str: string): string[] {
  if (!str.trim()) return ['']
  const steps = str
    .replace(/<[^>]*>/g, '')
    .split(/\d+\./)
    .map(s => s.trim())
    .filter(Boolean)
  return steps.length ? steps : ['']
}

function stepsToString(steps: string[]): string {
  return steps
    .filter(s => s.trim())
    .map((s, i) => `${i + 1}. ${s.trim()}`)
    .join(' ')
}

export default function AdminPage() {
  const { user } = useStore()
  const navigate = useNavigate()

  const [recipes, setRecipes]         = useState<AdminRecipe[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editId, setEditId]           = useState<string | null>(null)
  const [form, setForm]               = useState<RecipeFormData>(BLANK)
  const [steps, setSteps]             = useState<string[]>([''])
  const [saving, setSaving]           = useState(false)
  const [deleteId, setDeleteId]       = useState<string | null>(null)

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/app'); return }
    load()
  }, [user])

  async function load() {
    setLoading(true)
    try { setRecipes(await adminService.listRecipes()) }
    catch { toast.error('Failed to load recipes') }
    finally { setLoading(false) }
  }

  const filtered = recipes.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
    const matchC = !filterCuisine || r.cuisine === filterCuisine
    return matchQ && matchC
  })

  function openAdd() {
    setForm(BLANK)
    setSteps([''])
    setEditId(null)
    setShowModal(true)
  }

  function openEdit(r: AdminRecipe) {
    setForm({
      title: r.title, category: r.category, cuisine: r.cuisine,
      thumbnail: r.thumbnail, readyInMinutes: r.readyInMinutes,
      servings: r.servings, vegetarian: r.vegetarian, vegan: r.vegan,
      glutenFree: r.glutenFree, dairyFree: r.dairyFree,
      tags: r.tags, instructions: r.instructions,
      ingredients: r.ingredients.length ? r.ingredients : [{ name: '', measure: '' }],
      nutrition: (r as any).nutrition ?? BLANK.nutrition,
    })
    setSteps(parseInstructions(r.instructions))
    setEditId(r.id)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.ingredients.some(i => i.name.trim())) { toast.error('Add at least one ingredient'); return }
    if (!steps.some(s => s.trim())) { toast.error('Add at least one instruction step'); return }
    setSaving(true)
    try {
      const clean: RecipeFormData = {
        ...form,
        ingredients: form.ingredients.filter(i => i.name.trim()),
        instructions: stepsToString(steps),
      }
      if (editId) {
        const updated = await adminService.updateRecipe(editId, clean)
        setRecipes(rs => rs.map(r => r.id === editId ? { ...updated, id: editId } : r))
        toast.success('Recipe updated')
      } else {
        const created = await adminService.createRecipe(clean)
        setRecipes(rs => [created, ...rs])
        toast.success('Recipe added')
      }
      setShowModal(false)
    } catch { toast.error('Failed to save recipe') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    try {
      await adminService.deleteRecipe(id)
      setRecipes(rs => rs.filter(r => r.id !== id))
      toast.success('Recipe deleted')
    } catch { toast.error('Failed to delete') }
    finally { setDeleteId(null) }
  }

  const setField = useCallback(<K extends keyof RecipeFormData>(k: K, v: RecipeFormData[K]) =>
    setForm(f => ({ ...f, [k]: v })), [])

  const setIngredient = (i: number, field: 'name' | 'measure', val: string) =>
    setForm(f => {
      const ings = [...f.ingredients]
      ings[i] = { ...ings[i], [field]: val }
      return { ...f, ingredients: ings }
    })

  const addIngredient = () =>
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', measure: '' }] }))

  const removeIngredient = (i: number) =>
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))

  const setStep = (i: number, val: string) =>
    setSteps(ss => { const next = [...ss]; next[i] = val; return next })

  const addStep = () => setSteps(ss => [...ss, ''])

  const removeStep = (i: number) =>
    setSteps(ss => ss.filter((_, idx) => idx !== i))

  return (
    <div className="admin-shell">

      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Recipe Manager</h1>
          <p className="admin-sub">{recipes.length} recipes in your collection</p>
        </div>
        <button className="btn-primary admin-add-btn" onClick={openAdd}>
          <Plus size={15} strokeWidth={2.5} /> Add Recipe
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="admin-filters">
        <div className="admin-search-wrap">
          <Search size={14} className="admin-search-icon" />
          <input
            className="admin-search"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-select-wrap">
          <select className="admin-select" value={filterCuisine} onChange={e => setFilterCuisine(e.target.value)}>
            <option value="">All cuisines</option>
            {CUISINES.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={13} className="admin-select-icon" />
        </div>
        {(search || filterCuisine) && (
          <button className="btn-ghost admin-clear-btn" onClick={() => { setSearch(''); setFilterCuisine('') }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Recipe Table ── */}
      {loading ? (
        <div className="admin-loading"><Loader2 size={24} className="spin" /> Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Cuisine</th>
                <th>Category</th>
                <th>Time</th>
                <th>Diet</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="admin-row">
                  <td className="admin-cell-recipe">
                    <img src={r.thumbnail} alt={r.title} className="admin-thumb" onError={e => (e.currentTarget.style.display = 'none')} />
                    <span className="admin-recipe-title">{r.title}</span>
                  </td>
                  <td><span className="admin-badge admin-badge--cuisine">{r.cuisine}</span></td>
                  <td><span className="admin-badge admin-badge--cat">{r.category}</span></td>
                  <td className="admin-cell-time">{r.readyInMinutes} min</td>
                  <td className="admin-cell-diet">
                    {r.vegetarian && <span className="admin-diet-tag">Veg</span>}
                    {r.vegan      && <span className="admin-diet-tag">Vegan</span>}
                    {r.glutenFree && <span className="admin-diet-tag">GF</span>}
                    {r.dairyFree  && <span className="admin-diet-tag">DF</span>}
                  </td>
                  <td className="admin-cell-actions">
                    <button className="admin-action-btn" onClick={() => openEdit(r)} title="Edit">
                      <Pencil size={14} strokeWidth={2} />
                    </button>
                    <button className="admin-action-btn admin-action-btn--delete" onClick={() => setDeleteId(r.id)} title="Delete">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="admin-empty">No recipes found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="admin-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-confirm" onClick={e => e.stopPropagation()}>
            <h3 className="admin-confirm-title">Delete recipe?</h3>
            <p className="admin-confirm-sub">This cannot be undone.</p>
            <div className="admin-confirm-actions">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="admin-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>

            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editId ? 'Edit Recipe' : 'Add Recipe'}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="admin-modal-body">

              {/* Basic info */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Basic Info</h3>
                <div className="admin-form-grid">
                  <label className="admin-label admin-span-2">
                    Title *
                    <input className="admin-input" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Butter Chicken" />
                  </label>
                  <label className="admin-label">
                    Category *
                    <div className="admin-select-wrap">
                      <select className="admin-select admin-select--full" value={form.category} onChange={e => setField('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="admin-select-icon" />
                    </div>
                  </label>
                  <label className="admin-label">
                    Cuisine *
                    <div className="admin-select-wrap">
                      <select className="admin-select admin-select--full" value={form.cuisine} onChange={e => setField('cuisine', e.target.value)}>
                        {CUISINES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="admin-select-icon" />
                    </div>
                  </label>
                  <label className="admin-label">
                    Cook time (min)
                    <input className="admin-input" type="number" min={1} value={form.readyInMinutes} onChange={e => setField('readyInMinutes', Number(e.target.value))} />
                  </label>
                  <label className="admin-label">
                    Servings
                    <input className="admin-input" type="number" min={1} value={form.servings} onChange={e => setField('servings', Number(e.target.value))} />
                  </label>
                  <label className="admin-label admin-span-2">
                    Thumbnail URL
                    <input className="admin-input" value={form.thumbnail} onChange={e => setField('thumbnail', e.target.value)} placeholder="https://images.unsplash.com/…" />
                  </label>
                  {form.thumbnail && (
                    <div className="admin-span-2 admin-thumb-preview-wrap">
                      <img src={form.thumbnail} alt="preview" className="admin-thumb-preview" onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              </div>

              {/* Dietary flags */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Dietary</h3>
                <div className="admin-checks">
                  {(['vegetarian', 'vegan', 'glutenFree', 'dairyFree'] as const).map(flag => (
                    <label key={flag} className="admin-check-label">
                      <input type="checkbox" checked={form[flag] as boolean} onChange={e => setField(flag, e.target.checked)} />
                      {flag === 'glutenFree' ? 'Gluten Free' : flag === 'dairyFree' ? 'Dairy Free' : flag.charAt(0).toUpperCase() + flag.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Nutrition (per serving)</h3>
                <div className="admin-form-grid admin-form-grid--4">
                  {(['calories', 'protein', 'carbs', 'fat'] as const).map(n => (
                    <label key={n} className="admin-label">
                      {n.charAt(0).toUpperCase() + n.slice(1)}
                      <input
                        className="admin-input"
                        value={form.nutrition[n]}
                        onChange={e => setField('nutrition', { ...form.nutrition, [n]: e.target.value })}
                        placeholder={n === 'calories' ? '450 kcal' : '28g'}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Ingredients *</h3>
                <div className="admin-ing-list">
                  {form.ingredients.map((ing, i) => (
                    <div key={i} className="admin-ing-row">
                      <input
                        className="admin-input admin-ing-name"
                        placeholder="e.g. chicken breast"
                        value={ing.name}
                        onChange={e => setIngredient(i, 'name', e.target.value)}
                      />
                      <input
                        className="admin-input admin-ing-measure"
                        placeholder="e.g. 400g"
                        value={ing.measure}
                        onChange={e => setIngredient(i, 'measure', e.target.value)}
                      />
                      {form.ingredients.length > 1 && (
                        <button className="admin-ing-remove" onClick={() => removeIngredient(i)} title="Remove">
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn-ghost admin-add-ing-btn" onClick={addIngredient}>
                  <Plus size={13} strokeWidth={2.5} /> Add ingredient
                </button>
              </div>

              {/* Instructions — step builder */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Instructions *</h3>
                <div className="admin-ing-list">
                  {steps.map((step, i) => (
                    <div key={i} className="admin-step-row">
                      <span className="admin-step-num">{i + 1}</span>
                      <textarea
                        className="admin-input admin-step-input"
                        rows={2}
                        placeholder={`Step ${i + 1}…`}
                        value={step}
                        onChange={e => setStep(i, e.target.value)}
                      />
                      {steps.length > 1 && (
                        <button className="admin-ing-remove" onClick={() => removeStep(i)} title="Remove step">
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn-ghost admin-add-ing-btn" onClick={addStep}>
                  <Plus size={13} strokeWidth={2.5} /> Add next step
                </button>
              </div>

            </div>

            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : editId ? 'Save changes' : 'Add recipe'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
