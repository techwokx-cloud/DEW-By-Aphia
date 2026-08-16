"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsapp: whatsapp || undefined }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please try again.");
    }
  }

  return (
    <section className="bg-primary text-cream py-20 lg:py-24">
      <div className="mx-auto max-w-lg px-6 text-center">
        <p className="eyebrow text-gold-soft mb-3">Stay in the Atelier</p>
        <h2 className="font-display text-3xl text-balance">
          First look at new collections & consultation dates.
        </h2>
        <DewMotifDivider className="w-28 h-3 mx-auto mt-5 mb-8" tone="gold" />

        {submitted ? (
          <p className="text-gold-soft">You&rsquo;re on the list — welcome to the house.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-cream/30 px-4 py-3 text-sm placeholder:text-cream/50 focus:border-gold outline-none"
              />
              <Button type="submit" variant="outline" className="!border-cream/40 !text-cream hover:!bg-cream hover:!text-primary">
                Subscribe
              </Button>
            </div>

            {showWhatsapp ? (
              <div>
                <label htmlFor="newsletter-whatsapp" className="sr-only">
                  WhatsApp number
                </label>
                <input
                  id="newsletter-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp number (optional)"
                  className="w-full bg-transparent border border-cream/30 px-4 py-3 text-sm placeholder:text-cream/50 focus:border-gold outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowWhatsapp(true)}
                className="text-xs text-cream/60 hover:text-cream underline underline-offset-2"
              >
                + Also get updates on WhatsApp
              </button>
            )}

            {error && <p className="text-xs text-red-200">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
