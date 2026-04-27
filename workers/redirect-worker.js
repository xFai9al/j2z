/**
 * J2z Redirect Worker
 * Handles slug → URL redirects at Cloudflare's global edge with KV caching.
 * Falls back to Supabase REST API on KV miss. Tracks clicks asynchronously.
 *
 * Required bindings (set in Cloudflare dashboard or wrangler.toml):
 *   REDIRECT_KV  — KV namespace
 *   SUPABASE_URL — var (public, safe to commit)
 *   SUPABASE_SERVICE_ROLE_KEY — secret (wrangler secret put)
 */

const RESERVED = new Set([
  'auth', 'dashboard', 'admin', 'terms', 'privacy', 'api', 'u', 'not-found',
  '_next', 'favicon.ico',
])

const KV_TTL_SECONDS = 300 // cache each slug for 5 minutes

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const segments = url.pathname.split('/').filter(Boolean)

    // Only intercept single-segment short-link paths
    if (segments.length !== 1 || RESERVED.has(segments[0])) {
      return fetch(request) // pass through to Vercel origin
    }

    const slug = segments[0]

    // 1 — KV cache lookup
    const cached = await env.REDIRECT_KV.get(slug)
    if (cached) {
      env.waitUntil(trackFromKV(slug, cached, request, env))
      return Response.redirect(cached, 301)
    }

    // 2 — Supabase lookup (links table)
    const headers = {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    }

    const linkRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/links?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=id,destination_url&limit=1`,
      { headers }
    )
    const links = await linkRes.json()

    if (Array.isArray(links) && links.length > 0) {
      const dest = links[0].destination_url
      env.waitUntil(cacheAndTrack(slug, dest, links[0].id, 'link', request, env))
      return Response.redirect(dest, 301)
    }

    // 3 — Supabase lookup (qr_codes table)
    const qrRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/qr_codes?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=id,destination_url&limit=1`,
      { headers }
    )
    const qrs = await qrRes.json()

    if (Array.isArray(qrs) && qrs.length > 0) {
      const dest = qrs[0].destination_url
      env.waitUntil(cacheAndTrack(slug, dest, qrs[0].id, 'qr', request, env))
      return Response.redirect(dest, 301)
    }

    // 4 — Not found → pass to Vercel (shows /?notfound=1 via middleware)
    return fetch(request)
  },
}

async function cacheAndTrack(slug, dest, resourceId, resourceType, request, env) {
  await Promise.all([
    env.REDIRECT_KV.put(slug, dest, { expirationTtl: KV_TTL_SECONDS }),
    track(resourceId, resourceType, request, env),
  ])
}

async function trackFromKV(slug, dest, request, env) {
  // KV hit: we don't have the DB id, so just fire a direct insert into clicks
  const ua = request.headers.get('user-agent') ?? ''
  const country = request.headers.get('cf-ipcountry') ?? null
  const device = parseDevice(ua)
  const referrer = request.headers.get('referer')?.slice(0, 500) ?? null

  // No resource_id available from KV — insert without it
  await fetch(`${env.SUPABASE_URL}/rest/v1/clicks`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      resource_type: 'link',
      slug,
      country,
      device_type: device,
      referrer,
      user_agent: ua.slice(0, 300),
    }),
  }).catch(() => {})
}

async function track(resourceId, resourceType, request, env) {
  const ua = request.headers.get('user-agent') ?? ''
  const country = request.headers.get('cf-ipcountry') ?? null
  const device = parseDevice(ua)
  const referrer = request.headers.get('referer')?.slice(0, 500) ?? null

  await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/track_click`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_country: country,
      p_device_type: device,
      p_referrer: referrer,
      p_user_agent: ua.slice(0, 300),
    }),
  }).catch(() => {})
}

function parseDevice(ua) {
  if (/ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'
  return 'desktop'
}
