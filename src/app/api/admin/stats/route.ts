import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { isAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

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
  const svc = makeServiceClient()
  if (!user || !(await isAdmin(svc, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
