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

  const anonClient = createClient()
  const { data: sessionData } = await anonClient.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = `qr-${generateSlug(4)}`
  const service = makeServiceClient()

  const { data, error } = await service
    .from('qr_codes')
    .insert({ slug, destination_url: originalUrl, user_id: sessionData.user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    destination_url: data.destination_url,
    short_url: `${siteUrl}/${data.slug}`,
    scans: data.scans,
    created_at: data.created_at,
  })
}
