import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { generateSlug, isValidUrl, ensureHttps } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

function makeServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const originalUrl = ensureHttps(body.url.trim())
  if (!isValidUrl(originalUrl)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const rawSlug = (body.slug ?? body.customSlug ?? '').trim().replace(/[^a-zA-Z0-9-_]/g, '')
  const service = makeServiceClient()

  if (rawSlug) {
    const { data: existing } = await service
      .from('links')
      .select('id')
      .eq('slug', rawSlug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This alias is already taken' }, { status: 409 })
    }
  }

  const slug = rawSlug || generateSlug()

  // Identify current user (optional — anon users get user_id = null)
  const anonClient = createClient()
  const { data: sessionData } = await anonClient.auth.getUser()
  const userId = sessionData?.user?.id ?? null

  // Use service role to bypass RLS — allows both anon and authenticated inserts
  const { data, error } = await service
    .from('links')
    .insert({ slug, destination_url: originalUrl, user_id: userId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug collision, please try again' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    destination_url: data.destination_url,
    short_url: `${siteUrl}/${data.slug}`,
    clicks: data.clicks,
    created_at: data.created_at,
  })
}
