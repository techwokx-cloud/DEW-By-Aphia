import { PageHeader } from "@/components/ui/PageHeader";

const sections = [
  {
    title: "1. Orders & Payment",
    body: "By placing an order with La Maison du Mode dew (\"DEW by Aphia\"), you agree to pay the listed price plus applicable shipping and duties. We accept payment via the methods shown at checkout.",
  },
  {
    title: "2. Made-to-Order & Custom Pieces",
    body: "Made-to-order and custom pieces are produced specifically for you and are non-refundable except where defective, as described in our Returns & Exchanges policy.",
  },
  {
    title: "3. Intellectual Property",
    body: "All designs, photography, and content on this site are the property of DEW by Aphia and may not be reproduced without permission.",
  },
  {
    title: "4. Limitation of Liability",
    body: "DEW by Aphia is not liable for delays caused by shipping carriers, customs authorities, or events outside our reasonable control.",
  },
  {
    title: "5. Governing Law",
    body: "These terms are governed by the laws of Ghana.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Terms & Conditions" />
      <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3 mb-8">
        <p className="text-xs text-ink-soft leading-relaxed">
          This is placeholder template text and has not been reviewed by a lawyer. Replace
          with terms drafted or reviewed by legal counsel before this site goes live for
          real transactions.
        </p>
      </div>
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl text-ink mb-2">{s.title}</h2>
            <p className="text-ink-soft text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
