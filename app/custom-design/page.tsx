import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomOrdersGallery } from "@/components/custom-design/CustomOrdersGallery";

const customizations = [
  "Size — made to your exact measurements",
  "Fabric — choose from our wax print & Ankara selection",
  "Color — pick the palette that suits you",
  "Embroidery & detailing — add the finishing touches that make it yours",
];

export default function CustomDesignPage() {
  return (
    <div>
      <section
        className="relative text-cream overflow-hidden"
        style={{ background: "linear-gradient(150deg, #4b1f6f 0%, #331349 55%, #6b4a1f 130%)" }}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="eyebrow text-gold mb-4">Bespoke Elegance</p>
            <h1 className="font-display text-4xl lg:text-5xl mb-5">Custom Made</h1>
            <p className="text-cream/80 leading-relaxed max-w-md mb-2">Your vision. Our craftsmanship.</p>
            <p className="text-cream/80 leading-relaxed max-w-md mb-6">
              We create made-to-measure pieces that reflect your style, your personality
              and your story.
            </p>
            <ul className="space-y-2.5 mb-8">
              {customizations.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-cream/90">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/25 text-gold mt-0.5">
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <Button href="/consultation">Start Your Custom Journey</Button>
          </div>
          <div className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden">
            <Image
              src="/custom-orders/order-01.webp"
              alt="Custom made DEW by Aphia piece"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14 lg:py-16">
        <Image
          src="/brand/how-it-works.webp"
          alt="How It Works: Consult, Design, Create, Deliver"
          width={2172}
          height={724}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="w-full h-auto"
        />
      </section>

      <div className="bg-primary/[0.03]">
        <CustomOrdersGallery />
      </div>

      <section className="mx-auto max-w-2xl px-6 lg:px-10 py-12 text-center">
        <p className="text-xs text-ink-soft leading-relaxed">
          All custom and made-to-order pieces require a 50% deposit to begin production and
          are cut specifically for you — as with all made-to-order items, they are final sale
          and not eligible for return or exchange except in the case of a manufacturing
          defect. Allow 10-14 working days for delivery or pickup.
        </p>
      </section>

      <section className="bg-primary text-cream">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="font-display text-2xl mb-1">Let&rsquo;s bring your dream look to life.</p>
            <p className="text-cream/70 text-sm">Book a consultation to start your custom piece.</p>
          </div>
          <Button
            href="/consultation"
            variant="outline"
            className="!border-cream/40 !text-cream hover:!bg-cream hover:!text-primary shrink-0"
          >
            Book a Consultation
          </Button>
        </div>
      </section>
    </div>
  );
}
