import { PageHeader } from "@/components/ui/PageHeader";

const sections = [
  {
    title: "Return Window",
    body: "Ready-to-wear pieces may be returned or exchanged within 14 days of delivery, provided they are unworn, unwashed, and in their original packaging with tags attached.",
  },
  {
    title: "Made-to-Order & Custom Pieces",
    body: "Because made-to-order and custom pieces are cut specifically for you, they are final sale and not eligible for return or exchange except in the case of a manufacturing defect.",
  },
  {
    title: "How to Start a Return",
    body: "Email info@dewbyaphia.com with your order number and the reason for return. We'll confirm eligibility and send you return instructions within 1-2 business days.",
  },
  {
    title: "Refunds",
    body: "Approved refunds are issued to your original payment method within 7-10 business days of us receiving the returned item. Shipping costs are non-refundable.",
  },
  {
    title: "Exchanges",
    body: "Need a different size or colour? Let us know when you start your return and we'll prioritize getting the right piece back to you, subject to availability.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Returns & Exchanges" />
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
