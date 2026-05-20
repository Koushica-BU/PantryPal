import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// ─── User Model ───────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string
  email: string
  password: string
  createdAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now },
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model<IUser>('User', UserSchema)

// ─── Ingredient Schema (reused) ───────────────────────────────────────────────

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  measure: { type: String, default: '' },
}, { _id: false })

// ─── Recipe Schema (embedded) ─────────────────────────────────────────────────

const RecipeSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  cuisine: { type: String, default: '' },
  instructions: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  tags: [{ type: String }],
  sourceUrl: { type: String, default: null },
  ingredients: [IngredientSchema],
}, { _id: false })

// ─── Favourite Model ──────────────────────────────────────────────────────────

export interface IFavourite extends Document {
  userId: mongoose.Types.ObjectId
  recipeId: string
  recipe: object
  savedAt: Date
}

const FavouriteSchema = new Schema<IFavourite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipeId: { type: String, required: true },
  recipe: { type: RecipeSchema, required: true },
  savedAt: { type: Date, default: Date.now },
})

FavouriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true })
export const Favourite = mongoose.model<IFavourite>('Favourite', FavouriteSchema)

// ─── MealPlan Model ───────────────────────────────────────────────────────────

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId
  weekStart: string
  day: string
  slot: string
  recipe: object
}

const MealPlanSchema = new Schema<IMealPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekStart: { type: String, required: true },
  day: { type: String, required: true },
  slot: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  recipe: { type: RecipeSchema, required: true },
})

MealPlanSchema.index({ userId: 1, weekStart: 1 })
export const MealPlan = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema)

// ─── ShoppingList Model ───────────────────────────────────────────────────────

export interface IShoppingItem extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  measure: string
  checked: boolean
  recipeId?: string
  recipeTitle?: string
}

const ShoppingItemSchema = new Schema<IShoppingItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  measure: { type: String, default: '' },
  checked: { type: Boolean, default: false },
  recipeId: { type: String },
  recipeTitle: { type: String },
})

export const ShoppingItem = mongoose.model<IShoppingItem>('ShoppingItem', ShoppingItemSchema)
