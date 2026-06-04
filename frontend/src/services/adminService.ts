import api from './api'
import type { Recipe } from '../types'

export interface AdminRecipe extends Recipe {
  _id?: string
}

export interface RecipeFormData {
  title: string
  category: string
  cuisine: string
  thumbnail: string
  readyInMinutes: number
  servings: number
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  dairyFree: boolean
  tags: string[]
  instructions: string
  ingredients: { name: string; measure: string }[]
  nutrition: { calories: string; protein: string; carbs: string; fat: string }
}

export const adminService = {
  async listRecipes(): Promise<AdminRecipe[]> {
    const { data } = await api.get('/admin/recipes')
    return data.data
  },
  async createRecipe(form: RecipeFormData): Promise<AdminRecipe> {
    const { data } = await api.post('/admin/recipes', form)
    return data.data
  },
  async updateRecipe(id: string, form: RecipeFormData): Promise<AdminRecipe> {
    const { data } = await api.put(`/admin/recipes/${id}`, form)
    return data.data
  },
  async deleteRecipe(id: string): Promise<void> {
    await api.delete(`/admin/recipes/${id}`)
  },
}
