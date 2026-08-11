# UX handoff

## Current ownership map

The landing page is composed in `src/app/page.tsx`. Its major sections each live in a complete file under `src/components/sections/`:

- `Hero.tsx`
- `Learn.tsx`
- `Target.tsx`
- `Plan.tsx`
- `Create.tsx`
- `Ship.tsx`
- `ExecutionGap.tsx`
- `Cta.tsx`

The waitlist page is composed in `src/app/waitlist/page.tsx`. SERP report routing starts in `src/app/serp/[slug]/page.tsx`; overall report order is controlled by `src/components/serp-report/SerpReportShell.tsx`, and individual report sections and their CSS Modules live in `src/components/serp-report/sections/`.

Nishchay and the UX designer should own different complete section files on concurrent branches. Avoid splitting responsibility for one section file across active branches.

## Shared conflict hotspots

Coordinate before editing shared composition or styling files, especially:

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/tokens.ts`
- `src/components/Nav.tsx`
- `src/components/Section.tsx`
- `src/components/StickyWorkflowHeader.tsx`
- `src/components/StepCaption.tsx`
- `src/components/serp-report/SerpReportShell.tsx`
- `src/components/serp-report/SerpReportTheme.module.css`

Keep section-specific animation code beside its owning section whenever possible. If an animation must use shared global keyframes, coordinate the `globals.css` change first.

Do not include unrelated formatting or import-order churn in UX changes. Small, section-scoped diffs are easier to review and merge safely.

## Engineering and security boundaries

UX-only changes should avoid these data-loading, validation, API, and security-sensitive files unless coordinated with engineering:

- `src/lib/serp-report/getReport.ts`
- `src/lib/serp-report/getSerpReportData.ts`
- `src/lib/serp-report/opportunityMetrics.ts`
- `src/lib/serp-report/schema.ts`
- `src/lib/supabase/server.ts`
- `src/app/api/waitlist/route.ts`
- `src/app/serp/[slug]/page.tsx`

The waitlist page currently mixes presentation with submission state, so coordinate behavior changes in `src/app/waitlist/page.tsx` even when the visual edit appears local.

## Local commands

```bash
npm run dev
npm run typecheck
```

The development server is available at `http://localhost:3000` by default.
