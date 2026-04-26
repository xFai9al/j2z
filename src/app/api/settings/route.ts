import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const profileUpdate: Record<string, string> = {}

  if (typeof body.display_name === 'string') {
    const name = body.display_name.trim().slice(0, 100)
    profileUpdate.display_name = name
    await sb.auth.updateUser({ data: { full_name: name } })
  }

  if (body.language === 'en' || body.language === 'ar') {
    profileUpdate.language = body.language
  }

  if (body.theme === 'light' || body.theme === 'dark') {
    profileUpdate.theme = body.theme
  }

  if (Object.keys(profileUpdate).length > 0) {
    await sb.from('profiles').update(profileUpdate).eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
