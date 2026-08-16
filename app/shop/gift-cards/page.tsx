import { Gift } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function GiftCardsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16 text-center">
      <PageHeader title="Gift Cards" />
      <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
        <Gift size={26} strokeWidth={1.5} />
      </span>
      <p className="font-display text-2xl text-ink mb-2">Coming Soon</p>
      <p className="text-ink-soft text-sm leading-relaxed max-w-sm mx-auto">
        DEW gift cards are on the way. In the meantime, a{" "}
        <a href="/consultation" className="text-primary underline underline-offset-2">
          consultation
        </a>{" "}
        makes a wonderful gift too — reach out and we&rsquo;ll help you arrange it.
      </p>
    </div>
  );
}
