// ─── Recipe Types ─────────────────────────────────────────────────────────────

export interface Recipe {
  id: string
  title: string
  category: string
  cuisine: string
  instructions: string
  thumbnail: string
  tags: string[]
  sourceUrl: string | null
  readyInMinutes: number
  servings: number
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  dairyFree: boolean
  usedIngredientCount: number
  missedIngredientCount: number
  ingredients: Ingredient[]
}

export interface Ingredient {
  name: string
  measure: string
  image?: string
}

// ─── User / Auth Types ────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  isAdmin?: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Pantry / Ingredient Types ────────────────────────────────────────────────

export interface PantryItem {
  id: string
  name: string
  emoji?: string
  category: PantryCategory
  addedAt: string
}

export type PantryCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'grains'
  | 'canned'
  | 'spices'
  | 'condiments'
  | 'frozen'
  | 'other'

// ─── Favourites ───────────────────────────────────────────────────────────────

export interface FavouriteRecipe {
  id: string
  userId: string
  recipeId: string
  recipe: Recipe
  savedAt: string
}

// ─── Meal Plan ────────────────────────────────────────────────────────────────

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner'

export interface MealPlanEntry {
  id: string
  userId: string
  weekStart: string
  day: DayOfWeek
  slot: MealSlot
  recipe: Recipe
}

export type WeekPlan = Partial<Record<DayOfWeek, Partial<Record<MealSlot, Recipe>>>>

// ─── Shopping List ────────────────────────────────────────────────────────────

export interface ShoppingListItem {
  id: string
  name: string
  measure: string
  checked: boolean
  recipeId?: string
  recipeTitle?: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface RecipeFilters {
  cuisine?: string
  category?: string
  diet?: string
  searchQuery?: string
}
