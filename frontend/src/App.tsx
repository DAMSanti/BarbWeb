import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import ConsultationPage from './pages/ConsultationPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminPayments from './pages/AdminPayments'
import AdminAnalytics from './pages/AdminAnalytics'
import TestSentryPage from './pages/TestSentryPage'
import PrivateRoute from './components/PrivateRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { applyThemeVariables } from './theme/themeVariables'
import { useAppStore } from './store/appStore'
import { getApiUrl } from './services/backendApi'
import { trackPageView, trackFunnelStep, setUserId, setUserProperties } from './utils/analytics'

function AppContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, tokens, setIsAuthInitialized } = useAppStore()

  // Track page views on route change (Google Analytics 4)
  useEffect(() => {
    trackPageView(location.pathname, document.title)
    
    // Track specific funnel steps based on route
    if (location.pathname === '/') {
      trackFunnelStep('LANDING')
    } else if (location.pathname === '/faq') {
      trackFunnelStep('VIEW_FAQ')
    } else if (location.pathname === '/login') {
      trackFunnelStep('VIEW_LOGIN')
    } else if (location.pathname === '/register') {
      trackFunnelStep('VIEW_REGISTER')
    }
  }, [location.pathname])

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
    const initializeAuth = async () => {
      try {
        if (tokens?.accessToken) {
          const response = await fetch(`${getApiUrl()}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
            },
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`)
          }
          
          const data = await response.json()
          if (data.user) {
            // Update user info in store
            const { setUser, setIsAuthenticated } = useAppStore.getState()
            setUser({
              id: data.user.userId || data.user.id || '',
              email: data.user.email,
              name: data.user.name,
              role: data.user.role || 'user',
            })
            setIsAuthenticated(true)
            
            // Track user in Google Analytics
            const userId = data.user.userId || data.user.id
            if (userId) {
              setUserId(userId)
              setUserProperties({
                user_type: data.user.role === 'admin' ? 'admin' : 'registered',
              })
            }
          }
        }
      } catch (err) {
        // Si falla, limpiar tokens
        const { logout } = useAppStore.getState()
        logout()
      } finally {
        // Mark auth as initialized (even if failed, so we can redirect)
        setIsAuthInitialized(true)
      }
    }

    initializeAuth()
  }, [tokens, setIsAuthInitialized])

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
          <Route path="/test-sentry" element={<TestSentryPage />} />
          
          {/* Protected routes */}
          <Route
            path="/consultation"
            element={
              <PrivateRoute>
                <ConsultationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout/:consultationId"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  )
}

export default App
