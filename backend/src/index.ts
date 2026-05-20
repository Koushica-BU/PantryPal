import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { router } from './routes'

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', router)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ─── Database + Server Start ──────────────────────────────────────────────────

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 PantryPal API running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err)
    process.exit(1)
  }
}

start()
