"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, User, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "LookBook", href: "/lookbook" },
  { label: "Custom Made", href: "/custom-design" },
  { label: "About Us", href: "/about" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 gap-6">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/brand/dew-logo.jpg"
              alt="DEW by Aphia"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
              priority
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-[1.15rem] text-ink">La Maison du Mode dew</span>
              <span className="eyebrow text-ink-soft text-[10px] tracking-[0.2em] mt-1">
                Premium Fashion Brand
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 ml-4">
            {NAV_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] tracking-[0.08em] uppercase transition-colors ${
                    active ? "text-gold" : "text-ink-soft hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 ml-auto">
            <button aria-label="Search" className="hidden sm:block p-2 hover:text-primary transition-colors">
              <Search size={19} strokeWidth={1.5} />
            </button>
            <Link
              href="/auth/login"
              aria-label="Account"
              className="p-2 hover:text-primary transition-colors"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>
            <Link
              href="/custom-design"
              className="hidden sm:inline-flex ml-2 items-center bg-primary text-cream px-5 py-2.5 text-xs tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors"
            >
              Start Your Custom Journey
            </Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-cream shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <Image src="/brand/dew-logo.jpg" alt="DEW by Aphia" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base tracking-wide uppercase text-ink-soft hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/custom-design"
                onClick={() => setOpen(false)}
                className="mt-4 text-center text-sm tracking-[0.1em] uppercase bg-primary text-cream py-3"
              >
                Start Your Custom Journey
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
