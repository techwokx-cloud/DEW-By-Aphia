"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Sparkles, MessageCircle, ShoppingBag, LogOut, ExternalLink, TrendingUp, Mail, ImageIcon, Settings, Film } from "lucide-react";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Sales", href: "/admin/sales", icon: TrendingUp },
  { label: "Marketing", href: "/admin/marketing", icon: Mail },
  { label: "Content Queue", href: "/admin/content", icon: Sparkles },
  { label: "Reels", href: "/admin/reels", icon: Film },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "Leads (Instagram)", href: "/admin/leads", icon: MessageCircle },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 shrink-0 bg-ink text-cream flex flex-col">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-cream/10">
          <Image
            src="/brand/dew-logo.jpg"
            alt="DEW by Aphia"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-sm leading-none">DEW Admin</p>
            <p className="text-[10px] text-cream/50 mt-1">Internal dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active ? "bg-cream/10 text-cream" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                }`}
              >
                <item.icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-cream/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-cream/60 hover:bg-cream/5 hover:text-cream transition-colors"
          >
            <ExternalLink size={16} strokeWidth={1.5} />
            View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-cream/60 hover:bg-cream/5 hover:text-cream transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
