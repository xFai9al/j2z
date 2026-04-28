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
│   │   ├── admin/
│   │   │   └── page.tsx              ✅ Admin panel (auth-gated, stats/signups/links/blocklist, bilingual)
│   │   ├── dashboard/
│   │   │   └── page.tsx              ✅ Dashboard (6 tabs, auth-gated, real data)
│   │   ├── terms/
│   │   │   ├── page.tsx              ✅ Terms of Service page
│   │   │   └── LegalContent.tsx      ✅ Shared bilingual legal component
│   │   ├── privacy/
│   │   │   └── page.tsx              ✅ Privacy Policy page
│   │   ├── [slug]/
│   │   │   └── route.ts              ✅ Redirect handler (uses destination_url)
│   │   └── api/
│   │       ├── shorten/
│   │       │   └── route.ts          ✅ POST /api/shorten (creates short link)
│   │       ├── admin/
│   │       │   ├── stats/
│   │       │   │   └── route.ts      ✅ GET platform stats (service role key)
│   │       │   └── blocklist/
│   │       │       └── route.ts      ✅ GET/POST/DELETE blocklist entries
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ✅ Browser Supabase client (lazy-safe fallback URL)
│   │   │   └── server.ts             ✅ Server Supabase client (cookie-based)
│   │   └── utils.ts                  ✅ generateSlug, isValidUrl, ensureHttps, formatDate
│   └── middleware.ts                  ✅ Session refresh on every request
├── supabase/
│   ├── schema.sql                    ✅ Full 8-table schema (applied to Supabase)
│   └── schema-additions.sql          ✅ Trigger fix + track_click function (applied to Supabase)
├── .env.local                        ✅ Real values set
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

**Current state: FULLY CONFIGURED AND LIVE**

- Project URL: `https://jzjyzmizjvlgmsaazfcc.supabase.co` ✅
- Anon key: set in `.env.local` ✅ (also stored as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- Tables: ✅ ALL 8 TABLES CREATED (links, profiles, qr_codes, clicks, bio_pages, bio_links, anon_usage, url_blocklist)
- url_blocklist: ✅ 8 blocked patterns seeded (porn/gambling domains + keywords)
- Auth providers: ✅ Email + Google OAuth both working
- Vercel env vars: ✅ SET (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL, SUPABASE_SERVICE_ROLE_KEY)

### Supabase setup — FULLY COMPLETE:
1. ✅ Created Supabase project
2. ✅ Filled `.env.local` with real URL and key
3. ✅ Ran `supabase/schema.sql` — all 8 tables created
4. ✅ Ran `supabase/schema-additions.sql` — trigger fix + track_click function applied
5. ✅ Email/Password auth enabled (default)
6. ✅ Google OAuth enabled — Client ID configured, redirect URLs set
7. ✅ Redirect URLs added: `https://j2z.com/auth/callback` and `https://j2z-zeta.vercel.app/auth/callback`
8. ✅ Env vars added to Vercel

### Supabase service role key:
Stored in Vercel as `SUPABASE_SERVICE_ROLE_KEY` (server-only, no NEXT_PUBLIC_ prefix).
Used in `src/middleware.ts` for click tracking — bypasses RLS on INSERT into clicks table.

### Google OAuth credentials (stored in Supabase dashboard):
- Google Cloud project: j2zz
- Client ID: 614363137131-0loga1r7sdjlflmisn825qcuj3qbh2bs.apps.googleusercontent.com

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

### Session 6 — UI/UX Redesign (ui-ux-pro-max rules)
- ✅ Dashboard: replaced all emoji icons with inline SVG components
  - Nav tabs: grid, link, QR, sparkle, chart, cog SVGs
  - Stat icons: cursor, link, radio SVGs
  - Pill icons: cursor, calendar, radio SVGs
  - Action buttons: download arrow, pencil SVGs
  - Theme toggle: sun/moon SVGs; hamburger: menu/X SVGs; logout: arrow SVG
- ✅ Dashboard: added `touch-action:manipulation` to all buttons, `prefers-reduced-motion` media query
- ✅ Dashboard: added `aria-label` to icon-only buttons (theme, hamburger, nav)
- ✅ Bio public page (`/u/[username]`): premium dark redesign with OG meta, radial gradient bg,
  glowing avatar animation, staggered link animations, brand strip, footer CTA, full a11y
- ✅ Landing + Auth: added `touch-action:manipulation` + `prefers-reduced-motion` global rules
- ✅ Committed and pushed (commit `162f654`)

### Session 8 — Real Analytics + Settings + Click Tracking Fix
- ✅ Fixed click tracking: middleware now calls `track_click` RPC (SECURITY DEFINER) instead of direct UPDATE (which was failing silently due to RLS)
- ✅ Added device type + country headers (cf-ipcountry / x-vercel-ip-country) to middleware click tracking
- ✅ Created `supabase/schema-additions.sql` — `track_click` Postgres function (run this if schema was already applied)
- ✅ Added `track_click` function to `supabase/schema.sql` for fresh installs
- ✅ Created `src/app/api/analytics/route.ts` — real analytics from `clicks` table (weekly, countries, devices)
- ✅ Created `src/app/api/settings/route.ts` — PATCH: saves display_name to auth metadata + profiles table
- ✅ Created `src/app/api/account/route.ts` — DELETE: deactivates all user data + signs out
- ✅ Dashboard analytics tab: replaced hardcoded mock data with real data from `/api/analytics`
  - Loading skeleton while fetching; "No data yet" empty state
  - 3 stat cards (Total Clicks, QR Scans, This Week) — all real
  - Weekly bar chart + devices + countries — all real
- ✅ Dashboard overview tab: weekly chart + countries now use real analytics data
- ✅ Dashboard settings tab: display name controlled input, save button calls `/api/settings`
- ✅ Dashboard settings tab: delete account button calls DELETE `/api/account` with confirm dialog
- ✅ Committed and pushed (this session)

### Session 9 — Full Production Setup
- ✅ Diagnosed `profiles.email NOT NULL` bug blocking all signups (profiles table had extra column from old schema)
- ✅ Updated `supabase/schema-additions.sql` with 3 fixes: ALTER TABLE email nullable, updated handle_new_user trigger, track_click function
- ✅ User ran schema-additions.sql — verified user creation + profile trigger works end-to-end
- ✅ Middleware updated to use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS for click tracking)
- ✅ `track_click` RPC confirmed working (HTTP 204) — analytics fully functional
- ✅ Google OAuth configured: Client ID set in Supabase, redirect URLs added, verified working
- ✅ All auth flows tested and confirmed: Email signup ✅, Google OAuth ✅
- ✅ Committed and pushed (commit `a01bf4e`)

### Session 7 — Polish (P7)
- ✅ Created `src/app/not-found.tsx` — branded 404: coral "404" glyph, inline CSS, Cal Sans, back-home + dashboard links
- ✅ Created `src/app/error.tsx` — global error boundary (client component), retry + back-home buttons
- ✅ Dashboard skeleton: replaced `return null` with pulsing J2z logo + skeleton bars while auth loads
- ✅ Bio tab skeleton: replaced `...` with animated skeleton bars while bio data fetches
- ✅ Committed and pushed (commit `6452317`)

### Session 10 — Design Polish (Auth + Landing + Dashboard)
- ✅ **Auth page** (`src/app/auth/page.tsx`): replaced 4 emoji benefit icons (🔗 ⬛ 📊 ✨) with inline SVG components
  - `BenefitLinkIcon`, `BenefitQrIcon`, `BenefitChartIcon`, `BenefitBioIcon`, `VerifyMailIcon`
  - Fixed TS "used before declaration" error: moved `benefits` array AFTER all icon declarations
- ✅ **Landing page** (`src/app/page.tsx`): added two new sections
  - Hero demo card: shows `https://www.youtube.com/watch?v=...&utm_source=social&ref=home` → `j2z.com/yt-vid`
  - Stats strip below hero: `10K+ Links · 190+ Countries · 100% Free`
- ✅ **Dashboard** (`src/app/dashboard/page.tsx`): visual polish
  - Bar chart height: 80px → 110px; all bars same coral color with opacity gradient (oldest=25%, newest=100%)
  - Stat cards: added `::before` pseudo-element top-border accent (coral/sage/butter/warm gradient per card)
  - Removed 👋 emoji from greeting
- ✅ **DNS**: j2z.com → Vercel (A record: 76.76.21.21, CNAME www → cname.vercel-dns.com) — user applied at name.com
- ✅ Committed and pushed (commit `c2b9df0`)

### Session 11 — Admin Dashboard
- ✅ Built `src/app/admin/page.tsx` — client component, auth-guarded (email check), bilingual EN/AR
  - Loading skeleton (pulsing logo while auth + data fetches)
  - Forbidden state (shield icon + redirect link)
  - Stats section: 4 cards with color accents (users/links/QR/clicks)
  - Recent signups table: last 15, shows name + email + join date
  - Top links table: top 10 by clicks, shows slug + destination + click count
  - URL blocklist: add form (pattern + type + reason) + delete per entry, optimistic UI
- ✅ Built `src/app/api/admin/stats/route.ts` — GET, verifies admin email, service role key, parallel fetch
- ✅ Built `src/app/api/admin/blocklist/route.ts` — GET/POST/DELETE, verifies admin email, service role key
- ✅ Committed and pushed (commits `907c9d1`, `3accf5c`)

### Session 13 — Bio Page Linktree Upgrade + Redesign Fixes
- ✅ Fixed `src/app/globals.css` body style override (removed Tailwind slate overrides that fought inline CSS)
- ✅ Fixed `src/app/layout.tsx` — removed dead Geist font loading, added og:image/Twitter card meta
- ✅ Fixed `src/app/terms/LegalContent.tsx` hydration error (`dangerouslySetInnerHTML`), replaced `[OPERATOR NAME]` → Faisal
- ✅ Added `linkNotFound` toast on landing page when `?notfound=1` query param is present
- ✅ Added `.env.local` `SUPABASE_SERVICE_ROLE_KEY` (was missing, caused URL shortener failure on localhost)
- ✅ Fixed Google OAuth: added correct redirect URI in Google Cloud Console
- ✅ **Bio URL change**: `j2z.com/u/username` → `j2z.com/username` (bio page now at root slug)
  - Created `src/app/[username]/page.tsx` — new Linktree-style server-rendered bio page
  - `src/app/u/[username]/page.tsx` now does `permanentRedirect()` to `/[username]`
  - Middleware updated: bio page wins over short links (checked first); `/u/[username]` → `/[username]` 301
  - RESERVED set expanded with edge-case paths
- ✅ **Linktree features** added to bio pages:
  - **Social links**: 16 platforms (Instagram, X, TikTok, YouTube, LinkedIn, GitHub, Snapchat, Facebook, Discord, WhatsApp, Telegram, Spotify, Twitch, Pinterest, Behance, Dribbble) — stored as `bio_links` with `platform` field, rendered as icon circles
  - **Button styles**: 6 presets (glass, fill, outline, pill, pill-outline, soft) with live preview
  - **Custom button colors**: accent color + button color + text color pickers
  - **Background image**: URL input for custom bg image (with overlay)
  - **Avatar image**: URL input for photo avatar (in addition to emoji picker)
  - All colors support free color pickers (not just presets)
- ✅ Created `src/lib/platforms.ts` — shared platform SVG paths (server + client safe)
- ✅ Updated API: `/api/bio` PATCH handles new fields; `/api/bio/links` POST handles `platform`; bio POST validates against RESERVED list
- ✅ Created `supabase/schema-additions-v2.sql` — user must run this in Supabase SQL editor
- ✅ Build passes clean (`npm run build` ✓)

### Session 12 — Landing Page Polish (React perf + a11y + UX fixes)
- ✅ Moved `Logo`, `QRIcon`, `T` outside `J2zLanding` component (eliminates per-render recreation)
- ✅ Added `IcoDownload` + `BioAvatarIcon` inline SVG components — replaced `⬇` and `🚀` emojis
- ✅ Removed dead footer links (`/about`, `/blog`) — pages don't exist
- ✅ Removed Apple OAuth button from signup prompt (Apple Developer account not set up)
- ✅ Made result short URL clickable `<a href target="_blank">` instead of plain text
- ✅ Fixed touch targets: `lang-btn`, `btn-signin`, `btn-signup` all ≥44px via `min-height + display:inline-flex`
- ✅ Added `aria-label` to all URL inputs; `type="url"` on URL fields
- ✅ Marked decorative elements `aria-hidden="true"`; signup prompt `role="dialog" aria-modal="true"`
- ✅ Committed and pushed (commit `30348c5`)

---

## What's Next (Pending Work)

### Priority 1 — Make it actually work ✅ DONE (Sessions 8–9)
- Supabase fully configured, auth working, click tracking working

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

### Priority 7 — Polish ✅ DONE (Sessions 7–8)
- ✅ 404 page (`src/app/not-found.tsx`) — branded coral glyph, bilingual, back-home CTA
- ✅ Error boundary (`src/app/error.tsx`) — client component, retry button
- ✅ Loading states — dashboard skeleton (pulsing logo on auth wait, skeleton bars for bio tab)
- ✅ Real analytics (session 8) — click tracking via `track_click` RPC + dashboard wired up
- ✅ Settings save (session 8) — display name persisted to Supabase
- ✅ Delete account (session 8) — deactivates data + signs out
- Mobile testing — manual (user must test on device)

### Priority 8 ✅ DONE — schema-additions.sql applied, click tracking working

### Priority 9 ✅ DONE — Admin Dashboard

**Route:** `src/app/admin/page.tsx`
- Client auth guard: checks email === `faisal@aba-alkhail.com`, shows forbidden state if not admin
- Stats: total users, active links, active QR codes, total clicks (service role key bypasses RLS)
- Recent signups: last 15 profiles ordered by `created_at`
- Top links: top 10 by clicks
- URL blocklist: view all, add (POST), delete (DELETE with `?id=`) — optimistic UI
- Bilingual EN/AR, inline CSS, same brand tokens
- API routes: `/api/admin/stats` (GET), `/api/admin/blocklist` (GET/POST/DELETE)
- `admin` in RESERVED set in middleware ✅ (was already there)

---

## Known Issues / Decisions

| Issue | Decision |
|-------|----------|
| `user_id` in `links` table | Made nullable — anonymous users can create 1 link |
| Dashboard data | Real Supabase data — fully wired up |
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
