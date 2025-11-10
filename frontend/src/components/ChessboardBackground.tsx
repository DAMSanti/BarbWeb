import { useEffect, useRef, useState } from 'react'

interface ChessboardBackgroundProps {
  imageUrl: string
  opacity?: number
  blurAmount?: number
  parallaxIntensity?: number
  cleanMode?: boolean // Sin overlays adicionales
}

export default function ChessboardBackground({
  imageUrl,
  opacity = 0.15,
  blurAmount = 8,
  parallaxIntensity = 0.5,
  cleanMode = false,
}: ChessboardBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Fondo con efecto parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * parallaxIntensity}px) scale(1.05)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <img
          src={imageUrl}
          alt="Tablero de ajedrez"
          className="w-full h-full object-cover"
          style={{
            filter: `blur(${blurAmount}px)`,
            opacity: opacity,
            pointerEvents: 'none',
          }}
        />

        {!cleanMode && (
          <>
            {/* Capa de overlay para mejorar contraste */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary-950/10 via-transparent to-accent-950/5"
              style={{
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>

      {!cleanMode && (
        /* Gradiente adicional para asegurar legibilidad */
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5"
          style={{
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
