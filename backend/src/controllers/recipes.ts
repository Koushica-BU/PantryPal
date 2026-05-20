import { Request, Response } from 'express'
import axios from 'axios'

const SPOONACULAR_BASE = 'https://api.spoonacular.com'
const API_KEY = process.env.SPOONACULAR_API_KEY

// ─── Search by ingredients ────────────────────────────────────────────────────
export async function searchByIngredients(req: Request, res: Response) {
  try {
    const { ingredients, number = 20, ranking = 1 } = req.query
    // ranking=1 → maximize used ingredients, ranking=2 → minimize missing

    const { data } = await axios.get(`${SPOONACULAR_BASE}/recipes/findByIngredients`, {
      params: {
        apiKey: API_KEY,
        ingredients,           // comma-separated e.g. "chicken,garlic,onion"
        number,
        ranking,
        ignorePantry: true,
      },
    })

    res.json({ success: true, data })
  } catch (err) {
    console.error('Spoonacular error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch recipes' })
  }
}

// ─── Get recipe details by ID ─────────────────────────────────────────────────
export async function getRecipeById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { data } = await axios.get(
      `${SPOONACULAR_BASE}/recipes/${id}/information`,
      {
        params: {
          apiKey: API_KEY,
          includeNutrition: false,
        },
      },
    )

    res.json({ success: true, data })
  } catch (err) {
    console.error('Spoonacular error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch recipe' })
  }
}

// ─── Search by name / keyword ─────────────────────────────────────────────────
export async function searchRecipes(req: Request, res: Response) {
  try {
    const { query, cuisine, diet, type, number = 20 } = req.query

    const { data } = await axios.get(`${SPOONACULAR_BASE}/recipes/complexSearch`, {
      params: {
        apiKey: API_KEY,
        query,
        cuisine,
        diet,
        type,
        number,
        addRecipeInformation: true,
        fillIngredients: true,
      },
    })

    res.json({ success: true, data: data.results, total: data.totalResults })
  } catch (err) {
    console.error('Spoonacular error:', err)
    res.status(500).json({ success: false, message: 'Failed to search recipes' })
  }
}

// ─── Get cuisines list ────────────────────────────────────────────────────────
export async function getCuisines(_req: Request, res: Response) {
  // Spoonacular supported cuisines (static list — no API call needed)
  const cuisines = [
    'African', 'American', 'British', 'Cajun', 'Caribbean',
    'Chinese', 'Eastern European', 'European', 'French', 'German',
    'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish',
    'Korean', 'Latin American', 'Mediterranean', 'Mexican',
    'Middle Eastern', 'Nordic', 'Southern', 'Spanish', 'Thai', 'Vietnamese',
  ]
  res.json({ success: true, data: cuisines })
}

// ─── Get diets list ───────────────────────────────────────────────────────────
export async function getDiets(_req: Request, res: Response) {
  const diets = [
    'Gluten Free', 'Ketogenic', 'Vegetarian', 'Lacto-Vegetarian',
    'Ovo-Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Primal', 'Whole30',
  ]
  res.json({ success: true, data: diets })
}

// ─── Get nutrition info ───────────────────────────────────────────────────────
export async function getRecipeNutrition(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { data } = await axios.get(
      `${SPOONACULAR_BASE}/recipes/${id}/nutritionWidget.json`,
      { params: { apiKey: API_KEY } },
    )
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch nutrition' })
  }
}
