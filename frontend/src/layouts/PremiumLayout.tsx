import { ArrowRight, Zap, Lock, Shield, Users, TrendingUp, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import ChessboardBackground from '../components/ChessboardBackground'

export default function PremiumLayout() {
  const [scrollY, setScrollY] = useState(0)
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="w-full overflow-hidden bg-black relative">
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.08}
        blurAmount={20}
        parallaxIntensity={0.6}
      />

      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(2, 132, 199, 0.5), inset 0 0 20px rgba(2, 132, 199, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(2, 132, 199, 0.8), inset 0 0 40px rgba(2, 132, 199, 0.2);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes float3d {
          0%, 100% {
            transform: translateZ(0) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translateZ(30px) rotateX(5deg) rotateY(5deg);
          }
        }

        @keyframes morphing {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          50% {
            border-radius: 30% 60% 70% 40% / 40% 60% 30% 70%;
          }
        }

        .premium-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f0f 100%);
        }

        .premium-gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: morphing 8s ease-in-out infinite;
        }

        .premium-gradient-orb-1 {
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.3) 0%, transparent 70%);
          animation: float3d 6s ease-in-out infinite;
        }

        .premium-gradient-orb-2 {
          bottom: -150px;
          left: -150px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(217, 70, 239, 0.2) 0%, transparent 70%);
          animation: float3d 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        .premium-gradient-orb-3 {
          top: 50%;
          left: 10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
          animation: morphing 10s ease-in-out infinite;
          animation-delay: 1s;
        }

        .premium-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .premium-title {
          font-size: clamp(2.5rem, 12vw, 5.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .premium-subtitle {
          font-size: clamp(1rem, 3vw, 1.25rem);
          line-height: 1.8;
          opacity: 0.8;
          margin-bottom: 3rem;
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        .premium-cta-group {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 3rem;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        @media (min-width: 640px) {
          .premium-cta-group {
            flex-direction: row;
            justify-content: center;
          }
        }

        .premium-button {
          padding: 1rem 2.5rem;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 50px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .premium-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: inherit;
          transition: left 0.4s ease;
          z-index: -1;
        }

        .premium-button.primary {
          background: linear-gradient(135deg, #d4af37 0%, #f0e68c 100%);
          color: #1a1a1a;
          border: 2px solid transparent;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
        }

        .premium-button.primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 48px rgba(212, 175, 55, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .premium-button.secondary {
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          border: 2px solid #d4af37;
          backdrop-filter: blur(10px);
        }

        .premium-button.secondary:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #f0e68c;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
          transform: translateY(-4px);
        }

        .premium-section {
          position: relative;
          padding: 6rem 2rem;
          z-index: 5;
        }

        .premium-section-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .premium-section-title {
          font-size: clamp(2rem, 8vw, 4rem);
          font-weight: 900;
          margin-bottom: 1rem;
          text-align: center;
          color: white;
        }

        .premium-section-subtitle {
          font-size: 1.25rem;
          text-align: center;
          opacity: 0.7;
          margin-bottom: 4rem;
          line-height: 1.6;
          color: #aaa;
        }

        .premium-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .premium-card {
          position: relative;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(2, 132, 199, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          transition: all 0.4s ease;
          overflow: hidden;
          group: hover;
          cursor: pointer;
        }

        .premium-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top right, rgba(2, 132, 199, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .premium-card:hover {
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(217, 70, 239, 0.05) 100%);
          border-color: rgba(2, 132, 199, 0.5);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(2, 132, 199, 0.2);
        }

        .premium-card:hover::before {
          opacity: 1;
        }

        .premium-card-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #0284c7 0%, #d946ef 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          color: white;
        }

        .premium-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: white;
        }

        .premium-card-text {
          font-size: 1rem;
          opacity: 0.7;
          line-height: 1.6;
          color: #aaa;
        }

        .premium-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .premium-feature {
          display: flex;
          gap: 1.5rem;
          padding: 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .premium-feature:hover {
          background: rgba(2, 132, 199, 0.08);
          border-color: rgba(2, 132, 199, 0.3);
          transform: translateX(8px);
        }

        .premium-feature-icon {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(217, 70, 239, 0.1));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #06b6d4;
        }

        .premium-feature-content h4 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }

        .premium-feature-content p {
          opacity: 0.7;
          line-height: 1.5;
          font-size: 0.95rem;
          color: #aaa;
        }

        .premium-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
          text-align: center;
        }

        .premium-stat {
          padding: 2rem;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(217, 70, 239, 0.05) 100%);
          border: 1px solid rgba(2, 132, 199, 0.2);
          transition: all 0.3s ease;
        }

        .premium-stat:hover {
          transform: scale(1.05);
          border-color: rgba(2, 132, 199, 0.5);
        }

        .premium-stat-number {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #0284c7, #d946ef);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .premium-stat-label {
          font-size: 0.95rem;
          opacity: 0.7;
          color: #aaa;
        }

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

        .premium-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.3), transparent);
          margin: 4rem 0;
        }
      `}</style>

      {/* Hero Section with Parallax */}
      <section className="premium-hero" ref={parallaxRef}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="premium-gradient-orb premium-gradient-orb-1" />
          <div className="premium-gradient-orb premium-gradient-orb-2" />
          <div
            className="premium-gradient-orb premium-gradient-orb-3"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
        </div>

        <div className="premium-content">
          <h1 className="premium-title" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
            Asesoramiento Legal <br />
            <span>Inteligente y Accesible</span>
          </h1>
          <p className="premium-subtitle" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
            Tecnología avanzada combinada con expertos legales para resolver tus dudas al instante o ofrecerte asesoramiento profesional personalizado.
          </p>
          <div className="premium-cta-group" style={{ transform: `translateY(${scrollY * 0.25}px)` }}>
            <Link to="/faq" className="premium-button primary">
              Consulta Gratis <ArrowRight size={20} />
            </Link>
            <a href="#caracteristicas" className="premium-button secondary">
              Descubre Más
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="premium-section">
        <div className="premium-divider" />
        <div className="premium-section-content">
          <h2 className="premium-section-title">Por Qué Somos La Mejor Opción</h2>
          <p className="premium-section-subtitle">
            Combinamos lo mejor de la tecnología e inteligencia artificial con experiencia legal profesional
          </p>

          <div className="premium-cards">
            <div className="premium-card">
              <div className="premium-card-icon">⚡</div>
              <h3 className="premium-card-title">Respuestas Instantáneas</h3>
              <p className="premium-card-text">
                Nuestro sistema IA detecta automáticamente la categoría de tu pregunta y proporciona respuestas en segundos.
              </p>
            </div>

            <div className="premium-card">
              <div className="premium-card-icon">🔐</div>
              <h3 className="premium-card-title">Seguridad Premium</h3>
              <p className="premium-card-text">
                Encriptación de nivel bancario garantiza la privacidad absoluta de tus datos legales.
              </p>
            </div>

            <div className="premium-card">
              <div className="premium-card-icon">👨‍⚖️</div>
              <h3 className="premium-card-title">Expertos Certificados</h3>
              <p className="premium-card-text">
                Acceso a abogados especializados en todas las áreas del derecho cuando lo necesites.
              </p>
            </div>

            <div className="premium-card">
              <div className="premium-card-icon">🌐</div>
              <h3 className="premium-card-title">24/7 Disponible</h3>
              <p className="premium-card-text">
                Asesoramiento legal disponible en cualquier momento del día desde cualquier lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="premium-section bg-gradient-to-b from-transparent to-black">
        <div className="premium-section-content">
          <h2 className="premium-section-title">Características Avanzadas</h2>

          <div className="premium-features">
            <div className="premium-feature">
              <div className="premium-feature-icon">
                <Zap size={24} />
              </div>
              <div className="premium-feature-content">
                <h4>Análisis Inteligente</h4>
                <p>IA avanzada que entiende el contexto de tu pregunta legal específica.</p>
              </div>
            </div>

            <div className="premium-feature">
              <div className="premium-feature-icon">
                <Lock size={24} />
              </div>
              <div className="premium-feature-content">
                <h4>Privacidad Garantizada</h4>
                <p>Tus datos nunca se comparten con terceros, cumpliendo RGPD.</p>
              </div>
            </div>

            <div className="premium-feature">
              <div className="premium-feature-icon">
                <Award size={24} />
              </div>
              <div className="premium-feature-content">
                <h4>Calidad Premium</h4>
                <p>Respuestas verificadas por abogados especializados y actualizadas regularmente.</p>
              </div>
            </div>

            <div className="premium-feature">
              <div className="premium-feature-icon">
                <TrendingUp size={24} />
              </div>
              <div className="premium-feature-content">
                <h4>Mejora Continua</h4>
                <p>Nuestro sistema aprende y mejora constantemente basándose en tus consultas.</p>
              </div>
            </div>

            <div className="premium-feature">
              <div className="premium-feature-icon">
                <Shield size={24} />
              </div>
              <div className="premium-feature-content">
                <h4>Asesoramiento Profesional</h4>
                <p>Consulta con abogados certificados para casos complejos sin esperas.</p>
              </div>
            </div>

            <div className="premium-feature">
              <div className="premium-feature-icon">
                <Users size={24} />
              </div>
              <div className="premium-feature-content">
                <h4>Comunidad Confiable</h4>
                <p>Miles de personas utilizan nuestros servicios con éxito todos los días.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="premium-section">
        <div className="premium-section-content">
          <h2 className="premium-section-title">Nuestro Impacto</h2>

          <div className="premium-stats">
            <div className="premium-stat">
              <div className="premium-stat-number">500+</div>
              <div className="premium-stat-label">Consultas Mensuales Resueltas</div>
            </div>
            <div className="premium-stat">
              <div className="premium-stat-number">95%</div>
              <div className="premium-stat-label">Satisfacción de Clientes</div>
            </div>
            <div className="premium-stat">
              <div className="premium-stat-number">6</div>
              <div className="premium-stat-label">Áreas de Especialización</div>
            </div>
            <div className="premium-stat">
              <div className="premium-stat-number">24/7</div>
              <div className="premium-stat-label">Disponibilidad Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="premium-section text-center border-t border-primary-500/10">
        <div className="premium-section-content">
          <h2 className="premium-section-title">¿Listo Para Tu Consulta Legal?</h2>
          <p className="premium-section-subtitle mb-8">
            Comienza ahora y obtén respuestas legales profesionales en minutos.
          </p>
          <Link to="/faq" className="premium-button primary">
            Iniciar Consulta Gratuita <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
