import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

export function LookbookHero() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-12 lg:pt-16 pb-10 text-center">
      <p className="eyebrow text-primary mb-2">Home / Lookbook</p>
      <h1 className="font-display text-4xl lg:text-5xl text-ink">Editorial Lookbook</h1>
      <DewMotifDivider className="w-24 h-3 mx-auto mt-5" tone="gold" />
      <p className="text-ink-soft max-w-lg mx-auto mt-5 text-sm leading-relaxed">
        A running record of DEW in motion — season by season, occasion by occasion.
      </p>
    </div>
  );
}
