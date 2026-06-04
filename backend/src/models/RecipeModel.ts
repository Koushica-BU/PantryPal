import mongoose, { Schema, Document } from 'mongoose'

export interface IRecipe extends Document {
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
  nutrition: { calories: string; protein: string; carbs: string; fat: string }
  ingredients: Array<{ name: string; measure: string }>
}

const RecipeSchema = new Schema<IRecipe>({
  title:          { type: String, required: true },
  category:       { type: String, default: '' },
  cuisine:        { type: String, default: '' },
  instructions:   { type: String, default: '' },
  thumbnail:      { type: String, default: '' },
  tags:           [{ type: String }],
  sourceUrl:      { type: String, default: null },
  readyInMinutes: { type: Number, default: 0 },
  servings:       { type: Number, default: 2 },
  vegetarian:     { type: Boolean, default: false },
  vegan:          { type: Boolean, default: false },
  glutenFree:     { type: Boolean, default: false },
  dairyFree:      { type: Boolean, default: false },
  nutrition: {
    calories: { type: String, default: '' },
    protein:  { type: String, default: '' },
    carbs:    { type: String, default: '' },
    fat:      { type: String, default: '' },
  },
  ingredients: [{
    name:    { type: String, required: true },
    measure: { type: String, default: '' },
    _id:     false,
  }],
})

RecipeSchema.set('timestamps', true)
RecipeSchema.index({ title: 'text', tags: 'text' })
RecipeSchema.index({ cuisine: 1 })
RecipeSchema.index({ category: 1 })
RecipeSchema.index({ vegetarian: 1, vegan: 1, glutenFree: 1 })

export const RecipeModel = mongoose.model<IRecipe>('Recipe', RecipeSchema)
