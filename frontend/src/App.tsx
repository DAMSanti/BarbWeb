import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PrivateRoute from './components/PrivateRoute'
import { applyThemeVariables } from './theme/themeVariables'
import { useAppStore } from './store/appStore'

function AppContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, tokens } = useAppStore()

  // Handle OAuth callback - extract tokens from URL
  useEffect(() => {
    const token = searchParams.get('token')
    const refresh = searchParams.get('refresh')

    if (token && refresh) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refresh)

      // Update app store with tokens
      login(
        {
          id: '',
          email: '',
          name: null,
          role: 'user',
        },
        {
          accessToken: token,
          refreshToken: refresh,
        }
      )

      // Clean up URL and redirect to home
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate, login])

  // Fetch user info from backend when we have tokens
  useEffect(() => {
    if (tokens?.accessToken) {
      fetch('https://back-jqdv9.ondigitalocean.app/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            // Update user info in store
            const { setUser } = useAppStore.getState()
            setUser({
              id: data.user.userId || data.user.id || '',
              email: data.user.email,
              name: data.user.name,
              role: data.user.role || 'user',
            })
          }
        })
        .catch((err) => console.error('Failed to fetch user:', err))
    }
  }, [tokens])

  // Apply theme on mount
  useEffect(() => {
    applyThemeVariables('nocturne')
    document.body.classList.add('theme-nocturne')
  }, [])

  return (
    <div className="app-shell flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="/checkout/:consultationId"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router basename="/barbweb2">
      <AppContent />
    </Router>
  )
}

export default App
