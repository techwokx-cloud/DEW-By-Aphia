"use client";

import { useEffect, useState } from "react";
import { Save, Check, Lock, RefreshCw } from "lucide-react";

type FieldState = string | "SET_IN_SETTINGS" | "SET_IN_ENV" | null;

interface SettingsShape {
  ownerWhatsappOverride: string | null;
  cadenceDays: number;
  igAccessToken: FieldState;
  igBusinessAccountId: string | null;
  facebookPageAccessToken: FieldState;
  facebookPageId: string | null;
  threadsAccessToken: FieldState;
  threadsUserId: string | null;
  whatsappBusinessToken: FieldState;
  whatsappPhoneNumberId: string | null;
  falApiKey: FieldState;
  falImageModel: string;
  json2videoApiKey: FieldState;
  paystackSecretKey: FieldState;
  paystackPublicKey: string | null;
  resendSmtpHost: string | null;
  resendSmtpPort: number;
  resendSmtpUsername: string | null;
  resendSmtpPassword: FieldState;
  metaAdAccountId: string | null;
  metaAdsAccessToken: FieldState;
  seedAdBudgetUsd: number;
}

function SecretField({
  label,
  value,
  onChange,
  hint,
  status,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  status?: FieldState;
}) {
  const placeholder =
    status === "SET_IN_SETTINGS" ? "•••••••••••••••• (saved — leave blank to keep)"
    : status === "SET_IN_ENV" ? "•••••••••••••••• (set via server .env)"
    : "Not set";
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary font-mono placeholder:text-ink-soft/70"
      />
      {hint && <p className="text-xs text-ink-soft mt-1.5">{hint}</p>}
    </div>
  );
}

function StatusPill({ state }: { state: FieldState }) {
  if (state === "SET_IN_SETTINGS") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Set in dashboard</span>;
  if (state === "SET_IN_ENV") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Set in environment</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500">Not configured</span>;
}

function Section({ title, status, children }: { title: string; status: FieldState; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-[var(--radius)] bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        <StatusPill state={status} />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [whatsapp, setWhatsapp] = useState("");
  const [cadence, setCadence] = useState(15);

  const [igToken, setIgToken] = useState("");
  const [igStatus, setIgStatus] = useState<FieldState>(null);
  const [igAccountId, setIgAccountId] = useState("");

  const [fbToken, setFbToken] = useState("");
  const [fbStatus, setFbStatus] = useState<FieldState>(null);
  const [fbPageId, setFbPageId] = useState("");

  const [threadsToken, setThreadsToken] = useState("");
  const [threadsStatus, setThreadsStatus] = useState<FieldState>(null);
  const [threadsUserId, setThreadsUserId] = useState("");

  const [waBizToken, setWaBizToken] = useState("");
  const [waBizStatus, setWaBizStatus] = useState<FieldState>(null);
  const [waPhoneId, setWaPhoneId] = useState("");

  const [falKey, setFalKey] = useState("");
  const [falStatus, setFalStatus] = useState<FieldState>(null);
  const [falModel, setFalModel] = useState("fal-ai/flux/schnell");
  const [savingFalModel, setSavingFalModel] = useState(false);
  const [falModelSaved, setFalModelSaved] = useState(false);

  const [j2vKey, setJ2vKey] = useState("");
  const [j2vStatus, setJ2vStatus] = useState<FieldState>(null);

  const [paystackSecret, setPaystackSecret] = useState("");
  const [paystackStatus, setPaystackStatus] = useState<FieldState>(null);
  const [paystackPublic, setPaystackPublic] = useState("");

  const [resendHost, setResendHost] = useState("smtp.resend.com");
  const [resendPort, setResendPort] = useState(587);
  const [resendUsername, setResendUsername] = useState("resend");
  const [resendPassword, setResendPassword] = useState("");
  const [resendStatus, setResendStatus] = useState<FieldState>(null);

  const [metaAdAccountId, setMetaAdAccountId] = useState("");
  const [metaAdsToken, setMetaAdsToken] = useState("");
  const [metaAdsStatus, setMetaAdsStatus] = useState<FieldState>(null);
  const [seedAdBudget, setSeedAdBudget] = useState(10);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { item: SettingsShape }) => {
        const s = d.item;
        setWhatsapp(s.ownerWhatsappOverride ?? "");
        setCadence(s.cadenceDays);
        setIgStatus(s.igAccessToken);
        setIgAccountId(s.igBusinessAccountId ?? "");
        setFbStatus(s.facebookPageAccessToken);
        setFbPageId(s.facebookPageId ?? "");
        setThreadsStatus(s.threadsAccessToken);
        setThreadsUserId(s.threadsUserId ?? "");
        setWaBizStatus(s.whatsappBusinessToken);
        setWaPhoneId(s.whatsappPhoneNumberId ?? "");
        setFalStatus(s.falApiKey);
        setFalModel(s.falImageModel || "fal-ai/flux/schnell");
        setJ2vStatus(s.json2videoApiKey);
        setPaystackStatus(s.paystackSecretKey);
        setPaystackPublic(s.paystackPublicKey ?? "");
        setResendHost(s.resendSmtpHost || "smtp.resend.com");
        setResendPort(s.resendSmtpPort || 587);
        setResendUsername(s.resendSmtpUsername || "resend");
        setResendStatus(s.resendSmtpPassword);
        setMetaAdAccountId(s.metaAdAccountId ?? "");
        setMetaAdsStatus(s.metaAdsAccessToken);
        setSeedAdBudget(s.seedAdBudgetUsd || 10);
        setLoaded(true);
      });
  }, []);

  async function saveFalModel() {
    setSavingFalModel(true);
    setFalModelSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ falImageModel: falModel }),
    });
    setSavingFalModel(false);
    setFalModelSaved(true);
    setTimeout(() => setFalModelSaved(false), 2000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      ownerWhatsappOverride: whatsapp || null,
      cadenceDays: cadence,
      igBusinessAccountId: igAccountId || null,
      facebookPageId: fbPageId || null,
      threadsUserId: threadsUserId || null,
      whatsappPhoneNumberId: waPhoneId || null,
      falImageModel: falModel,
      paystackPublicKey: paystackPublic || null,
      resendSmtpHost: resendHost || null,
      resendSmtpPort: resendPort,
      resendSmtpUsername: resendUsername || null,
      metaAdAccountId: metaAdAccountId || null,
      seedAdBudgetUsd: seedAdBudget,
    };
    // Only send secret fields the admin actually typed something into —
    // an empty password field means "leave whatever's already set alone".
    if (igToken) payload.igAccessToken = igToken;
    if (fbToken) payload.facebookPageAccessToken = fbToken;
    if (threadsToken) payload.threadsAccessToken = threadsToken;
    if (waBizToken) payload.whatsappBusinessToken = waBizToken;
    if (falKey) payload.falApiKey = falKey;
    if (j2vKey) payload.json2videoApiKey = j2vKey;
    if (paystackSecret) payload.paystackSecretKey = paystackSecret;
    if (resendPassword) payload.resendSmtpPassword = resendPassword;
    if (metaAdsToken) payload.metaAdsAccessToken = metaAdsToken;

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setIgStatus(data.item.igAccessToken);
    setFbStatus(data.item.facebookPageAccessToken);
    setThreadsStatus(data.item.threadsAccessToken);
    setWaBizStatus(data.item.whatsappBusinessToken);
    setFalStatus(data.item.falApiKey);
    setJ2vStatus(data.item.json2videoApiKey);
    setPaystackStatus(data.item.paystackSecretKey);
    setResendStatus(data.item.resendSmtpPassword);
    setMetaAdsStatus(data.item.metaAdsAccessToken);
    setIgToken("");
    setFbToken("");
    setThreadsToken("");
    setWaBizToken("");
    setFalKey("");
    setJ2vKey("");
    setPaystackSecret("");
    setResendPassword("");
    setMetaAdsToken("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!loaded) return <p className="text-ink-soft text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Settings</h1>
      <p className="text-ink-soft text-sm mb-8">
        Change API credentials anytime — no redeploy needed. Secret fields never display their
        saved value again; leave a field blank to keep what's already set.
      </p>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3 flex items-start gap-2">
          <Lock size={14} className="text-gold shrink-0 mt-0.5" strokeWidth={1.75} />
          <p className="text-xs text-ink-soft leading-relaxed">
            These are real credentials for real accounts (Meta, Paystack, Resend, fal.ai, json2video).
            This page is behind your admin password, and secret values are never sent back to
            the browser after saving — but treat this like any other credentials vault.
          </p>
        </div>

        <Section title="Instagram" status={igStatus}>
          <SecretField label="Access Token" value={igToken} onChange={setIgToken} hint="From your Meta Developer App, after Instagram Business Account setup." status={igStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Business Account ID</label>
            <input value={igAccountId} onChange={(e) => setIgAccountId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="Facebook Page" status={fbStatus}>
          <SecretField label="Page Access Token" value={fbToken} onChange={setFbToken} status={fbStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Page ID</label>
            <input value={fbPageId} onChange={(e) => setFbPageId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="Threads" status={threadsStatus}>
          <SecretField label="Access Token" value={threadsToken} onChange={setThreadsToken} hint="Separate app review from Instagram/Facebook, even though same Meta ecosystem." status={threadsStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Threads User ID</label>
            <input value={threadsUserId} onChange={(e) => setThreadsUserId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="WhatsApp Business (owner notifications)" status={waBizStatus}>
          <SecretField label="Business API Token" value={waBizToken} onChange={setWaBizToken} hint="Different from your customer-facing wa.me ordering number." status={waBizStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Phone Number ID</label>
            <input value={waPhoneId} onChange={(e) => setWaPhoneId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Owner Number to Notify</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="233504115111" className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="fal.ai (AI image/video generation)" status={falStatus}>
          <SecretField label="API Key" value={falKey} onChange={setFalKey} hint="fal.ai/dashboard/keys" status={falStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Image Model</label>
            <div className="flex gap-2">
              <select
                value={falModel}
                onChange={(e) => setFalModel(e.target.value)}
                className="flex-1 border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono bg-white"
              >
                <option value="fal-ai/flux/schnell">FLUX.1 [schnell] — fast &amp; cheap (current default)</option>
                <option value="fal-ai/flux/dev">FLUX.1 [dev] — higher quality, slower</option>
                <option value="fal-ai/flux-pro/v1.1-ultra">FLUX1.1 [pro] ultra — up to 2K, best photo realism</option>
                <option value="fal-ai/ideogram/v3">Ideogram V3 — built for posters/logos, best text-in-image rendering</option>
                <option value="fal-ai/recraft-v3">Recraft V3 — vector/brand-system output, also strong at text</option>
                <option value="fal-ai/nano-banana-2">Nano Banana 2 (Google) — fast, strong text rendering</option>
              </select>
              <button
                type="button"
                onClick={saveFalModel}
                disabled={savingFalModel}
                className="shrink-0 flex items-center gap-1.5 border border-primary text-primary px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-primary hover:text-cream transition-colors disabled:opacity-50"
              >
                {falModelSaved ? <Check size={13} /> : <RefreshCw size={13} className={savingFalModel ? "animate-spin" : ""} />}
                {savingFalModel ? "Updating…" : falModelSaved ? "Updated" : "Update"}
              </button>
            </div>
            <p className="text-xs text-ink-soft mt-1.5">
              Given the poster-style graphics this app generates, <strong>Ideogram V3</strong> or{" "}
              <strong>Recraft V3</strong> are worth trying first — most other models (including
              FLUX) render in-image text unreliably, which is why headlines are drawn separately
              as crisp SVG text rather than left to the AI model. Check current pricing/availability
              at fal.ai/models before switching, since the catalog changes often.
            </p>
          </div>
        </Section>

        <Section title="json2video (Reel rendering)" status={j2vStatus}>
          <SecretField label="API Key" value={j2vKey} onChange={setJ2vKey} hint="json2video.com — free tier available" status={j2vStatus} />
        </Section>

        <Section title="Paystack (international checkout)" status={paystackStatus}>
          <SecretField label="Secret Key" value={paystackSecret} onChange={setPaystackSecret} hint="Starts with sk_live_ or sk_test_ — from your Paystack dashboard → Settings → API Keys" status={paystackStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Public Key</label>
            <input value={paystackPublic} onChange={(e) => setPaystackPublic(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono" />
          </div>
          <p className="text-xs text-ink-soft">
            Also register <code>https://your-domain/api/webhooks/paystack</code> as your Webhook
            URL in Paystack → Settings → API Keys &amp; Webhooks — that's what confirms a
            payment actually went through.
          </p>
        </Section>

        <Section title="Resend (Transactional Email)" status={resendStatus}>
          <SecretField label="SMTP Password (API Key)" value={resendPassword} onChange={setResendPassword} hint="From resend.com/api-keys — starts with re_" status={resendStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">SMTP Host</label>
            <input value={resendHost} onChange={(e) => setResendHost(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">SMTP Port</label>
            <select
              value={resendPort}
              onChange={(e) => setResendPort(Number(e.target.value))}
              className="w-full max-w-xs border border-line px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value={587}>587 (TLS — recommended)</option>
              <option value={465}>465 (SSL)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">SMTP Username</label>
            <input value={resendUsername} onChange={(e) => setResendUsername(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono" />
          </div>
        </Section>

        <Section title="Meta Ads (Seed Ad Campaigns)" status={metaAdsStatus}>
          <p className="text-xs text-ink-soft -mt-1 mb-3">
            A minimum $10 ad runs every month for 10 days, rotating between engagement, leads,
            and reach — created paused, and only launches once you tap Launch on the Seed Ads
            page. Uses the same Facebook Page / Instagram Business Account set above; the token
            here needs the <code>ads_management</code> permission, which your organic posting
            token may not have.
          </p>
          <SecretField label="Marketing API Access Token" value={metaAdsToken} onChange={setMetaAdsToken} hint="Needs ads_management scope — from Meta Business Suite → System Users" status={metaAdsStatus} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Ad Account ID</label>
            <input value={metaAdAccountId} onChange={(e) => setMetaAdAccountId(e.target.value)} placeholder="123456789012345" className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono" />
            <p className="text-xs text-ink-soft mt-1.5">Numbers only, no "act_" prefix — found in Meta Ads Manager → Account Overview.</p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Monthly Budget (USD)</label>
            <input
              type="number"
              min={10}
              step={1}
              value={seedAdBudget}
              onChange={(e) => setSeedAdBudget(Math.max(10, Number(e.target.value)))}
              className="w-full max-w-xs border border-line px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <p className="text-xs text-ink-soft mt-1.5">$10 minimum, spent over 10 days each month.</p>
          </div>
        </Section>

        <div>
          <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Content Generation Cadence</label>
          <select
            value={cadence}
            onChange={(e) => setCadence(Number(e.target.value))}
            className="w-full max-w-xs border border-line px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value={7}>Every 7 days (~4x/month)</option>
            <option value={15}>Every 15 days (~2x/month)</option>
            <option value={30}>Every 30 days (~1x/month)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-cream px-6 py-3 text-sm tracking-[0.05em] uppercase hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={15} strokeWidth={2} /> : <Save size={15} strokeWidth={1.75} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
