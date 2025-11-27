import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'
import { backendApi } from '../services/backendApi.js'
import { SEO } from '../components/SEO'

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAppStore()
  
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await backendApi.verifyEmail(token)
        
        if (response.success && response.tokens && response.user) {
          // Auto-login the user
          login(response.user, response.tokens)
          setStatus('success')
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          setStatus('error')
          setErrorMessage(response.message || 'Error al verificar el email')
        }
      } catch (err: any) {
        setStatus('error')
        setErrorMessage(err.response?.data?.error || err.message || 'Error al verificar el email')
      }
    }

    verifyEmail()
  }, [token, login, navigate])

  return (
    <div className="w-full overflow-hidden relative min-h-screen">
      <SEO
        title="Verificar Email - Barbara & Abogados"
        description="Verificación de email para tu cuenta de Barbara & Abogados."
        image="https://damsanti.app/og-default.png"
        url="https://damsanti.app/verify-email"
      />
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <style>{`
        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem 1rem;
        }

        .verify-card {
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

        .status-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .status-icon.loading {
          background: linear-gradient(135deg, #0369a1, #0284c7);
        }

        .status-icon.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .status-icon.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .status-icon.no-token {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .verify-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .verify-text {
          font-size: 1rem;
          opacity: 0.8;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .verify-link {
          display: inline-block;
          margin-top: 1rem;
          color: var(--primary-500, #d4af37);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .verify-link:hover {
          color: var(--accent-500, #d946ef);
        }

        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #d4af37, #f0e68c);
          color: #1a1a1a;
          border: none;
          border-radius: 10px;
          padding: 0.875rem 2rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          margin-top: 1rem;
        }

        .verify-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="verify-container">
        <div className="verify-card">
          {status === 'loading' && (
            <>
              <div className="status-icon loading">
                <Loader size={40} color="white" className="spinner" />
              </div>
              <h1 className="verify-title">Verificando...</h1>
              <p className="verify-text">
                Estamos verificando tu dirección de email.<br />
                Por favor espera un momento.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="status-icon success">
                <CheckCircle size={40} color="white" />
              </div>
              <h1 className="verify-title">¡Email Verificado!</h1>
              <p className="verify-text">
                Tu cuenta ha sido activada exitosamente.<br />
                Serás redirigido en unos segundos...
              </p>
              <Link to="/" className="verify-button">
                Ir al Inicio
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="status-icon error">
                <XCircle size={40} color="white" />
              </div>
              <h1 className="verify-title">Error de Verificación</h1>
              <p className="verify-text">
                {errorMessage || 'No se pudo verificar tu email.'}
              </p>
              <p className="verify-text" style={{ fontSize: '0.9rem', opacity: 0.6 }}>
                El enlace puede haber expirado o ya fue utilizado.
              </p>
              <Link to="/register" className="verify-button">
                Registrarse de nuevo
              </Link>
              <br />
              <Link to="/login" className="verify-link">
                ← Ir a Iniciar Sesión
              </Link>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div className="status-icon no-token">
                <Mail size={40} color="white" />
              </div>
              <h1 className="verify-title">Token Requerido</h1>
              <p className="verify-text">
                No se encontró un token de verificación.<br />
                Por favor usa el enlace del email que recibiste.
              </p>
              <Link to="/login" className="verify-button">
                Ir a Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
