# KaizenVault — Refactor Plan & SoA-Tab Integration Design

> Status: **Draft v1** · Author: Claude (planning only — no code written yet) · Last updated: 2026-05-07
> Branch this lives on: `claude/kaizen-os-pipeline-ideas-A73BI` (the only branch with real UI; will be promoted to `main` per HH 2026-05-07)

---

## 0. TL;DR

- **What KaizenVault is today**: a single-page Next.js 15 dashboard with mocked HR-service data. Seven UI components, no auth, no DB, no routing beyond `/`. ~10 source files. Real bugs hide in the small surface area.
- **What HH wants next**: clone Hudson One's Statement of Affairs (SoA) feature into KaizenVault as a new (last) top-level tab; the Assets / Liabilities / Charges tables sync **bi-directionally** with Hudson One; the SoA renders as a live **preview** computed from those tables (same waterfall logic Hudson One uses).
- **Architectural decisions taken on 2026-05-07**:
  1. Kaizen runs its **own Supabase** project; bi-directional sync is via a **bridge service**.
  2. Kaizen has **its own auth**; a **service-role bridge** holds the Hudson One key server-side and proxies authorised mutations.
  3. The `claude/kaizen-os-pipeline-ideas-A73BI` branch is **promoted to `main`** before any new work; SoA work happens on `feat/soa-tab` branched off the new main.
- **Sequence**: (A) clean repo hygiene, (B) the actual refactor (bugs + speed + architecture), (C) build the SoA tab + sync bridge in three stages — schema mirror, read-side, write-side.
- **Hard dependency**: the bridge needs a Hudson One service-role key + a webhook/Realtime channel exposed by Hudson One. **HH or a Hudson One maintainer has to provision both before stage C-2 can start.**

---

## 1. Current state of KaizenVault

### 1.1 Branch & repo state
- Default branch (`claude/document-capabilities-T7D6T`) and two other "doc" branches contain only the Next.js scaffold + a CLAUDE.md.
- **All real UI lives on `claude/kaizen-os-pipeline-ideas-A73BI`** — that is where this plan must apply. First action item is promoting that branch to `main`.
- `gh` token (`HasibHudson2026`) has `pull` permission only on `Kaizen4eva/Kaizen` — pushing changes back will require either (a) HH/owner granting push access, or (b) working through a fork + PR. **Flagged for HH** (see §10).

### 1.2 Stack snapshot
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15.1.7 (App Router) | React 19. `reactStrictMode: true`. |
| Styling | Mixed: Tailwind 3.4 + CSS variables in `globals.css` + inline `style={{}}` | **Three styling systems competing**, see §3.5 + §4.3. |
| Data | All hardcoded in `data/mock.ts` | No DB / API / auth. |
| Charts | `recharts` 2.14 (eagerly imported) | ~120 KB gzipped on initial load. |
| Icons | `lucide-react` 0.469 | OK. |
| Tests | None | No Vitest, Jest, Playwright. |
| Lint | `eslint-config-next` defaults | No project rules. |
| CI | None | No GitHub Actions. |

### 1.3 File inventory (real branch)
```
app/
  layout.tsx           — minimal RootLayout, no fonts/metadata strategy
  page.tsx             — single dashboard, hardcoded "FORMATTED_DATE" (BUG, see §3.1)
  globals.css          — CSS variables for colours/sidebar width
components/
  Sidebar.tsx          — non-functional nav (BUG, §3.2)
  KPIGrid.tsx          — KPI cards from mock; broken progress logic (BUG, §3.3)
  ServiceHealthGrid.tsx — service cards with onMouseEnter/Leave (PERF, §4.2)
  ActivityFeed.tsx     — event feed
  AutomationTrendChart.tsx — Recharts LineChart (PERF, §4.1)
  MaturityScoreCard.tsx — radial score; hardcoded dimensions (BUG, §3.4)
  PipelineIdeas.tsx    — pipeline cards with type defined in mock data (ARCH, §5.4)
data/mock.ts           — all dummy data + a stray `PipelineIdea` type
lib/utils.ts           — cn(), status/maturity helpers
types/index.ts         — half the domain types (rest is in mock.ts)
```

---

## 2. Bugs (functional)

> Numbered B-#. Severity: 🟥 user-visible defect · 🟧 silent / latent · 🟨 cosmetic.

### B-1 🟥 "Today's date" is frozen at build time
`app/page.tsx:9` computes `FORMATTED_DATE` from `new Date("2026-03-31").toLocaleDateString("en-US", …)` at **module load**. In production this header will literally always say "Tuesday, March 31, 2026" — it doesn't update. Two issues compounded: (a) the date string is hardcoded; (b) even if `new Date()` were used, computing it at module scope on a server component would freeze it across requests.
**Fix**: render the date inside the component body using a server-time helper, or move to a client component using `useEffect` + locale that matches the firm (`en-GB`, not `en-US`).

### B-2 🟥 Sidebar nav buttons go nowhere
`Sidebar.tsx` items (Dashboard, Services, Pipeline Ideas, Activity, Roadmap) only flip a local `useState`. None of those routes exist in `app/`. Clicks visually highlight a different item but the dashboard contents never change.
**Fix**: replace `<button onClick>` with `next/link` `<Link>` and create the matching routes (or, until they exist, link back to `/` and disable the others).

### B-3 🟥 `parseProgress` returns "passing" for missed cost targets
`KPIGrid.tsx:5` divides current value by target — for "Avg Cost / Ticket" the target is `$12.00` and current `$14.20`, so progress = 118% and the bar fills green at 100%. But cost-per-ticket overshooting target is **bad**. The function has no concept of "lower is better".
**Fix**: extend `KPICard` with a `direction: 'higher_is_better' | 'lower_is_better'` field; invert the percentage when lower-is-better. Currently the data also relies on `trendGood: false` for monthly tickets but doesn't drive the progress bar from it.

### B-4 🟧 `MaturityScoreCard.dimensions` is hardcoded but pretends to be computed
The radial score is computed from `services` (`computeOverallScore()`), but the five "dimension bars" below it are static numbers that have no relationship to anything in the data. Visually misleading.
**Fix**: compute each dimension from `services` (or accept it as props from a future API), or label the section "Illustrative".

### B-5 🟧 Two different "cyan" tokens
`globals.css` defines `--cyan: #06B6D4`. `tailwind.config.ts` defines `cyan: "#00D4FF"`. App currently uses the CSS variable, but anyone reaching for a Tailwind class (`bg-cyan`) will get a different shade. Same for `purple`.
**Fix**: pick one source of truth (recommend Tailwind theme tokens) and delete the other.

### B-6 🟧 Recharts `Line.dot` custom prop ignores type-system warnings
`AutomationTrendChart.tsx:30` defines `CustomDot` props as `cx?: number; cy?: number; stroke?: string` but Recharts passes the whole datum through. The current implementation works by accident for this dataset; if the data shape changes the dot positions will break silently.
**Fix**: use `recharts`-typed dot props or render with `<Dot>` recipes from the docs.

### B-7 🟨 `<style>{...}` injected inline in `Sidebar.tsx` and `ActivityFeed.tsx`
Both components use a `<style>` tag at the bottom for `@keyframes`. Works but causes a re-mount-time style flash and pollutes the global CSS scope. Better in `globals.css` or via `tailwindcss-animate`.

### B-8 🟨 Locale mismatch
`en-US` formatter for a UK firm (Hudson Weir). Cosmetic but symptomatic of no shared `formatDate` util.

### B-9 🟧 No error boundaries / no Suspense / no loading states
With mock data this is invisible. The minute we wire to a remote DB (which is the whole point of the SoA tab), an exception in any component will crash the whole tree because `app/error.tsx` doesn't exist.
**Fix**: add `app/error.tsx`, `app/loading.tsx`, and segment-level error/loading files for any future tab.

### B-10 🟧 No empty / not-found states
`app/not-found.tsx` doesn't exist — bad URLs will fall back to Next's default. Add one.

---

## 3. Performance issues

> P-# numbering. Each has a measurable target.

### P-1 Recharts is in the initial bundle
`AutomationTrendChart.tsx` imports the whole `recharts` namespace. On a fresh load that's ~120 KB gzipped of JS the user doesn't need until the chart scrolls into view (not even the first viewport on smaller screens).
**Fix**: dynamic-import the chart with `next/dynamic` and `ssr: false`. Add a low-cost SVG skeleton fallback (<2 KB).
**Target**: cut First Load JS by ≥ 100 KB.

### P-2 Over-broad `"use client"` boundaries
- `Sidebar.tsx` — uses `useState` for active highlight; once we replace that with `<Link>` + the App Router pathname, it can be a server component (or a tiny client island just for the active state).
- `ServiceHealthGrid.tsx` — only client because of `onMouseEnter/Leave` to set hover styles. Replaceable with CSS `:hover`.
- `AutomationTrendChart.tsx` — legitimately client (Recharts).
- `ActivityFeed.tsx` — legitimately client (animation).
**Fix**: convert Sidebar + ServiceHealthGrid to server components; reduce JS shipped by ~15-25 KB after gzip.

### P-3 No `next/font`
Inter is loaded via `font-family: 'Inter', system-ui, sans-serif` in `globals.css` with no `@font-face`. The browser falls back to system-ui until Inter is fetched, causing FOUT on every page load.
**Fix**: `import { Inter } from 'next/font/google'` in `app/layout.tsx`, attach the className to `<body>`. Self-hosted, preloaded, zero FOUT.

### P-4 Inline-style render cost + no memoization
Every component creates fresh style objects on every render. With mock data this is invisible. After we wire to live data with frequent re-renders (Realtime subscription updates), this will produce thousands of useless object allocations per second.
**Fix**: switch to Tailwind utility classes (or extract style objects to module scope). After data integration, profile with React DevTools and add `React.memo` on row-level components (`EventRow`, `ServiceCard`, `PipelineCard`).

### P-5 No bundle analyser configured
You can't optimise what you can't measure.
**Fix**: add `@next/bundle-analyzer` behind `ANALYZE=true`. Document `npm run analyze`.

### P-6 No image strategy
Currently zero images. Pre-empt: add `images.formats: ['image/avif', 'image/webp']` to `next.config.ts` and an `images.remotePatterns` allow-list scoped to the Supabase storage bucket once Storage is wired.

---

## 4. Architecture issues

> A-# numbering. Each is a structural change, not a one-liner fix.

### A-1 Three styling systems competing
Tailwind tokens in `tailwind.config.ts` are defined but unused. CSS variables in `globals.css` are used everywhere. Inline `style={{}}` is used everywhere. Hover effects are JS-driven instead of CSS.
**Decision**: pick **Tailwind utility-first** as the single source of truth. Move colour tokens into `tailwind.config.ts`. Delete CSS variables that duplicate Tailwind. Migrate inline styles to classes (`tailwind-merge` is already a dep — use it via `cn()`).
**Why**: the SoA preview is heavy DOM; we want CSS specificity + reusability + dark-mode override later. Tailwind's `@apply` and arbitrary values make migrating from CSS variables straightforward.

### A-2 No data layer
Everything is hardcoded in `data/mock.ts`. There is no fetch path, no error handling, no caching layer, no SWR/React Query, no Server Action, no DB.
**Decision**: install **TanStack Query** for client-side data, alongside **Supabase JS** for queries / Realtime / Auth. Server Components pre-fetch via Supabase server client; Client Components hydrate React Query cache and subscribe to Realtime for live updates.
**Why**: Hudson One uses Server Actions + manual `useState` + Realtime subscriptions. KaizenVault is small enough to adopt React Query cleanly from the start; it gives us automatic refetch-on-focus, optimistic updates, and a unified cache for the bridge.

### A-3 No routing beyond `/`
Sidebar advertises 5 destinations; only `/` exists. With the SoA tab as the sixth entry, we need a real router structure.
**Decision**: introduce nested routes:
```
/                         (Dashboard - existing)
/services                 (Services from Sidebar)
/pipeline                 (Pipeline Ideas - already on dashboard, but standalone view)
/activity                 (Activity Feed - standalone view)
/roadmap                  (Empty for now)
/soa                      (NEW — the tab HH wants)
/soa/[caseId]             (NEW — case-scoped SoA preview + assets/liabilities/charges)
/soa/[caseId]/assets
/soa/[caseId]/liabilities
/soa/[caseId]/charges
/soa/[caseId]/preview
```
The `[caseId]` segment is the case ID synced from Hudson One. Without one selected, `/soa` shows a case picker (paginated list of cases pulled via the bridge).

### A-4 No types organisation
`PipelineIdea` is defined in `data/mock.ts` but `KPICard`, `ServiceProduct`, `ActivityEvent` are in `types/index.ts`. Mock data and domain types are entangled.
**Decision**: split `types/` into domain modules — `types/dashboard.ts`, `types/soa.ts`, `types/sync.ts` etc. Mock data files import types, never define them.

### A-5 No environment config
No `.env.local`, no `.env.example`, no env-var validation. The bridge will need 6+ secrets (Kaizen Supabase URL, Kaizen anon key, Kaizen service-role key, Hudson One Supabase URL, Hudson One service-role key, bridge HMAC secret) — these MUST be validated at boot.
**Decision**: install `@t3-oss/env-nextjs` + `zod`. Define `env.ts` with full schema. Fail-fast on missing or invalid env vars.

### A-6 No auth
There is no user concept at all. Users in Kaizen need:
1. To sign in (per HH decision: Kaizen-only auth — Clerk or Supabase Auth on Kaizen's own project).
2. To be mapped to a Hudson One user (`hw_user_id`) so the bridge can verify case access.
3. To be authorised against the case before any sync request fires.
**Decision**: use **Supabase Auth on Kaizen's own project** (cheaper, fewer integrations, same JS client we'll already have). Identity-mapping table: `kaizen.user_links (kaizen_user_id pk, hw_user_id, hw_email, linked_at)` — populated by an "invite" flow signed by HH. (See §6.4 for details.)

### A-7 No tests / no CI
**Decision**: add **Vitest** for units, **Playwright** for E2E (Hudson One already uses it). GitHub Actions workflow: `lint → typecheck → test:unit → test:e2e (smoke) → build`. Required to pass before merging to `main`.

### A-8 Mixed `<style>{}` injection vs CSS file vs inline
See B-7 + A-1. Move all keyframes into `globals.css` (or kill them when migrating to Tailwind animate plugins).

---

## 5. Branch hygiene & repo cleanup (must happen before refactor)

1. Open PR `pipeline-ideas → main` on `Kaizen4eva/Kaizen`. Title: "feat: promote pipeline-ideas branch to main".
2. **HH or repo owner needs to merge** — current `gh` user is read-only.
3. Delete the three doc-only branches (`claude/add-claude-documentation-1ja9K`, `claude/document-capabilities-T7D6T`, `claude/document-kaizen-os-nejkC`) after their CLAUDE.md content is squash-merged into `main`.
4. Set `main` as the new default branch in the GitHub UI.
5. Add branch protection: PRs only, require CI green, require 1 review.
6. Create `feat/soa-tab` from the new `main` for §6+ work.

---

## 6. SoA tab integration — design

> The "very, very detailed" part. Based on the Hudson One audit (see §A.1 appendix below for the complete file/table reference).

### 6.1 What we are recreating
Hudson One's SoA flow is three editable tables (assets, liabilities, charges) plus a derived statutory-format preview document. The preview uses an IA1986 s.107 / s.175 / s.176A waterfall calculator to compute charge-grouped surpluses/shortfalls, prescribed-part allocations, employee preferential rows, and total deficiency.

In Kaizen, the same feature appears as the **last sidebar tab** ("Statement of Affairs"). Sub-routes:
- `/soa` — case picker
- `/soa/[caseId]` — split view: left pane has Assets / Liabilities / Charges sub-tabs; right pane is a live SoA preview rendered from the current state of those three tables. Identical to Hudson One's two-pane layout, identical waterfall logic.
- `/soa/[caseId]/preview` — full-width read-only preview, suitable for printing.

### 6.2 New top-level tab in `Sidebar.tsx`

Append to `navItems` (last position per HH):
```ts
{ id: "soa", label: "Statement of Affairs", icon: <FileText size={18} />, href: "/soa" }
```
Once Sidebar is converted to use `<Link>` (see B-2), the tab routes naturally.

### 6.3 Schema mirror in Kaizen Supabase

Bi-directional sync requires Kaizen to hold a faithful copy of three Hudson One tables. We mirror schema **only for the columns the SoA preview reads**. Audit columns and Hudson One internal columns stay on the Hudson One side.

#### Migration `001_soa_mirror.sql` (sketch)
```sql
create schema if not exists soa;

-- minimal mirror of public.case_assets
create table soa.case_assets (
  id uuid primary key,                                    -- same UUID as Hudson One
  hw_case_id uuid not null,                               -- Hudson One case id
  description text,
  category text check (category in ('fixed','current')),
  charge_status text check (charge_status in ('uncharged','fixed_charge','floating_charge','hire_purchase','specifically_pledged')),
  asset_type text,
  charge_holder_name text,
  book_value numeric(18,2),
  etr numeric(18,2),
  secured_debt numeric(18,2),
  realised_amount numeric(18,2),
  soa_book_value numeric(18,2),
  soa_estimated_to_realise numeric(18,2),
  sip6_explanation text,
  etr_uncertain boolean default false,
  status text,
  realised_date date,
  parent_asset_id uuid,
  charge_id uuid,
  sort_order int,

  -- Sync bookkeeping
  hw_updated_at timestamptz,                              -- last update timestamp on Hudson One
  kz_updated_at timestamptz default now(),                -- last update timestamp on Kaizen
  sync_version int not null default 1,                    -- monotonic, used for conflict resolution
  sync_origin text check (sync_origin in ('hw','kz')) not null,  -- which side authored the latest write
  deleted_at timestamptz                                  -- soft delete (matches HW)
);
create index on soa.case_assets (hw_case_id) where deleted_at is null;
create index on soa.case_assets (sync_version);

-- analogous mirrors for case_liabilities and case_charges (columns per §A.1)
create table soa.case_liabilities (...);
create table soa.case_charges (...);

-- RLS: only members of the case can read/write
alter table soa.case_assets enable row level security;
create policy "case access" on soa.case_assets for all using (
  exists (
    select 1 from soa.case_access ca
    where ca.hw_case_id = soa.case_assets.hw_case_id
      and ca.kaizen_user_id = auth.uid()
  )
);

-- case access table: maps Kaizen user → Hudson One case access
create table soa.case_access (
  kaizen_user_id uuid not null references auth.users(id) on delete cascade,
  hw_case_id uuid not null,
  hw_role text not null,                                 -- mirrors Hudson One role string
  granted_at timestamptz default now(),
  primary key (kaizen_user_id, hw_case_id)
);
```

> **Conflict policy**: last-writer-wins by `sync_version`. Both sides increment on every write; the bridge resolves by `version + sync_origin`. If versions are equal but origins differ, **HW wins** (Hudson One is the canonical insolvency record-of-truth).

> **Soft-delete only**: matches Hudson One's existing `deleted_at` policy. The bridge never `DELETE`s; deletion always sets `deleted_at`.

### 6.4 Authentication & service-role bridge

#### 6.4.1 User identity flow
1. User signs into Kaizen via Supabase Auth on Kaizen's own project (magic link or password).
2. On first login, user is shown an **"Link your Hudson One account"** screen if no `user_links` row exists. Two paths:
   - **Self-service**: enters their Hudson One email → Kaizen sends a verification email containing a token → user clicks; bridge verifies the email is a valid Hudson One user via `hw_users` lookup using the service-role key → `user_links` row created.
   - **Admin-issued**: HH provisions the link manually in a Kaizen admin panel (faster for the first 5–10 users).
3. Once linked, every Kaizen request that hits the bridge carries `(kaizen_jwt, kaizen_user_id) → bridge resolves → (hw_user_id) → checks Hudson One RLS → proceeds`.

#### 6.4.2 Service-role bridge — request lifecycle
- Lives at `/api/bridge/*` in Kaizen (Next.js Route Handlers, `nodejs` runtime, no edge — needs ≥ 60s timeout).
- Holds **two service-role keys** in env vars:
  - `KAIZEN_SUPABASE_SERVICE_ROLE_KEY` — to write to Kaizen mirror tables bypassing RLS.
  - `HUDSON_ONE_SUPABASE_SERVICE_ROLE_KEY` — to read/write Hudson One tables on behalf of the authenticated Kaizen user.
- **Never exposed to the browser**. Bridge endpoints are protected by:
  1. Verify Kaizen JWT (`supabase.auth.getUser()` server-side).
  2. Look up `hw_user_id` via `user_links`.
  3. Call Hudson One via REST with `apikey: HW_SERVICE_ROLE`, but **add a `?user_id=hw_user_id` predicate or use a Hudson One RPC that re-checks `private.has_case_access(case_id, hw_user_id)`** — i.e. the bridge does not bypass case-level authorisation, it just bypasses session auth.
  4. Sign every bridge response with HMAC + timestamp to prevent replay.
- Audit log table `soa.bridge_audit (id, kaizen_user_id, hw_user_id, action, hw_table, hw_row_id, payload_hash, succeeded, requested_at)` — every bridge call is logged.

#### 6.4.3 Required Hudson One side changes
- Add a stored procedure `public.kaizen_bridge_check_access(p_user_id uuid, p_case_id uuid) returns boolean` that re-uses `private.has_case_access`. The bridge calls this before every read/write.
- (Optional but recommended) Whitelist the bridge's static IP in Hudson One Supabase network rules.
- Provision a service-role key with **table-level grants** scoped to `case_assets`, `case_liabilities`, `case_charges`, `kaizen_bridge_check_access` only. Do NOT use the universal service-role key.

### 6.5 Bi-directional sync — three mechanisms layered

> Three layers because **Realtime + reconcile + idempotent retry** is what survives network blips and prevents drift.

#### Layer 1: Realtime subscriptions (live)
- Kaizen subscribes to **its own** mirror tables for the UI.
- A long-running **bridge worker** (Vercel Cron + a queued state, or a small Node service on Render/Fly) subscribes to **Hudson One's** `case_assets / case_liabilities / case_charges` Realtime channels. On each change → write to Kaizen mirror with `sync_origin='hw'`.
- Reverse direction: a **Postgres trigger on Kaizen mirror tables** (`AFTER INSERT/UPDATE`) writes to a `soa.outbox` table when `sync_origin='kz'`. The bridge worker drains the outbox and POSTs each change to Hudson One via the service-role key. Successful → row removed from outbox. Failed → exponential backoff, max 6 retries, then alert.

#### Layer 2: Periodic reconciliation (every 5 min)
- Cron job compares row counts + max(`hw_updated_at`) per case between Kaizen mirror and Hudson One. Drift triggers a full diff for that case.
- Catches missed Realtime events during deploy / cold starts / network blips.

#### Layer 3: Manual reconcile button
- In the SoA tab UI, a "Resync" button per case forces a full pull from Hudson One → mirror, blowing away local mirror rows and re-creating them. Last-resort tool for HH.

#### Idempotency
- Every bridge write carries `Idempotency-Key: kaizen_${row_id}_${sync_version}`.
- Hudson One side stores last-N keys per row (table `soa_bridge_idempotency`); duplicate keys are no-ops.

### 6.6 SoA preview rendering

The preview is **purely derived** — no separate `soa_preview` table. The pipeline:

```
[Kaizen UI: SoaPreview component]
  ↓ reads
[soa.case_assets ∪ case_liabilities ∪ case_charges] (live, Realtime-subscribed)
  ↓ feeds
[lib/soa/waterfall.ts] (port of soa-waterfall-calc.ts from Hudson One)
  ↓ produces
[WaterfallResult { totalForUnsecured, totalUnsec, deficiencyNonPref, totalDeficiency }]
  ↓ rendered as
[components/soa/DocumentPreview.tsx] (port of document-preview.tsx)
```

Files to port from Hudson One (paraphrased — code is not duplicated verbatim, it is rewritten to match Kaizen conventions):
- `src/lib/documents/soa-waterfall-calc.ts` → `lib/soa/waterfall.ts`
- `src/lib/documents/soa-deficiency-calc.ts` → `lib/soa/deficiency.ts`
- `src/lib/types/soa.ts` (the AssetItem / LiabilityItem / ChargeStatus / SoAData types) → `types/soa.ts`
- `src/lib/case-data/al-mappers.ts` (`caseAssetToSoA`, `caseLiabilityToSoA`) → `lib/soa/mappers.ts`
- `src/components/soa/document-preview.tsx` → `components/soa/DocumentPreview.tsx`
- `src/components/soa/constants.ts` (ASSET_TYPES, KNOWN_ASSETS, CHARGE_STATUS_LABELS, CREDITOR_CATEGORIES) → `lib/soa/constants.ts`

#### What we DO NOT port
- `soa-app-wrapper.tsx` (Hudson One's localStorage hydration logic) — replaced by React Query + Realtime.
- `case-data-sync.ts` (Hudson One's case_data JSONB push) — irrelevant; we use first-class tables only.
- `Stage12Data` resolver (company/director details) — replaced by a simple props-based contract; the case picker fetches company details once via the bridge and passes them into the preview.

### 6.7 Editing UX

- Three sub-tabs (Assets / Liabilities / Charges) — each is a TanStack Table-based grid with inline cell editing.
- **Optimistic updates** via React Query mutations; on success, mutation writes to Kaizen mirror (which triggers outbox → Hudson One). On error, rolls back local state and shows a toast.
- **Debounce 400ms** per-cell — matches Hudson One's debounce so we don't double-write on every keystroke.
- **OCR import**: out of scope for v1. The bridge can later proxy to Hudson One's `/api/liabilities/extract`.

---

## 7. Phased implementation roadmap

> Each phase is a separate PR. Phases inside a stage can run in parallel (italics).

### Stage A — Repo hygiene & refactor groundwork (≈ 1 week)
- A.1 Promote `pipeline-ideas` to `main`; add branch protection. **(blocked: needs HH push access on `Kaizen4eva/Kaizen`)**
- A.2 *Add `@t3-oss/env-nextjs` + `zod` env validation; create `env.ts` with placeholders for all secrets.*
- A.3 *Add Vitest + Playwright; minimal smoke test for `/`.*
- A.4 *Add GitHub Actions workflow (lint, typecheck, test, build).*
- A.5 *Add `@next/bundle-analyzer`; document `npm run analyze`.*

### Stage B — KaizenVault refactor (≈ 1.5 weeks)
- B.1 Migrate to Tailwind utilities (kill inline styles + duplicate CSS variables). Decision A-1.
- B.2 Convert components: Sidebar → server component + client island; `ServiceHealthGrid` → server component (CSS hover); keep `AutomationTrendChart` as client + dynamic import (P-1).
- B.3 Add `next/font` (Inter) + remove FOUT.
- B.4 Fix bugs B-1 (live date), B-2 (real routing — create `/services`, `/pipeline`, `/activity`, `/roadmap` placeholder pages with content moved out of dashboard), B-3 (KPI direction).
- B.5 Add `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`.
- B.6 Re-org types: move all interfaces into `types/`; mock data only imports.
- B.7 Replace `MaturityScoreCard` static dimensions with computed values (B-4).
- B.8 React Query setup (`app/providers.tsx`) — even before remote data, wrap dashboard mocks so the migration is one-line later.

### Stage C — SoA tab + sync bridge (≈ 3-4 weeks, three sub-stages)

#### C-1 Schema + auth scaffolding (≈ 1 week)
- C-1.1 Provision Kaizen Supabase project. Document URL/anon-key in `env.ts`.
- C-1.2 Write migrations 001..003 for `soa.case_assets`, `soa.case_liabilities`, `soa.case_charges`, `soa.case_access`, `soa.outbox`, `soa.bridge_audit`.
- C-1.3 Set up Kaizen Supabase Auth; build `/sign-in` and `/sign-up` flows.
- C-1.4 Build Kaizen-side admin page `/admin/user-links` (HH-only).
- C-1.5 **Hudson One side (HH coordinates)**: provision restricted service-role key, create `kaizen_bridge_check_access` RPC, document the new IP allow-list entry.

#### C-2 Bridge + read path (≈ 1.5 weeks)
- C-2.1 Implement `/api/bridge/cases` — list of HW cases the user has access to (calls Hudson One via service-role, filtered by `hw_user_id`).
- C-2.2 Implement `/api/bridge/sync/:caseId` — pull-down endpoint that fetches HW assets/liabilities/charges and upserts into Kaizen mirror.
- C-2.3 Bridge worker subscribes to HW Realtime; replays into Kaizen mirror.
- C-2.4 SoA tab UI: `/soa` case picker + `/soa/[caseId]` read-only view of three tables + preview pane (using ported waterfall calc).
- C-2.5 E2E test: HH inserts an asset on Hudson One → it appears in Kaizen within 2 seconds.

#### C-3 Write path + reconcile (≈ 1-1.5 weeks)
- C-3.1 Inline cell editing in the three sub-tabs (TanStack Table + React Query mutations). Optimistic UI.
- C-3.2 Postgres triggers on Kaizen mirror tables → `soa.outbox` rows when `sync_origin='kz'`.
- C-3.3 Bridge worker drains outbox, POSTs to Hudson One via service-role + `hw_user_id` predicate, retries on failure.
- C-3.4 Idempotency-key handling on both sides.
- C-3.5 Periodic reconciliation cron (5-minute drift check).
- C-3.6 Manual "Resync" button.
- C-3.7 E2E test: edit on Kaizen → appears on Hudson One within 2 seconds; edit on both sides simultaneously → last-write-wins per `sync_version` deterministically; offline-Hudson-One case → write queued in outbox → succeeds on reconnect.

### Stage D — Hardening (≈ 0.5 week)
- D.1 Bridge audit log retention + alerting (Sentry / log drain).
- D.2 Rate-limit bridge endpoints per Kaizen user.
- D.3 Penetration test the bridge — confirm no path bypasses `kaizen_bridge_check_access`.
- D.4 Load-test SoA preview with a 1000-asset case (Hudson One has cases close to this).

**Total estimated calendar time**: 6-7 weeks if work is sequential and HH actions on Hudson One side land same week as requested.

---

## 8. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | HH does not get push access on `Kaizen4eva/Kaizen` to me, blocking even §5 cleanup | High | Blocks all stages | HH adds Hasib bot user as Maintainer, OR I work via fork + PR (slower). |
| R2 | Hudson One service-role key is reused / leaked from Kaizen env | Medium | Catastrophic — full Hudson One DB read/write | Use a NEW key with table-level grants only; rotate quarterly; mTLS on bridge ↔ Hudson One. |
| R3 | Bi-directional drift goes undetected | Medium | Wrong SoA numbers = compliance breach | Layer 2 reconcile + alerting; manual Resync button; bridge audit log. |
| R4 | Kaizen-side write is rejected by Hudson One RLS but bridge thinks it succeeded | Low | Drift | Hudson One returns the actual updated row; bridge compares; mismatch → mark Kaizen row `sync_origin='hw'` and re-pull. |
| R5 | Hudson One schema drifts (columns added) | Medium | Mirror missing data | Schema diff job in Stage D — runs weekly, opens an alert if Hudson One has new columns we don't mirror. |
| R6 | Recharts upgrade or React 19 + Recharts 2.14 compat issues | Low | Chart breaks | Pin major versions, add Playwright visual regression on dashboard. |
| R7 | User unlinks Kaizen↔HW link mid-session and tries to write | Low | Clean failure | Bridge re-checks `user_links` on every call; returns 401 if missing. |
| R8 | First case has 1000+ assets; mirror sync first-load is slow | Medium | Bad UX on first open | Stream mirror rows into UI (don't await full sync); progress indicator; pre-warm common cases overnight. |

---

## 9. Open questions for HH

> Things I shelved instead of guessing.

1. **Plan owner & reviewers** — should this `REFACTOR_PLAN.md` be reviewed by anyone Hudson-One-side before stage A starts? (Recommend: yes — at least the bridge auth design.)
2. **Kaizen Supabase project** — does HH already have one provisioned, or do I open a new one?
3. **Hudson One side coordination** — who provisions the restricted service-role key + adds the `kaizen_bridge_check_access` RPC + sets the IP allow-list? Hudson One has its own deploy gate.
4. **OCR / import features** — out of v1 per §6.7. Confirm this is acceptable.
5. **Documents (charge PDFs, source documents)** — Hudson One stores them in its own Storage bucket. Does the SoA tab need to display/download them in v1, or can we stub a "Open in Hudson One" link? (Recommend: stub in v1; full bridge in v2.)
6. **Audit & compliance** — Hudson One has `audit.log_change()` triggers on every DML. Should Kaizen mirror log to a parallel audit table, or proxy back to Hudson One? (Recommend: parallel + bridge-replicated.)
7. **Branch protection** — should `main` be protected with required reviews from a specific GitHub team?

---

## Appendix A.1 — Hudson One reference (compressed)

> Full audit lives in the chat; this is the look-up table the team needs while implementing §6.

### Tables on Hudson One Supabase
| Table | Purpose | Key columns relevant to mirror |
|---|---|---|
| `public.case_assets` | First-class assets | id, case_id, description, category, charge_status, asset_type, charge_holder_name, book_value, etr, secured_debt, realised_amount, soa_book_value, soa_estimated_to_realise, sip6_explanation, etr_uncertain, status, realised_date, parent_asset_id, charge_id, sort_order, deleted_at |
| `public.case_liabilities` | First-class liabilities | id, case_id, creditor_name, category, amount, soa_amount, proof_received, proof_of_debt_date, proof_of_debt_amount, creditor_type, address, contact_*, reference_number, security_*, currency, original_amount, exchange_rate, source_*, description, sort_order, deleted_at |
| `public.case_charges` | First-class charges | id, case_id, charge_type, charge_holder_name, creditor_id, agreement_date, charge_amount, attached_asset_ids, ch_charge_code, description, sort_order, deleted_at |

### RLS predicate
All three: `private.has_case_access(case_id)` — checks `case_assignments` for the calling `auth.uid()`. Bridge will call `kaizen_bridge_check_access(hw_user_id, case_id)` (new RPC) which delegates to the same function.

### Logic to port to Kaizen
- `src/lib/documents/soa-waterfall-calc.ts` (waterfall computation)
- `src/lib/documents/soa-deficiency-calc.ts` (deficiency account)
- `src/lib/case-data/al-mappers.ts` (DTO mapping)
- `src/lib/types/soa.ts` (domain types)
- `src/components/soa/document-preview.tsx` (preview rendering)
- `src/components/soa/constants.ts` (asset types / charge statuses / creditor categories)

### NOT to port
- localStorage-based hydration (`soa-app-wrapper.tsx`)
- case_data JSONB sync (`case-data-sync.ts`)
- Stage12Data resolver — accept company/director props instead
- OCR endpoints (proxy in v2 if needed)

---

## Appendix A.2 — Decision log

| Date | Decision | Driver |
|---|---|---|
| 2026-05-07 | Source of truth: separate Kaizen DB + bridge | HH choice from popup |
| 2026-05-07 | Auth: Kaizen-only auth + service-role bridge | HH choice from popup |
| 2026-05-07 | Branch: promote pipeline-ideas to main, then `feat/soa-tab` | HH choice from popup |
| 2026-05-07 | Plan output: this file in repo root | HH choice from popup |
