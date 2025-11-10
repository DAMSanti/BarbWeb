import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'
import { LegalCategory, ConsultationRequest, FAQ } from '../types'
import { detectCategory, findAutoResponse, faqDatabase } from '../utils/faqMatcher'
import { useAppStore } from '../store/appStore'

const CATEGORIES: LegalCategory[] = ['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia']
const CONSULTATION_PRICE = 29.99

export default function FAQPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [autoResponse, setAutoResponse] = useState<FAQ | null>(null)
  const [showAutoResponse, setShowAutoResponse] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const addConsultation = useAppStore((state) => state.addConsultation)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setShowAutoResponse(false)
    setAutoResponse(null)

    if (!question.trim()) {
      setErrorMessage('Por favor, ingresa una pregunta.')
      return
    }

    // Detectar categoría automáticamente si no está seleccionada
    const detectedCategory = selectedCategory || detectCategory(question)

    if (!detectedCategory) {
      setErrorMessage('No pudimos identificar la categoría de tu pregunta. Por favor, selecciona una.')
      return
    }

    // Buscar respuesta automática
    const response = findAutoResponse(question, detectedCategory)

    if (response) {
      setShowAutoResponse(true)
      setAutoResponse(response)
    } else {
      // No hay respuesta automática, dirigir a checkout
      const consultation: ConsultationRequest = {
        id: `consult-${Date.now()}`,
        clientName: '',
        clientEmail: '',
        question: question.trim(),
        category: detectedCategory,
        price: CONSULTATION_PRICE,
        isPaid: false,
        createdAt: new Date(),
      }

      addConsultation(consultation)
      navigate(`/checkout/${consultation.id}`)
    }
  }

  const handleRequestConsultation = () => {
    const consultation: ConsultationRequest = {
      id: `consult-${Date.now()}`,
      clientName: '',
      clientEmail: '',
      question: question.trim(),
      category: selectedCategory || detectCategory(question) || 'Civil',
      price: CONSULTATION_PRICE,
      isPaid: false,
      createdAt: new Date(),
    }

    addConsultation(consultation)
    navigate(`/checkout/${consultation.id}`)
  }

  // Mostrar FAQs sugeridas basadas en categoría seleccionada
  const suggestedFaqs = useMemo(() => {
    if (!selectedCategory) return []
    return faqDatabase[selectedCategory] || []
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Centro de Consultas
          </h1>
          <p className="text-lg text-gray-600">
            Describe tu dudas legales y nuestro sistema inteligente buscará una solución para ti.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {/* Question Input */}
            <div>
              <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-3">
                ¿Cuál es tu pregunta legal?
              </label>
              <div className="relative">
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ej: ¿Cuándo puedo reclamar daños y perjuicios?"
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Filter size={18} />
                  <span>Categoría (Opcional - se detecta automáticamente)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      className={`p-3 rounded-lg font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              Buscar Respuesta
            </button>
          </div>
        </form>

        {/* Auto Response Result */}
        {showAutoResponse && autoResponse && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {autoResponse.question}
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {autoResponse.answer}
                </p>
                <div className="bg-white rounded-lg p-4 mb-6 border border-green-200">
                  <p className="text-sm text-gray-600">
                    <strong>💡 Categoría:</strong> {autoResponse.category}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    ¿Necesitas más detalles sobre este tema o deseas hacer otra pregunta?
                  </p>
                  <button
                    onClick={handleRequestConsultation}
                    className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Solicitar Consulta Profesional (${CONSULTATION_PRICE})
                  </button>
                  <button
                    onClick={() => {
                      setQuestion('')
                      setShowAutoResponse(false)
                      setAutoResponse(null)
                      setSelectedCategory(null)
                    }}
                    className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hacer Otra Pregunta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested FAQs */}
        {!showAutoResponse && suggestedFaqs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Lightbulb className="text-primary-600" size={24} />
              <span>Preguntas Frecuentes - {selectedCategory}</span>
            </h2>
            <div className="space-y-4">
              {suggestedFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setQuestion(faq.question)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Describe tu pregunta</h3>
              <p className="text-gray-600 text-sm">
                Cuéntanos tu duda legal de forma clara y concisa.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sistema inteligente analiza</h3>
              <p className="text-gray-600 text-sm">
                Nuestro IA busca si hay una respuesta automática disponible.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Recibe solución</h3>
              <p className="text-gray-600 text-sm">
                Obtén respuesta inmediata o solicita una consulta profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
