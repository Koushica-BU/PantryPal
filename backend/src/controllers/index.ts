import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User, Favourite, MealPlan, ShoppingItem } from '../models'
import type { AuthRequest } from '../middleware/auth'

const signToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  } as jwt.SignOptions)

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' })
    }
    const user = await User.create({ name, email, password })
    const token = signToken(String(user._id))
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
    const token = signToken(String(user._id))
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function getFavourites(req: AuthRequest, res: Response) {
  try {
    const favs = await Favourite.find({ userId: req.userId }).sort({ savedAt: -1 })
    res.json({ success: true, data: favs })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function addFavourite(req: AuthRequest, res: Response) {
  try {
    const { recipeId, recipe } = req.body
    const fav = await Favourite.findOneAndUpdate(
      { userId: req.userId, recipeId },
      { userId: req.userId, recipeId, recipe, savedAt: new Date() },
      { upsert: true, new: true },
    )
    res.status(201).json({ success: true, data: fav })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function removeFavourite(req: AuthRequest, res: Response) {
  try {
    await Favourite.findOneAndDelete({ userId: req.userId, recipeId: req.params.recipeId })
    res.json({ success: true, message: 'Removed from favourites' })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ─── Meal Plan Controllers ────────────────────────────────────────────────────

export async function getMealPlan(req: AuthRequest, res: Response) {
  try {
    const { weekStart } = req.query
    const query: Record<string, unknown> = { userId: req.userId }
    if (weekStart) query.weekStart = weekStart
    const entries = await MealPlan.find(query)
    res.json({ success: true, data: entries })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function saveMealPlanEntry(req: AuthRequest, res: Response) {
  try {
    const { weekStart, day, slot, recipe } = req.body
    const entry = await MealPlan.findOneAndUpdate(
      { userId: req.userId, weekStart, day, slot },
      { userId: req.userId, weekStart, day, slot, recipe },
      { upsert: true, new: true },
    )
    res.status(201).json({ success: true, data: entry })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function removeMealPlanEntry(req: AuthRequest, res: Response) {
  try {
    await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ success: true, message: 'Entry removed' })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function getShoppingList(req: AuthRequest, res: Response) {
  try {
    const items = await ShoppingItem.find({ userId: req.userId })
    res.json({ success: true, data: items })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function generateShoppingList(req: AuthRequest, res: Response) {
  try {
    const { items } = req.body
    const created = await ShoppingItem.insertMany(
      items.map((item: { name: string; measure: string; recipeId?: string; recipeTitle?: string }) => ({
        ...item,
        userId: req.userId,
        checked: false,
      })),
    )
    res.status(201).json({ success: true, data: created })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function toggleShoppingItem(req: AuthRequest, res: Response) {
  try {
    const item = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { checked: req.body.checked },
      { new: true },
    )
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' })
    res.json({ success: true, data: item })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export async function clearShoppingList(req: AuthRequest, res: Response) {
  try {
    await ShoppingItem.deleteMany({ userId: req.userId })
    res.json({ success: true, message: 'Shopping list cleared' })
  } catch {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
