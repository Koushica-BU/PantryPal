import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import FavouritesPage from './pages/FavouritesPage'
import ShoppingListPage from './pages/ShoppingListPage'
import MealPlanPage from './pages/MealPlanPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import { useStore } from './store/useStore'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  const { darkMode } = useStore()
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/signup"        element={<SignupPage />} />
        <Route path="/app"           element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/recipe/:id"    element={<AppLayout><RecipeDetailPage /></AppLayout>} />
        <Route path="/favourites"    element={<AppLayout><FavouritesPage /></AppLayout>} />
        <Route path="/shopping-list" element={<AppLayout><ShoppingListPage /></AppLayout>} />
        <Route path="/meal-plan"     element={<AppLayout><MealPlanPage /></AppLayout>} />
        <Route path="/profile"       element={<AppLayout><ProfilePage /></AppLayout>} />
      </Routes>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: 'var(--bg-card)', color: 'var(--text)',
          border: '1.5px solid var(--border)', fontFamily: 'var(--font)',
          fontSize: '13px', fontWeight: '500', borderRadius: '12px',
          boxShadow: 'var(--shadow-float)', padding: '10px 16px',
        },
        success: { iconTheme: { primary: 'var(--terra)', secondary: '#fff' } },
      }} />
    </BrowserRouter>
  )
}
