import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AIBanner() {
  return (
    <section className="bg-primary-deep text-cream">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/50">
          <Sparkles size={20} className="text-gold" strokeWidth={1.5} />
        </span>
        <div className="flex-1 text-center sm:text-left">
          <p className="eyebrow text-gold mb-1">Design Your Dream Look</p>
          <h3 className="font-display text-xl sm:text-2xl">AI Fashion Consultant</h3>
          <p className="text-cream/70 text-sm mt-1">
            Get personalized style recommendations, fabric suggestions and custom design
            ideas just for you.
          </p>
        </div>
        <Button href="/ai" className="shrink-0">
          Start Your Style Journey
          <ArrowRight size={14} />
        </Button>
      </div>
    </section>
  );
}
