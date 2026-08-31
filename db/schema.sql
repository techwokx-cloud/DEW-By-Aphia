-- DEW by Aphia — schema for self-hosted Postgres on the VPS.
-- Run once with: psql -U dew_app -d dew -f db/schema.sql
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS orders (
  id                 TEXT PRIMARY KEY,
  channel            TEXT NOT NULL CHECK (channel IN ('international_card', 'local_whatsapp')),
  items              JSONB NOT NULL,
  subtotal           NUMERIC(10,2) NOT NULL,
  shipping_fee       NUMERIC(10,2) NOT NULL,
  total              NUMERIC(10,2) NOT NULL,
  customer_email     TEXT,
  shipping_address   JSONB,
  stripe_session_id  TEXT,
  paystack_reference TEXT,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON orders (paystack_reference) WHERE paystack_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS leads (
  id           TEXT PRIMARY KEY,
  platform     TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'facebook')),
  handle       TEXT NOT NULL,  -- IG username or Facebook PSID, depending on platform
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'engaged', 'qualified', 'won', 'lost')),
  messages     JSONB NOT NULL DEFAULT '[]',
  draft_reply  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, handle)
);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON leads (updated_at DESC);

CREATE TABLE IF NOT EXISTS content_posts (
  id            TEXT PRIMARY KEY,
  product_id    TEXT,
  product_name  TEXT,
  image         TEXT NOT NULL,
  image_source  TEXT NOT NULL CHECK (image_source IN ('media-library', 'ai-generated', 'generated-graphic', 'product-photo')),
  content_type  TEXT NOT NULL CHECK (content_type IN ('education', 'quiz', 'engagement', 'promo')),
  caption       TEXT NOT NULL,
  hashtags      JSONB NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'posted')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_content_posts_created_at ON content_posts (created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_drafts (
  id         TEXT PRIMARY KEY,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_drafts (created_at DESC);

CREATE TABLE IF NOT EXISTS reels (
  id                 TEXT PRIMARY KEY,
  product_name       TEXT NOT NULL,
  script             JSONB NOT NULL,
  video_url          TEXT,
  render_project_id  TEXT,
  render_status      TEXT NOT NULL DEFAULT 'not_configured'
                       CHECK (render_status IN ('not_configured', 'pending', 'ready', 'failed')),
  render_error       TEXT,
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'posted')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels (created_at DESC);

CREATE TABLE IF NOT EXISTS subscribers (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  whatsapp   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_library (
  id                TEXT PRIMARY KEY,
  url               TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('image', 'video')),
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at      TIMESTAMPTZ,
  window_expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,  -- full Product object; matches lib/types.ts shape
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Single-row key/value table for admin Settings (json blob keeps this in
-- lockstep with the Settings interface in lib/store/settings.ts without a
-- second schema to maintain — every field already has an env-var fallback
-- for when this table is empty).
CREATE TABLE IF NOT EXISTS app_settings (
  id    INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- enforces exactly one row
  data  JSONB NOT NULL DEFAULT '{}'
);

-- content-schedule.ts's single cadence timestamp
CREATE TABLE IF NOT EXISTS content_schedule (
  id                 INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_generated_at  TIMESTAMPTZ
);

-- Monthly seed ad campaigns: $10+ minimum spend over a 10-day window every
-- month, objective rotating (engagement / leads / reach) to keep organic
-- momentum going the rest of the month. Created PAUSED on Meta's side and
-- only flipped to ACTIVE once the owner taps "Launch" in the admin
-- dashboard — real money is at stake, so nothing spends without a human
-- confirming it first.
CREATE TABLE IF NOT EXISTS seed_ad_campaigns (
  id                TEXT PRIMARY KEY,
  month             TEXT NOT NULL,  -- 'YYYY-MM', one campaign per month
  objective         TEXT NOT NULL CHECK (objective IN ('engagement', 'leads', 'reach')),
  budget_usd        NUMERIC(10,2) NOT NULL,
  duration_days     INT NOT NULL DEFAULT 10,
  headline          TEXT,
  primary_text      TEXT,
  creative_image    TEXT,
  meta_campaign_id  TEXT,
  meta_adset_id     TEXT,
  meta_ad_id        TEXT,
  status            TEXT NOT NULL DEFAULT 'pending_approval'
                      CHECK (status IN ('pending_approval', 'active', 'completed', 'failed', 'rejected')),
  error_detail      TEXT,
  start_time        TIMESTAMPTZ,
  end_time          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seed_ads_month ON seed_ad_campaigns (month);

CREATE TABLE IF NOT EXISTS seed_ad_schedule (
  id                 INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_objective     TEXT CHECK (last_objective IN ('engagement', 'leads', 'reach'))
);
