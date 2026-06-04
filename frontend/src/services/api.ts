import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor – attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pantrypal_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't intercept 401s from the auth endpoints themselves — let the
    // login/register catch blocks handle those and show proper error messages.
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('pantrypal_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
