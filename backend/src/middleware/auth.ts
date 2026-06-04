import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models'

export interface AuthRequest extends Request {
  userId?: string
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export async function adminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    const user = await User.findById(decoded.userId).select('isAdmin')
    if (!user?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' })
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
