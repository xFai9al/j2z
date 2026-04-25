# J2z.com — Project Guide for Claude Code

**Domain:** j2z.com (owned by user)
**GitHub:** https://github.com/xFai9al/j2z
**Vercel:** https://j2z-zeta.vercel.app
**Owner:** Faisal (no coding experience — relies fully on Claude Code)
**Stack:** Next.js 14 App Router + TypeScript + Supabase + Tailwind CSS + Vercel

---

## How to Use This File

Every time a session ends, update the "Completed Steps" section with what was done.
When a new session starts, read this file first to know exactly where to continue.
Never ask the user to explain what was done before — it's all here.

---

## Project Structure

```
j2z/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ✅ Landing page (URL shortener + QR + bio preview)
│   │   ├── layout.tsx                ✅ Root layout with ThemeProvider + fonts
│   │   ├── globals.css               ✅ Tailwind base + dark mode body styles
│   │   ├── auth/
│   │   │   ├── page.tsx              ✅ Sign up / Sign in (Google, Apple, Email)
│   │   │   └── callback/route.ts     ✅ OAuth callback handler
│   │   ├── dashboard/
│   │   │   └── page.tsx              ✅ Dashboard (6 tabs, auth-gated, mock data)
│   │   ├── terms/
│   │   │   ├── page.tsx              ✅ Terms of Service page
│   │   │   └── LegalContent.tsx      ✅ Shared bilingual legal component
│   │   ├── privacy/
│   │   │   └── page.tsx              ✅ Privacy Policy page
│   │   ├── [slug]/
│   │   │   └── route.ts              ✅ Redirect handler (uses destination_url)
│   │   └── api/
│   │       └── shorten/
│   │           └── route.ts          ✅ POST /api/shorten (creates short link)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ✅ Browser Supabase client (lazy-safe fallback URL)
│   │   │   └── server.ts             ✅ Server Supabase client (cookie-based)
│   │   └── utils.ts                  ✅ generateSlug, isValidUrl, ensureHttps, formatDate
│   └── middleware.ts                  ✅ Session refresh on every request
├── supabase/
│   └── schema.sql                    ✅ Full 8-table schema (NOT yet applied to Supabase)
├── .env.local                        ⚠️  PLACEHOLDER — user must fill in real values
├── tailwind.config.ts                ✅ darkMode: 'class'
└── package.json                      ✅ All deps installed
```

---

## Brand Identity (DO NOT CHANGE)

### Colors
```css
--paper: #FBFAF7        /* main background */
--ink: #2F2A24          /* primary text */
--coral-deep: #D45A3F   /* primary brand */
--coral: #E8765C        /* CTAs */
--coral-light: #F4A593  /* highlights */
--coral-soft: #FBEDE8   /* soft coral bg */
--sage: #8FA68E         /* success */
--sage-soft: #EDF1EC    /* soft sage bg */
--butter: #E8C66B       /* warm accent */
```

### Fonts
- **Cal Sans** — headlines
- **Space Grotesk** — body
- **Tajawal** — Arabic (weights 500/700/800)
All loaded via Google Fonts `@import` inside inline `<style>` tags.

### Logo SVG
```jsx
<svg viewBox="0 0 60 60" width={44} height={44} fill="none">
  <rect x="0" y="0" width="60" height="60" rx="16" fill="#FBEDE8"/>
  <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
  <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
  <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
  <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
  <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
</svg>
```

### Wordmark: `J2z` — Space Grotesk 700, letter-spacing -0.04em

---

## Coding Conventions

- All pages use **inline `<style>{css}</style>`** — DO NOT convert to Tailwind classes
- CSS variables are set via `style={theme}` on the root `div` for dark/light switching
- All pages are bilingual with `lang` state (`'en' | 'ar'`) and `dir` (`'ltr' | 'rtl'`)
- Translation objects are named `T` or `TXT` with `en` and `ar` keys
- Supabase client MUST be initialized lazily (inside `useRef` + getter function) to avoid SSR crashes during build
- `export const dynamic = 'force-dynamic'` is set on auth and dashboard pages
- The `createClient()` functions use fallback placeholder URLs so `npm run build` works without real env vars

---

## Environment Variables

File: `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jzjyzmizjvlgmsaazfcc.supabase.co   # ✅ SET
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_h8zqxSKFpM6GTOOOz-NrVA_OFxW6pDk  # ✅ SET
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_h8zqxSKFpM6GTOOOz-NrVA_OFxW6pDk  # ✅ SET
NEXT_PUBLIC_SITE_URL=https://j2z.com
```

⚠️ Same variables must still be added in Vercel dashboard → Project Settings → Environment Variables.

---

## Supabase Setup Status

**Current state: CREDENTIALS CONFIGURED — schema not yet applied**

- Project URL: `https://jzjyzmizjvlgmsaazfcc.supabase.co` ✅
- Anon key: set in `.env.local` ✅ (also stored as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- Tables: ✅ ALL 8 TABLES CREATED (links, profiles, qr_codes, clicks, bio_pages, bio_links, anon_usage, url_blocklist)
- url_blocklist: ✅ 8 blocked patterns seeded (porn/gambling domains + keywords)
- Auth providers: ❌ NOT configured
- Vercel env vars: ❌ NOT added

### What still needs to be done (in order):
1. ✅ Created Supabase project
2. ✅ Filled `.env.local` with real URL and key
3. ✅ Ran `supabase/schema.sql` — all tables verified working
4. ❌ Enable Auth providers: Email/Password + Google OAuth
5. ❌ Add redirect URLs in Supabase Auth settings: `https://j2z.com/auth/callback` and `https://j2z-zeta.vercel.app/auth/callback`
6. ❌ Add env vars to Vercel: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Note on key naming:
Supabase now calls the anon key a "Publishable Key" (`sb_publishable_...`).
In `.env.local` it is stored under BOTH `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` so all code works.

### Schema summary (8 tables):
- `profiles` — extends auth.users, auto-created via trigger on signup
- `links` — short links, `user_id` nullable (allows anonymous links)
- `qr_codes` — QR code entries
- `bio_pages` — one per user, has username
- `bio_links` — multiple links per bio page
- `clicks` — analytics (resource_type: link/qr/bio/bio_link)
- `anon_usage` — rate limiting for anonymous users
- `url_blocklist` — forbidden domains/keywords

---

## Completed Steps Log

### Session 1 — Project Bootstrap
- ✅ Created Next.js 14 project at `C:\Users\Faisal\Desktop\j2z`
- ✅ Installed: `@supabase/ssr`, `@supabase/supabase-js`, `qrcode`, `@types/qrcode`, `next-themes`, `lucide-react`
- ✅ Set up GitHub repo: https://github.com/xFai9al/j2z
- ✅ Connected Vercel: https://j2z-zeta.vercel.app (auto-deploys from master)
- ✅ Configured Tailwind `darkMode: 'class'`
- ✅ Created `src/lib/supabase/client.ts` and `server.ts`
- ✅ Created `src/lib/utils.ts`

### Session 2 — Landing Page + Auth Page
- ✅ Ported `j2z-landing-v4.jsx` → `src/app/page.tsx`
  - Real API call to `/api/shorten`
  - Real QR via `QRCode.toCanvas`
  - Shows signup prompt after first use (`linkUsed` / `qrUsed` state)
  - Bilingual EN/AR, full inline CSS preserved
- ✅ Ported `j2z-auth.jsx` → `src/app/auth/page.tsx`
  - Google OAuth: `signInWithOAuth` with callback redirect
  - Apple OAuth: same pattern
  - Email signup: `signUp` with email verification
  - Email signin: `signInWithPassword` → redirect to `/dashboard`
  - All 5 modes: signup / signin / email-signup / email-signin / verify
- ✅ Updated `src/app/layout.tsx` with ThemeProvider

### Session 3 — Dashboard + Legal Pages + Infrastructure
- ✅ Ported `j2z-dashboard-v2.jsx` → `src/app/dashboard/page.tsx`
  - Auth-gated: redirects to `/auth` if no session
  - Working logout (Supabase signOut → redirect to /auth)
  - Avatar shows user's initial from Supabase user metadata
  - 6 tabs: Overview, Links, QR Codes, Bio Link, Analytics, Settings
  - Real QR generation with `QRCode.toCanvas`
  - Dark/light theme toggle with CSS variables
  - Bilingual EN/AR + RTL
  - ~~Currently uses mock data~~ → **Now uses real Supabase data** (fetches on login)
- ✅ Ported `j2z-terms.jsx` → `src/app/terms/page.tsx` + `src/app/privacy/page.tsx`
  - Shared component: `src/app/terms/LegalContent.tsx`
  - Bilingual EN/AR, tab switching between Terms and Privacy
- ✅ Created `src/app/auth/callback/route.ts` — OAuth code exchange
- ✅ Created `src/middleware.ts` — session refresh on all routes
- ✅ Updated `src/app/api/shorten/route.ts`:
  - Uses `destination_url` column (new schema)
  - Accepts `slug` or `customSlug` in body
  - Passes `user_id` from session (null for anonymous)
- ✅ Updated `src/app/[slug]/route.ts`:
  - Uses `destination_url` and `is_active = true` filter
- ✅ Replaced `supabase/schema.sql` with comprehensive 8-table schema
- ✅ Fixed build: Supabase clients use fallback URLs, lazy initialization via `useRef`
- ✅ Committed and pushed to GitHub (commit `5409c58`)

### Session 4 — Real Data Integration + CRUD API Routes
- ✅ Replaced mock data in dashboard with real Supabase queries
  - Fetches `links` table on login: `fetchLinks(uid)` → `.from('links').select(...).eq('user_id', uid)`
  - Fetches `qr_codes` table on login: `fetchQrs(uid)`
  - Soft-delete (set `is_active=false`) instead of hard delete
- ✅ Created `src/app/api/qr/route.ts` — POST creates QR code in `qr_codes` table
- ✅ Created `src/app/api/links/[id]/route.ts` — DELETE + PATCH for links
- ✅ Created `src/app/api/qr/[id]/route.ts` — DELETE + PATCH for QR codes
- ✅ Updated `src/app/[slug]/route.ts` — now checks both `links` AND `qr_codes` tables + increments scans
- ✅ Committed and pushed (commit `3418dfb`)

### Session 5 — Landing Page Design Sync + Bio Page (P4)
- ✅ Synced `src/app/page.tsx` with original `j2z-landing-v4.jsx` design (10 diffs fixed)
  - Badge `◈→✦`, bio avatar `👤→🚀`, footer restored About+Blog links
  - CTA decorative circles (`::before`/`::after`), shadow CSS variables
  - `consent a:hover`, canvas `imageRendering:pixelated`, download `↓→⬇`, `✗→✕`, `-webkit-backdrop-filter`
- ✅ Built bio page (Priority 4) — 3 parts:
  - `src/app/api/bio/route.ts` — GET/POST/PATCH bio page
  - `src/app/api/bio/links/route.ts` — POST add bio link
  - `src/app/api/bio/links/[id]/route.ts` — PATCH/DELETE bio link
  - Dashboard bio tab: create page flow, profile editor, links manager, publish toggle, live preview
  - `src/app/u/[username]/page.tsx` — public server-rendered bio page, 404 if unpublished
- ✅ Committed and pushed (commits `396fea3`, `0f9923f`)

---

## What's Next (Pending Work)

### Priority 1 — Make it actually work (requires Supabase setup)
1. **User sets up Supabase** (see steps above)
2. **Fill `.env.local`** with real URL and anon key
3. **Add same vars to Vercel** → triggers redeploy
4. **Run `supabase/schema.sql`** in Supabase SQL Editor
5. **Enable auth providers** in Supabase dashboard

### Priority 2 — Replace mock data in dashboard ✅ DONE (Session 4)

### Priority 3 — API routes ✅ DONE (Session 4)

### Priority 4 — Bio page ✅ DONE (Session 5)

### Priority 5 — Cloudflare Worker (redirect engine)
- Sub-50ms global redirects instead of Vercel (optional, for scale)
- Worker reads from Supabase or KV cache
- Reserved paths: `auth`, `dashboard`, `terms`, `privacy`, `api`, `u`

### Priority 6 — DNS & domain
- Point `j2z.com` to Vercel
- Update `NEXT_PUBLIC_SITE_URL` from `https://j2z.com` (already set)
- Add production URL to Supabase auth redirects

### Priority 7 — Polish
- 404 page (`src/app/not-found.tsx`)
- Loading states (skeleton screens)
- Error boundaries
- Mobile testing

---

## Known Issues / Decisions

| Issue | Decision |
|-------|----------|
| `user_id` in `links` table | Made nullable — anonymous users can create 1 link |
| Dashboard data | Uses mock data until Supabase is configured |
| Apple OAuth | Requires Apple Developer account ($99/yr) — defer |
| Supabase URL validation | Supabase v2 throws on invalid URLs at instantiation — fixed with lazy `useRef` init |
| Build with no env vars | Fixed: fallback to `https://placeholder.supabase.co` so `npm run build` passes |

---

## Useful Commands

```bash
# Local dev
npm run dev

# Build check
npm run build

# Push to GitHub (auto-deploys to Vercel)
git add -A && git commit -m "message" && git push origin master
```

---

## Design Files Reference (in `j2z2/` folder on Desktop)

| File | Ported to | Status |
|------|-----------|--------|
| `j2z-landing-v4.jsx` | `src/app/page.tsx` | ✅ Done |
| `j2z-auth.jsx` | `src/app/auth/page.tsx` | ✅ Done |
| `j2z-dashboard-v2.jsx` | `src/app/dashboard/page.tsx` | ✅ Done |
| `j2z-terms.jsx` | `src/app/terms/` + `privacy/` | ✅ Done |
| `j2z-database-schema.sql` | `supabase/schema.sql` | ✅ Done |
| `CLAUDE_CODE_INSTRUCTIONS.md` | This file | ✅ Done |
