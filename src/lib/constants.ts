/** Single-segment paths that can never be bio usernames or short-link slugs */
export const RESERVED = new Set([
  'auth', 'dashboard', 'admin', 'terms', 'privacy', 'api', 'u',
  'not-found', 'error', 'sitemap', 'robots', 'favicon', 'sw', 'manifest',
  '_next', 'static', 'images',
])
