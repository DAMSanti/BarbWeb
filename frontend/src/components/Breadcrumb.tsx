import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Inicio', path: '/' }],
  '/faq': [
    { label: 'Inicio', path: '/' },
    { label: 'Preguntas Frecuentes', path: '/faq' },
  ],
  '/about': [
    { label: 'Inicio', path: '/' },
    { label: 'Sobre Nosotros', path: '/about' },
  ],
  '/contact': [
    { label: 'Inicio', path: '/' },
    { label: 'Contacto', path: '/contact' },
  ],
  '/privacy': [
    { label: 'Inicio', path: '/' },
    { label: 'Privacidad', path: '/privacy' },
  ],
  '/terms': [
    { label: 'Inicio', path: '/' },
    { label: 'Términos', path: '/terms' },
  ],
  '/login': [
    { label: 'Inicio', path: '/' },
    { label: 'Iniciar Sesión', path: '/login' },
  ],
  '/register': [
    { label: 'Inicio', path: '/' },
    { label: 'Crear Cuenta', path: '/register' },
  ],
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation()
  const breadcrumbs = items || breadcrumbMap[location.pathname] || [{ label: 'Inicio', path: '/' }]

  // Generate JSON-LD schema
  const schemaItems = breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: `https://barbweb.com${item.path}`,
  }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      >
        {breadcrumbs.map((item, index) => (
          <div key={item.path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-gold hover:text-gold/80 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
