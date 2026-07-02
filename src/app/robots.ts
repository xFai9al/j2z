import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/auth', '/admin', '/api'],
      },
    ],
    sitemap: 'https://j2z.com/sitemap.xml',
  }
}
