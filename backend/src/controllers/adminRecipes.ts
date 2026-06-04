import { Response } from 'express'
import { RecipeModel } from '../models/RecipeModel'
import type { AuthRequest } from '../middleware/auth'

export async function listAllRecipes(_req: AuthRequest, res: Response) {
  try {
    const recipes = await RecipeModel.find({}).sort({ title: 1 }).lean()
    const data = recipes.map(r => ({ ...r, id: String(r._id) }))
    res.json({ success: true, data, total: data.length })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to list recipes' })
  }
}

export async function createRecipe(req: AuthRequest, res: Response) {
  try {
    const doc = await RecipeModel.create(req.body)
    res.status(201).json({ success: true, data: { ...doc.toObject(), id: String(doc._id) } })
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create recipe' })
  }
}

export async function updateRecipe(req: AuthRequest, res: Response) {
  try {
    const doc = await RecipeModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean()
    if (!doc) return res.status(404).json({ success: false, message: 'Recipe not found' })
    res.json({ success: true, data: { ...doc, id: String(doc._id) } })
  } catch {
    res.status(400).json({ success: false, message: 'Failed to update recipe' })
  }
}

export async function deleteRecipe(req: AuthRequest, res: Response) {
  try {
    const doc = await RecipeModel.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ success: false, message: 'Recipe not found' })
    res.json({ success: true, message: 'Recipe deleted' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete recipe' })
  }
}
