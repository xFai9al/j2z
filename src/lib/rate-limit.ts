import crypto from 'crypto'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || req.headers.get('x-real-ip') || 'unknown'
}

export function hashClientIp(req: NextRequest): string {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Missing rate-limit secret')
  return crypto.createHmac('sha256', secret).update(getClientIp(req)).digest('hex')
}

export async function claimRateLimit(
  req: NextRequest,
  service: SupabaseClient,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await service.rpc('claim_rate_limit', {
    p_key: hashClientIp(req),
    p_action: action,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })

  if (error) throw error
  return data === true
}
