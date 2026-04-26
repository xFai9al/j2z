import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'faisal@aba-alkhail.com'

function makeServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const svc = makeServiceClient()

  const [
    { count: totalUsers },
    { count: totalLinks },
    { count: totalQr },
    { count: totalClicks },
    { data: topLinks },
    { data: recentUsers },
  ] = await Promise.all([
    svc.from('profiles').select('*', { count: 'exact', head: true }),
    svc.from('links').select('*', { count: 'exact', head: true }).eq('is_active', true),
    svc.from('qr_codes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    svc.from('clicks').select('*', { count: 'exact', head: true }),
    svc.from('links').select('id,slug,destination_url,clicks,created_at').eq('is_active', true).order('clicks', { ascending: false }).limit(10),
    svc.from('profiles').select('id,email,display_name,created_at').order('created_at', { ascending: false }).limit(15),
  ])

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalLinks: totalLinks ?? 0,
    totalQr: totalQr ?? 0,
    totalClicks: totalClicks ?? 0,
    topLinks: topLinks ?? [],
    recentUsers: recentUsers ?? [],
  })
}
