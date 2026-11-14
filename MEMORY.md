# Linktree Clone — Working Memory

> Living status file. Update it at the end of every work session: what changed, what was verified, current blockers, and the immediate next step.
> Last updated: 2026-11-14

## Snapshot

- **Objective:** full Linktree SaaS replica — marketing, auth, admin, editors, analytics, audience, earn, settings, tools, public profiles.
- **Location:** `D:\linktree-clone` (no git repo yet).
- **Stack:** Next.js 16.4.6 · React 19.3 · Tailwind 4.3.3 · SQLite (`node:sqlite`) · custom cookie auth.
- **Dev URL:** `http://localhost:3000` (`npm run dev`).
- **Demo login:** `demo@linktr.ee` / `demo1234` (username `demo`).
- **Current phase:** feature complete — marketing site, auth, admin dashboard, editors, insights, audience, earn, settings, tools, public profiles, API. Typecheck + production build pass; full admin walk is console-clean.

## Status board

| Area | State | Notes |
| --- | --- | --- |
| Recon (marketing + logged-in admin) | ✅ Done | Full IA/screens mapped; screenshots captured |
| Project scaffold | ✅ Done | Next 16 + TS + Tailwind v4 + Turbopack |
| Dependencies | ✅ Installed | lucide-react, qrcode, @types/qrcode, server-only, @types/node |
| DB schema + seed | ✅ Done | `src/lib/db.ts`; seeded demo + 6 profiles + analytics |
| Data helpers | ✅ Done | `src/lib/data.ts` |
| Auth library | ✅ Done | `src/lib/auth.ts`, `src/lib/password.ts` |
| Server actions | ✅ Done | `src/app/actions.ts` (links, header, design, account, etc.) |
| Themes/plans | ✅ Done | `src/lib/themes.ts` |
| Design tokens | ✅ Done | `src/app/globals.css` |
| Root layout / fonts / metadata | ✅ Done | `instant = false` |
| Shared UI kit | ✅ Done | Button, Form, Modal, Logo, Avatar, PlatformIcon, CopyButton |
| Marketing homepage/site | ✅ Done | Header/footer, homepage, `/pricing`, `/discover`, 404 |
| Auth pages | ✅ Done | `/login`, `/register`, split layout, demo autofill |
| Admin layout/shell | ✅ Done | Sidebar + editor rail, setup checklist, mobile drawer, AI chat |
| Link editor | ✅ Done | Add-link modal, socials, reorder/hide/edit/delete, share/QR |
| Header editor | ✅ Done | Layouts/avatar/title/bio, live phone preview |
| Design editor | ✅ Done | Themes/wallpapers/buttons/fonts/corners/footer, live preview |
| Insights | ✅ Done | 7/14/30 ranges, deltas, chart, top links, referrers, countries, CSV |
| Audience | ✅ Done | Contacts table, search, add contact, CSV export |
| Earn | ✅ Done | Products, revenue summary, recent sales, payout mock |
| Account/settings | ✅ Done | Details, password, plan switch, integrations, delete |
| Tools | ✅ Done | Shortener (real), business cards, planner, IG DM, post ideas |
| Public profile | ✅ Done | `/[username]`, themed layouts, share, view/click tracking |
| API routes | ✅ Done | view/click/qr/export/short-link redirect |
| Pricing / discover | ✅ Done | Plan toggle, comparison, FAQ; searchable profile grid |
| Verification | ✅ Done | `tsc`, `next build`, runtime walk, interaction smoke tests |

## Completed work log

### 1. Recon
- Explored live `linktr.ee` marketing homepage and the logged-in admin (read-only, account `prakashwk23`).
- Captured marketing colors/fonts/copy and section order.
- Mapped admin sidebar: My Linktree, Earn, Media kit, Audience, Insights, Messaging, Tools (Business cards, Social planner, Instagram auto-reply, Link shortener, Post ideas), Settings, setup checklist, AI chat.
- Mapped editor rail: Content / Header / Design / settings; profile chip; Preview; Share.
- Header editor: Classic, Hero, Banner, Cutout, Shape layouts; title 0/30; bio 0/160; Text/Logo title style.
- Design editor: Theme/Customize, Wallpaper (Pro), Buttons (Pro), Text (Pro), Colors (Pro), Stickers, Footer.
- Add-link modal: Collection, Link, Product, Form tiles; categories Suggested, Commerce, Social, Media, Contact, Events, Text, View all; suggested apps Messaging, Instagram, TikTok, Image gallery.
- Captured tokens: chartreuse `#D2E823`, shade `#1E2330`, forest `#254F1A`, cobalt `#2665D6`, oxblood `#780016`, sage `#E8EFD6`, chalk `#F3F3F1`, blush `#E9C0E9`, grape `#502274`.

### 2. Foundation
- Scaffolded app (`create-next-app@latest`), Tailwind v4 via `@tailwindcss/turbopack` loader.
- Installed `lucide-react`, `qrcode`, `@types/qrcode`, `@types/node@latest`, `server-only`.
- `src/lib/types.ts` — Plan/User/Link/Social/Contact/Product/ShortLink/ActionState/AnalyticsPoint/TopLink.
- `src/lib/db.ts` — full schema, WAL, foreign keys, seed.
- `src/lib/data.ts` — queries, analytics, setup progress, discover, normalize/clean helpers, reserved usernames.
- `src/lib/password.ts` — scrypt hash/verify (`salt:hash`).
- `src/lib/auth.ts` — `getCurrentUser`, `requireUser`, `createSession`, `destroySession`, cookie `lt_session`.
- `src/lib/themes.ts` — 10 themes, 3 fonts, 3 button styles, 3 corners, 3 wallpapers, 4 plans.
- `src/app/actions.ts` — register/login/logout; update header/design/account/password; upgrade plan; link CRUD/reorder/toggle; socials; contacts; products; short links; delete account; seed links.
- `src/app/globals.css` — Tailwind v4 `@theme` tokens, keyframes (marquee/float/pop/rise), grain, focus ring, reduced motion.
- `src/app/layout.tsx` — DM Sans + Space Grotesk + Fraunces, metadata, `export const instant = false`.
- Shared UI: `Logo.tsx` (official wordmark SVG + star), `Avatar.tsx`, `PlatformIcon.tsx` (17 platforms), `Button.tsx`, `Form.tsx`, `Modal.tsx`.

### 3. Bug fixes already applied
- Removed a malformed duplicate line in `loginAction`.
- Removed unused `getUserById` import from `actions.ts`.

### 4. Marketing, auth and admin UI
- Marketing: `MarketingHeader`, `MarketingFooter`, homepage (`src/app/page.tsx`), `/pricing` (annual toggle, comparison table, FAQ), `/discover` (searchable/filterable profile grid), global `not-found.tsx`.
- `ProfileBody.tsx`: themed renderer with classic/hero/banner/cutout/shape layouts, wallpapers, button/corner styles, title styles — shared by editors and public page.
- Auth: `(auth)/layout.tsx`, `/login`, `/register`, `LoginForm` demo autofill, `RegisterForm` live username preview.
- Shells: `AdminShell` (sidebar, checklist, mobile drawer, logout), `AdminChat` mock, `EditorShell` (icon rail, share modal with QR).
- Pages: `/admin`, links, header, design, insights, audience, earn, account, link-shortener, business-cards, media-kit, messaging, social-planner, igdm, post-ideas, settings redirect.
- Public/API: `/[username]`, `/api/click/[id]`, `/api/view`, `/api/qr`, `/api/analytics/export`, `/s/[code]`.

### 5. Runtime hardening (Cache Components / Next 16)
- `requireUser()` now calls `await connection()` so session + current-time reads happen at request time, and `/admin/layout.tsx` wraps the auth gate in `<Suspense>` with a shell skeleton.
- Added `export const instant = false` to every admin `page.tsx`/`layout.tsx` (root opt-out does not propagate to descendants).
- Data layer returns plain objects (`plain`/`plainAll`) so null-prototype SQLite rows can cross into Client Components.
- `SocialPlanner` resolves "today" after mount; `AudienceTable` formats dates in UTC — no hydration mismatches.
- Fixed nested `<a>` by giving `Logo` an `href`/`onClick` and using it directly in the admin sidebar.
- Fixed password-form validation reading `password_next`/`password_confirm` instead of `next`/`confirm`.
- Added `data-scroll-behavior="smooth"` to `<html>`.

### 6. Verified runtime behaviour
- All 28 routes build; `tsc --noEmit` clean.
- Admin walk (dashboard + 15 pages): no console errors, no hydration warnings.
- Smoke-tested: add/delete links, header save, design save, insights ranges, analytics/contacts CSV, short-link create/redirect/delete, contact add, account details/password/plan switch, messaging send, IG rule add/delete, post-ideas refresh/save.
- Public profile loads themed, records views, and links route through `/api/click/[id]`.
- Test data cleaned up; demo profile restored to Chartreuse / Classic / DM Sans / Rounded / Pro.

## Decisions log

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | Full SaaS clone (not landing-page only) | User explicitly requested all logged-in features/pages |
| D2 | Next.js + Tailwind + SQLite | User-selected stack |
| D3 | `node:sqlite` instead of better-sqlite3 | Avoid native build deps on Windows |
| D4 | Custom sessions + scrypt | Small dependency-free auth, sufficient for clone |
| D5 | Exact Linktree branding, original CSS mockups for photos | User wants faithful branding; avoid copying proprietary photos |
| D6 | Mirror real admin routes (`/admin/links`, `/admin/header`, …) | Fidelity and predictability |
| D7 | Root `instant = false` | Cache Components would otherwise require Suspense around every cookie/DB read |
| D8 | Single-file server actions module | Simpler imports across admin client components |
| D9 | Public links route through `/api/click/[id]` | Reliable analytics without JS |
| D10 | Marketing homepage uses CSS phone/profile mockups | No licensed assets needed |
| D11 | No git init yet | Scaffold created without a repo; decide with user before committing |
| D12 | `connection()` in `requireUser()` + Suspense gate | Makes admin request-time without tripping `new Date()` prerender checks |
| D13 | `instant = false` on each admin segment | Opt-out does not inherit; admin routes are intentionally blocking |
| D14 | Plain-object mapping in data helpers | `node:sqlite` rows have null prototypes and can't be client props |
| D15 | Client-only date resolution in tools | Prevents server/browser timezone hydration mismatches |

## Next steps (in order)

1. **Production deployment** — deploy to Vercel/host with `NEXT_PUBLIC_APP_URL` and persistent SQLite / Turso / Postgres if hosting remotely.
2. **Additional creator tools** — expand business card export (PDF), interactive mock integrations (e.g. Mailchimp, Shopify).

## Verification checklist

- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean (31 routes)
- [x] `npm run dev` boots without errors
- [x] Register/login/logout works with cookie persistence
- [x] Demo login works (`demo@linktr.ee` / `demo1234`)
- [x] Add/edit/delete/reorder/toggle links persists and reflects on public page
- [x] Header + design edits reflect on public page
- [x] Public profile view/click rows recorded; insights numbers move
- [x] QR route returns a scannable PNG
- [x] Short link create/redirect/delete works and counts clicks
- [x] Account update/password/plan switch work (delete flow present, untested by design)
- [x] 404 for unknown usernames; reserved usernames blocked
- [x] Mobile layouts for marketing, admin, editor, public page (60/60 routes & viewports verified in CDP audit; 0 issues)
- [x] Accessibility audit: focus trap in modals & drawers, ARIA labels on all icon buttons, WCAG AA contrast on tinted text & badges
- [x] Make `/discover` dynamic request-time via `connection()` (new profiles appear immediately)
- [x] Pointer and touch Drag-and-Drop link reordering with drop indicators + keyboard accessibility
- [x] Local image upload pipeline for avatars (`/api/upload` endpoint + file picker in Header editor)
- [x] Stripe checkout integration: `/checkout` page + `/api/stripe/webhook` + plan upgrade link
- [x] Git repository initialized with clean working tree
- [x] No console errors/hydration mismatches on the admin walk
- [x] README/CONTEXT updated with current architecture

## Open questions / watchouts

- Public profile link behavior: same-tab navigation vs new tab. Current plan: same tab via tracking route.
- Whether to add drag-and-drop reorder or up/down controls. Plan: drag with a fallback "move up/down" for accessibility/mobile.
- Upgrade/payments are mocked (no Stripe). Keep copy honest within the clone.
- Tools (planner, IG auto-reply, post ideas) will be interactive mocks; shortener is real.
- Media kit/messaging are invented but consistent with real Linktree IA.
- No git repo; do not initialize/commit without asking the user.
- Do not touch the user's real Linktree account.

## Session log

### 2026-11-14 — Foundation
- Finished data layer, auth, actions, tokens, root layout, shared UI primitives.
- Added `Button`, `Form`, `Modal` components.
- Created `CONTEXT.md` and this `MEMORY.md`.
- Next: marketing shell and homepage.

### 2026-11-14 — Full build + runtime hardening
- Built marketing site, auth, admin shell/pages, editors, tools, public profiles, APIs.
- Fixed Cache Components blocking-current-time errors with `connection()` + Suspense + per-segment `instant = false`.
- Fixed null-prototype SQLite rows crossing into Client Components.
- Fixed nested anchor in sidebar, planner hydration, audience date formatting, password form validation.
- Verified every admin page and key interaction in the browser with zero console errors; production build passes.
- Next: responsive/accessibility pass, optional polish (dynamic discover, drag-and-drop, uploads, Stripe).

### 2026-11-14 — Responsive pass & mobile audit
- Fixed 150px horizontal overflow on `/admin/post-ideas` at 375px (`src/components/admin/PostIdeas.tsx`, `src/app/admin/(app)/post-ideas/page.tsx`).
- Added `min-w-0` to `<main>` in `AdminShell.tsx` to guard against nested grid/flex min-content expansion.
- Verified mobile navigation drawer open/close and keyboard escape handling via CDP.
- Executed full 60-run responsive CDP audit (20 routes across 375, 768, 1440 px viewports) with 0 issues reported in `artifacts/responsive-report.json`.
- Typecheck (`npx tsc --noEmit`) and production build (`npm run build`) pass cleanly.

### 2026-11-14 — Accessibility pass (A11y)
- Enhanced focus management in `src/components/admin/AdminShell.tsx` mobile drawer: added Tab/Shift+Tab cycle trap and focus restoration.
- Ensured dialog role semantics in `src/components/ui/Modal.tsx` (`aria-label={title || "Dialog"}`).
- Audited all icon-only buttons across admin, site, and profile components (`LinkEditor.tsx`, `ShortLinkManager.tsx`, `EarnManager.tsx`, `Inbox.tsx`, `AdminChat.tsx`); ensured explicit `aria-label` / accessible names.
- Added `role="alert"` on form error messages in `src/components/ui/Form.tsx` for screen-reader live announcements.
- Improved color contrast ratios (WCAG AA): increased text contrast on subtle text (`text-shade/30`, `text-shade/35` -> `text-shade/50`-`text-shade/60`) in `AudienceTable.tsx`, `BarChart.tsx`, `DiscoverGrid.tsx`, `ShortLinkManager.tsx`, `LinkEditor.tsx`, `AdminShell.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, and `Form.tsx`.
- Typecheck (`npx tsc --noEmit`) and production build (`npm run build`, 28 routes) pass cleanly.

### 2026-11-14 — Product polish & Git initialization
- **Dynamic `/discover`**: Converted to dynamic request-time route with `connection()` so new creator profiles appear instantly without rebuild.
- **Drag-and-Drop link reordering**: Added desktop HTML5 drag & drop and touch gesture reordering with visual drag-over indicators in `LinkEditor.tsx`, keeping accessible keyboard move buttons.
- **Avatar upload pipeline**: Created `/api/upload` route with auth, MIME validation, and local disk persistence to `public/uploads/`; integrated file upload button & preview into `HeaderEditor.tsx`.
- **Stripe checkout integration**: Built interactive `/checkout` page with plan details and test mode card form; created `src/lib/stripe.ts` with API session generation fallback and `/api/stripe/webhook` for subscription lifecycle events.
- **Git initialized**: `.gitignore` updated (ignoring SQLite journals and uploaded user files); initialized repository and created initial commit `6db27c6` with clean working tree.
- **Build verification**: 31 routes pass production build; `npx tsc --noEmit` clean.

## Quick file index

| File | Purpose |
| --- | --- |
| `src/lib/db.ts` | Schema + seed (demo account and public profiles) |
| `src/lib/data.ts` | Query helpers + analytics + validation |
| `src/lib/auth.ts` | Session cookie helpers (`lt_session`) |
| `src/lib/password.ts` | scrypt hash/verify |
| `src/lib/themes.ts` | Themes/fonts/button/corner styles/plans |
| `src/lib/types.ts` | Shared types |
| `src/app/actions.ts` | All server actions |
| `src/app/globals.css` | Tailwind v4 tokens, animations, helpers |
| `src/app/layout.tsx` | Fonts, metadata, `instant = false` |
| `src/components/ui/*` | Button, Form, Modal, Logo, Avatar, PlatformIcon |
| `src/components/profile/ProfileBody.tsx` | Themed public-profile renderer |
| `src/components/admin/*` | Shells, editors, tables, charts, tool UIs |
| `src/components/site/*` | Marketing header/footer, pricing, discover grid, phone |
| `src/app/admin/layout.tsx` | Suspense auth gate + admin loading shell |
| `src/app/[username]/page.tsx` | Public profile + metadata + tracking |
| `src/app/api/*`, `src/app/s/[code]` | Click/view/QR/CSV/short-link handlers |
| `CONTEXT.md` | Stable project context |
| `MEMORY.md` | This file |

## Useful snippets

```tsx
// Protected server page
import { requireUser } from "@/lib/auth";
const user = await requireUser();

// Server action form
<form action={addLinkAction}>
  <input type="hidden" name="id" value={link.id} />
  <button type="submit">Save</button>
</form>
```

```tsx
// Client form with action state
"use client";
import { useActionState } from "react";
import { updateHeaderAction } from "@/app/actions";
const [state, action, pending] = useActionState(updateHeaderAction, {});
```

```ts
// DB ownership check
db.prepare("UPDATE links SET visible = ? WHERE id = ? AND user_id = ?").run(visible, id, user.id);
```
