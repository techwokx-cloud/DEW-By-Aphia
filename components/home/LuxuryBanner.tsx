import { DewMotifCorner } from "@/components/ui/AnkaraMotif";

export function LuxuryBanner() {
  return (
    <section className="relative bg-primary text-cream py-20 lg:py-28 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #c8a14a 0px, #c8a14a 1px, transparent 1px, transparent 22px)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <DewMotifCorner className="w-10 h-10 mx-auto mb-8 opacity-80" tone="gold" />
        <p className="font-display italic text-2xl sm:text-3xl lg:text-[2.35rem] leading-snug text-balance">
          "Every yard of wax print carries a proverb. We cut ours into blazers, so the
          boardroom can hear it too."
        </p>
        <p className="eyebrow text-gold-soft mt-8">Aphia, Founder &amp; Creative Director</p>
      </div>
    </section>
  );
}
