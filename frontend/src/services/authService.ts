import api from './api'
import type { User } from '../types'

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password })
    if (data.token) localStorage.setItem('pantrypal_token', data.token)
    return data as { user: User; token: string }
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.token) localStorage.setItem('pantrypal_token', data.token)
    return data as { user: User; token: string }
  },

  async logout() {
    localStorage.removeItem('pantrypal_token')
  },

  async getProfile() {
    const { data } = await api.get('/auth/me')
    return data as User
  },
}
