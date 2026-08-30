# Deployment Runbook — dewbyaphia.online

Everything built this session is now on GitHub (`master`, commit `7b91bdc`).
This walks through taking it from there to the live VPS. Follow it in
order — each section depends on the one before it.

Do this on a quiet moment, not mid-sale — the checkout provider swap
(Stripe → Paystack) and the database migration both touch how orders are
recorded.

---

## 0. Before you start

Gather these now so you're not hunting for them mid-deploy:

- [ ] **Paystack** live secret key + public key (Settings → API Keys in your Paystack dashboard)
- [ ] **Resend** API key — **rotate the one you pasted in chat earlier**, treat it as burned
- [ ] **Meta Marketing API** access token (needs `ads_management` scope — different from your existing organic-posting token) + Ad Account ID, if you want seed ads live now (optional — everything else works without it)
- [ ] A strong new `ADMIN_PASSWORD` (the current one may also have been exposed during this session — worth rotating)
- [ ] SSH access to the VPS (`root@42123567` per earlier commands)

---

## 1. Install Postgres on the VPS

```bash
apt-get update
apt-get install -y postgresql postgresql-contrib
service postgresql start
systemctl enable postgresql   # so it survives a reboot
```

Create the database and a dedicated app user (never use the `postgres`
superuser role for the app itself):

```bash
su postgres -c "psql -c \"CREATE USER dew_app WITH PASSWORD 'CHOOSE_A_REAL_PASSWORD_HERE';\""
su postgres -c "psql -c \"CREATE DATABASE dew OWNER dew_app;\""
```

Confirm it's listening only on localhost (default install is already
correct, but worth a quick check — never expose 5432 publicly):

```bash
grep listen_addresses /etc/postgresql/*/main/postgresql.conf
# Should show: listen_addresses = 'localhost'
```

---

## 2. Pull the new code

```bash
cd /var/www/dew
git fetch origin
git log --oneline -5   # confirm 7b91bdc is there
git pull origin master
```

If `git status` shows local uncommitted changes from earlier in this
session (the manual edits you made over SSH before we moved to this
sandbox workflow), check `git diff` first — the sandbox version should
be a superset of those fixes, but confirm nothing server-specific gets
lost. When in doubt, `git stash` before pulling, then compare.

---

## 3. Run the schema

```bash
cd /var/www/dew
PGPASSWORD='CHOOSE_A_REAL_PASSWORD_HERE' psql -U dew_app -h localhost -d dew -f db/schema.sql
```

Verify all 12 tables exist:

```bash
PGPASSWORD='...' psql -U dew_app -h localhost -d dew -c "\dt"
```

---

## 4. Update `.env`

Add these to `/var/www/dew/.env` (keep everything already there — this is
additive except where noted):

```bash
# --- New: Postgres ---
DATABASE_URL=postgresql://dew_app:CHOOSE_A_REAL_PASSWORD_HERE@localhost:5432/dew

# --- New: Paystack (replaces Stripe) ---
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# --- New: Resend ---
RESEND_SMTP_HOST=smtp.resend.com
RESEND_SMTP_PORT=587
RESEND_SMTP_USERNAME=resend
RESEND_SMTP_PASSWORD=re_...   # the ROTATED key, not the one pasted in chat

# --- New: Meta Ads (optional — seed ads stay inert without this) ---
META_AD_ACCOUNT_ID=...
META_ADS_ACCESS_TOKEN=...

# --- Existing: rotate this too, was set via chat earlier this session ---
ADMIN_PASSWORD=your-new-strong-password

# --- Existing: remove these, no longer used ---
# STRIPE_SECRET_KEY=...          <- delete
# STRIPE_WEBHOOK_SECRET=...      <- delete
```

Everything above can *also* be set later from the admin dashboard's
Settings page instead of `.env` — Settings takes priority when both are
set. `.env` is the right place for the very first deploy since Settings
starts empty (and, until Task 8 below, still resets on restart).

---

## 5. Register the Paystack webhook

In your Paystack dashboard → Settings → API Keys & Webhooks, set the
Webhook URL to:

```
https://dewbyaphia.online/api/webhooks/paystack
```

There's no separate signing secret to copy — Paystack signs webhooks with
your secret key directly (HMAC-SHA512), which is already in `.env`.

---

## 6. Build and restart

```bash
cd /var/www/dew
rm -rf node_modules package-lock.json .next
npm install
npm run build
pm2 restart dew-platform --update-env
```

Watch the logs for a minute to confirm it actually stays up (recall the
crash-loop from earlier this session — same check applies):

```bash
pm2 list
pm2 logs dew-platform --lines 50
```

---

## 7. Set up the three cron jobs

These all live at `/api/cron/*` and are meant to be hit daily — each
route internally decides whether it's actually due, so a daily trigger is
correct for all three (not "run once a month manually").

```bash
crontab -e
```

Add:

```cron
# Daily content generation (only fires once cadence elapses, ~2x/month)
0 9 * * * curl -s https://dewbyaphia.online/api/cron/generate-content >> /var/log/dew-cron.log 2>&1

# Daily seed-ad check (only fires once/month, creates campaign PAUSED)
5 9 * * * curl -s https://dewbyaphia.online/api/cron/seed-ad >> /var/log/dew-cron.log 2>&1

# Daily monthly-report check (only actually sends on the 1st)
10 9 * * * curl -s https://dewbyaphia.online/api/cron/monthly-report >> /var/log/dew-cron.log 2>&1

# Nightly database backup
0 3 * * * /var/www/dew/scripts/backup-db.sh >> /var/log/dew-backup.log 2>&1
```

`scripts/backup-db.sh` is already executable in the repo. **Before
relying on it**, open it and set up the off-box copy step (commented out
by default) — local-only backups protect against a bad migration, not
against the VPS itself failing. See the comments in that file.

---

## 8. Known gap: Settings still resets on restart

The 8 stores migrated to Postgres this session (orders, leads, content,
newsletter, reels, subscribers, media, content-schedule) now survive
restarts. **`lib/store/settings.ts` was deliberately left in-memory** —
converting it touches nearly every integration file synchronously and
was scoped out as a separate follow-up (see the reasoning logged earlier
in this session). Practical effect: if you configure something via the
**admin Settings page** (rather than `.env`) and the server restarts,
you'll need to re-enter it. Anything set via `.env` is unaffected.

If this becomes annoying, that's the next thing worth tackling — same
migration pattern as the other 8 stores, just with wider blast radius.

---

## 9. Verify, in order

1. **Site loads**: `curl -I https://dewbyaphia.online` → 200
2. **Admin login works**: visit `/admin/login`, log in with the new password
3. **Dashboard shows real data**: Overview page — integrations banner
   should now list *only* things you haven't configured (Meta Ads, maybe
   Instagram/Threads if not set up yet), not a stale hardcoded list
4. **Data survives a restart**: create a test lead (Leads → Simulate
   incoming DM), then `pm2 restart dew-platform`, then check it's still
   there
5. **Checkout**: run a real ₵1 or small test transaction through Paystack
   if you have test-mode keys, confirm the order lands in Admin → Orders
   with status `paid` after the webhook fires
6. **Reels voiceover**: generate a reel (needs a JSON2Video key set),
   confirm the rendered video actually has narration this time
7. **Seed ads** (if Meta Ads configured): manually hit
   `curl https://dewbyaphia.online/api/cron/seed-ad` once, confirm a
   WhatsApp message arrives and the campaign shows up paused in
   `/admin/ads`

---

## 10. Rollback plan

If something's badly wrong after deploy:

```bash
cd /var/www/dew
git log --oneline -5          # find the previous commit (dc2ef85)
git checkout dc2ef85 -- .     # revert code only, not the database
npm install && npm run build
pm2 restart dew-platform --update-env
```

The database migration is **not** easily reversible (the old code reads
from in-memory arrays, not Postgres) — if you roll back the code, orders/
leads/content created *after* this deploy won't be visible again until
you roll forward. This is a reason to do this deploy during a quiet
period and verify thoroughly before considering it final, rather than a
reason to skip the migration.
