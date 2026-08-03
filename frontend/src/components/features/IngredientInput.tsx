import { useState, useRef, useEffect } from 'react'
import { X, Plus, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/useStore'
import './IngredientInput.css'

const QUICK = ['Eggs','Garlic','Onion','Tomatoes','Chicken','Pasta','Rice','Butter','Milk','Cheese','Lemon','Potatoes']
const EMOJI: Record<string, string> = { Eggs:'🥚',Garlic:'🧄',Onion:'🧅',Tomatoes:'🍅',Chicken:'🍗',Pasta:'🍝',Rice:'🍚',Butter:'🧈',Milk:'🥛',Cheese:'🧀',Lemon:'🍋',Potatoes:'🥔' }
const STAPLES = new Set(['salt','sugar','water'])

interface Props { onSearch: () => void; isLoading?: boolean }

export default function IngredientInput({ onSearch, isLoading }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { pantryItems, addIngredient, removeIngredient, clearPantry, seedDefaultStaples } = useStore()

  useEffect(() => { seedDefaultStaples() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const add = () => {
    const name = input.trim()
    if (!name || pantryItems.some(i => i.name.toLowerCase() === name.toLowerCase())) return
    addIngredient(name); setInput(''); inputRef.current?.focus()
  }
  const toggle = (name: string) => {
    const ex = pantryItems.find(i => i.name.toLowerCase() === name.toLowerCase())
    ex ? removeIngredient(ex.id) : addIngredient(name)
  }

  return (
    <div className="card ingredient-card">
      <div className="ingredient-header">
        <p className="label label--mb-5">Your pantry</p>
        <h2>What do you have?</h2>
      </div>

      <div className="ingredient-add-row">
        <input ref={inputRef} type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="e.g. chicken, garlic, lemon…"
          className="input-field flex-1" />
        <button onClick={add} disabled={!input.trim()} className="btn-primary ingredient-add-btn">
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div>
        <p className="label label--mb-8">Quick add</p>
        <div className="quick-add-pills">
          {QUICK.map(name => {
            const active = pantryItems.some(i => i.name.toLowerCase() === name.toLowerCase())
            return (
              <button key={name} onClick={() => toggle(name)} className={`quick-btn${active ? ' quick-btn--active' : ''}`}>
                <span className="quick-btn-emoji">{EMOJI[name]}</span>
                {name}
                {active && <X size={11} strokeWidth={3} />}
              </button>
            )
          })}
        </div>
      </div>

      {pantryItems.length > 0 && (
        <div>
          <div className="pantry-items-header">
            <p className="label">In pantry · {pantryItems.length}</p>
            <button onClick={clearPantry} className="pantry-clear-btn">
              Clear all
            </button>
          </div>
          <div className="pantry-tags">
            {pantryItems.map(item => (
              <span key={item.id} className="pantry-tag">
                {item.name}
                <button onClick={() => removeIngredient(item.id)} className="pantry-tag-remove">
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {(() => {
        const hasNonStaple = pantryItems.some(i => !STAPLES.has(i.name.toLowerCase()))
        return (
          <button onClick={onSearch} disabled={!hasNonStaple || !!isLoading} className="btn-primary find-recipes-btn">
            {isLoading ? (
              <><div className="btn-spinner" />Finding recipes…</>
            ) : (
              <>Find recipes{hasNonStaple && ` · ${pantryItems.length}`} <ArrowRight size={16} strokeWidth={2.5} /></>
            )}
          </button>
        )
      })()}
    </div>
  )
}
