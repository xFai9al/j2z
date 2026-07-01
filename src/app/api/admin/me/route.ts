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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await isAdmin(makeServiceClient(), user.id)
  return NextResponse.json({ isAdmin: admin })
}
