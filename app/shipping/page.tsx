import { PageHeader } from "@/components/ui/PageHeader";

const sections = [
  {
    title: "Made-to-Order & Deposit",
    body: "All dresses are made to order in your size. A 50% deposit secures your order, with the remaining 50% due when it's ready for pickup or shipment. Please allow 10-14 working days for delivery or pickup.",
  },
  {
    title: "How to Order",
    body: "All new orders are placed via WhatsApp so we can confirm your size, fabric, and deposit directly — message us at +233 50 411 5111 to start an order.",
  },
  {
    title: "Worldwide Shipping",
    body: "We ship to most countries worldwide. Once your deposit is confirmed, allow 10-14 working days for your piece to be made, then standard delivery timelines apply to your destination.",
  },
  {
    title: "Shipping Costs",
    body: "Shipping costs are calculated based on destination and order weight and confirmed with you over WhatsApp before your balance payment.",
  },
  {
    title: "Customs & Duties",
    body: "International orders may be subject to import duties and taxes levied by the destination country. These charges are the responsibility of the recipient and are not included in the item price.",
  },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="Shipping & Delivery" />
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
