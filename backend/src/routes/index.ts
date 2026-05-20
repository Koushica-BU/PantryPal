import { Router } from 'express'
import { body } from 'express-validator'
import { auth } from '../middleware/auth'
import * as ctrl from '../controllers'
import * as recipeCtrl from '../controllers/recipes'
import { getRecipeNutrition } from '../controllers/recipes'

export const router = Router()

// ─── Auth ─────────────────────────────────────────────────────────────────────

router.post(
  '/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  ctrl.register,
)

router.post(
  '/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  ctrl.login,
)

router.get('/auth/me', auth, ctrl.getMe)

// ─── Recipes (Spoonacular proxy) ──────────────────────────────────────────────

router.get('/recipes/search-by-ingredients', recipeCtrl.searchByIngredients)
router.get('/recipes/search', recipeCtrl.searchRecipes)
router.get('/recipes/cuisines', recipeCtrl.getCuisines)
router.get('/recipes/diets', recipeCtrl.getDiets)
router.get('/recipes/:id/nutrition', recipeCtrl.getRecipeNutrition)
router.get('/recipes/:id', recipeCtrl.getRecipeById)

// ─── Favourites ───────────────────────────────────────────────────────────────

router.get('/favourites', auth, ctrl.getFavourites)
router.post('/favourites', auth, ctrl.addFavourite)
router.delete('/favourites/:recipeId', auth, ctrl.removeFavourite)

// ─── Meal Plan ────────────────────────────────────────────────────────────────

router.get('/mealplan', auth, ctrl.getMealPlan)
router.post('/mealplan', auth, ctrl.saveMealPlanEntry)
router.delete('/mealplan/:id', auth, ctrl.removeMealPlanEntry)

// ─── Shopping List ────────────────────────────────────────────────────────────

router.get('/shopping-list', auth, ctrl.getShoppingList)
router.post('/shopping-list/generate', auth, ctrl.generateShoppingList)
router.patch('/shopping-list/:id', auth, ctrl.toggleShoppingItem)
router.delete('/shopping-list', auth, ctrl.clearShoppingList)
