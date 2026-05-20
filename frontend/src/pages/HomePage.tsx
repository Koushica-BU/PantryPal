import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import IngredientInput from '../components/features/IngredientInput'
import RecipeCard from '../components/features/RecipeCard'
import RecipeFiltersBar from '../components/features/RecipeFiltersBar'
import { searchByIngredients, searchRecipes } from '../services/recipeService'
import { useStore } from '../store/useStore'
import type { Recipe, RecipeFilters } from '../types'
import './HomePage.css'

const PAGE_SIZE = 12

export default function HomePage() {
  const { pantryItems } = useStore()
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [displayed, setDisplayed] = useState<Recipe[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [filters, setFilters] = useState<RecipeFilters>({})
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && displayed.length < allRecipes.length) setPage(p => p + 1)
    }, { threshold: 0.1 })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [displayed.length, allRecipes.length])

  useEffect(() => {
    if (allRecipes.length) setDisplayed(allRecipes.slice(0, page * PAGE_SIZE))
  }, [page, allRecipes])

  const handleSearch = useCallback(async () => {
    if (!pantryItems.length) return
    setLoading(true); setSearched(true); setPage(1)
    try {
      const r = (filters.cuisine || filters.diet || filters.category)
        ? await searchRecipes(pantryItems.map(i => i.name).join(' '), filters)
        : await searchByIngredients(pantryItems.map(i => i.name))
      setAllRecipes(r); setDisplayed(r.slice(0, PAGE_SIZE))
      if (!r.length) toast('No matches — try more ingredients', { icon: '○' })
    } catch { toast.error('Connection error') }
    finally { setLoading(false) }
  }, [pantryItems, filters])

  return (
    <div className="page-shell">
      {!searched && (
        <div className="home-hero">
          <p className="label label--mb-12">// Recipe_Scanner</p>
          <h1 className="home-headline">
            What can you cook<br /><span className="text-purple-gradient">tonight?</span>
          </h1>
          <p className="home-sub">
            Add your ingredients and we'll find what to make right now.
          </p>
        </div>
      )}

      <div className={searched ? 'home-layout-searched' : ''}>
        <div className={searched ? 'home-sidebar' : 'home-sidebar--default'}>
          <IngredientInput onSearch={handleSearch} isLoading={loading} />
        </div>

        {searched && (
          <div>
            <div className="results-header">
              <div className="results-status">
                {loading && <div className="scanning-dot" />}
                <span className="results-count-text">
                  {loading ? 'Scanning…' : `${allRecipes.length} recipes found`}
                </span>
              </div>
              <RecipeFiltersBar filters={filters} onChange={setFilters} />
            </div>

            {loading && (
              <div className="recipes-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card skeleton-card-overflow">
                    <div className="skeleton skeleton-aspect-16-10" />
                    <div className="skeleton-card-body">
                      <div className="skeleton skeleton-line-title" />
                      <div className="skeleton skeleton-line-meta" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && displayed.length > 0 && (
              <>
                <div className="stagger recipes-grid">
                  {displayed.map(r => <RecipeCard key={r.id} recipe={r} matchedIngredients={r.usedIngredientCount} totalIngredients={r.usedIngredientCount + r.missedIngredientCount} />)}
                </div>
                <div ref={loaderRef} className="loader-sentinel">
                  <span className="loader-sentinel-text">
                    {displayed.length < allRecipes.length ? '// Loading more…' : `// All ${allRecipes.length} results loaded`}
                  </span>
                </div>
              </>
            )}

            {!loading && !displayed.length && (
              <div className="home-empty-state">
                <p className="home-empty-code">404</p>
                <h3 className="home-empty-title">No recipes found</h3>
                <p className="home-empty-sub">Try adding more ingredients or clearing filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
