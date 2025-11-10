import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import CheckoutPage from './pages/CheckoutPage'
import { useAppStore } from './store/appStore'
import { THEME_CLASSNAMES, DEFAULT_THEME_ID } from './theme/themes'

function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    // Aplicar tema al body
    document.body.classList.remove(...THEME_CLASSNAMES)
    document.body.classList.add(`theme-${theme}`)
    
    // También guardar en localStorage para persistencia
    localStorage.setItem('theme', theme)
  }, [theme])

  // Aplicar tema almacenado al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || DEFAULT_THEME_ID
    const store = useAppStore.getState()
    if (store.theme !== savedTheme) {
      store.setTheme(savedTheme as any)
    }
    
    // Aplicar inmediatamente
    document.body.classList.remove(...THEME_CLASSNAMES)
    document.body.classList.add(`theme-${savedTheme}`)
  }, [])

  return (
    <Router basename="/barbweb2">
      <div className="app-shell flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/checkout/:consultationId" element={<CheckoutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
