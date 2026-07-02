import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: 'https://j2z.com', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://j2z.com/terms', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://j2z.com/privacy', changeFrequency: 'yearly', priority: 0.3 },
  ]

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return staticRoutes

  const sb = createClient(url, key)
  const { data } = await sb
    .from('bio_pages')
    .select('username, updated_at')
    .eq('is_published', true)

  const bioRoutes: MetadataRoute.Sitemap = (data ?? []).map((page) => ({
    url: `https://j2z.com/${page.username}`,
    lastModified: page.updated_at ?? undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...bioRoutes]
}
