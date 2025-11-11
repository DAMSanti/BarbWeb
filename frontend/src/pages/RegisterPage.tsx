import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { backendApi } from '../services/backendApi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, setError, setIsLoading, isLoading } = useAppStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [localError, setLocalError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[\W]/)) strength++
    setPasswordStrength(strength)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setLocalError('')

    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    setIsLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setLocalError('Por favor completa todos los campos')
        setIsLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        setLocalError('Email inválido')
        setIsLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setLocalError('La contraseña debe tener al menos 8 caracteres')
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setLocalError('Las contraseñas no coinciden')
        setIsLoading(false)
        return
      }

      if (!formData.agreeTerms) {
        setLocalError('Debes aceptar los términos y condiciones')
        setIsLoading(false)
        return
      }

      // Make API call
      const response = await backendApi.register(formData.email, formData.password, formData.name)

      // Store tokens and user
      register(response.user, response.tokens)
      
      // Redirect to home
      navigate('/')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al registrarse'
      setLocalError(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-yellow-500'
    if (passwordStrength === 3) return 'bg-blue-500'
    if (passwordStrength >= 4) return 'bg-green-500'
    return 'bg-slate-500'
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return 'Muy débil'
    if (passwordStrength === 1) return 'Débil'
    if (passwordStrength === 2) return 'Regular'
    if (passwordStrength === 3) return 'Fuerte'
    return 'Muy fuerte'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-400">Únete a nuestra plataforma de consultas legales</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-8 mb-6">
          {/* Error Message */}
          {localError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-red-400 text-sm">{localError}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isLoading}
                />
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">{getPasswordStrengthLabel()}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isLoading}
                />
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle size={16} />
                  <span>Las contraseñas coinciden</span>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="agreeTerms" className="text-sm text-slate-400">
                Acepto los{' '}
                <a href="#" className="text-blue-500 hover:text-blue-400">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-blue-500 hover:text-blue-400">
                  política de privacidad
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
