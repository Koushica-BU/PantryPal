import api from './api'
import type { Recipe, RecipeFilters } from '../types'

// ─── Recipe API calls ─────────────────────────────────────────────────────────

export async function searchByIngredients(ingredients: string[]): Promise<Recipe[]> {
  if (ingredients.length === 0) return []
  const { data } = await api.get('/recipes/search-by-ingredients', {
    params: { ingredients: ingredients.join(','), number: 24 },
  })
  return data.data as Recipe[]
}

export async function searchRecipes(query: string, filters?: RecipeFilters): Promise<Recipe[]> {
  const { data } = await api.get('/recipes/search', {
    params: {
      query,
      cuisine: filters?.cuisine,
      diet: filters?.diet,
      type: filters?.category,
      number: 24,
    },
  })
  return data.data as Recipe[]
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const { data } = await api.get(`/recipes/${id}`)
    return data.data as Recipe
  } catch {
    return null
  }
}

export async function getCuisines(): Promise<string[]> {
  const { data } = await api.get('/recipes/cuisines')
  return data.data as string[]
}

export async function getDiets(): Promise<string[]> {
  const { data } = await api.get('/recipes/diets')
  return data.data as string[]
}

export async function getRecipeNutrition(id: string) {
  const { data } = await api.get(`/recipes/${id}/nutrition`)
  return data.data
}

// ─── User data calls ──────────────────────────────────────────────────────────

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
  async saveMealPlanEntry(entry: { weekStart: string; day: string; slot: string; recipe: Recipe }) {
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
