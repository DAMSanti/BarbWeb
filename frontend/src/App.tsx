import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import CheckoutPage from './pages/CheckoutPage'
import { applyThemeVariables } from './theme/themeVariables'

function App() {
  // Aplicar tema fijo al cargar
  useEffect(() => {
    applyThemeVariables('nocturne')
    document.body.classList.add('theme-nocturne')
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
