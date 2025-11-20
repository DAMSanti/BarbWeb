import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'
import { backendApi } from '../services/backendApi.js'
import { useErrorHandler } from '../hooks/useErrorHandler.js'
import { SEO } from '../components/SEO'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, setIsLoading, isLoading } = useAppStore()
  const { error, handleError, clearError, errorMessage } = useErrorHandler()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
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
    clearError()

    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        handleError(new Error('Por favor completa todos los campos'), 'RegisterPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        handleError(new Error('Email inválido'), 'RegisterPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (formData.password.length < 8) {
        handleError(new Error('La contraseña debe tener al menos 8 caracteres'), 'RegisterPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        handleError(new Error('Las contraseñas no coinciden'), 'RegisterPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (!formData.agreeTerms) {
        handleError(new Error('Debes aceptar los términos y condiciones'), 'RegisterPage.handleSubmit')
        setIsLoading(false)
        return
      }

      // Make API call
      const response = await backendApi.register(
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.name
      )

      // Store tokens and user
      register(response.user, response.tokens)
      
      // Redirect to home
      navigate('/')
    } catch (err: any) {
      // Use parseBackendError through handleError hook
      handleError(err, 'RegisterPage.handleSubmit')
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
    <div className="w-full overflow-hidden relative min-h-screen">
      <SEO
        title="Crear Cuenta - Barbara & Abogados"
        description="Crea tu cuenta en Barbara & Abogados. Acceso inmediato a consultas legales de expertos."
        image="https://barbweb.com/og-default.png"
        url="https://barbweb.com/register"
      />
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem 1rem;
        }

        .register-card {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 20px;
          padding: 3rem;
          max-width: 480px;
          width: 100%;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .register-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .register-subtitle {
          font-size: 0.95rem;
          opacity: 0.7;
          margin-bottom: 2rem;
        }

        .register-input-group {
          margin-bottom: 1.5rem;
        }

        .register-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .register-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .register-input-icon {
          position: absolute;
          left: 12px;
          opacity: 0.5;
          pointer-events: none;
        }

        .register-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .register-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .register-input:focus {
          outline: none;
          border-color: var(--primary-500, #d4af37);
          background: rgba(30, 41, 59, 1);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
        }

        .password-strength {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-bar-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-label {
          font-size: 0.8rem;
          opacity: 0.7;
          white-space: nowrap;
        }

        .password-match {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgb(34, 197, 94);
          font-size: 0.9rem;
        }

        .register-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin: 1.5rem 0;
        }

        .register-checkbox input {
          margin-top: 0.25rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #d4af37;
        }

        .register-checkbox label {
          font-size: 0.9rem;
          opacity: 0.8;
          line-height: 1.5;
          cursor: pointer;
        }

        .register-checkbox a {
          color: var(--primary-500, #d4af37);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .register-checkbox a:hover {
          color: var(--accent-500, #d946ef);
        }

        .register-button {
          width: 100%;
          background: linear-gradient(135deg, #d4af37, #f0e68c);
          color: #1a1a1a;
          border: none;
          border-radius: 10px;
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .register-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: rgba(239, 68, 68, 0.9);
        }

        .error-icon {
          flex-shrink: 0;
          color: rgb(239, 68, 68);
        }

        .register-footer {
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 2rem;
        }

        .register-footer a {
          color: var(--primary-500, #d4af37);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .register-footer a:hover {
          color: var(--accent-500, #d946ef);
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Crear Cuenta</h1>
          <p className="register-subtitle">Únete a nuestra plataforma legal</p>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="register-input-group">
              <label className="register-label">Nombre Completo</label>
              <div className="register-input-wrapper">
                <User className="register-input-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className="register-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-label">Email</label>
              <div className="register-input-wrapper">
                <Mail className="register-input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="register-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-label">Contraseña</label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="register-input"
                  disabled={isLoading}
                />
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-bar-fill ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="strength-label">{getPasswordStrengthLabel()}</span>
                </div>
              )}
            </div>

            <div className="register-input-group">
              <label className="register-label">Confirmar Contraseña</label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="register-input"
                  disabled={isLoading}
                />
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="password-match">
                  <CheckCircle size={16} />
                  <span>Las contraseñas coinciden</span>
                </div>
              )}
            </div>

            <div className="register-checkbox">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="agreeTerms">
                Acepto los{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>términos y condiciones</a>
                {' '}y la{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>política de privacidad</a>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="register-button">
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

          <div className="register-footer">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
