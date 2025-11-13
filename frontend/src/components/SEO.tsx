import { Helmet } from 'react-helmet';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'business.business';
  author?: string;
  publishedDate?: string;
  schema?: Record<string, any>;
}

/**
 * SEO Component - Manages all meta tags, Open Graph, and Schema.org
 * Usage:
 * <SEO 
 *   title="Page Title"
 *   description="Page description"
 *   image="og-image.png"
 *   url="https://barbweb.com/page"
 * />
 */
export function SEO({
  title,
  description,
  image = 'https://barbweb.com/og-default.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://barbweb.com',
  type = 'website',
  author,
  publishedDate,
  schema,
}: SEOProps) {
  const fullTitle = `${title} - Barbara & Abogados`;
  const siteUrl = 'https://barbweb.com';

  // Default schema for organization
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: 'Barbara & Abogados',
    description: 'Plataforma de consultas legales online con respuestas inmediatas de abogados expertos',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: image,
    telephone: '+34-XXX-XXX-XXX',
    email: 'info@barbweb.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Principal, 123',
      addressLocality: 'Madrid',
      addressRegion: 'Madrid',
      postalCode: '28001',
      addressCountry: 'ES',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      ratingCount: 120,
    },
    sameAs: [
      'https://www.facebook.com/barbweb',
      'https://www.linkedin.com/company/barbweb',
      'https://twitter.com/barbweb',
    ],
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="es-ES" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Barbara & Abogados" />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@barbweb" />

      {/* Article Meta Tags (if applicable) */}
      {type === 'article' && publishedDate && (
        <>
          <meta property="article:published_time" content={publishedDate} />
          <meta property="article:author" content={author || 'Barbara & Abogados'} />
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Alternate Versions */}
      <link rel="alternate" hrefLang="es" href={url} />

      {/* JSON-LD Schema.org Structured Data */}
      <script type="application/ld+json">{JSON.stringify(finalSchema)}</script>

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#D4AF37" />
      <meta name="msapplication-TileColor" content="#D4AF37" />
    </Helmet>
  );
}

/**
 * Schema presets for common use cases
 */
export const schemaPresets = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Barbara & Abogados',
    description: 'Consultas legales online',
    url: 'https://barbweb.com',
  },

  service: (name: string, description: string, price?: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: 'Barbara & Abogados',
    },
    ...(price && { priceRange: price }),
  }),

  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Barbara & Abogados',
    image: 'https://barbweb.com/logo.png',
    description: 'Consultas legales online con abogados expertos',
    url: 'https://barbweb.com',
    telephone: '+34-XXX-XXX-XXX',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Principal, 123',
      addressLocality: 'Madrid',
      addressRegion: 'Madrid',
      postalCode: '28001',
      addressCountry: 'ES',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      ratingCount: 120,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  },

  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};
