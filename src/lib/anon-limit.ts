import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { claimRateLimit } from '@/lib/rate-limit'

const DAILY_LINK_LIMIT = 1

/** Returns true if this anon request is allowed to create a link today, and records the usage. */
export async function checkAnonLinkLimit(req: NextRequest, service: SupabaseClient): Promise<boolean> {
  return claimRateLimit(req, service, 'anonymous_link', DAILY_LINK_LIMIT, 86_400)
}
