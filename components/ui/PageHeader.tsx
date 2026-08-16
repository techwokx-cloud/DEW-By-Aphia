import Link from "next/link";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-10">
      <p className="eyebrow text-ink-soft mb-2">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        / <span className="text-ink">{title}</span>
      </p>
      <h1 className="font-display text-4xl text-ink mb-3">{title}</h1>
      <DewMotifDivider className="w-24 h-3" tone="gold" />
    </div>
  );
}
