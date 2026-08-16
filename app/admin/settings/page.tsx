"use client";

import { useEffect, useState } from "react";
import { Save, Check, Lock } from "lucide-react";

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
  stripeSecretKey: FieldState;
  stripePublishableKey: string | null;
}

function SecretField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Not set"
        className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary font-mono"
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

  const [j2vKey, setJ2vKey] = useState("");
  const [j2vStatus, setJ2vStatus] = useState<FieldState>(null);

  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeStatus, setStripeStatus] = useState<FieldState>(null);
  const [stripePublishable, setStripePublishable] = useState("");

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
        setStripeStatus(s.stripeSecretKey);
        setStripePublishable(s.stripePublishableKey ?? "");
        setLoaded(true);
      });
  }, []);

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
      stripePublishableKey: stripePublishable || null,
    };
    // Only send secret fields the admin actually typed something into —
    // an empty password field means "leave whatever's already set alone".
    if (igToken) payload.igAccessToken = igToken;
    if (fbToken) payload.facebookPageAccessToken = fbToken;
    if (threadsToken) payload.threadsAccessToken = threadsToken;
    if (waBizToken) payload.whatsappBusinessToken = waBizToken;
    if (falKey) payload.falApiKey = falKey;
    if (j2vKey) payload.json2videoApiKey = j2vKey;
    if (stripeSecret) payload.stripeSecretKey = stripeSecret;

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
    setStripeStatus(data.item.stripeSecretKey);
    setIgToken("");
    setFbToken("");
    setThreadsToken("");
    setWaBizToken("");
    setFalKey("");
    setJ2vKey("");
    setStripeSecret("");
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
            These are real credentials for real accounts (Meta, Stripe, fal.ai, json2video).
            This page is behind your admin password, and secret values are never sent back to
            the browser after saving — but treat this like any other credentials vault.
          </p>
        </div>

        <Section title="Instagram" status={igStatus}>
          <SecretField label="Access Token" value={igToken} onChange={setIgToken} hint="From your Meta Developer App, after Instagram Business Account setup." />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Business Account ID</label>
            <input value={igAccountId} onChange={(e) => setIgAccountId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="Facebook Page" status={fbStatus}>
          <SecretField label="Page Access Token" value={fbToken} onChange={setFbToken} />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Page ID</label>
            <input value={fbPageId} onChange={(e) => setFbPageId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="Threads" status={threadsStatus}>
          <SecretField label="Access Token" value={threadsToken} onChange={setThreadsToken} hint="Separate app review from Instagram/Facebook, even though same Meta ecosystem." />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Threads User ID</label>
            <input value={threadsUserId} onChange={(e) => setThreadsUserId(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </Section>

        <Section title="WhatsApp Business (owner notifications)" status={waBizStatus}>
          <SecretField label="Business API Token" value={waBizToken} onChange={setWaBizToken} hint="Different from your customer-facing wa.me ordering number." />
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
          <SecretField label="API Key" value={falKey} onChange={setFalKey} hint="fal.ai/dashboard/keys" />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Image Model</label>
            <input
              value={falModel}
              onChange={(e) => setFalModel(e.target.value)}
              placeholder="fal-ai/flux/schnell"
              className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono"
            />
            <p className="text-xs text-ink-soft mt-1.5">
              Any fal.ai model slug that accepts a text prompt (check fal.ai/models for current
              options and exact input format before switching).
            </p>
          </div>
        </Section>

        <Section title="json2video (Reel rendering)" status={j2vStatus}>
          <SecretField label="API Key" value={j2vKey} onChange={setJ2vKey} hint="json2video.com — free tier available" />
        </Section>

        <Section title="Stripe (international checkout)" status={stripeStatus}>
          <SecretField label="Secret Key" value={stripeSecret} onChange={setStripeSecret} hint="Starts with sk_live_ or sk_test_" />
          <div>
            <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Publishable Key</label>
            <input value={stripePublishable} onChange={(e) => setStripePublishable(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary font-mono" />
          </div>
          <p className="text-xs text-ink-soft">
            Also set <code>STRIPE_WEBHOOK_SECRET</code> as an environment variable (not here —
            it's tied to a specific webhook endpoint URL registered in your Stripe dashboard).
          </p>
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
