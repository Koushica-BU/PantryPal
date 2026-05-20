import api from './api'
import type {
  SpoonacularRecipe,
  SpoonacularRecipeDetail,
  Recipe,
  RecipeFilters,
} from '../types'

// ─── Transform Spoonacular → our clean Recipe type ────────────────────────────

export function transformSpoonacularRecipe(
  r: SpoonacularRecipeDetail,
  used = 0,
  missed = 0,
): Recipe {
  return {
    id: String(r.id),
    title: r.title,
    thumbnail: r.image,
    category: r.dishTypes?.[0] || '',
    cuisine: r.cuisines?.[0] || '',
    instructions: r.instructions || '',
    tags: r.diets || [],
    sourceUrl: r.sourceUrl || null,
    readyInMinutes: r.readyInMinutes || 0,
    servings: r.servings || 0,
    vegetarian: r.vegetarian || false,
    vegan: r.vegan || false,
    glutenFree: r.glutenFree || false,
    dairyFree: r.dairyFree || false,
    usedIngredientCount: used,
    missedIngredientCount: missed,
    ingredients: (r.extendedIngredients || []).map((ing) => ({
      name: ing.name,
      measure: `${ing.amount} ${ing.unit}`.trim(),
      image: ing.image
        ? `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`
        : undefined,
    })),
  }
}

// Transform the summary list result (no extended ingredients yet)
export function transformSpoonacularSummary(r: SpoonacularRecipe): Recipe {
  return {
    id: String(r.id),
    title: r.title,
    thumbnail: r.image,
    category: '',
    cuisine: '',
    instructions: '',
    tags: [],
    sourceUrl: null,
    readyInMinutes: 0,
    servings: 0,
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    usedIngredientCount: r.usedIngredientCount,
    missedIngredientCount: r.missedIngredientCount,
    ingredients: [
      ...r.usedIngredients.map((i) => ({ name: i.name, measure: `${i.amount} ${i.unit}`.trim() })),
      ...r.missedIngredients.map((i) => ({ name: i.name, measure: `${i.amount} ${i.unit}`.trim() })),
    ],
  }
}

// ─── Recipe API calls (all go through YOUR backend) ──────────────────────────

/** Search by pantry ingredients */
export async function searchByIngredients(ingredients: string[]): Promise<Recipe[]> {
  if (ingredients.length === 0) return []

  const { data } = await api.get('/recipes/search-by-ingredients', {
    params: {
      ingredients: ingredients.join(','),
      number: 24,
      ranking: 1,
    },
  })

  // data is an array of SpoonacularRecipe (summary, no full details)
  return (data.data as SpoonacularRecipe[]).map(transformSpoonacularSummary)
}

/** Search by name with optional filters */
export async function searchRecipes(
  query: string,
  filters?: RecipeFilters,
): Promise<Recipe[]> {
  const { data } = await api.get('/recipes/search', {
    params: {
      query,
      cuisine: filters?.cuisine,
      diet: filters?.diet,
      type: filters?.category,
      number: 24,
    },
  })
  return (data.data as SpoonacularRecipeDetail[]).map((r) => transformSpoonacularRecipe(r))
}

/** Get full recipe details */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const { data } = await api.get(`/recipes/${id}`)
    return transformSpoonacularRecipe(data.data as SpoonacularRecipeDetail)
  } catch {
    return null
  }
}

/** Get cuisines list */
export async function getCuisines(): Promise<string[]> {
  const { data } = await api.get('/recipes/cuisines')
  return data.data as string[]
}

/** Get diets list */
export async function getDiets(): Promise<string[]> {
  const { data } = await api.get('/recipes/diets')
  return data.data as string[]
}

// ─── Backend user data calls ──────────────────────────────────────────────────

export const recipeService = {
  async getFavourites() {
    const { data } = await api.get('/favourites')
    return data
  },
  async addFavourite(recipeId: string, recipe: Recipe) {
    const { data } = await api.post('/favourites', { recipeId, recipe })
    return data
  },
  async removeFavourite(recipeId: string) {
    const { data } = await api.delete(`/favourites/${recipeId}`)
    return data
  },
  async getMealPlan(weekStart: string) {
    const { data } = await api.get(`/mealplan?weekStart=${weekStart}`)
    return data
  },
  async saveMealPlanEntry(entry: {
    weekStart: string; day: string; slot: string; recipe: Recipe
  }) {
    const { data } = await api.post('/mealplan', entry)
    return data
  },
  async removeMealPlanEntry(id: string) {
    const { data } = await api.delete(`/mealplan/${id}`)
    return data
  },
  async getShoppingList() {
    const { data } = await api.get('/shopping-list')
    return data
  },
  async generateShoppingList(items: object[]) {
    const { data } = await api.post('/shopping-list/generate', { items })
    return data
  },
  async toggleShoppingItem(itemId: string, checked: boolean) {
    const { data } = await api.patch(`/shopping-list/${itemId}`, { checked })
    return data
  },
  async clearShoppingList() {
    const { data } = await api.delete('/shopping-list')
    return data
  },
}

/** Get nutrition info for a recipe */
export async function getRecipeNutrition(id: string) {
  const { data } = await api.get(`/recipes/${id}/nutrition`)
  return data.data
}
