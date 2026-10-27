import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/product-view";
import { Reviews } from "@/components/product/reviews";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/config/site";
import { getProduct, getRelated, getReviews, ratingBreakdown } from "@/lib/repo";
import { photosFor } from "@/lib/photos";

export const dynamic = "force-dynamic";
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  const img = photosFor(p, p.colors[0].name)[0];
  return {
    title: p.name,
    description: `${p.subtitle}. ${p.description}`.slice(0, 160),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description: p.description, type: "website", images: img ? [img] : undefined },
  };
}

export default async function ProductPage({ params }: { params: P }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const reviews = getReviews(p.id);
  const breakdown = ratingBreakdown(p.id);
  const related = getRelated(p, 4);
  const img = photosFor(p, p.colors[0].name);

  // Product structured data. Rating data is only emitted when real reviews exist.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: `MN-${p.id}`,
    brand: { "@type": "Brand", name: SITE.shortName },
    ...(img.length ? { image: img } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      url: `${SITE.url}/product/${p.slug}`,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(p.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.ratingCount } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <ProductView product={p} />
      <section className="container-x pt-24 lg:pt-32" aria-labelledby="reviews-h">
        <Reviews productId={p.id} productName={p.name} rating={p.rating} reviews={reviews} breakdown={breakdown} />
      </section>
      {related.length > 0 && (
        <section className="container-x py-24 lg:py-32" aria-labelledby="related-h">
          <SectionHeading id="related-h" eyebrow="Complete the look" title="You may also like" href="/shop" cta="Shop all" />
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
