import { json } from "@/lib/http";
import { suggest } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const r = suggest(q.slice(0, 60));
  return json({
    total: r.total,
    categories: r.categories,
    products: r.products.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, kind: p.kind, price: p.price, mrp: p.mrp, category: p.category,
      color: p.colors[0], images: p.images,
    })),
  });
}
