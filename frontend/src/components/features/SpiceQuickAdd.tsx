import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import './SpiceQuickAdd.css'

const GROUPS = [
  {
    label: 'Basics',
    items: [
      'Milk', 'Butter', 'Eggs', 'Oil', 'Yogurt', 'Flour',
      'Honey', 'Vinegar', 'Cream', 'Cheese', 'Baking Powder', 'Baking Soda',
    ],
  },
  {
    label: 'Spices',
    items: [
      'Cumin', 'Cumin Powder', 'Coriander', 'Coriander Powder',
      'Turmeric', 'Chilli', 'Chilli Powder', 'Black Pepper', 'Black Pepper Powder',
      'Garam Masala', 'Paprika', 'Cardamom', 'Cinnamon', 'Cloves',
      'Mustard Seeds', 'Fennel Seeds', 'Star Anise', 'Asafoetida',
    ],
  },
  {
    label: 'Herbs',
    items: [
      'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Bay Leaves',
      'Cilantro', 'Mint', 'Parsley', 'Sage', 'Dill', 'Chives', 'Tarragon',
    ],
  },
]

export default function SpiceQuickAdd() {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { pantryItems, addIngredient, removeIngredient } = useStore()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const toggle = (name: string) => {
    const ex = pantryItems.find(i => i.name.toLowerCase() === name.toLowerCase())
    ex ? removeIngredient(ex.id) : addIngredient(name)
  }

  const searching = searchTerm.length > 0
  const searchResults = searching
    ? GROUPS.flatMap(g => g.items).filter(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  const panelGroup = !searching && openGroup ? GROUPS.find(g => g.label === openGroup) : null
  const showPanel = searching || openGroup !== null

  return (
    <div ref={wrapRef} className="spice-quick-add">
      <div className="spice-bar">
        <div className="spice-search-wrap">
          <Search size={12} strokeWidth={2} className="spice-search-icon" />
          <input
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setOpenGroup(null) }}
            placeholder="Search spices, herbs, basics…"
            className="spice-search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="spice-clear-btn">
              <X size={11} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="spice-group-btns">
          {GROUPS.map(g => (
            <button
              key={g.label}
              onClick={() => { setOpenGroup(o => o === g.label ? null : g.label); setSearchTerm('') }}
              className={`spice-group-btn${openGroup === g.label ? ' spice-group-btn--active' : ''}`}
            >
              {g.label}
              <ChevronDown size={11} strokeWidth={2} className={`spice-chevron${openGroup === g.label ? ' spice-chevron--open' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {showPanel && (
        <div className="spice-panel">
          {searching ? (
            searchResults.length > 0
              ? searchResults.map(name => <SpiceChip key={name} name={name} active={pantryItems.some(i => i.name.toLowerCase() === name.toLowerCase())} onToggle={toggle} />)
              : <p className="spice-no-results">No results for "{searchTerm}"</p>
          ) : panelGroup?.items.map(name => (
            <SpiceChip key={name} name={name} active={pantryItems.some(i => i.name.toLowerCase() === name.toLowerCase())} onToggle={toggle} />
          ))}
        </div>
      )}
    </div>
  )
}

function SpiceChip({ name, active, onToggle }: { name: string; active: boolean; onToggle: (n: string) => void }) {
  return (
    <button onClick={() => onToggle(name)} className={`quick-btn${active ? ' quick-btn--active' : ''}`}>
      {name}
      {active && <X size={11} strokeWidth={3} />}
    </button>
  )
}
