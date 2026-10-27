import "server-only";
import { db } from "./db";
import type { ColorOpt, Product, Review, ShopQuery, Variant } from "./types";

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

type Row = Record<string, any>;

function mapProduct(r: Row, variants: Variant[]): Product {
  const price = r.price as number;
  const mrp = r.mrp as number;
  return {
    id: r.id, slug: r.slug, name: r.name, subtitle: r.subtitle, gender: r.gender, category: r.category,
    style: r.style, kind: r.kind, season: r.season, price, mrp,
    discountPct: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    isNew: !!r.is_new, isBestseller: !!r.is_bestseller, onSale: mrp > price,
    description: r.description, fabric: r.fabric, fit: r.fit,
    care: JSON.parse(r.care), details: JSON.parse(r.details),
    colors: JSON.parse(r.colors), sizes: JSON.parse(r.sizes), sizeGuide: r.size_guide,
    images: JSON.parse(r.images || "{}"),
    rating: r.rating, ratingCount: r.rating_count, popularity: r.popularity, createdAt: r.created_at,
    variants, inStock: variants.some((v) => v.stock > 0),
  };
}

function loadProducts(where = "", params: unknown[] = []): Product[] {
  const d = db();
  const rows = d.prepare(`SELECT * FROM products ${where}`).all(...params);
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id as number);
  const vrows = d
    .prepare(`SELECT product_id, color, size, stock FROM variants WHERE product_id IN (${ids.map(() => "?").join(",")})`)
    .all(...ids);
  const byProduct = new Map<number, Variant[]>();
  for (const v of vrows) {
    const arr = byProduct.get(v.product_id) ?? [];
    arr.push({ color: v.color, size: v.size, stock: v.stock });
    byProduct.set(v.product_id, arr);
  }
  return rows.map((r) => mapProduct(r, byProduct.get(r.id) ?? []));
}

export const getAllProducts = () => loadProducts();
export const getProduct = (slug: string) => loadProducts("WHERE slug = ?", [slug])[0] ?? null;
export const getProductById = (id: number) => loadProducts("WHERE id = ?", [id])[0] ?? null;
export function getProductsByIds(ids: number[]) {
  if (!ids.length) return [];
  const found = loadProducts(`WHERE id IN (${ids.map(() => "?").join(",")})`, ids);
  return ids.map((id) => found.find((p) => p.id === id)).filter(Boolean) as Product[];
}

const SYNONYMS: Record<string, string[]> = {
  tshirt: ["tee"], "t-shirt": ["tee"], tshirts: ["tee"], tees: ["tee"], pants: ["trousers", "cargo", "jeans"], pant: ["trousers", "cargo"],
  trouser: ["trousers"], jumper: ["knit"], sweater: ["knit", "sweat"], jersey: ["knit"], bag: ["tote"], bags: ["tote"],
  shoes: ["sneaker"], shoe: ["sneaker"], sneakers: ["sneaker"], denim: ["jeans"], jean: ["jeans"], gown: ["dress"], dresses: ["dress"],
  jackets: ["jacket", "blazer", "coat"], coats: ["coat"], hat: ["cap"], hats: ["cap"], hoodies: ["hoodie"], shirts: ["shirt"],
  mens: ["men"], man: ["men"], womens: ["women"], woman: ["women"], ladies: ["women"],
};

function matchScore(p: Product, tokens: string[]): number {
  const fields: [string, number][] = [
    [p.name.toLowerCase(), 5], [p.category.toLowerCase(), 3], [p.style.toLowerCase(), 3], [p.kind, 3],
    [p.gender, 2], [p.colors.map((c) => c.name.toLowerCase()).join(" "), 2],
    [p.subtitle.toLowerCase(), 1], [p.description.toLowerCase(), 1], [p.fabric.toLowerCase(), 1],
  ];
  let total = 0;
  for (const t of tokens) {
    const alts = [t, ...(SYNONYMS[t] ?? [])];
    let best = 0;
    for (const [text, w] of fields) {
      for (const a of alts) {
        if (text.includes(a)) {
          best = Math.max(best, w + (text.startsWith(a) ? 1 : 0));
        }
      }
    }
    if (!best) return 0; // every word must match something
    total += best;
  }
  return total;
}

export function queryProducts(q: ShopQuery): Product[] {
  let list = getAllProducts();
  if (q.gender === "men") list = list.filter((p) => p.gender === "men" || p.gender === "unisex");
  else if (q.gender === "women") list = list.filter((p) => p.gender === "women" || p.gender === "unisex");
  if (q.category) list = list.filter((p) => p.category.toLowerCase() === q.category!.toLowerCase());
  if (q.style) list = list.filter((p) => p.style === q.style);
  if (q.season) list = list.filter((p) => p.season === q.season);
  if (q.sale) list = list.filter((p) => p.onSale);
  if (q.isNew) list = list.filter((p) => p.isNew);
  if (q.min !== undefined) list = list.filter((p) => p.price >= q.min!);
  if (q.max !== undefined) list = list.filter((p) => p.price <= q.max!);
  if (q.inStock) list = list.filter((p) => p.inStock);
  if (q.colors.length) {
    const set = new Set(q.colors.map((c) => c.toLowerCase()));
    list = list.filter((p) => p.colors.some((c) => set.has(c.name.toLowerCase())));
  }
  if (q.sizes.length) {
    const set = new Set(q.sizes);
    list = list.filter((p) => p.variants.some((v) => set.has(v.size) && v.stock > 0));
  }

  let scores: Map<number, number> | null = null;
  if (q.q) {
    const tokens = q.q.toLowerCase().split(/[\s,]+/).filter(Boolean);
    scores = new Map();
    list = list.filter((p) => {
      const s = matchScore(p, tokens);
      if (s > 0) scores!.set(p.id, s);
      return s > 0;
    });
  }

  const sorters: Record<string, (a: Product, b: Product) => number> = {
    popular: (a, b) => b.popularity - a.popularity,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
  };
  if (scores && q.sort === "popular") {
    list.sort((a, b) => scores!.get(b.id)! - scores!.get(a.id)! || b.popularity - a.popularity);
  } else {
    list.sort(sorters[q.sort] ?? sorters.popular);
  }
  return list;
}

export function suggest(term: string) {
  const q = term.trim();
  if (q.length < 2) return { products: [] as Product[], categories: [] as string[], total: 0 };
  const results = queryProducts({ q, sizes: [], colors: [], inStock: false, sale: false, isNew: false, sort: "popular" });
  const lower = q.toLowerCase();
  const categories = [...new Set(getAllProducts().map((p) => p.category))].filter((c) => c.toLowerCase().includes(lower));
  return { products: results.slice(0, 6), categories: categories.slice(0, 3), total: results.length };
}

export interface Facets {
  categories: { name: string; count: number }[];
  colors: ColorOpt[];
  sizeGroups: { label: string; sizes: string[] }[];
  minPrice: number;
  maxPrice: number;
}

export function getFacets(): Facets {
  const all = getAllProducts();
  const cat = new Map<string, number>();
  const colors = new Map<string, ColorOpt>();
  const sizes = new Set<string>();
  for (const p of all) {
    cat.set(p.category, (cat.get(p.category) ?? 0) + 1);
    for (const c of p.colors) if (!colors.has(c.name)) colors.set(c.name, c);
    for (const s of p.sizes) sizes.add(s);
  }
  const clothing = ["XS", "S", "M", "L", "XL", "XXL"].filter((s) => sizes.has(s));
  const waist = ["26", "28", "30", "32", "34", "36"].filter((s) => sizes.has(s));
  const shoes = ["6", "7", "8", "9", "10", "11"].filter((s) => sizes.has(s));
  const prices = all.map((p) => p.price);
  return {
    categories: [...cat.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    colors: [...colors.values()].sort((a, b) => a.name.localeCompare(b.name)),
    sizeGroups: [
      { label: "Clothing", sizes: clothing },
      { label: "Waist", sizes: waist },
      { label: "Footwear (UK)", sizes: shoes },
    ],
    minPrice: Math.floor(Math.min(...prices) / 100) * 100,
    maxPrice: Math.ceil(Math.max(...prices) / 1000) * 1000,
  };
}

export function getRelated(p: Product, n = 4): Product[] {
  return getAllProducts()
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      s: (x.category === p.category ? 3 : 0) + (x.style === p.style ? 2 : 0) + (x.gender === p.gender || x.gender === "unisex" ? 1 : 0) + x.popularity / 200,
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((r) => r.x);
}

export const getHomepageSets = () => {
  const all = getAllProducts();
  return {
    newArrivals: [...all].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    trending: [...all].sort((a, b) => b.popularity - a.popularity).slice(0, 8),
    offers: all.filter((p) => p.onSale).sort((a, b) => b.discountPct - a.discountPct).slice(0, 4),
  };
};

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

const mapReview = (r: Row): Review => ({
  id: r.id, productId: r.product_id, author: r.author, city: r.city, rating: r.rating,
  title: r.title, body: r.body, verified: !!r.verified, createdAt: r.created_at,
});

export function getReviews(productId: number): Review[] {
  return db().prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC").all(productId).map(mapReview);
}

export function ratingBreakdown(productId: number): number[] {
  const out = [0, 0, 0, 0, 0];
  for (const r of db().prepare("SELECT rating, COUNT(*) c FROM reviews WHERE product_id = ? GROUP BY rating").all(productId)) {
    out[r.rating - 1] = r.c;
  }
  return out; // index 0 = 1 star
}

export function addReview(input: { productId: number; userId: number; author: string; rating: number; title: string; body: string }) {
  const d = db();
  const verified = d
    .prepare(`SELECT 1 FROM orders o JOIN order_items i ON i.order_id = o.id
              WHERE o.user_id = ? AND i.product_id = ? AND o.payment_status IN ('paid','cod_pending') LIMIT 1`)
    .get(input.userId, input.productId);
  const now = new Date().toISOString();
  d.prepare(
    `INSERT INTO reviews (product_id,user_id,author,city,rating,title,body,verified,is_sample,created_at)
     VALUES (?,?,?,'',?,?,?,?,0,?)
     ON CONFLICT(product_id,user_id) DO UPDATE SET rating=excluded.rating,title=excluded.title,body=excluded.body,created_at=excluded.created_at`,
  ).run(input.productId, input.userId, input.author, input.rating, input.title, input.body, verified ? 1 : 0, now);
  const agg = d.prepare("SELECT AVG(rating) a, COUNT(*) c FROM reviews WHERE product_id = ?").get(input.productId)!;
  d.prepare("UPDATE products SET rating = ?, rating_count = ? WHERE id = ?").run(Math.round(agg.a * 10) / 10, agg.c, input.productId);
}

/* ------------------------------------------------------------------ */
/* Wishlist & newsletter                                               */
/* ------------------------------------------------------------------ */

export const getWishlistIds = (userId: number): number[] =>
  db().prepare("SELECT product_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC").all(userId).map((r) => r.product_id);

export function setWishlist(userId: number, productId: number, on: boolean) {
  const d = db();
  if (on) {
    if (!getProductById(productId)) return;
    d.prepare("INSERT OR IGNORE INTO wishlist (user_id,product_id,created_at) VALUES (?,?,?)").run(userId, productId, new Date().toISOString());
  } else {
    d.prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?").run(userId, productId);
  }
}

export function subscribe(email: string): boolean {
  const r = db().prepare("INSERT OR IGNORE INTO subscribers (email,created_at) VALUES (?,?)").run(email, new Date().toISOString());
  return Number(r.changes) > 0;
}

export function getSiteRating() {
  const r = db().prepare("SELECT AVG(rating) a, COUNT(*) c FROM reviews").get()!;
  return { average: Math.round((r.a ?? 0) * 10) / 10, count: r.c as number };
}
