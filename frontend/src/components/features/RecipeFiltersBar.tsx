import { useState, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { getCuisines, getDiets } from '../../services/recipeService'
import type { RecipeFilters } from '../../types'
import './RecipeFiltersBar.css'

const CATEGORIES = ['main course','side dish','dessert','appetizer','salad','breakfast','soup','snack']
interface Props { filters: RecipeFilters; onChange: (f: RecipeFilters) => void }

export default function RecipeFiltersBar({ filters, onChange }: Props) {
  const [cuisines, setCuisines] = useState<string[]>([])
  const [diets, setDiets] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  useEffect(() => { getCuisines().then(setCuisines); getDiets().then(setDiets) }, [])
  const count = [filters.category, filters.cuisine, filters.diet].filter(Boolean).length

  return (
    <div className="filters-wrapper">
      <div className="filters-toggle-row">
        <button onClick={() => setOpen(!open)} className={`filters-toggle-btn${count > 0 ? ' filters-toggle-btn--active' : ''}`}>
          <SlidersHorizontal size={13} strokeWidth={2} />
          Filters {count > 0 && `· ${count}`}
        </button>
        {filters.category && <Chip label={filters.category} onRemove={() => onChange({ ...filters, category: undefined })} />}
        {filters.cuisine   && <Chip label={filters.cuisine}  onRemove={() => onChange({ ...filters, cuisine: undefined })} />}
        {filters.diet      && <Chip label={filters.diet}     onRemove={() => onChange({ ...filters, diet: undefined })} />}
        {count > 0 && <button onClick={() => onChange({})} className="filters-clear-btn">[ CLEAR ]</button>}
      </div>

      {open && (
        <>
          <div className="filters-overlay" onClick={() => setOpen(false)} />
          <div className="card filters-dropdown">
            <div className="filters-dropdown-header">
              <p className="label">Filter_Params</p>
              <button onClick={() => setOpen(false)} className="filters-close-btn"><X size={14} strokeWidth={2} /></button>
            </div>
            <Section label="TYPE" items={CATEGORIES} active={filters.category} onSelect={v => { onChange({ ...filters, category: filters.category === v ? undefined : v }); setOpen(false) }} />
            <div className="divider filters-divider" />
            <Section label="DIET" items={diets} active={filters.diet} onSelect={v => { onChange({ ...filters, diet: filters.diet === v ? undefined : v }); setOpen(false) }} />
            <div className="divider filters-divider" />
            <Section label="CUISINE" items={cuisines} active={filters.cuisine} scrollable onSelect={v => { onChange({ ...filters, cuisine: filters.cuisine === v ? undefined : v }); setOpen(false) }} />
          </div>
        </>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="filter-chip">
      {label}
      <button onClick={onRemove} className="filter-chip-remove"><X size={9} strokeWidth={3} /></button>
    </span>
  )
}

function Section({ label, items, active, onSelect, scrollable }: { label: string; items: string[]; active?: string; onSelect: (v: string) => void; scrollable?: boolean }) {
  return (
    <div className="filter-section">
      <p className="label label--mb-8">{label}</p>
      <div className={`filter-section-items${scrollable ? ' filter-section-items--scrollable' : ''}`}>
        {items.map(item => (
          <button key={item} onClick={() => onSelect(item)} className={`filter-item-btn${active === item ? ' filter-item-btn--active' : ''}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
