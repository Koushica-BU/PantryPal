import { useState, useEffect, useCallback, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Search, Loader2, UtensilsCrossed } from 'lucide-react'
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

function AdminThumb({ src, alt }: { src?: string; alt: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div className="admin-thumb admin-thumb-placeholder"><UtensilsCrossed size={16} strokeWidth={1.5} /></div>
  return <img src={src} alt={alt} className="admin-thumb" onError={() => setErr(true)} />
}

type Section = { title: string; steps: string[] }

const BLANK_SECTION: Section = { title: '', steps: [''] }

const BLANK: RecipeFormData = {
  title: '', category: 'dinner', cuisine: 'American', thumbnail: '',
  readyInMinutes: 30, servings: 2,
  vegetarian: false, vegan: false, glutenFree: false, dairyFree: false,
  tags: [], instructions: '', instructionSections: [],
  ingredients: [{ name: '', measure: '' }],
  nutrition: { calories: '', protein: '', carbs: '', fat: '' },
}

function parseInstructionsToSection(str: string): Section {
  if (!str.trim()) return BLANK_SECTION
  const steps = str
    .replace(/<[^>]*>/g, '')
    .split(/\d+\./)
    .map(s => s.trim())
    .filter(Boolean)
  return { title: '', steps: steps.length ? steps : [''] }
}

export default function AdminPage() {
  const { user } = useStore()
  const navigate = useNavigate()

  const [recipes, setRecipes]             = useState<AdminRecipe[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [showModal, setShowModal]         = useState(false)
  const [editId, setEditId]               = useState<string | null>(null)
  const [form, setForm]                   = useState<RecipeFormData>(BLANK)
  const [sections, setSections]           = useState<Section[]>([{ ...BLANK_SECTION }])
  const [tagInput, setTagInput]           = useState('')
  const [saving, setSaving]               = useState(false)
  const [deleteId, setDeleteId]           = useState<string | null>(null)

  const isAdmin = user?.isAdmin
  useEffect(() => {
    if (!isAdmin) { navigate('/app'); return }
    load()
  }, [isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true)
    try { setRecipes(await adminService.listRecipes()) }
    catch { toast.error('Failed to load recipes') }
    finally { setLoading(false) }
  }

  const debouncedSearch = useDebounce(search, 300)
  const filtered = recipes.filter(r => {
    const q = debouncedSearch.toLowerCase()
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
    const matchC = !filterCuisine || r.cuisine === filterCuisine
    return matchQ && matchC
  })

  function openAdd() {
    setForm(BLANK)
    setSections([{ ...BLANK_SECTION }])
    setTagInput('')
    setEditId(null)
    setShowModal(true)
  }

  function openEdit(r: AdminRecipe) {
    setForm({
      title: r.title, category: r.category, cuisine: r.cuisine,
      thumbnail: r.thumbnail, readyInMinutes: r.readyInMinutes,
      servings: r.servings, vegetarian: r.vegetarian, vegan: r.vegan,
      glutenFree: r.glutenFree, dairyFree: r.dairyFree,
      tags: r.tags ?? [], instructions: r.instructions,
      instructionSections: [],
      ingredients: r.ingredients.length ? r.ingredients : [{ name: '', measure: '' }],
      nutrition: (r as any).nutrition ?? BLANK.nutrition,
    })

    const existing = (r as any).instructionSections as Section[] | undefined
    if (existing?.length) {
      setSections(existing.map(s => ({ title: s.title ?? '', steps: s.steps.length ? s.steps : [''] })))
    } else {
      setSections([parseInstructionsToSection(r.instructions)])
    }

    setTagInput('')
    setEditId(r.id)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.ingredients.some(i => i.name.trim())) { toast.error('Add at least one ingredient'); return }
    if (!sections.some(s => s.steps.some(st => st.trim()))) { toast.error('Add at least one instruction step'); return }
    setSaving(true)
    try {
      const instructionSections = sections
        .filter(s => s.steps.some(st => st.trim()))
        .map(s => ({ title: s.title.trim(), steps: s.steps.filter(st => st.trim()) }))

      const clean: RecipeFormData = {
        ...form,
        ingredients: form.ingredients.filter(i => i.name.trim()),
        instructionSections,
        instructions: '',
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

  // ── Tag helpers ──────────────────────────────────────────────────────────────

  function commitTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/,+$/, '')
    if (!tag) return
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags : [...f.tags, tag] }))
    setTagInput('')
  }

  function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitTag(tagInput) }
    if (e.key === 'Backspace' && !tagInput) setForm(f => ({ ...f, tags: f.tags.slice(0, -1) }))
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  // ── Ingredient helpers ───────────────────────────────────────────────────────

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

  // ── Section / step helpers ───────────────────────────────────────────────────

  const addSection = () => setSections(ss => [...ss, { title: '', steps: [''] }])

  const removeSection = (si: number) =>
    setSections(ss => ss.filter((_, i) => i !== si))

  const moveSectionUp = (si: number) =>
    setSections(ss => {
      if (si === 0) return ss
      const next = [...ss];
      [next[si - 1], next[si]] = [next[si], next[si - 1]]
      return next
    })

  const moveSectionDown = (si: number) =>
    setSections(ss => {
      if (si === ss.length - 1) return ss
      const next = [...ss];
      [next[si], next[si + 1]] = [next[si + 1], next[si]]
      return next
    })

  const setSectionTitle = (si: number, val: string) =>
    setSections(ss => ss.map((s, i) => i === si ? { ...s, title: val } : s))

  const addSectionStep = (si: number) =>
    setSections(ss => ss.map((s, i) => i === si ? { ...s, steps: [...s.steps, ''] } : s))

  const removeSectionStep = (si: number, sj: number) =>
    setSections(ss => ss.map((s, i) => i === si ? { ...s, steps: s.steps.filter((_, j) => j !== sj) } : s))

  const setSectionStep = (si: number, sj: number, val: string) =>
    setSections(ss => ss.map((s, i) => i === si ? { ...s, steps: s.steps.map((st, j) => j === sj ? val : st) } : s))

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
                  <td>
                    <div className="admin-cell-recipe">
                      <AdminThumb src={r.thumbnail} alt={r.title} />
                      <span className="admin-recipe-title">{r.title}</span>
                    </div>
                  </td>
                  <td><span className="admin-badge admin-badge--cuisine">{r.cuisine}</span></td>
                  <td><span className="admin-badge admin-badge--cat">{r.category}</span></td>
                  <td className="admin-cell-time">{r.readyInMinutes} min</td>
                  <td>
                    <div className="admin-cell-diet">
                      {r.vegetarian && <span className="admin-diet-tag">Veg</span>}
                      {r.vegan      && <span className="admin-diet-tag">Vegan</span>}
                      {r.glutenFree && <span className="admin-diet-tag">GF</span>}
                      {r.dairyFree  && <span className="admin-diet-tag">DF</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell-actions">
                      <button className="admin-action-btn" onClick={() => openEdit(r)} title="Edit">
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => setDeleteId(r.id)} title="Delete">
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
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

              {/* Tags */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Tags <span className="admin-section-hint">— for SEO &amp; filtering (press Enter or comma to add)</span></h3>
                <div className="admin-tag-input-wrap">
                  {form.tags.map(tag => (
                    <span key={tag} className="admin-tag-chip">
                      {tag}
                      <button className="admin-tag-chip-remove" onClick={() => removeTag(tag)} title="Remove tag">
                        <X size={11} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="admin-tag-input"
                    placeholder={form.tags.length ? '' : 'e.g. healthy, eggless, quick…'}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={onTagKeyDown}
                    onBlur={() => commitTag(tagInput)}
                  />
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

              {/* Instructions — section builder */}
              <div className="admin-form-section">
                <h3 className="admin-section-label">Instructions *</h3>
                <div className="admin-sections-list">
                  {sections.map((sec, si) => (
                    <div key={si} className="admin-section-block">
                      <div className="admin-section-block-header">
                        <input
                          className="admin-input admin-section-title-input"
                          placeholder={sections.length > 1 ? 'Section title (e.g. Date Paste)' : 'Section title (optional)'}
                          value={sec.title}
                          onChange={e => setSectionTitle(si, e.target.value)}
                        />
                        {sections.length > 1 && (
                          <div className="admin-section-move-btns">
                            <button className="admin-ing-remove" onClick={() => moveSectionUp(si)} disabled={si === 0} title="Move up">
                              <ChevronUp size={14} strokeWidth={2.5} />
                            </button>
                            <button className="admin-ing-remove" onClick={() => moveSectionDown(si)} disabled={si === sections.length - 1} title="Move down">
                              <ChevronDown size={14} strokeWidth={2.5} />
                            </button>
                            <button className="admin-ing-remove" onClick={() => removeSection(si)} title="Remove section">
                              <X size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="admin-ing-list">
                        {sec.steps.map((step, sj) => (
                          <div key={sj} className="admin-step-row">
                            <span className="admin-step-num">{sj + 1}</span>
                            <textarea
                              className="admin-input admin-step-input"
                              rows={2}
                              placeholder={`Step ${sj + 1}…`}
                              value={step}
                              onChange={e => setSectionStep(si, sj, e.target.value)}
                            />
                            {sec.steps.length > 1 && (
                              <button className="admin-ing-remove" onClick={() => removeSectionStep(si, sj)} title="Remove step">
                                <X size={14} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn-ghost admin-add-ing-btn" onClick={() => addSectionStep(si)}>
                        <Plus size={13} strokeWidth={2.5} /> Add step
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-ghost admin-add-ing-btn admin-add-section-btn" onClick={addSection}>
                  <Plus size={13} strokeWidth={2.5} /> Add section
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
