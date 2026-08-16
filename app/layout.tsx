import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dew-by-aphia.onrender.com"),
  title: {
    default: "DEW By Aphia — Luxury Ghanaian Wax Print & Ankara Fashion",
    template: "%s | DEW By Aphia",
  },
  description:
    "La Maison du Mode Dew: bespoke luxury womenswear cut from authentic Ghanaian wax prints and Ankara. Made to order, ships worldwide including the USA, UK, Canada & Australia.",
  keywords: [
    "Ghanaian wax print fashion",
    "Ankara dresses",
    "African fashion USA",
    "African fashion UK",
    "luxury African womenswear",
    "made to order Ankara",
    "custom Ankara dress",
  ],
  openGraph: {
    type: "website",
    siteName: "DEW By Aphia",
    title: "DEW By Aphia — Luxury Ghanaian Wax Print & Ankara Fashion",
    description:
      "Bespoke luxury womenswear cut from authentic Ghanaian wax prints and Ankara. Made to order, ships worldwide.",
    images: ["/brand/top-info-bar.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DEW By Aphia — Luxury Ghanaian Wax Print & Ankara Fashion",
    description: "Bespoke luxury womenswear cut from authentic Ghanaian wax prints and Ankara.",
    images: ["/brand/top-info-bar.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
