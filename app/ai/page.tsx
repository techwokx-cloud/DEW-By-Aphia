import Image from "next/image";
import { Check } from "lucide-react";
import { AIPageChat } from "@/components/ai/AIPageChat";

const features = [
  "Personalized Recommendations",
  "Fabric & Color Matching",
  "Occasion Based Styling",
  "Style Guides & Tips",
];

export default function AIStylistPage() {
  return (
    <div>
      <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[450px]">
        <Image
          src="/brand/chat-banner.webp"
          alt="DEW AI Stylist"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      <section
        className="text-cream"
        style={{ background: "linear-gradient(150deg, #4b1f6f 0%, #331349 55%, #6b4a1f 130%)" }}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="eyebrow text-gold mb-4">AI Fashion Consultant</p>
              <h1 className="font-display text-4xl lg:text-5xl text-balance mb-5">
                Your Personal Style, Perfected
              </h1>
              <p className="text-cream/80 leading-relaxed max-w-md mb-8">
                Chat with our AI stylist to discover outfits, fabrics and designs tailored just
                for you.
              </p>
              <ul className="space-y-3 mb-9">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-cream/90">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/25 text-gold">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <AIPageChat />
          </div>
        </div>
      </section>
    </div>
  );
}
