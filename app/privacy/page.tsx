import { PageHeader } from "@/components/ui/PageHeader";

const sections = [
  {
    title: "Information We Collect",
    body: "When you place an order, book a consultation, or chat with our AI Stylist, we collect information such as your name, email, phone number, shipping address, and the details you share for styling recommendations.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to fulfill orders, communicate with you about your order or consultation, and — with your consent — send updates about new collections.",
  },
  {
    title: "AI Stylist Conversations",
    body: "Messages you send to our AI Stylist may be processed by a third-party AI provider to generate recommendations. We do not sell this data.",
  },
  {
    title: "Data Sharing",
    body: "We share information only with service providers who help us operate (payment processing, shipping, email) and do not sell your personal data to third parties.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by emailing info@dewbyaphia.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Privacy Policy" />
      <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3 mb-8">
        <p className="text-xs text-ink-soft leading-relaxed">
          This is placeholder template text and has not been reviewed by a lawyer. Replace
          with a policy drafted or reviewed by legal counsel — especially the AI Stylist
          data-handling section — before this site goes live for real transactions.
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
