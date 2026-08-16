import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

const testimonials = [
  {
    quote:
      "I wore the Adjoa coat to close a deal in Geneva. Three people asked where it was from before I sat down.",
    name: "Efua A.",
    role: "Corporate Lawyer, Accra",
  },
  {
    quote:
      "The AI stylist understood 'boardroom but make it Ankara' better than my actual stylist did.",
    name: "Naa K.",
    role: "Managing Director, Lagos",
  },
  {
    quote: "My bridal look was custom-fitted in three sessions. It felt like couture, not a factory order.",
    name: "Adjoa B.",
    role: "Bride, London",
  },
];

export function Testimonials() {
  return (
    <section className="bg-primary/[0.03] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="eyebrow text-primary mb-3">In Their Words</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink">Client Notes</h2>
          <DewMotifDivider className="w-28 h-3 mx-auto mt-4" tone="gold" />
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <figure key={t.name} className="text-center px-4">
              <blockquote className="font-display italic text-lg text-ink leading-relaxed text-balance">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <p className="text-sm font-medium text-ink">{t.name}</p>
                <p className="text-xs text-ink-soft">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
