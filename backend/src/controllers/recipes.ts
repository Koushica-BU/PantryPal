import { Request, Response } from 'express'
import { RecipeModel, IRecipe } from '../models/RecipeModel'

function toClient(doc: IRecipe, usedCount = 0, missedCount = 0) {
  return {
    id: String(doc._id),
    title: doc.title,
    category: doc.category,
    cuisine: doc.cuisine,
    instructions: doc.instructions,
    thumbnail: doc.thumbnail,
    tags: doc.tags,
    sourceUrl: doc.sourceUrl,
    readyInMinutes: doc.readyInMinutes,
    servings: doc.servings,
    vegetarian: doc.vegetarian,
    vegan: doc.vegan,
    glutenFree: doc.glutenFree,
    dairyFree: doc.dairyFree,
    usedIngredientCount: usedCount,
    missedIngredientCount: missedCount,
    ingredients: doc.ingredients,
  }
}

function scoreByIngredients(doc: IRecipe, searchTerms: string[]) {
  const recipeNames = doc.ingredients.map(i => i.name.toLowerCase())
  let used = 0
  for (const term of searchTerms) {
    if (recipeNames.some(n => n.includes(term) || term.includes(n))) used++
  }
  return { used, missed: doc.ingredients.length - used }
}

// ─── Search by pantry ingredients ─────────────────────────────────────────────

export async function searchByIngredients(req: Request, res: Response) {
  try {
    const raw = (req.query.ingredients as string) || ''
    const terms = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    if (!terms.length) return res.json({ success: true, data: [] })

    const all = await RecipeModel.find({}).lean()

    const scored = all
      .map(doc => {
        const { used, missed } = scoreByIngredients(doc as unknown as IRecipe, terms)
        return { doc, used, missed }
      })
      .filter(({ used }) => used > 0)
      .sort((a, b) => b.used - a.used || a.missed - b.missed)
      .slice(0, Number(req.query.number) || 24)

    res.json({ success: true, data: scored.map(({ doc, used, missed }) => toClient(doc as unknown as IRecipe, used, missed)) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to search recipes' })
  }
}

// ─── Search by name / keyword + optional filters ───────────────────────────────

export async function searchRecipes(req: Request, res: Response) {
  try {
    const { query = '', cuisine, diet, type, number = 24 } = req.query
    const terms = String(query).toLowerCase().split(' ').filter(Boolean)

    const filter: Record<string, unknown> = {}
    if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' }
    if (type) filter.category = { $regex: type, $options: 'i' }
    if (diet) {
      const d = String(diet).toLowerCase()
      if (d === 'vegetarian')  filter.vegetarian = true
      else if (d === 'vegan')  filter.vegan = true
      else if (d.includes('gluten')) filter.glutenFree = true
      else if (d.includes('dairy'))  filter.dairyFree = true
      else filter.tags = { $regex: diet, $options: 'i' }
    }

    const all = await RecipeModel.find(filter).lean()

    const results = all
      .map(doc => {
        const { used, missed } = scoreByIngredients(doc as unknown as IRecipe, terms)
        return { doc, used, missed }
      })
      .sort((a, b) => b.used - a.used || a.missed - b.missed)
      .slice(0, Number(number))

    res.json({ success: true, data: results.map(({ doc, used, missed }) => toClient(doc as unknown as IRecipe, used, missed)), total: results.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to search recipes' })
  }
}

// ─── Get recipe by ID ──────────────────────────────────────────────────────────

export async function getRecipeById(req: Request, res: Response) {
  try {
    const doc = await RecipeModel.findById(req.params.id).lean()
    if (!doc) return res.status(404).json({ success: false, message: 'Recipe not found' })
    res.json({ success: true, data: toClient(doc as unknown as IRecipe) })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipe' })
  }
}

// ─── Get nutrition (from our own data) ────────────────────────────────────────

export async function getRecipeNutrition(req: Request, res: Response) {
  try {
    const doc = await RecipeModel.findById(req.params.id).lean() as unknown as IRecipe | null
    if (!doc) return res.status(404).json({ success: false, message: 'Recipe not found' })
    res.json({ success: true, data: doc.nutrition })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch nutrition' })
  }
}

// ─── Static lists ──────────────────────────────────────────────────────────────

export async function getCuisines(_req: Request, res: Response) {
  const cuisines = await RecipeModel.distinct('cuisine')
  res.json({ success: true, data: cuisines.sort() })
}

export async function getDiets(_req: Request, res: Response) {
  const diets = [
    'Gluten Free', 'Ketogenic', 'Vegetarian', 'Vegan',
    'Pescetarian', 'Paleo', 'Primal', 'Whole30',
  ]
  res.json({ success: true, data: diets })
}
