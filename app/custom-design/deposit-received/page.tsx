import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/business-info";

export default function DepositReceivedPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
        <CheckCircle2 size={28} strokeWidth={1.5} />
      </span>
      <h1 className="font-display text-3xl text-ink mb-3">Deposit Received</h1>
      <p className="text-ink-soft text-sm leading-relaxed mb-2">
        Thank you — your 50% deposit is confirmed. We&rsquo;ll be in touch shortly to confirm
        your measurements and any final design details before we start cutting.
      </p>
      <p className="text-ink-soft text-sm leading-relaxed mb-8">
        Allow 10-14 working days from confirmation, and the remaining 50% is due when your
        piece is ready for pickup or shipment.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/lookbook"
          className="border border-line text-ink px-6 py-3 text-sm tracking-[0.08em] uppercase hover:border-primary transition-colors"
        >
          Browse the LookBook
        </Link>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="bg-primary text-cream px-6 py-3 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors"
        >
          Message Us on WhatsApp
        </a>
      </div>
    </div>
  );
}
