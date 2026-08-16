import { Scissors, Palette, Users, Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EMAIL_ORDERS } from "@/lib/business-info";

const values = [
  { icon: Scissors, title: "Craftsmanship First", desc: "Every piece is cut and finished by hand — we look for people who take pride in precision." },
  { icon: Palette, title: "Design With Heritage", desc: "We celebrate Ghanaian wax print and Ankara, not just wear it — our team brings real cultural fluency to every collection." },
  { icon: Users, title: "Small Team, Real Ownership", desc: "We're a small Accra-based house — everyone's work is visible in the final piece, not lost in a big org chart." },
  { icon: Heart, title: "Women-Led, Women-Focused", desc: "Founded and led by Aphia, building for the woman who leads the room." },
];

const roles = [
  { title: "Tailor / Seamstress", type: "Atelier, Accra", desc: "Made-to-order construction, fittings, and finishing work on wax-print and Ankara pieces." },
  { title: "Fashion Design Intern", type: "Atelier, Accra", desc: "Support seasonal collection development, from sketch to sample." },
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Careers" />
      <p className="text-ink-soft leading-relaxed mb-10">
        DEW by Aphia is a growing house of Ghanaian wax-print and Ankara fashion, built by a
        small team of designers, tailors, and stylists in Accra. We're looking for people who
        care about craftsmanship as much as we do.
      </p>

      <h2 className="font-display text-xl text-ink mb-5">What We Value</h2>
      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {values.map((v) => (
          <div key={v.title} className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <v.icon size={17} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink mb-1">{v.title}</p>
              <p className="text-xs text-ink-soft leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl text-ink mb-5">Open Roles</h2>
      <div className="space-y-4 mb-10">
        {roles.map((r) => (
          <div key={r.title} className="border border-line rounded-[var(--radius)] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-ink">{r.title}</p>
              <span className="text-xs text-ink-soft">{r.type}</span>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-ink-soft leading-relaxed">
        Don't see the right fit but think you'd add something to the team anyway? We're
        always glad to hear from people who love craftsmanship and African design. Send a
        short note and your portfolio or CV to{" "}
        <a href={`mailto:${EMAIL_ORDERS}`} className="text-primary underline underline-offset-2">
          {EMAIL_ORDERS}
        </a>
        .
      </p>
    </div>
  );
}
