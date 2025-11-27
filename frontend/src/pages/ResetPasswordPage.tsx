import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Lock, AlertCircle, Loader, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'
import { backendApi } from '../services/backendApi.js'
import { useErrorHandler } from '../hooks/useErrorHandler.js'
import { SEO } from '../components/SEO'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const { setIsLoading, isLoading } = useAppStore()
  const { error, handleError, clearError, errorMessage } = useErrorHandler()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [resetSuccess, setResetSuccess] = useState(false)
  
  const token = searchParams.get('token')

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.match(/[a-z]/)) strength++
    if (pwd.match(/[A-Z]/)) strength++
    if (pwd.match(/[0-9]/)) strength++
    if (pwd.match(/[\W]/)) strength++
    setPasswordStrength(strength)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)

    try {
      if (!token) {
        handleError(new Error('Token de recuperación no encontrado'), 'ResetPasswordPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (!password || !confirmPassword) {
        handleError(new Error('Por favor completa todos los campos'), 'ResetPasswordPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        handleError(new Error('La contraseña debe tener al menos 8 caracteres'), 'ResetPasswordPage.handleSubmit')
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        handleError(new Error('Las contraseñas no coinciden'), 'ResetPasswordPage.handleSubmit')
        setIsLoading(false)
        return
      }

      await backendApi.resetPassword(token, password)
      setResetSuccess(true)
    } catch (err: any) {
      handleError(err, 'ResetPasswordPage.handleSubmit')
    } finally {
      setIsLoading(false)
    }
  }

  // No token provided
  if (!token) {
    return (
      <div className="w-full overflow-hidden relative min-h-screen">
        <SEO
          title="Token Requerido - Barbara & Abogados"
          description="Se requiere un token válido para restablecer la contraseña."
          image="https://damsanti.app/og-default.png"
          url="https://damsanti.app/reset-password"
        />
        <ChessboardBackground
          imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
          opacity={0.1}
          blurAmount={15}
          parallaxIntensity={0.4}
        />

        <style>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 10;
            padding: 2rem 1rem;
          }

          .error-card {
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
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .error-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }

          .error-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .error-text {
            font-size: 1rem;
            opacity: 0.8;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .error-link {
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

          .error-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
          }
        `}</style>

        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">
              <KeyRound size={40} color="white" />
            </div>
            <h1 className="error-title">Token Requerido</h1>
            <p className="error-text">
              No se encontró un token de recuperación.<br />
              Por favor usa el enlace del email que recibiste.
            </p>
            <Link to="/forgot-password" className="error-link">
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="w-full overflow-hidden relative min-h-screen">
        <SEO
          title="Contraseña Restablecida - Barbara & Abogados"
          description="Tu contraseña ha sido restablecida exitosamente."
          image="https://damsanti.app/og-default.png"
          url="https://damsanti.app/reset-password"
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
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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

          .success-link {
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

          .success-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
          }
        `}</style>

        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle size={40} color="white" />
            </div>
            <h1 className="success-title">¡Contraseña Restablecida!</h1>
            <p className="success-text">
              Tu contraseña ha sido cambiada exitosamente.<br />
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link to="/login" className="success-link">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="w-full overflow-hidden relative min-h-screen">
      <SEO
        title="Nueva Contraseña - Barbara & Abogados"
        description="Crea una nueva contraseña para tu cuenta."
        image="https://damsanti.app/og-default.png"
        url="https://damsanti.app/reset-password"
      />
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <style>{`
        .reset-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem 1rem;
        }

        .reset-card {
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reset-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .reset-subtitle {
          font-size: 0.95rem;
          opacity: 0.7;
          margin-bottom: 2rem;
        }

        .reset-input-group {
          margin-bottom: 1.5rem;
        }

        .reset-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .reset-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .reset-input-icon {
          position: absolute;
          left: 12px;
          opacity: 0.5;
          pointer-events: none;
        }

        .reset-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .reset-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .reset-input:focus {
          outline: none;
          border-color: var(--primary-500, #d4af37);
          background: rgba(30, 41, 59, 1);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
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

        .reset-button {
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

        .reset-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .reset-button:disabled {
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

        .reset-footer {
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 2rem;
        }

        .reset-footer a {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-500, #d4af37);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .reset-footer a:hover {
          color: var(--accent-500, #d946ef);
        }
      `}</style>

      <div className="reset-container">
        <div className="reset-card">
          <h1 className="reset-title">Nueva Contraseña</h1>
          <p className="reset-subtitle">Crea una nueva contraseña para tu cuenta</p>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="reset-input-group">
              <label className="reset-label">Nueva Contraseña</label>
              <div className="reset-input-wrapper">
                <Lock className="reset-input-icon" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { 
                    setPassword(e.target.value)
                    calculatePasswordStrength(e.target.value)
                    clearError()
                  }}
                  placeholder="••••••••"
                  className="reset-input"
                  disabled={isLoading}
                />
              </div>
              {password && (
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

            <div className="reset-input-group">
              <label className="reset-label">Confirmar Contraseña</label>
              <div className="reset-input-wrapper">
                <Lock className="reset-input-icon" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  className="reset-input"
                  disabled={isLoading}
                />
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="password-match">
                  <CheckCircle size={16} />
                  <span>Las contraseñas coinciden</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="reset-button">
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>

          <div className="reset-footer">
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
