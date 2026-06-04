import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { RecipeModel } from '../models/RecipeModel'
import { recipes } from './recipeData'

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) { console.error('❌ MONGODB_URI not set'); process.exit(1) }

  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB')

  for (const recipe of recipes) {
    await RecipeModel.findOneAndUpdate(
      { title: recipe.title },
      { $set: recipe },
      { upsert: true },
    )
  }

  console.log(`🌱 Seeded ${recipes.length} recipes (upsert by title — admin recipes preserved)`)
  await mongoose.disconnect()
  console.log('✅ Done')
}

seed().catch(err => { console.error(err); process.exit(1) })
