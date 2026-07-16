# J2z.com — Project Guide for Codex

**Domain:** j2z.com (owned by user)
**GitHub:** https://github.com/xFai9al/j2z
**Vercel:** https://j2z-zeta.vercel.app
**Owner:** Faisal (no coding experience — relies fully on Codex)
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

### Session 15 — Landing Redesign + Bio Competitive Features
- Ran redesign-skill audit against 2026 design trends (Figma/SaaSFrame/line25/MockFlow research) on the landing page. Kept the coral/paper brand (already distinctive, not an AI tell) and fixed the real generic patterns: everything was perfectly centered/symmetric, zero motion anywhere, 3x repeated uppercase pill badges, coral+sage competing as two full accent colors.
  - `src/app/page.tsx`: asymmetric offset hero glow, `Reveal` component (IntersectionObserver scroll-reveal for below-fold sections, respects `prefers-reduced-motion`), kicker-style section tags (dash + label, no pill bg), bio section background consolidated to a warm cream gradient instead of a full sage wash, `.grain-overlay` (barely-there paper texture), `text-wrap:balance` on headlines.
  - `src/app/auth/page.tsx`: already well-executed (split-screen, off-center glow already present) — only added `text-wrap:balance`, restraint over adding unneeded effects.
  - Dashboard/admin audited and left mostly as-is — functional app screens already polished in prior sessions, no genuine AI-tells found (`redesign-skill`'s own guidance: dense/utility screens don't need marketing-page treatment).
- Ran `/office-hours`-style competitive research on Linktree/Beacons/AstroLink/Carrd (bio-link market) to find a real competitive wedge for j2z's bio pages. Findings: competitors charge 9–12% transaction fees even on paid tiers below $30/mo — j2z's "free forever, 0%" is a real, under-marketed advantage. Biggest actual feature gaps: no featured/pinned link, no link favicons, no per-link click analytics (bio_links had zero click tracking — external links bypassed j2z entirely), no font choice, no email capture. Full monetization/storefront (Beacons' edge) explicitly scoped out — multi-week project, wrong size for this project.
- Shipped the "light" + "medium" tier fixes from that research:
  - **Featured link**: `bio_links.is_featured` (one per page, enforced server-side by unfeaturing siblings on set) — renders as a larger card above the regular link list.
  - **Per-link click tracking (new capability — didn't exist before)**: `bio_links.clicks` counter + `increment_bio_link_clicks` RPC + new `POST /api/bio/click` (public), fired via `navigator.sendBeacon` from a new `TrackedLink` client component wrapping both social icons and custom link buttons on the public bio page. Dashboard now shows a click count per link.
  - **Auto favicons**: `https://www.google.com/s2/favicons` lookup by hostname, no schema/API needed — pure presentational addition in `[username]/page.tsx`.
  - **Tip jar**: added as a 17th entry in `src/lib/platforms.ts` (heart icon) — reuses the existing platform-picker UI entirely, zero new code paths.
  - **Font pairing**: `bio_pages.font_pairing` + new `src/lib/bio-fonts.ts` (4 curated pairs: Classic/Editorial/Bold/Mono), picker UI in dashboard, dynamic Google Fonts `@import` on the public page.
  - **Email capture**: `bio_pages.collect_emails` toggle + new `bio_subscribers` table + `POST /api/bio/subscribe` (public) + `GET /api/bio/subscribers` (authed) + new `EmailCaptureForm` client component on the public page + CSV export button in dashboard.
  - Fixed a pre-existing dashboard bug in the same area: the "Your links" editor list rendered social/platform links too (duplicated with the separate "Social links" chip list below it) — now correctly filtered to custom links only.
- Created `supabase/schema-additions-v4.sql` — **user must run this before merging/deploying**: adds `bio_links.clicks`/`is_featured`, `bio_pages.font_pairing`/`collect_emails`, the `bio_subscribers` table, and the `increment_bio_link_clicks` RPC. Same deploy-order risk as v3: without this migration, `[username]/page.tsx` and the dashboard bio tab select columns that don't exist yet and will 400.
- Build passes clean (`npm run build` ✓). Not yet tested against a live published bio page (needs the migration run first, then manual QA: feature a link, click a social icon and confirm the count increments, toggle email capture and submit a test email, switch font pairings).

### Session 14 — Hardening Pass (anon rate limiting, multi-admin, bio field caps)
- Ran `/office-hours` (builder mode) — full-codebase audit found 3 real gaps: `anon_usage` table unused (no rate limiting), admin access hardcoded to one email in 3 places, bio fields had no length caps. Design doc went through 3 rounds of adversarial review (9/10) before implementation — caught a factual error (anon QR "abuse" doesn't exist, `/api/qr` is already auth-gated) before it shipped.
- ✅ Created `supabase/schema-additions-v3.sql` — **user must run this in Supabase SQL editor**:
  - `admin_users` table (flat allowlist), seeds Faisal's existing account by email
  - `anon_usage` gets a `usage_date` column + composite PK `(ip_hash, usage_date)` so daily limits actually reset
  - CHECK constraints on `bio_pages.display_name` (60) / `.bio` (160) / `.bg_image_url` (500) / `.avatar_url` (500)
- ✅ Created `src/lib/anon-limit.ts` — `checkAnonLinkLimit()`, 1 link/day per IP hash (sha256, salted with service role key), wired into `src/app/api/shorten/route.ts` only (`/api/qr` is already auth-gated, no anon path exists there)
- ✅ Created `src/lib/admin.ts` — `isAdmin()` helper against `admin_users`, replaces hardcoded `ADMIN_EMAIL` in `src/app/api/admin/stats/route.ts`, `src/app/api/admin/blocklist/route.ts`
- ✅ Created `src/app/api/admin/me/route.ts` — `GET` returns `{ isAdmin }`, used by `src/app/admin/page.tsx` client-side check instead of duplicating the hardcoded email a third time
- ✅ Added `maxLength` hints (60/160/500) to the bio dashboard's display name, tagline, background image URL, and avatar URL inputs — client-side hint only, the DB CHECK constraint is the real gate
- ✅ Build passes clean (`npm run build` ✓)
- ⚠️ **Not yet tested against a live Supabase instance** — schema-additions-v3.sql needs to be run before this branch is merged, then manually verify: anon link limit blocks after 1/day, admin panel access works via `admin_users` row, over-length bio field rejected by DB

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

### Session 16 — SEO Audit Fixes
- Ran `/marketing-skills:seo-audit` (static-analysis only, pre-launch, no GSC data). Found: no `public/` dir at all → `robots.txt` missing, `sitemap.xml` missing, `og.png` referenced in `layout.tsx` metadata but 404'd. Also no `metadataBase`, and `dashboard`/`auth`/`admin` (all `'use client'`, can't export metadata) had no `noindex`.
- ✅ Added `metadataBase: new URL('https://j2z.com')` to `src/app/layout.tsx`
- ✅ Created `src/app/opengraph-image.tsx` — dynamic OG image via `next/og` `ImageResponse` (edge runtime, brand SVG logo + wordmark), replaces the broken static `og.png` reference; removed manual `images` fields from `layout.tsx` metadata (file convention auto-injects)
- ✅ Created `src/app/robots.ts` — allows `/`, disallows `/dashboard`, `/auth`, `/admin`, `/api`; points to sitemap
- ✅ Created `src/app/sitemap.ts` — static routes (`/`, `/terms`, `/privacy`) + all published `bio_pages` usernames queried from Supabase (anon key, RLS-gated to `is_published = true`)
- ✅ Added thin server `layout.tsx` (metadata-only, `robots: {index:false,follow:false}`) to `src/app/dashboard/`, `src/app/auth/`, `src/app/admin/` — none of these three had a layout before; page.tsx files untouched (still client components)
- ✅ `npm run build` passes clean — `/robots.txt` and `/sitemap.xml` prerender static, `/opengraph-image` is edge/dynamic as expected
- Not yet verified: OG image render at actual `j2z.com/opengraph-image` in production (Vercel edge), sitemap output once real bio pages are published

### Session 22 — slop.md Design System Pass
- ✅ Read and applied the complete global `pols.dev/slop.md` anti-slop design law across the product UI.
- ✅ Landing page redesigned around a product-first asymmetric composition: the real shortener is the hero artifact, the fold is fully composed, and fake/unverified stats were removed from view.
- ✅ Removed visible generic patterns: hero pill, kicker labels/ticks, entrance content hiding, radial glow blobs, candy CTA gradient, broad card shadows, hover lifts, rounded-everything styling, and decorative stat accent bars.
- ✅ Established one coherent visual language: warm printed-paper surface, deep ink, quiet tonal coral, square/chamfer-like geometry, terse labels, and restrained directional depth.
- ✅ QR, bio, comparison, FAQ, CTA, and footer sections now use distinct compositions rather than repeating label-over-heading/card templates.
- ✅ Auth page redesigned with architectural split composition, bare benefit icons, a bespoke route rail, tonal controls, and no icon tiles/hover boops.
- ✅ Dashboard/admin cleaned into utility-first interfaces: removed decorative card chrome, stat accent bars, generic shadows/lifts, and replaced the header sun/moon toggle with a single contrast glyph.
- ✅ Public bio pages retain user customization but no longer default to glow, entrance hiding, hover lift/scale, or fixed-background behavior.
- ✅ Error/404 hover boops removed. Development CSP now permits React's dev-only eval while production CSP remains strict.
- ✅ Browser QA: desktop landing/auth visually inspected; 390px mobile landing/auth inspected; horizontal overflow fixed; auth marketing panel correctly hidden on mobile; language toggle and FAQ interaction verified by real clicks; RTL confirmed.
- ✅ Verification: `npm run build` ✓, TypeScript ✓, ESLint ✓, Vitest 3/3 ✓, `git diff --check` ✓.

### Session 21 — Technical Audit Remediation
- ✅ Upgraded production stack to Next.js 16.2.10 + React 19.2 and migrated middleware to the Next 16 `proxy.ts` convention.
- ✅ Upgraded ESLint to v9 with flat config, added Vitest, and added the first automated URL/slug utility tests.
- ✅ `npm audit --omit=dev` now reports 0 vulnerabilities (PostCSS/ws secured with package overrides).
- ✅ Added a server-only Supabase admin client; removed unsafe anon-key fallbacks from all privileged server routes.
- ✅ Added `supabase/migrations/202607160001_security_hardening.sql`: removes public profile/link/QR reads, protects analytics views, restricts privileged RPCs to `service_role`, and adds atomic API rate limiting.
- ✅ Updated `supabase/schema.sql` to be a complete fresh-install schema for current bio/admin/subscriber/rate-limit features.
- ✅ Anonymous link limiting is now atomic and fail-closed; bio click and subscriber endpoints now have per-IP rate limits.
- ✅ Account deletion now permanently deletes the Supabase Auth user and cascaded data instead of only deactivating content.
- ✅ Added API error handling/rollback for key dashboard delete/update actions and settings/account operations.
- ✅ Fixed social-link creation bug where the selected platform was cleared before the API request.
- ✅ Removed nested `<html>/<body>` from public bio and 404 content; made animated profile links visible by default.
- ✅ Added Content Security Policy and HSTS headers.
- ✅ Verification: TypeScript ✓, ESLint ✓, Vitest 3/3 ✓, production build ✓, npm audit 0 vulnerabilities ✓.
- ✅ User applied `supabase/migrations/202607160001_security_hardening.sql` to the live Supabase database on 2026-07-17.

### Session 20 — Full Technical and Code Audit
- ✅ Audited the full Next.js/Supabase application: architecture, API routes, auth, RLS/schema, security, performance, SEO, UX, maintainability, deployment readiness, and dependencies.
- ✅ Production build passes. Build reports one React Hook dependency warning and four `<img>` performance warnings.
- ⚠️ Critical privacy issue found: `profiles_public_username` exposes full profile rows (including email) for profiles with usernames.
- ⚠️ Active link/QR RLS policies expose destination URLs through the Supabase Data API; public resolution should use a narrow RPC/server path instead.
- ⚠️ `npm audit --omit=dev` reports 3 production vulnerabilities (2 high, 1 moderate), primarily the old Next.js 14 line plus `ws`/bundled PostCSS.
- ⚠️ No automated tests exist; dashboard is a 1,712-line component; SQL source-of-truth is fragmented across manual schema-additions files and `schema.sql` is not a complete fresh-install schema.
- ⚠️ Public click/email endpoints lack meaningful abuse protection; anonymous daily limiting is non-atomic and can be bypassed by races or failed database writes.
- ⚠️ Account deletion endpoint only deactivates content and signs out; it does not delete the account despite its name/UI intent.
- ✅ No application fixes were applied during this audit; findings and remediation priorities were reported to the user.

### Session 19 — Codex Global Design Instructions
- ✅ Reviewed and installed `https://pols.dev/slop.md` into the global `~/.codex/AGENTS.md` file.
- ✅ Installation is duplicate-safe; no application source files were changed.

### Session 18 — Full Code Review + Bug Fix Pass
Full review of all API routes, middleware, lib, and public pages. Found and fixed 10 real bugs:
- ✅ **URL blocklist enforced** (was a dead feature — admin managed it but nothing checked it): new `src/lib/blocklist.ts` (`isUrlBlocked`, handles domain/keyword/regex pattern types), wired into `/api/shorten` POST, `/api/qr` POST, `/api/links/[id]` PATCH, `/api/qr/[id]` PATCH, `/api/bio/links` POST, `/api/bio/links/[id]` PATCH → all return 403 "This URL is not allowed"
- ✅ **Stored XSS fixed**: `/api/bio` PATCH previously accepted arbitrary strings for `accent_color`/`background_color`/`button_color`/`button_text_color`/`bg_image_url`/`button_style`/`font_pairing`, which `[username]/page.tsx` interpolated raw into `<style dangerouslySetInnerHTML>` (a `</style><script>` payload was possible). Now: hex-color regex validation, button_style/font_pairing whitelists, URL fields must be http(s) ≤500 chars, display_name/bio length caps. Defense-in-depth: `[username]/page.tsx` also sanitizes (`safeColor`/`safeCssUrl`) at render for pre-existing bad rows
- ✅ **Custom alias validation** in `/api/shorten`: rejects RESERVED words (e.g. `dashboard` — created fine before but never resolved) and now checks collisions against `qr_codes.slug` and `bio_pages.username` too (bio wins in middleware, so a link shadowed by a bio username was unreachable)
- ✅ **clicks RLS policy bug**: `bio_link` clicks store `bio_links.id` in `resource_id`, but the policy compared against `bio_pages.id` → owners could never see bio-link clicks in `/api/analytics`. Fixed in `supabase/schema.sql` + created `supabase/schema-additions-v5.sql` — **user must run v5 in Supabase SQL editor**
- ✅ **Middleware click-tracking fallback never executed**: the `clicks` insert inside the `.then()` error handler was a PostgREST builder that was never awaited → query never fired. Added `.then(() => {})` to execute it
- ✅ **301 → 302 for link/QR redirects**: destinations are editable via PATCH, but browsers cache 301 permanently — edits never applied for repeat visitors. CDN cache header (5 min) kept
- ✅ **QR slug collision** (`qr-` + 4 chars): 23505 now retried once with a fresh slug instead of returning 500
- ✅ **Auth callback open-redirect guard**: `?next=` must start with `/` and not `//`, else falls back to `/dashboard`
- ✅ **Dashboard addLink**: removed catch-block that inserted a fake local link on network failure; API errors (409 alias taken / 429 limit / 403 blocked) now shown via alert
- ✅ **Bio link routes hardening**: non-string `title` no longer crashes (500), error copy fixed ("http:// or https://")
- ✅ Verified locally against live Supabase (`npm run start` on scratch port): blocked URL → 403, keyword-blocked subdomain → 403, reserved alias → 400, normal create → 200, second anon create → 429, redirect → 302, unknown slug → `/?notfound=1`. Test link deleted from prod DB afterwards. `npm run build` passes clean
- ⚠️ **Pending: run `supabase/schema-additions-v5.sql` in Supabase SQL editor** (fixes bio-link analytics visibility). Everything else needs no migration
- Known trade-off left as-is: landing page lets anon users try both the shortener and QR tool once each client-side, but the server-side anon limit is 1 link/day total (QR gen on landing also calls `/api/shorten`) — second tool hits 429 with the sign-up message. Working as designed as a signup funnel; raise `DAILY_LINK_LIMIT` in `src/lib/anon-limit.ts` if unwanted
- Noted, not changed: `[username]/page.tsx` renders its own `<html>/<body>` nested inside the root layout's — invalid HTML that browsers tolerate (parser merges attributes). Proper fix = route groups with separate root layouts; deferred as a structural refactor

### Session 17 — AI SEO (llms.txt, FAQ + schema, RESERVED bug fix)
- Ran `/marketing-skills:ai-seo`. Scoped to structural/citation basics for ChatGPT/Perplexity/Codex (Google AI Overviews explicitly need nothing special per Google's own guide — normal E-E-A-T is the Google play, not schema). Skipped multi-page comparison content as too big for this pass.
- Verified the "competitors charge 9–12% fees" claim from Session 15's research note before publishing anything — both Linktree and Beacons pricing pages failed to fetch (404/403), so the copy was softened to unattributed, defensible framing ("many link-in-bio tools take a cut," no named percentage) rather than publishing a stale specific number against named competitors.
- ✅ Added FAQ section to `src/app/page.tsx` (5 Q&A, bilingual EN/AR, native `<details>/<summary>` accordion — accessible, no JS, fully extractable) between the feature-compare section and the final CTA
- ✅ Added `WebApplication` + `FAQPage` JSON-LD schema (`<script type="application/ld+json">` in the page return), sourced from `T.en` directly (not the live `t`/`lang` toggle) so schema always matches the SSR'd default-English HTML regardless of client-side language state
- ✅ Created `public/llms.txt` and `public/pricing.md` — plain-text/markdown context files for AI agents (product summary, 0%-fee guarantee, free-forever facts)
- **Found and fixed a real bug while verifying**: `src/middleware.ts`'s single-segment slug lookup treats any unmatched one-segment path as a bio/link/qr slug and 301s to `/?notfound=1` on no match. `src/lib/constants.ts`'s `RESERVED` set had bare words `'sitemap'`/`'robots'` that don't match the actual served paths `sitemap.xml`/`robots.txt` — meaning **`/robots.txt` and `/sitemap.xml` from Session 16 were silently broken in production since the moment they were added** (redirected to home instead of serving). Fixed `RESERVED` to the exact strings `'sitemap.xml'`, `'robots.txt'`, added `'llms.txt'`, `'pricing.md'`, `'opengraph-image'` (same bug would've hit the Session 16 OG image route too).
- ✅ Verified fix locally: built, ran `npm run start` on a scratch port, curled all 5 routes (`robots.txt`, `sitemap.xml`, `llms.txt`, `pricing.md`, `opengraph-image`) — all return `200` with correct body content (previously would have been silent redirects)
- ✅ `npm run build` passes clean

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

## Coding Principles (Karpathy Skills)

These four principles govern how Codex approaches every coding task in this project.

### 1. Think Before Coding
State assumptions explicitly before writing code. If a request is ambiguous, ask one clarifying question rather than guessing. Surface tradeoffs before implementation begins — not after.

### 2. Simplicity First
Write minimal code that addresses only what was requested. No speculative features, unnecessary abstractions, or edge-case error handling that won't realistically occur. Self-check: would a senior engineer find this overcomplicated?

### 3. Surgical Changes
When modifying existing code, touch only what's necessary. Match the existing style (inline CSS, caveman brevity, bilingual pattern) even if a different approach would be preferred. Do not refactor unrelated sections. Do not remove pre-existing dead code unless asked.

### 4. Goal-Driven Execution
Turn vague requests into verifiable success criteria before starting. "Fix the bio page" → "bio page loads at `/username`, social icons render, button styles apply." Clarify what *done* looks like first.

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
