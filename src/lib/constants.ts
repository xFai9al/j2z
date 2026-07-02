/** Single-segment paths that can never be bio usernames or short-link slugs */
export const RESERVED = new Set([
  'auth', 'dashboard', 'admin', 'terms', 'privacy', 'api', 'u',
  'not-found', 'error', 'sitemap.xml', 'robots.txt', 'favicon', 'sw', 'manifest',
  '_next', 'static', 'images', 'llms.txt', 'pricing.md', 'opengraph-image',
])
