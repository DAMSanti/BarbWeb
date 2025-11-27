/**
 * Sitemap route - Generates dynamic sitemap.xml for SEO
 * Accessible at: GET /sitemap.xml
 */

import { Router } from 'express';

const router = Router();

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * All public URLs of the application
 */
const sitemapUrls: SitemapEntry[] = [
  // Homepage
  {
    loc: 'https://damsanti.app',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 1.0,
  },

  // Main pages
  {
    loc: 'https://damsanti.app/faq',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
  },

  {
    loc: 'https://damsanti.app/about',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.8,
  },

  {
    loc: 'https://damsanti.app/contact',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
  },

  // Auth pages (public)
  {
    loc: 'https://damsanti.app/login',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'never',
    priority: 0.6,
  },

  {
    loc: 'https://damsanti.app/register',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'never',
    priority: 0.6,
  },

  // Legal pages
  {
    loc: 'https://damsanti.app/privacy',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'yearly',
    priority: 0.5,
  },

  {
    loc: 'https://damsanti.app/terms',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'yearly',
    priority: 0.5,
  },

  // Note: /admin, /checkout, /api/* are NOT included (private/internal)
];

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(entry: SitemapEntry): string {
  return `  <url>
    <loc>${entry.loc}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
}

/**
 * GET /sitemap.xml
 * Returns dynamic sitemap for search engines
 */
router.get('/sitemap.xml', (_req, res) => {
  // Generate XML header
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add all URLs
  sitemapUrls.forEach(url => {
    xml += generateUrlEntry(url) + '\n';
  });

  // Close XML
  xml += '</urlset>';

  // Set proper content type and headers
  res.type('application/xml');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(xml);
});

/**
 * GET /sitemap
 * Alternative route (some crawlers look for this)
 */
router.get('/sitemap', (req, res) => {
  res.redirect('/sitemap.xml');
});

export default router;
