import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/hanken-grotesk/index.css";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { QuickView } from "@/components/layout/quick-view";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { Toast } from "@/components/layout/toast";
import { Providers } from "@/components/providers";
import { SITE } from "@/config/site";
import { getUser } from "@/lib/auth";
import { getWishlistIds } from "@/lib/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  alternates: { canonical: "/" },
};
export const viewport: Viewport = { themeColor: "#121211", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: SITE.name, url: SITE.url, email: SITE.supportEmail },
      { "@type": "WebSite", name: SITE.name, url: SITE.url, potentialAction: { "@type": "SearchAction", target: `${SITE.url}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" } },
    ],
  };
  return (
    <html lang="en-IN">
      <head>
        {/* without JS, scroll-reveal content must stay visible */}
        <noscript>
          <style>{`[style*="opacity: 0"],[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers user={user} wishlistIds={wishlistIds}>
          <a href="#main" className="fixed left-4 top-4 z-[200] -translate-y-24 bg-ink px-4 py-3 text-sm text-bone transition-transform focus:translate-y-0">Skip to content</a>
          <AnnouncementBar />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          <QuickView />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
