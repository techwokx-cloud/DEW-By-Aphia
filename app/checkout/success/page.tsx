import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 text-green-700 mb-6">
        <CheckCircle2 size={28} strokeWidth={1.5} />
      </span>
      <h1 className="font-display text-3xl text-ink mb-3">Order Confirmed</h1>
      <p className="text-ink-soft text-sm leading-relaxed mb-8">
        Thank you! Your payment went through and your order is confirmed. Every piece is
        made to order — allow 10-14 working days before it ships, plus delivery time to your
        address. We'll be in touch by email with updates.
      </p>
      <Button href="/shop">Continue Shopping</Button>
      <p className="text-xs text-ink-soft mt-6">
        Questions about your order?{" "}
        <Link href="/contact" className="text-primary underline underline-offset-2">
          Contact us
        </Link>
      </p>
    </div>
  );
}
