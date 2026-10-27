import { json } from "@/lib/http";
import { queryProducts } from "@/lib/repo";
import { parseShopQuery } from "@/lib/shop-query";

export const dynamic = "force-dynamic";

/** Public catalogue API: GET /api/products?gender=women&category=Dresses&sort=price-asc */
export async function GET(req: Request) {
  const q = parseShopQuery(new URL(req.url).searchParams);
  const products = queryProducts(q);
  return json({ count: products.length, products });
}
