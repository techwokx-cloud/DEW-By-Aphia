"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Sparkles, Heart, ShieldCheck } from "lucide-react";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { APPOINTMENT_HOURS } from "@/lib/business-info";

const perks = [
  { icon: Users, label: "In-store & virtual consultations available" },
  { icon: Sparkles, label: "Personalized one-on-one session" },
  { icon: Heart, label: "Style advice & design recommendations" },
  { icon: ShieldCheck, label: "No obligation, just inspiration" },
];

export default function ConsultationPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      <div className="text-center max-w-lg mx-auto mb-12">
        <p className="eyebrow text-primary mb-3">Book a Consultation</p>
        <h1 className="font-display text-4xl text-ink">Let&rsquo;s Create Magic Together</h1>
        <DewMotifDivider className="w-24 h-3 mx-auto mt-5 mb-4" tone="gold" />
        <p className="text-ink-soft text-sm">
          Book a one-on-one consultation with our stylist either in-store or virtually.
        </p>
        <p className="text-ink-soft text-xs mt-2">By appointment, {APPOINTMENT_HOURS}.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-14 items-start">
        <div className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden hidden lg:block">
          <Image
            src="/collections/executive-2.avif"
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" id="name" required />
                <Field label="Email Address" id="email" type="email" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone Number" id="phone" type="tel" required />
                <SelectField
                  label="Consultation Type"
                  id="type"
                  options={["Custom Design", "Bridal", "Styling Session", "General Inquiry"]}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Format" id="format" options={["In-store", "Virtual"]} />
                <Field label="Preferred Date" id="date" type="date" required />
              </div>
              <Field label="Preferred Time" id="time" type="time" required />
              <button
                type="submit"
                className="w-full bg-primary text-cream py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors mt-2"
              >
                Book Now
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
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  required = false,
}: {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
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
