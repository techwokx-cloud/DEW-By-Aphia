import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
        <XCircle size={28} strokeWidth={1.5} />
      </span>
      <h1 className="font-display text-3xl text-ink mb-3">Checkout Cancelled</h1>
      <p className="text-ink-soft text-sm leading-relaxed mb-8">
        No charge was made. Your cart is still saved if you'd like to try again, or reach out
        to us directly if you had any trouble.
      </p>
      <Button href="/cart">Return to Cart</Button>
    </div>
  );
}
