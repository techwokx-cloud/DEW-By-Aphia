import { Sparkles, MessageCircle, Ruler } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

const steps = [
  { icon: MessageCircle, label: "Tell the stylist your occasion" },
  { icon: Sparkles, label: "Receive fabric & silhouette picks" },
  { icon: Ruler, label: "Book a fitting or go custom" },
];

export function AIStylistSection() {
  return (
    <section className="bg-primary/[0.04] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-block eyebrow text-primary bg-white px-4 py-1.5 rounded-full mb-4 shadow-sm">
              AI Fashion Consultant
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-ink text-balance">
              Your private stylist, available 24/7 — even at midnight.
            </h2>
            <DewMotifDivider className="w-28 h-3 mt-5 mb-6" tone="gold" />
            <p className="text-ink-soft leading-relaxed max-w-md mb-8">
              Describe the room you&rsquo;re walking into — a keynote, a wedding, a client
              dinner — and our AI stylist recommends fabric, cut, and colour from the DEW
              archive, then hands you off to a human fitting when you&rsquo;re ready.
            </p>
            <Button href="/ai" className="shadow-[var(--shadow)]">
              Talk to the AI Stylist
            </Button>
          </div>

          <div className="rounded-[var(--radius)] border border-line bg-white p-8 shadow-[var(--shadow)]">
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li key={s.label} className="flex items-center gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="eyebrow text-ink-soft mb-1">Step {i + 1}</p>
                    <p className="text-ink font-medium">{s.label}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
