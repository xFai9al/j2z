import crypto from 'crypto'
import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

const DAILY_LINK_LIMIT = 1

function hashIp(ip: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'j2z-anon-hash-fallback'
  return crypto.createHash('sha256').update(`${ip}:${secret}`).digest('hex')
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}

/** Returns true if this anon request is allowed to create a link today, and records the usage. */
export async function checkAnonLinkLimit(req: NextRequest, service: SupabaseClient): Promise<boolean> {
  const ipHash = hashIp(getClientIp(req))
  const usageDate = new Date().toISOString().slice(0, 10)

  const { data: existing } = await service
    .from('anon_usage')
    .select('links_created')
    .eq('ip_hash', ipHash)
    .eq('usage_date', usageDate)
    .maybeSingle()

  if (existing && existing.links_created >= DAILY_LINK_LIMIT) {
    return false
  }

  await service
    .from('anon_usage')
    .upsert(
      {
        ip_hash: ipHash,
        usage_date: usageDate,
        links_created: (existing?.links_created ?? 0) + 1,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'ip_hash,usage_date' }
    )

  return true
}
