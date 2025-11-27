import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, Loader, MailCheck, ArrowLeft } from 'lucide-react'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'
import { backendApi } from '../services/backendApi.js'
import { useErrorHandler } from '../hooks/useErrorHandler.js'
import { SEO } from '../components/SEO'
import { sanitizeEmail } from '../utils/sanitize'

export default function ForgotPasswordPage() {
  const { setIsLoading, isLoading } = useAppStore()
  const { error, handleError, clearError, errorMessage } = useErrorHandler()
  
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)

    try {
      if (!email) {
        handleError(new Error('Por favor ingresa tu email'), 'ForgotPasswordPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (!email.includes('@')) {
        handleError(new Error('Email inválido'), 'ForgotPasswordPage.handleSubmit')
        setIsLoading(false)
        return
      }

      const cleanEmail = sanitizeEmail(email)
      await backendApi.forgotPassword(cleanEmail)
      
      // Always show success to prevent email enumeration
      setEmailSent(true)
    } catch (err: any) {
      // Even on error, show success message for security
      setEmailSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="w-full overflow-hidden relative min-h-screen">
        <SEO
          title="Revisa tu Email - Barbara & Abogados"
          description="Te hemos enviado instrucciones para restablecer tu contraseña."
          image="https://damsanti.app/og-default.png"
          url="https://damsanti.app/forgot-password"
        />
        <ChessboardBackground
          imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
          opacity={0.1}
          blurAmount={15}
          parallaxIntensity={0.4}
        />

        <style>{`
          .success-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 10;
            padding: 2rem 1rem;
          }

          .success-card {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 20px;
            padding: 3rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
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

          .success-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }

          .success-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .success-text {
            font-size: 1rem;
            opacity: 0.8;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .email-highlight {
            font-weight: 600;
            color: var(--primary-500, #d4af37);
          }

          .success-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            color: var(--primary-500, #d4af37);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
          }

          .success-link:hover {
            color: var(--accent-500, #d946ef);
          }
        `}</style>

        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">
              <MailCheck size={40} color="white" />
            </div>
            <h1 className="success-title">¡Revisa tu Email!</h1>
            <p className="success-text">
              Si existe una cuenta asociada a<br />
              <span className="email-highlight">{email}</span><br />
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <p className="success-text" style={{ fontSize: '0.9rem', opacity: 0.6 }}>
              El enlace expira en 1 hora.
            </p>
            <Link to="/login" className="success-link">
              <ArrowLeft size={18} />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden relative min-h-screen">
      <SEO
        title="Recuperar Contraseña - Barbara & Abogados"
        description="Restablece tu contraseña de Barbara & Abogados."
        image="https://damsanti.app/og-default.png"
        url="https://damsanti.app/forgot-password"
      />
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <style>{`
        .forgot-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        .forgot-card {
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

        .forgot-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .forgot-subtitle {
          font-size: 0.95rem;
          opacity: 0.7;
          margin-bottom: 2rem;
        }

        .forgot-input-group {
          margin-bottom: 1.5rem;
        }

        .forgot-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .forgot-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .forgot-input-icon {
          position: absolute;
          left: 12px;
          opacity: 0.5;
          pointer-events: none;
        }

        .forgot-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .forgot-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .forgot-input:focus {
          outline: none;
          border-color: var(--primary-500, #d4af37);
          background: rgba(30, 41, 59, 1);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .forgot-button {
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

        .forgot-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .forgot-button:disabled {
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

        .forgot-footer {
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 2rem;
        }

        .forgot-footer a {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-500, #d4af37);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .forgot-footer a:hover {
          color: var(--accent-500, #d946ef);
        }
      `}</style>

      <div className="forgot-container px-4">
        <div className="forgot-card">
          <h1 className="forgot-title">Recuperar Contraseña</h1>
          <p className="forgot-subtitle">Ingresa tu email para recibir un enlace de recuperación</p>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="forgot-input-group">
              <label className="forgot-label">Email</label>
              <div className="forgot-input-wrapper">
                <Mail className="forgot-input-icon" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="tu@email.com"
                  className="forgot-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="forgot-button">
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </button>
          </form>

          <div className="forgot-footer">
            <Link to="/login">
              <ArrowLeft size={18} />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
