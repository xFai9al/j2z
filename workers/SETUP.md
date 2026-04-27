# Cloudflare Worker Setup

Gives j2z.com sub-50ms redirects globally via Cloudflare's edge + KV cache.
The Worker intercepts slug requests, checks KV cache, falls back to Supabase,
then passes everything else through to Vercel.

## One-time setup (do in order)

### 1. Create Cloudflare account
Sign up at cloudflare.com if not already done.

### 2. Add j2z.com to Cloudflare
- Cloudflare dashboard → Add a Site → j2z.com
- Cloudflare will show you nameservers (e.g. `aria.ns.cloudflare.com`)
- Go to name.com → Manage domain → change nameservers to Cloudflare's two NS records
- Wait for propagation (up to 24h, usually under 1h)
- Vercel redirects still work because the Worker passes non-slug traffic to Vercel origin

### 3. Install Wrangler
```
npm install -g wrangler
npx wrangler login
```

### 4. Create KV namespace
```
npx wrangler kv namespace create REDIRECT_KV
```
Copy the `id` from the output and paste it into `wrangler.toml` replacing `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

### 5. Add service role secret
```
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
Paste your Supabase service role key when prompted (same one in Vercel env vars).

### 6. Deploy
```
cd workers
npx wrangler deploy
```

### 7. Add Vercel as origin in Cloudflare
- Cloudflare dashboard → j2z.com → DNS
- The A record pointing to 76.76.21.21 (Vercel) should exist with Proxy enabled (orange cloud)
- If grey cloud: click it to turn orange (enables Cloudflare proxy)

That's it. The Worker now handles redirects at the edge, Vercel handles everything else.

## How it works

```
User clicks j2z.com/abc
  → Cloudflare Worker receives request
  → Check KV: hit? → 301 redirect in <5ms
  → KV miss? → query Supabase → cache in KV → 301 redirect
  → Not a slug? → pass through to Vercel
```

## Update after link changes

KV entries expire after 5 minutes automatically (KV_TTL_SECONDS in the worker).
No manual cache invalidation needed.
