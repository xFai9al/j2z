import { createClient } from '@/lib/supabase/server'
import { isValidUrl, ensureHttps } from '@/lib/utils'
import { isUrlBlocked } from '@/lib/blocklist'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('qr_codes')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', sessionData.user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.destination_url) {
    return NextResponse.json({ error: 'destination_url is required' }, { status: 400 })
  }

  const url = ensureHttps(body.destination_url.trim())
  if (!isValidUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (await isUrlBlocked(url, supabase)) {
    return NextResponse.json({ error: 'This URL is not allowed' }, { status: 403 })
  }

  const { error } = await supabase
    .from('qr_codes')
    .update({ destination_url: url })
    .eq('id', id)
    .eq('user_id', sessionData.user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
