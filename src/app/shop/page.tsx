import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getFacets, queryProducts } from "@/lib/repo";
import { parseShopQuery, shopTitle } from "@/lib/shop-query";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const q = parseShopQuery(await searchParams);
  const title = shopTitle(q);
  return { title, description: `Shop ${title.toLowerCase()} at Maison Noir. Premium essentials, free shipping above ₹2,999 and 14-day returns.`, robots: q.q ? { index: false } : undefined };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const query = parseShopQuery(await searchParams);
  const products = queryProducts(query);
  return <ShopView products={products} facets={getFacets()} query={query} title={shopTitle(query)} />;
}
