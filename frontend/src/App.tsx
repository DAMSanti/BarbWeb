import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import CheckoutPage from './pages/CheckoutPage'
import { useAppStore } from './store/appStore'
import { THEME_CLASSNAMES } from './theme/themes'

function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.body.classList.remove(...THEME_CLASSNAMES)
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

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
