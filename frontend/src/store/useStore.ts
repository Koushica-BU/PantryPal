import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User, PantryItem, Recipe, ShoppingListItem, WeekPlan, PantryCategory,
} from '../types'

interface AuthSlice {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

interface PantrySlice {
  pantryItems: PantryItem[]
  addIngredient: (name: string, category?: PantryCategory) => void
  removeIngredient: (id: string) => void
  clearPantry: () => void
}

interface FavouritesSlice {
  favourites: Recipe[]
  addFavourite: (recipe: Recipe) => void
  removeFavourite: (recipeId: string) => void
  isFavourite: (recipeId: string) => boolean
}

interface ShoppingSlice {
  shoppingList: ShoppingListItem[]
  addShoppingItems: (items: ShoppingListItem[]) => void
  toggleItem: (id: string) => void
  removeItem: (id: string) => void
  clearList: () => void
}

interface MealPlanSlice {
  weekPlan: WeekPlan
  setMealPlanEntry: (day: string, slot: string, recipe: Recipe) => void
  removeMealPlanEntry: (day: string, slot: string) => void
  clearWeekPlan: () => void
}

interface ThemeSlice {
  darkMode: boolean
  toggleDarkMode: () => void
}

type StoreState = AuthSlice & PantrySlice & FavouritesSlice & ShoppingSlice & MealPlanSlice & ThemeSlice

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),

      // Pantry
      pantryItems: [],
      addIngredient: (name, category = 'other') =>
        set((state) => ({
          pantryItems: state.pantryItems.some(i => i.name.toLowerCase() === name.toLowerCase())
            ? state.pantryItems
            : [...state.pantryItems, {
                id: `${Date.now()}-${Math.random()}`,
                name: name.toLowerCase().trim(),
                category,
                addedAt: new Date().toISOString(),
              }],
        })),
      removeIngredient: (id) =>
        set((state) => ({ pantryItems: state.pantryItems.filter((i) => i.id !== id) })),
      clearPantry: () => set({ pantryItems: [] }),

      // Favourites
      favourites: [],
      addFavourite: (recipe) =>
        set((state) => ({
          favourites: state.favourites.some((f) => f.id === recipe.id)
            ? state.favourites
            : [...state.favourites, recipe],
        })),
      removeFavourite: (recipeId) =>
        set((state) => ({ favourites: state.favourites.filter((f) => f.id !== recipeId) })),
      isFavourite: (recipeId) => get().favourites.some((f) => f.id === recipeId),

      // Shopping
      shoppingList: [],
      addShoppingItems: (items) =>
        set((state) => {
          const existing = new Set(state.shoppingList.map((i) => i.name.toLowerCase()))
          return { shoppingList: [...state.shoppingList, ...items.filter(i => !existing.has(i.name.toLowerCase()))] }
        }),
      toggleItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((i) => i.id === id ? { ...i, checked: !i.checked } : i),
        })),
      removeItem: (id) =>
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => i.id !== id) })),
      clearList: () => set({ shoppingList: [] }),

      // Meal Plan
      weekPlan: {},
      setMealPlanEntry: (day, slot, recipe) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [day]: { ...(state.weekPlan[day as keyof WeekPlan] || {}), [slot]: recipe },
          },
        })),
      removeMealPlanEntry: (day, slot) =>
        set((state) => {
          const dayPlan = { ...(state.weekPlan[day as keyof WeekPlan] || {}) }
          delete dayPlan[slot as keyof typeof dayPlan]
          return { weekPlan: { ...state.weekPlan, [day]: dayPlan } }
        }),
      clearWeekPlan: () => set({ weekPlan: {} }),

      // Theme
      darkMode: false,
      toggleDarkMode: () => {
        set((state) => {
          const next = !state.darkMode
          document.documentElement.classList.toggle('dark', next)
          return { darkMode: next }
        })
      },
    }),
    {
      name: 'pantrypal-storage',
      partialize: (state) => ({
        pantryItems: state.pantryItems,
        favourites: state.favourites,
        shoppingList: state.shoppingList,
        weekPlan: state.weekPlan,
        user: state.user,
        token: state.token,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply dark mode immediately on page load before React renders
        if (state?.darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    },
  ),
)
