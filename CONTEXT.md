# Linktree Clone — Project Context

> Stable reference for what this project is, how it is built, and the rules that keep it consistent.
> For live status, decisions, and next steps, see [`MEMORY.md`](./MEMORY.md).
> `AGENTS.md` is auto-managed by `next dev` (Next.js agent rules) — do not hand-edit it; add project notes here instead.

## 1. What we are building

A full, working replica of **Linktree** (`linktr.ee`) as a self-hosted SaaS clone, not a single landing page.

Scope:

- Marketing site that closely reproduces Linktree's public homepage, pricing, discover, and footer/nav.
- Auth: register, login, logout, session persistence.
- Admin dashboard with the real Linktree information architecture.
- Link editor, header editor, design editor with live preview.
- Insights (analytics), Audience (contacts), Earn (products/sales), Account/Settings, Tools.
- Public link-in-bio profiles at `/[username]`, with themes, social icons, click/view tracking, QR codes.
- Tools: link shortener (functional), business cards, social planner, Instagram auto-reply, post ideas.

**Branding:** the user explicitly asked for exact Linktree branding — name, logo, colors, and copy. This is an intentional clone for the user's own use; keep the Linktree wordmark/visual language faithful. Do not copy third-party photos/assets that we cannot recreate; use original CSS phone/art mockups instead.

**Do not make changes in the user's real Linktree account.** Recon was read-only. The clone lives entirely in this repo.

## 2. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16.4.6 (App Router, Turbopack) | Cache Components enabled |
| UI | React 19.3.0 | Server Components by default |
| Styling | Tailwind CSS 4.3.3 (`@import "tailwindcss"`, `@theme`) | No tailwind.config file |
| Language | TypeScript 5 | Strict mode |
| Database | SQLite via Node 25 built-in `node:sqlite` (`DatabaseSync`) | No native dependency |
| Auth | Custom cookie sessions + scrypt | Cookie name `lt_session` |
| Icons | `lucide-react`, plus hand-written brand SVGs | |
| QR | `qrcode` | Server-side PNG generation |
| Fonts | `next/font/google`: DM Sans, Space Grotesk, Fraunces | CSS vars |

Requirements: **Node 22+** (25.2.1 currently installed) because of `node:sqlite`.

## 3. Commands

```powershell
cd D:\linktree-clone
npm run dev        # http://localhost:3000
npm run build
npx tsc --noEmit   # typecheck without a full build
npm run lint
```

The SQLite file is created lazily at `data/linktree.db` (WAL mode) on first DB access and seeded if empty. Delete `data/` to reset the database.

## 4. Architecture

```
src/
  app/
    layout.tsx            # root layout, fonts, metadata, `export const instant = false`
    globals.css           # Tailwind v4 theme tokens, keyframes, helpers
    page.tsx              # marketing homepage (currently create-next-app default — TODO)
    actions.ts            # all server actions ("use server")
    ...
  components/
    ui/                   # Button, Form, Modal, Logo, Avatar, PlatformIcon
    site/                 # marketing header/footer/sections (TODO)
    profile/              # themed public profile renderer (TODO)
    admin/                # admin shell + editors (TODO)
  lib/
    db.ts                 # schema + seed
    data.ts               # query helpers, analytics, validation helpers
    auth.ts               # session cookie helpers, requireUser()
    password.ts           # scrypt hash/verify
    themes.ts             # themes, fonts, button/corner styles, plan definitions
    types.ts              # shared row/type definitions
```

### Server vs client

- Pages/layouts are Server Components; read DB via `src/lib/data.ts` and `src/lib/auth.ts`.
- Interactive parts (modals, editors, auth forms, toggles) are Client Components using `"use client"`.
- Server Actions live in `src/app/actions.ts`; import them directly into client components. They call `revalidatePath` after mutations.
- Never import `src/lib/db.ts` or `src/lib/auth.ts` into client code. `auth.ts` imports `server-only`.

### Next.js 16 specifics (important)

- `cookies()`, `headers()`, `params`, and `searchParams` are **async**. Always `await`.
- `cacheComponents: true` + `partialPrefetching: true` are enabled in `next.config.ts`.
- Root layout sets `export const instant = false`, but that opt-out does **not** propagate to descendant segments. Each admin `page.tsx`/`layout.tsx` repeats it. Do not remove without adding Suspense/caching boundaries.
- Route handlers: dynamic segments' `params` is a Promise.
- Server Actions used with `<form action={fn}>` are fine; forms with validation state use `useActionState`.
- `redirect()` throws — call it outside try/catch or rethrow.
- Keep `"use server"` at the top of `actions.ts`; all exports must be async functions.

## 5. Data model (`src/lib/db.ts`)

Tables (all created with `CREATE TABLE IF NOT EXISTS`):

- `users` — `id, email UNIQUE, password_hash, username UNIQUE NOCASE, name, bio, avatar, plan, theme, button_style, corner_style, font, layout, title_style, wallpaper, show_footer, created_at`
- `links` — `id, user_id → users, title, url, type ('link' | 'featured'), position, visible, thumbnail, created_at`
- `socials` — `id, user_id, platform, url, position`
- `views` — `id, user_id, created_at, referrer, country`
- `clicks` — `id, link_id, user_id, created_at, referrer`
- `contacts` — `id, user_id, name, email, source, created_at`
- `products` — `id, user_id, name, description, price_cents, sales, created_at`
- `short_links` — `id, user_id, code UNIQUE, target, clicks, created_at`
- `sessions` — `token PK, user_id, expires_at`

Seed data (runs only when `users` is empty):

- Demo account: **`demo@linktr.ee` / `demo1234`**, username `demo`, Pro plan, 6 links, 4 socials, contacts, products, a short link, and 14 days of seeded views/clicks.
- Six public profiles: `mayachen`, `jordanbeats`, `studionine`, `nova`, `eatwithsam`, `filmclub` (all password `demo1234`, though only `demo` is intended for login).
- All seeded users and the demo password live in `db.ts`. Keep usernames synchronized with `RESERVED_USERNAMES` in `data.ts`.

`src/lib/data.ts` provides: user lookups, links/socials/contacts/products/short links, counts, 7/14/30-day analytics (`getAnalytics`, `getTopLinks`, `getReferrers`), setup checklist, discover profiles, platform stats, `normalizeUrl`, `cleanUsername`, `RESERVED_USERNAMES`.

## 6. Auth

- Register: validate email/password (8+ chars)/username (3+, not reserved, unique), hash with scrypt, insert, create session, `redirect('/admin')`.
- Login: accepts email **or** username; verifies scrypt hash; creates session (`lt_session`, httpOnly, sameSite=lax, 30 days).
- `requireUser()` in `lib/auth.ts` calls `await connection()` (session + current-time reads must happen per request), then redirects to `/login` when unauthenticated. Use it in admin layouts and any protected server action.
- `logoutAction` clears the DB session and cookie.
- Sessions are stored in SQLite and validated against `expires_at`.

## 7. Design system

Tokens are defined in `src/app/globals.css` under `@theme`:

| Token | Hex | Use |
| --- | --- | --- |
| `chartreuse` | `#D2E823` | Linktree primary accent, hero |
| `shade` | `#1E2330` | Primary text / dark surfaces |
| `shade-soft` | `#394154` | Secondary dark |
| `forest` | `#254F1A` | Dark green accent |
| `cobalt` | `#2665D6` | Blue feature band |
| `oxblood` | `#780016` | Deep red feature band |
| `sage` | `#E8EFD6` | Light green feature band |
| `chalk` | `#F3F3F1` | Page background |
| `blush` | `#E9C0E9` | Pink accent |
| `grape` | `#502274` | Purple CTAs / premium |
| `grape-deep` | `#3D1A5A` | Hover |
| `lilac` / `violet` | `#D9C7FF` / `#7B2CBF` | Purple accents |
| `coral` | `#FF7A59` | Warm accent |

- Body font: **DM Sans** (`--font-sans`). Display headings use DM Sans at 700–800, tight tracking. Space Grotesk and Fraunces are available as profile fonts.
- Marketing style: full-bleed color bands, oversized headings, pill buttons, black/white controls, rounded cards, subtle grain via `.grain`.
- Admin style: `chalk` page background, white rounded-2xl cards, subtle borders, purple primary actions, dense 13–14px UI text.
- Shared classes: `focus-ring`, `hide-scrollbar`, `phone-shadow`, `grain`, `tabular`, `text-balance`.
- Reusable UI:
  - `Button` / `ButtonLink` — variants primary/dark/outline/ghost/chartreuse/white/cobalt, sizes sm/md/lg.
  - `Form.tsx` — `Field`, `Input`, `Textarea`, `Select`, `Switch`, `inputClass`, `textareaClass`, `selectClass`.
  - `Modal.tsx` — client dialog with Escape/scroll lock, sizes sm/md/lg.
  - `Logo` — official Linktree wordmark SVG (recovered from live site) + `StarMark`.
  - `Avatar` — deterministic gradient avatars with initials.
  - `PlatformIcon` / `PlatformBadge` — 17 brand glyphs.

## 8. Route map

Marketing/public:

| Route | Purpose | Rendering |
| --- | --- | --- |
| `/` | Marketing homepage | Static |
| `/pricing` | Plans (Free/Starter/Pro/Premium) | Static |
| `/discover` | Public profile directory | Dynamic (`connection()`) |
| `/checkout` | Stripe Checkout simulation/redirect | Dynamic |
| `/login`, `/register` | Auth | Static shell + action |
| `/[username]` | Public profile | Partial prerender (per-request tracking) |
| `/s/[code]` | Short-link redirect | Dynamic |
| `/api/click/[id]` | Track click + redirect | Dynamic |
| `/api/view` | Track profile view | Dynamic |
| `/api/qr` | QR PNG | Dynamic |
| `/api/upload` | Local avatar/image upload | Dynamic |
| `/api/stripe/webhook` | Stripe subscription events | Dynamic |
| `/api/analytics/export` | CSV export | Dynamic |

Admin (real Linktree IA; shell types in parentheses):

| Route | Purpose | Shell |
| --- | --- | --- |
| `/admin` | Dashboard: greeting, profile, weekly visitors, checklist, AI chat | Sidebar |
| `/admin/links` | Link editor + Add link modal + social icons | Editor rail |
| `/admin/header` | Layout, avatar, title, bio, title style | Editor rail |
| `/admin/design` | Theme, wallpaper, buttons, text, colors, footer | Editor rail |
| `/admin/insights` | Stats, chart, top links, referrers | Sidebar |
| `/admin/audience` | Contacts table, add contact | Sidebar |
| `/admin/earn` | Products, sales, payouts | Sidebar |
| `/admin/account` | Personal, password, plan, privacy, delete | Sidebar |
| `/admin/media-kit` | Media kit | Sidebar |
| `/admin/messaging` | Inbox mock | Sidebar |
| `/admin/business-cards` | Business card + QR | Sidebar |
| `/admin/social-planner` | Content calendar | Sidebar |
| `/admin/igdm` | Instagram auto-reply flow | Sidebar |
| `/admin/link-shortener` | Short link CRUD (functional) | Sidebar |
| `/admin/post-ideas` | Content idea generator | Sidebar |

Admin layout split (shipped):

- `src/app/admin/layout.tsx` — `<Suspense>`-wrapped auth gate (`requireUser()` → `connection()`) with a sidebar skeleton fallback.
- `src/app/admin/(app)/layout.tsx` — full sidebar shell (dashboard, insights, audience, earn, account, tools).
- `src/app/admin/(editor)/layout.tsx` — icon rail shell with profile chip + Preview/Share (links, header, design).
- Every admin `page.tsx`/`layout.tsx` exports `instant = false`; the root opt-out does not inherit into descendants.

## 9. Themes and plans (`src/lib/themes.ts`)

- 10 profile themes: `chartreuse`, `midnight`, `ocean`, `sunset`, `bubblegum`, `forest`, `lavender`, `chalk`, `cherry`, `paper`. Each defines background, text, muted, button colors, border, accent, swatches, `dark`, and is consumed by `getTheme(id)`.
- Fonts: `dm-sans`, `space`, `fraunces` (`fontFamily()`).
- Button styles: `solid`, `outline`, `glass`.
- Corners: `rounded` (14px), `pill` (999px), `square` (4px).
- Wallpapers: `fill`, `gradient`, `dots`.
- Plans: Free $0, Starter $3 (annual)/$5 monthly, Pro $6/$9 (highlighted, 7-day trial), Premium $15/$20. `planName()` helper.

## 10. Conventions / guardrails

- Keep marketing copy in the Linktree voice. Preserve exact known copy where captured ("A link in bio built for you.", "Everything you are, in one simple link", etc.).
- Prefer Server Components; add `"use client"` only for interactivity. Don't import DB/auth into client files.
- Call `revalidatePath` in every mutating action (helper `refreshProfile(username)` exists for profile/editor changes).
- Ownership checks are mandatory on every mutation: SQL must include `AND user_id = ?` (or verify ownership first).
- Normalize URLs with `normalizeUrl` / the same logic already in actions; reject invalid URLs.
- Escape user text via React automatically; never use `dangerouslySetInnerHTML` with user content.
- Admin URLs should mirror real Linktree. Media kit, messaging, tools pages are new but fit the IA.
- Public profile links must go through `/api/click/[id]` for analytics; add `target` handling and open externally.
- Use `next/link` internally, plain `<a>` for external/tracking routes.
- Use `next/image` for local images if any; CSS mockups are preferred over stock photos.
- Keep files small and colocated; components under `src/components/{ui,site,admin,profile}`, data helpers in `src/lib`.
- Formatting: 2-space indent, double quotes, semicolons; Tailwind utility-first with occasional shared classes for repeated styles.

## 11. Environment

- `NEXT_PUBLIC_APP_URL` — optional; defaults to `http://localhost:3000` for metadata/QR. Set to the deployed origin when hosting.
- No other env vars required. Payments/AI/payouts are mocked; no external API keys.
- SQLite data is local and disposable.

## 12. Known gaps / risks

- `/discover` is dynamic request-time via `connection()`.
- Link reordering supports both desktop/touch drag-and-drop and accessible up/down controls.
- Avatars can be uploaded directly via `/api/upload` (stored in `public/uploads/`) or specified via URL.
- Stripe checkout integration lives at `/checkout` with official API session generation fallback when `STRIPE_SECRET_KEY` is provided, and `/api/stripe/webhook` for subscription events.
- The clone's public profiles use the standard Linktree link-list layout; the real `linktr.ee/linktr.ee` profile has a custom rich layout that we are not replicating.
- Photos from the live marketing site are proprietary; use original CSS/gradient mockups instead.
- `node:sqlite` prints an experimental warning; this is expected on Node 25.
- Turbopack + Tailwind v4 uses the custom loader rule in `next.config.ts`; don't replace it with a `postcss.config` without verifying the build.
- Git repository initialized on `master` branch.

## 13. Recon reference (read-only)

The real admin was explored while logged in as the user's account `prakashwk23`. Observed shells:

- Sidebar: `My Linktree`, `Earn`, `Media kit`, `Audience`, `Insights`, `Messaging`, `Tools` (Business cards, Social planner, Instagram auto-reply, Link shortener, Post ideas), `Settings`, setup checklist (50%, 3 of 6), AI chat panel ("Ask Linktree").
- Editor rail: profile chip, `Preview`, `Share`; icons for `Content`, `Header`, `Design`, settings. Header editor has Classic/Hero/Banner/Cutout/Shape layouts, title 0/30, bio 0/160, Text/Logo title style. Design has Theme/Customize, Wallpaper (Pro), Buttons (Pro), Text (Pro), Colors (Pro), Stickers, Footer.
- Add link modal: tiles Collection, Link, Product, Form; categories Suggested, Commerce, Social, Media, Contact, Events, Text, View all; suggested apps Messaging, Instagram, TikTok, Image gallery.

Use this as the source of truth for IA and labels.

## 14. Resume protocol

1. Read `MEMORY.md` for current status.
2. `cd D:\linktree-clone`, check `git status` (repo currently not initialized), run `npx tsc --noEmit` before and after changes.
3. Continue from the first unchecked item in `MEMORY.md` → "Next steps".
4. Verify the affected flow in the browser (`npm run dev`) and update `MEMORY.md` with what changed and any new blockers.
