import { ShoppingCart, Trash2, CheckCheck, Download } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import './ShoppingListPage.css'

export default function ShoppingListPage() {
  const { shoppingList, toggleItem, removeItem, clearList } = useStore()
  const unchecked = shoppingList.filter(i => !i.checked)
  const checked   = shoppingList.filter(i =>  i.checked)

  const exportList = () => {
    const text = shoppingList.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.measure ? i.measure + ' ' : ''}${i.name}`).join('\n')
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: 'shopping-list.txt' })
    a.click(); toast.success('Exported')
  }

  return (
    <div className="page-shell shopping-page">
      <p className="label label--mb-10">// Shopping_List</p>
      <div className="shopping-header">
        <div>
          <h1 className="shopping-title">Shopping</h1>
          {unchecked.length > 0 && <p className="shopping-remaining-text">{unchecked.length} items_remaining</p>}
        </div>
        {shoppingList.length > 0 && (
          <div className="shopping-header-actions">
            <button onClick={exportList} className="btn-ghost btn-sm"><Download size={13} />Export</button>
            <button onClick={() => { clearList(); toast('List cleared') }} className="btn-ghost btn-sm btn-ghost--danger"><Trash2 size={13} />Clear</button>
          </div>
        )}
      </div>

      {!shoppingList.length ? (
        <div className="shopping-empty">
          <ShoppingCart size={32} strokeWidth={1} color="var(--text-4)" className="shopping-empty-icon" />
          <h2 className="shopping-empty-title">List is empty</h2>
          <p className="shopping-empty-sub">Open a recipe and tap "Add missing to shopping".</p>
          <Link to="/app" className="btn-primary hero-cta-link">Find recipes</Link>
        </div>
      ) : (
        <div className="shopping-list">
          {unchecked.map(item => (
            <div key={item.id} onClick={() => toggleItem(item.id)} className="card-interactive shopping-item">
              <div className="shopping-item-checkbox" />
              <div className="shopping-item-body">
                <p className="shopping-item-name">{item.name}</p>
                {item.measure && <p className="shopping-item-measure">{item.measure}</p>}
                {item.recipeTitle && <p className="shopping-item-recipe">from: {item.recipeTitle}</p>}
              </div>
              <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} className="btn-ghost btn-icon"><Trash2 size={13} /></button>
            </div>
          ))}

          {checked.length > 0 && (
            <>
              <div className="shopping-done-divider">
                <div className="divider flex-1" />
                <span className="shopping-done-label">DONE ({checked.length})</span>
                <div className="divider flex-1" />
              </div>
              {checked.map(item => (
                <div key={item.id} onClick={() => toggleItem(item.id)} className="shopping-checked-item">
                  <div className="shopping-checked-box">
                    <CheckCheck size={10} strokeWidth={3} color="#fff" />
                  </div>
                  <p className="shopping-checked-name">{item.name}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
