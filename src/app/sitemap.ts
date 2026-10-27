import type { MetadataRoute } from "next";
import { PAGES } from "@/config/pages";
import { SITE } from "@/config/site";
import { getAllProducts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE.url}${p}`;
  return [
    ...["/", "/shop", "/collections", "/track"].map((p) => ({ url: u(p) })),
    ...["/shop?gender=men", "/shop?gender=women", "/shop?sale=1", "/shop?new=1&sort=newest"].map((p) => ({ url: u(p) })),
    ...[...Object.keys(PAGES), "size-guide"].map((s) => ({ url: u(`/pages/${s}`) })),
    ...getAllProducts().map((p) => ({ url: u(`/product/${p.slug}`) })),
  ];
}
