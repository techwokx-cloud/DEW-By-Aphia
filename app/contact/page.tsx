"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WHATSAPP_NUMBER, WHATSAPP_DIGITS, PHONE_NUMBER, EMAIL_ORDERS, ADDRESS, APPOINTMENT_HOURS } from "@/lib/business-info";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Contact Us" />
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-14">
        <div className="space-y-6">
          <p className="text-ink-soft leading-relaxed">
            Have a question about an order, a custom piece, or a partnership? We&rsquo;d love
            to hear from you.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle size={16} strokeWidth={1.5} />
              </span>
              <a
                href={`https://wa.me/${WHATSAPP_DIGITS}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-ink hover:text-primary"
              >
                {WHATSAPP_NUMBER} — Orders (WhatsApp)
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={16} strokeWidth={1.5} />
              </span>
              <a href={`mailto:${EMAIL_ORDERS}`} className="text-sm text-ink hover:text-primary">
                {EMAIL_ORDERS}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone size={16} strokeWidth={1.5} />
              </span>
              <a href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`} className="text-sm text-ink hover:text-primary">
                {PHONE_NUMBER}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin size={16} strokeWidth={1.5} />
              </span>
              <p className="text-sm text-ink">{ADDRESS}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock size={16} strokeWidth={1.5} />
              </span>
              <p className="text-sm text-ink">{APPOINTMENT_HOURS}</p>
            </div>
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="rounded-[var(--radius)] border border-line bg-white p-10 text-center">
              <p className="font-display text-2xl text-primary mb-2">Message sent</p>
              <p className="text-ink-soft text-sm">We&rsquo;ll get back to you within 1-2 business days.</p>
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
                <input
                  required
                  placeholder="Your Name"
                  className="border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  required
                  type="email"
                  placeholder="Your Email"
                  className="border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <input
                placeholder="Subject"
                className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
              />
              <textarea
                required
                rows={5}
                placeholder="Your Message"
                className="w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary resize-none"
              />
              <button
                type="submit"
                className="bg-primary text-cream px-8 py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
