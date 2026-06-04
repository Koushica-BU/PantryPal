import { Router } from 'express'
import { body } from 'express-validator'
import { auth, adminAuth } from '../middleware/auth'
import * as ctrl from '../controllers'
import * as recipeCtrl from '../controllers/recipes'
import * as adminCtrl from '../controllers/adminRecipes'

export const router = Router()

// ─── Auth ─────────────────────────────────────────────────────────────────────

router.post(
  '/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  ctrl.register,
)

router.post(
  '/auth/login',
  [
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
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

// ─── Admin — Recipe CRUD ──────────────────────────────────────────────────────

router.get('/admin/recipes',        adminAuth, adminCtrl.listAllRecipes)
router.post('/admin/recipes',       adminAuth, adminCtrl.createRecipe)
router.put('/admin/recipes/:id',    adminAuth, adminCtrl.updateRecipe)
router.delete('/admin/recipes/:id', adminAuth, adminCtrl.deleteRecipe)
