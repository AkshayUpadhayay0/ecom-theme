import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/checkout", "/order/", "/account", "/wishlist"] }], sitemap: `${SITE.url}/sitemap.xml` };
}
