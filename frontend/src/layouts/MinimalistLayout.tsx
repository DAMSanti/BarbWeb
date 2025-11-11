import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ChessboardBackground from '../components/ChessboardBackground'

export default function MinimalistLayout() {
  return (
    <div className="w-full overflow-hidden relative">
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(2, 132, 199, 0);
          }
        }

        .minimalist-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .minimalist-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--primary-500, #d4af37) 0%, transparent 70%);
          opacity: 0.1;
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .minimalist-hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--accent-500, #d946ef) 0%, transparent 70%);
          opacity: 0.08;
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(30px) rotate(10deg); }
        }

        .minimalist-content {
          animation: fadeInUp 0.8s ease-out;
          z-index: 10;
          position: relative;
        }

        .minimalist-title {
          font-size: clamp(2.5rem, 10vw, 5rem);
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.02em;
          animation: fadeInUp 0.8s ease-out;
        }

        .minimalist-subtitle {
          font-size: clamp(1rem, 3vw, 1.5rem);
          line-height: 1.6;
          animation: fadeInUp 0.8s ease-out 0.2s both;
          opacity: 0.7;
          max-width: 600px;
          margin: 2rem auto 0;
        }

        .minimalist-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 3rem;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        @media (min-width: 640px) {
          .minimalist-buttons {
            flex-direction: row;
            justify-content: center;
          }
        }

        .minimalist-button {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .minimalist-button.primary {
          background: #d4af37;
          color: #1a1a1a;
          border: none;
          font-weight: 700;
        }

        .minimalist-button.primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(212, 175, 55, 0.4);
          background: #f0e68c;
        }

        .minimalist-button.secondary {
          background: transparent;
          color: #d4af37;
          border: 2px solid #d4af37;
        }

        .minimalist-button.secondary:hover {
          background: #d4af37;
          color: #1a1a1a;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(212, 175, 55, 0.4);
        }

        .minimalist-section {
          padding: 8rem 2rem;
          position: relative;
          z-index: 5;
        }

        .minimalist-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          margin-top: 3rem;
        }

        .minimalist-card {
          text-align: center;
          animation: slideInRight 0.6s ease-out;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .minimalist-card:hover {
          transform: translateY(-8px);
        }

        .minimalist-card-number {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .minimalist-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .minimalist-card-description {
          font-size: 1rem;
          opacity: 0.7;
          line-height: 1.6;
        }

        .minimalist-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .minimalist-feature {
          padding: 2rem;
          background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .minimalist-feature:hover {
          background: var(--bg-secondary, rgba(255, 255, 255, 0.1));
          transform: translateY(-4px);
          border-color: var(--primary-500, #d4af37);
        }

        .minimalist-feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary-500, #d4af37), var(--accent-500, #d946ef));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .minimalist-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-color, rgba(255, 255, 255, 0.2)), transparent);
          margin: 2rem 0;
        }
      `}</style>

      {/* Hero Section */}
      <section className="minimalist-hero">
        <div className="minimalist-content text-center px-4">
          <h1 className="minimalist-title">
            Consultas Legales <br />
            <span className="text-primary-500">Simples y Eficaces</span>
          </h1>
          <p className="minimalist-subtitle">
            Nuestro sistema inteligente entiende tus preguntas legales y proporciona respuestas instantáneas o te conecta con profesionales especializados.
          </p>
          <div className="minimalist-buttons">
            <Link to="/faq" className="minimalist-button primary">
              Comenzar Consulta
              <ArrowRight className="ml-2 inline" size={20} />
            </Link>
            <a href="#caracteristicas" className="minimalist-button secondary">
              Descubre Más
            </a>
          </div>

          {/* OAuth Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
                const redirectUri = `${window.location.origin}/auth/google/callback`
                if (clientId) {
                  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
                  window.location.href = googleAuthUrl
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <button
              onClick={() => {
                const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID
                const redirectUri = `${window.location.origin}/auth/microsoft/callback`
                if (clientId) {
                  const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
                  window.location.href = microsoftAuthUrl
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0, 164, 239, 0.15)', color: '#00A4EF' }}
            >
              <svg width="18" height="18" viewBox="0 0 21 21" fill="currentColor">
                <path d="M0 0h10v10H0z" fill="#F1511B" />
                <path d="M11 0h10v10H11z" fill="#80CC28" />
                <path d="M0 11h10v10H0z" fill="#00A4EF" />
                <path d="M11 11h10v10H11z" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>
        </div>
      </section>

      <div className="minimalist-divider max-w-7xl mx-auto" />

      {/* Features Section */}
      <section id="caracteristicas" className="minimalist-section max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Por Qué Elegirnos?</h2>
          <p className="text-lg opacity-70 max-w-2xl mx-auto">
            Combinamos inteligencia artificial con experiencia legal para ofrecerte soluciones rápidas y precisas.
          </p>
        </div>

        <div className="minimalist-feature-grid">
          <div className="minimalist-feature">
            <div className="minimalist-feature-icon">⚡</div>
            <h3 className="text-xl font-bold mb-3">Respuestas Inmediatas</h3>
            <p className="opacity-70">Obtén soluciones en segundos para preguntas legales comunes.</p>
          </div>
          <div className="minimalist-feature">
            <div className="minimalist-feature-icon">🔒</div>
            <h3 className="text-xl font-bold mb-3">Privacidad Garantizada</h3>
            <p className="opacity-70">Tus datos están protegidos con encriptación de nivel bancario.</p>
          </div>
          <div className="minimalist-feature">
            <div className="minimalist-feature-icon">👨‍⚖️</div>
            <h3 className="text-xl font-bold mb-3">Expertos Certificados</h3>
            <p className="opacity-70">Accede a abogados especializados en todas las áreas del derecho.</p>
          </div>
          <div className="minimalist-feature">
            <div className="minimalist-feature-icon">📱</div>
            <h3 className="text-xl font-bold mb-3">Disponibilidad 24/7</h3>
            <p className="opacity-70">Acceso ilimitado a consultas en cualquier momento del día.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="minimalist-section bg-gradient-to-r from-primary-500/10 to-accent-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="minimalist-cards">
            <div className="minimalist-card">
              <div className="minimalist-card-number">500+</div>
              <div className="minimalist-card-title">Consultas Mensuales</div>
              <div className="minimalist-card-description">Resueltas satisfactoriamente por nuestro equipo</div>
            </div>
            <div className="minimalist-card">
              <div className="minimalist-card-number">95%</div>
              <div className="minimalist-card-title">Satisfacción</div>
              <div className="minimalist-card-description">De nuestros clientes recomendaría nuestros servicios</div>
            </div>
            <div className="minimalist-card">
              <div className="minimalist-card-number">6</div>
              <div className="minimalist-card-title">Especialidades</div>
              <div className="minimalist-card-description">Áreas de experto conocimiento legal cubierto</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="minimalist-section text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Tienes una Pregunta Legal?</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          No esperes más. Nuestro sistema está listo para ayudarte.
        </p>
        <Link to="/faq" className="minimalist-button primary inline-flex items-center">
          Empezar Ahora
          <ArrowRight className="ml-2" size={20} />
        </Link>
      </section>
    </div>
  )
}
