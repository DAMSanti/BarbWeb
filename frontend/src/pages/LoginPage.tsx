import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle, Loader } from 'lucide-react'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'
import { backendApi } from '../services/backendApi.js'
import { useErrorHandler } from '../hooks/useErrorHandler.js'
import { SEO } from '../components/SEO'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, setIsLoading, isLoading } = useAppStore()
  const { error, handleError, clearError, errorMessage } = useErrorHandler()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)

    try {
      // Validation
      if (!formData.email || !formData.password) {
        handleError(new Error('Por favor completa todos los campos'), 'LoginPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        handleError(new Error('Email inválido'), 'LoginPage.handleSubmit')
        setIsLoading(false)
        return
      }

      // Make API call
      const response = await backendApi.login(formData.email, formData.password)

      // Store tokens and user
      login(response.user, response.tokens)
      
      // Redirect to home
      navigate('/')
    } catch (err: any) {
      // Use parseBackendError through handleError hook
      console.log('[LoginPage] Capturando error en handleSubmit:', err)
      handleError(err, 'LoginPage.handleSubmit')
      console.log('[LoginPage] Error manejado, error state debería estar seteado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth flow
    // In production, this would use the actual OAuth flow
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/google/callback`
    
    if (!clientId) {
      handleError(new Error('Google OAuth no está configurado'), 'LoginPage.handleGoogleLogin')
      return
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
    window.location.href = googleAuthUrl
  }

  const handleMicrosoftLogin = () => {
    // Redirect to Microsoft OAuth flow
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/microsoft/callback`
    
    if (!clientId) {
      handleError(new Error('Microsoft OAuth no está configurado'), 'LoginPage.handleMicrosoftLogin')
      return
    }

    const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
    window.location.href = microsoftAuthUrl
  }

  return (
    <div className="w-full overflow-hidden relative min-h-screen">
      <SEO
        title="Iniciar Sesión - Barbara & Abogados"
        description="Inicia sesión en tu cuenta de Barbara & Abogados para acceder a tus consultas."
        image="https://barbweb.com/og-default.png"
        url="https://barbweb.com/login"
      />
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        .login-card {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 20px;
          padding: 3rem;
          max-width: 420px;
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

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          font-size: 0.95rem;
          opacity: 0.7;
          margin-bottom: 2rem;
        }

        .login-input-group {
          margin-bottom: 1.5rem;
        }

        .login-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 12px;
          opacity: 0.5;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .login-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .login-input:focus {
          outline: none;
          border-color: var(--primary-500, #d4af37);
          background: rgba(30, 41, 59, 1);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .login-button {
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

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .oauth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
          opacity: 0.5;
        }

        .oauth-divider::before,
        .oauth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: currentColor;
        }

        .oauth-divider-text {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .oauth-button {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .oauth-button:hover {
          background: rgba(30, 41, 59, 1);
          border-color: rgba(148, 163, 184, 0.4);
          transform: translateY(-2px);
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

        .login-footer {
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 2rem;
        }

        .login-footer a {
          color: var(--primary-500, #d4af37);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .login-footer a:hover {
          color: var(--accent-500, #d946ef);
        }
      `}</style>

      <div className="login-container px-4">
        <div className="login-card">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="login-input-group">
              <label className="login-label">Email</label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="login-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-label">Contraseña</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="login-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="login-button">
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="oauth-divider">
            <span className="oauth-divider-text">O continúa con</span>
          </div>

          <button onClick={handleGoogleLogin} className="oauth-button" disabled={isLoading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <button onClick={handleMicrosoftLogin} className="oauth-button" disabled={isLoading}>
            <svg width="18" height="18" viewBox="0 0 21 21" fill="currentColor">
              <path d="M0 0h10v10H0z" fill="#F1511B" />
              <path d="M11 0h10v10H11z" fill="#80CC28" />
              <path d="M0 11h10v10H0z" fill="#00A4EF" />
              <path d="M11 11h10v10H11z" fill="#FFB900" />
            </svg>
            Microsoft
          </button>

          <div className="login-footer">
            ¿No tienes cuenta?{' '}
            <Link to="/register">Crea una aquí</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
