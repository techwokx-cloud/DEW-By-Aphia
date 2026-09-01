"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, Users, Sparkles, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomOrdersGallery } from "@/components/custom-design/CustomOrdersGallery";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { APPOINTMENT_HOURS } from "@/lib/business-info";

const customizations = [
  "Size — made to your exact measurements",
  "Fabric — choose from our wax print & Ankara selection",
  "Color — pick the palette that suits you",
  "Embroidery & detailing — add the finishing touches that make it yours",
];

const perks = [
  { icon: Users, label: "In-store & virtual consultations available" },
  { icon: Sparkles, label: "Personalized one-on-one session" },
  { icon: Heart, label: "Style advice & design recommendations" },
  { icon: ShieldCheck, label: "No obligation, just inspiration" },
];

export default function CustomDesignPage() {
  return (
    <div>
      <section
        className="relative text-cream overflow-hidden"
        style={{ background: "linear-gradient(150deg, #4b1f6f 0%, #331349 55%, #6b4a1f 130%)" }}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="eyebrow text-gold mb-4">Bespoke Elegance</p>
            <h1 className="font-display text-4xl lg:text-5xl mb-5">Custom Made</h1>
            <p className="text-cream/80 leading-relaxed max-w-md mb-2">Your vision. Our craftsmanship.</p>
            <p className="text-cream/80 leading-relaxed max-w-md mb-6">
              Every DEW by Aphia piece is made to order — nothing is pre-sewn or held in stock.
              Browse the LookBook for inspiration, then start your custom order below.
            </p>
            <ul className="space-y-2.5 mb-8">
              {customizations.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-cream/90">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/25 text-gold mt-0.5">
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <Button href="#book">Start Your Custom Journey</Button>
          </div>
          <div className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden">
            <Image
              src="/custom-orders/order-01.webp"
              alt="Custom made DEW by Aphia piece"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14 lg:py-16">
        <Image
          src="/brand/how-it-works.webp"
          alt="How It Works: Consult, Design, Create, Deliver"
          width={2172}
          height={724}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="w-full h-auto"
        />
      </section>

      <div className="bg-primary/[0.03]">
        <CustomOrdersGallery />
      </div>

      <section className="mx-auto max-w-2xl px-6 lg:px-10 py-12 text-center">
        <p className="text-xs text-ink-soft leading-relaxed">
          All custom and made-to-order pieces require a 50% deposit to begin production and
          are cut specifically for you — as with all made-to-order items, they are final sale
          and not eligible for return or exchange except in the case of a manufacturing
          defect. Allow 10-14 working days for delivery or pickup.
        </p>
      </section>

      <Suspense fallback={null}>
        <BookingSection />
      </Suspense>
    </div>
  );
}

function BookingSection() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ghsPreview, setGhsPreview] = useState<{ ghsAmount: number; rate: number } | null>(null);
  const referenceDesign = searchParams.get("design") ?? "";
  const price = searchParams.get("price") ? Number(searchParams.get("price")) : null;
  const depositUsd = price ? Math.round(price * 0.5 * 100) / 100 : null;

  // Show the GHS amount the customer will actually be charged before
  // they submit — the real conversion happens server-side at payment
  // time, but showing an estimate upfront means nothing is a surprise
  // once they reach Paystack's page.
  useEffect(() => {
    if (!depositUsd) return;
    fetch(`/api/currency/preview?usd=${depositUsd}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ghsAmount) setGhsPreview({ ghsAmount: d.ghsAmount, rate: d.rate });
      })
      .catch(() => {});
  }, [depositUsd]);

  // Next.js's native #hash scroll can fire before this client component
  // (inside a Suspense boundary) has actually mounted, so navigating here
  // via a "#book" link can silently land at the top of the page instead
  // of the form — scroll explicitly once mounted as a reliable fallback.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const design = String(form.get("referenceDesign") ?? referenceDesign);

    // Only a design coming from a specific product (with a known price)
    // goes straight to a deposit payment — a general consultation with
    // no fixed design/price yet stays a plain "we'll be in touch" request.
    if (!price) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, designName: design, price }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Couldn't start payment right now — please try again, or message us on WhatsApp instead.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start payment — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section id="book" className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14 lg:py-16 scroll-mt-20">
      <div className="text-center max-w-lg mx-auto mb-12">
        <p className="eyebrow text-primary mb-3">Start Your Custom Order</p>
        <h1 className="font-display text-4xl text-ink">Let&rsquo;s Create Magic Together</h1>
        <DewMotifDivider className="w-24 h-3 mx-auto mt-5 mb-4" tone="gold" />
        <p className="text-ink-soft text-sm">
          {price
            ? "Tell us a bit about yourself, then confirm your 50% deposit to begin."
            : "Tell us what you have in mind — in-store, virtually, or both. There's no payment due until we've confirmed your design together."}
        </p>
        <p className="text-ink-soft text-xs mt-2">By appointment, {APPOINTMENT_HOURS}.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-14 items-start">
        <div className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden hidden lg:block">
          <Image
            src="/custom-orders/order-05.webp"
            alt="DEW by Aphia consultation atelier"
            fill
            sizes="50vw"
            className="object-cover"
          />
        </div>

        <div>
          {submitted ? (
            <div className="rounded-[var(--radius)] border border-line bg-white p-10 text-center">
              <p className="font-display text-2xl text-primary mb-2">Thank you!</p>
              <p className="text-ink-soft text-sm">
                We&rsquo;ve received your request and will confirm your consultation by email
                shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {referenceDesign && (
                <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3">
                  <p className="text-xs text-ink-soft">
                    Referencing design: <span className="text-ink font-medium">{referenceDesign}</span>
                    {price ? <span className="text-ink font-medium"> · ${price.toLocaleString()}</span> : null}.
                    Every custom piece is made specifically for you — if you&rsquo;d like this
                    exact design recreated in your size, say so below; we&rsquo;ll confirm every
                    detail with you before we start.
                  </p>
                  {depositUsd && (
                    <p className="text-xs text-ink font-medium mt-2 pt-2 border-t border-gold/30">
                      50% deposit due now: ${depositUsd.toLocaleString()}
                      {ghsPreview && <span className="text-ink-soft font-normal"> (≈ ₵{ghsPreview.ghsAmount.toLocaleString()} GHS, charged via Paystack)</span>}
                    </p>
                  )}
                </div>
              )}
              <Field label="Reference Design (optional)" id="referenceDesign" defaultValue={referenceDesign} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" id="name" required />
                <Field label="Email Address" id="email" type="email" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone Number" id="phone" type="tel" required />
                <SelectField
                  label="Consultation Type"
                  id="type"
                  options={["Custom Design", "Bridal", "Styling Session", "General Inquiry", "Other"]}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Format" id="format" options={["In-store", "Virtual", "Both"]} />
                <Field label="Preferred Date" id="date" type="date" required />
              </div>
              <Field label="Preferred Time" id="time" type="time" required />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-cream py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors mt-2 disabled:opacity-60"
              >
                {submitting ? "Starting payment…" : price ? `Confirm & Pay $${(price * 0.5).toLocaleString()} Deposit` : "Start My Custom Order"}
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-line">
            {perks.map((p) => (
              <div key={p.label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <p.icon size={15} strokeWidth={1.5} />
                </span>
                <p className="text-xs text-ink-soft leading-snug">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  id,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
      />
    </div>
  );
}

function SelectField({ label, id, options }: { label: string; id: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
