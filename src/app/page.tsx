import type { Metadata } from "next";
import { CollectionCards } from "@/components/home/collections";
import { Editorial } from "@/components/home/editorial";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Newsletter } from "@/components/home/newsletter";
import { Offers } from "@/components/home/offers";
import { Testimonials } from "@/components/home/testimonials";
import { TrendingCarousel } from "@/components/home/trending";
import { ProductGrid } from "@/components/shop/product-grid";
import { Stars } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/config/site";
import { getHomepageSets, getSiteRating } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: `${SITE.name} | ${SITE.tagline}` } };

export default function HomePage() {
  const { newArrivals, trending, offers } = getHomepageSets();
  const rating = getSiteRating();
  const maxDiscount = Math.max(0, ...offers.map((p) => p.discountPct));

  return (
    <>
      <Hero />
      <Marquee />

      <section className="container-x pt-24 lg:pt-32" aria-labelledby="collections-title">
        <SectionHeading id="collections-title" eyebrow="Shop by category" title="Featured collections" href="/collections" cta="All collections" />
        <CollectionCards />
      </section>

      <section id="new-arrivals" className="container-x scroll-mt-24 pt-28 lg:pt-40" aria-labelledby="new-title">
        <SectionHeading id="new-title" eyebrow="Just landed" title="New arrivals" href="/shop?new=1&sort=newest" />
        <ProductGrid products={newArrivals} />
      </section>

      <div className="mt-28 lg:mt-40"><Editorial /></div>

      <section className="container-x pt-28 lg:pt-40" aria-labelledby="trending-title">
        <SectionHeading id="trending-title" eyebrow="Most loved" title="Trending now" href="/shop?sort=popular" cta="Shop bestsellers" />
        <TrendingCarousel products={trending} />
      </section>

      <section className="container-x pt-28 lg:pt-40" aria-labelledby="offers-title">
        <h2 id="offers-title" className="sr-only">Special offers</h2>
        <Offers sale={offers} maxDiscount={maxDiscount} />
      </section>

      <section className="container-x pt-28 lg:pt-40" aria-labelledby="reviews-title">
        <SectionHeading id="reviews-title" eyebrow="Kind words" title="Loved by our customers" />
        <Reveal className="-mt-6 mb-10 flex items-center gap-3 text-sm lg:-mt-8">
          <Stars rating={rating.average} size={18} />
          <span><b className="font-semibold">{rating.average.toFixed(1)}</b> average from {rating.count} product reviews</span>
        </Reveal>
        <Testimonials />
      </section>

      <section className="container-x py-28 lg:py-40" aria-label="Newsletter">
        <Newsletter />
      </section>
    </>
  );
}
