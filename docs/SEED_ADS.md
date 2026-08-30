# Monthly Seed Ad Campaigns

A recurring paid-ads feature: every calendar month, a minimum $10 Meta ad
runs for 10 days to keep audience growth and lead generation going, so
organic content isn't the only thing driving momentum.

## How it decides what to run

An AI agent (`lib/ai/ad-strategy-agent.ts`) picks the objective —
**engagement**, **leads**, or **reach** — by looking at real pipeline
data (how many leads are sitting unconverted, what ran last month) rather
than a blind rotation. It falls back to simple rotation if the AI call
fails, so the feature never blocks on that dependency.

Ad creative (headline + primary text) is generated per-objective by
`lib/ai/ad-creative-agent.ts`. The image comes from the existing media
library rotation, falling back to a generated branded graphic.

## Human-in-the-loop, always

Every campaign is created **fully paused** on Meta's side — campaign, ad
set, and ad all created with `status: "PAUSED"`. Nothing spends until a
human taps **Launch** on `/admin/ads`. This is non-negotiable: it's real
money, and no automated flow should move it without explicit confirmation.

## Monthly flow

1. `/api/cron/seed-ad` runs daily (harmless no-op unless the month has no
   campaign yet — see `getCampaignForMonth`).
2. On the day it fires: decides objective + generates creative + creates
   the paused campaign on Meta's Marketing API.
3. Owner gets a WhatsApp message naming the month, the objective, the
   reasoning, the budget/duration, and — if there's a real backlog — a
   nudge to also follow up on existing leads directly (not automated;
   that's a human task, the ad is a parallel top-of-funnel push).
4. Owner reviews on `/admin/ads` and taps **Launch** (spends) or
   **Skip this month** (deletes the paused campaign on Meta's side).

## Requirements

- `metaAdAccountId` + `metaAdsAccessToken` (needs `ads_management` scope
  — different from the organic-posting token used for regular content) —
  set in Settings → Meta Ads.
- Reuses `facebookPageId` / `igBusinessAccountId` already configured for
  organic posting.

## Known limitations / future ideas

- No retargeting/custom-audience support yet — every campaign targets
  fresh Ghana-based cold audience (age 21-55). A future version could
  build a Meta Custom Audience from the leads list for a genuine
  "re-engage existing leads with ads" mode, distinct from the cold-traffic
  seed ad. That's a materially bigger lift (Custom Audiences API, PII
  hashing per Meta's requirements) — flagged here rather than half-built.
- Objective set is currently fixed to engagement/leads/reach. Could
  expand to sales/traffic objectives once conversion tracking (Meta
  Pixel / Conversions API) exists on the storefront.
- No automatic pause/kill-switch if spend pace looks abnormal mid-flight
  — worth adding once there's a track record of real campaigns to learn
  normal pacing from.
