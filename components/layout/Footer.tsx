import Link from "next/link";
import Image from "next/image";
import { AtSign, Globe, MapPin, Mail, Phone, Share2, Music2, MessageCircle, Clock } from "lucide-react";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { WHATSAPP_NUMBER, WHATSAPP_DIGITS, PHONE_NUMBER, EMAIL_ORDERS, ADDRESS, APPOINTMENT_HOURS } from "@/lib/business-info";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "Custom Made", href: "/custom-design" },
      { label: "Accessories", href: "/shop?category=accessories" },
      { label: "Gift Cards", href: "/shop/gift-cards" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/dew_byaphia/", icon: AtSign },
  { label: "Facebook", href: "#", icon: Globe },
  { label: "Pinterest", href: "#", icon: Share2 },
  { label: "TikTok", href: "#", icon: Music2 },
];

export function Footer() {
  return (
    <footer className="bg-primary-deep text-cream">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/dew-logo.jpg"
                alt="DEW by Aphia"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-display text-lg leading-tight">La Maison du Mode dew</span>
            </div>
            <DewMotifDivider className="w-32 h-2.5 mt-4 mb-4 opacity-70" tone="gold" />
            <p className="text-sm text-cream/70 leading-relaxed max-w-xs">
              Premium African fashion brand mixing prints since 2014. Shipping to the USA,
              UK, Canada, Australia &amp; worldwide.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map((s) =>
                s.label === "Instagram" ? (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="p-1.5 border border-cream/25 rounded-full hover:border-gold transition-colors overflow-hidden"
                  >
                    <Image src="/brand/instagram-icon.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                  </a>
                ) : (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={s.label}
                    className="p-2 border border-cream/25 rounded-full hover:border-gold hover:text-gold transition-colors"
                  >
                    <s.icon size={15} strokeWidth={1.5} />
                  </a>
                )
              )}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow text-gold mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/75 hover:text-cream transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="eyebrow text-gold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/75">
              <li className="flex items-start gap-2">
                <MessageCircle size={14} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                <span>
                  Orders: <a href={`https://wa.me/${WHATSAPP_DIGITS}`} className="hover:text-cream">{WHATSAPP_NUMBER}</a> (WhatsApp)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                {EMAIL_ORDERS}
              </li>
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                {PHONE_NUMBER}
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                {ADDRESS}
              </li>
              <li className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                Appointments: {APPOINTMENT_HOURS}
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline my-10 opacity-30" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} La Maison du Mode dew. All rights reserved.</p>
          <div className="flex items-center gap-3 text-cream/60">
            <Image
              src="/brand/payment-methods.png"
              alt="Accepted payment methods: MoMo, Telecel Cash, GhQR, AT Money, Mastercard, Visa, GhIPSS"
              width={419}
              height={54}
              className="h-6 w-auto opacity-90"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
