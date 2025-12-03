import { useEffect, useRef, useState, useCallback } from 'react'

interface ChessboardBackgroundProps {
  imageUrl: string
  opacity?: number
  blurAmount?: number
  parallaxIntensity?: number
  cleanMode?: boolean // Sin overlays adicionales
}

// Use local image first (served from same domain = faster)
// Falls back to external URL only if local fails
const LOCAL_IMAGE = '/images/chess-bg-original.jpg'
const EXTERNAL_FALLBACK = 'https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg'

export default function ChessboardBackground({
  imageUrl,
  opacity = 0.15,
  blurAmount = 8,
  parallaxIntensity = 0.5,
  cleanMode = false,
}: ChessboardBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [imageSrc, setImageSrc] = useState<string>(LOCAL_IMAGE)
  const [imageLoaded, setImageLoaded] = useState(false)
  const rafRef = useRef<number>()

  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (rafRef.current) return
    
    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.scrollY)
      rafRef.current = undefined
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll])

  // Handle image loading with fallback to external URL
  const handleImageError = () => {
    if (imageSrc === LOCAL_IMAGE) {
      // Try external fallback
      setImageSrc(imageUrl || EXTERNAL_FALLBACK)
    }
    // If external also fails, image stays invisible (opacity: 0)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

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
          // Use will-change for GPU acceleration, removed transition to avoid forced reflow
          willChange: 'transform',
        }}
      >
        <img
          src={imageSrc}
          alt="Tablero de ajedrez"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="sync"
          // @ts-expect-error - fetchpriority is a valid HTML attribute but React types don't include it yet
          fetchpriority="high"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            filter: `blur(${blurAmount}px)`,
            opacity: imageLoaded ? opacity : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease-in-out',
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
