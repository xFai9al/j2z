import { createClient } from '@/lib/supabase/server'
import { isValidUrl, ensureHttps } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: sessionData } = await supabase.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('qr_codes')
    .update({ is_active: false })
    .eq('id', params.id)
    .eq('user_id', sessionData.user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null)
  if (!body?.destination_url) {
    return NextResponse.json({ error: 'destination_url is required' }, { status: 400 })
  }

  const url = ensureHttps(body.destination_url.trim())
  if (!isValidUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const supabase = createClient()
  const { data: sessionData } = await supabase.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('qr_codes')
    .update({ destination_url: url })
    .eq('id', params.id)
    .eq('user_id', sessionData.user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
