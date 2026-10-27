import type { ShopQuery, SortKey } from "./types";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest arrivals" },
  { value: "rating", label: "Customer rating" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function get(p: Params, k: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(k) ?? undefined;
  const v = p[k];
  return Array.isArray(v) ? v[0] : v;
}
function list(p: Params, k: string): string[] {
  const raw = get(p, k);
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}
function num(s?: string): number | undefined {
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseShopQuery(p: Params): ShopQuery {
  const sort = get(p, "sort") as SortKey | undefined;
  return {
    gender: get(p, "gender") || undefined,
    category: get(p, "category") || undefined,
    style: get(p, "style") || undefined,
    season: get(p, "season") || undefined,
    q: get(p, "q")?.slice(0, 80) || undefined,
    sizes: list(p, "size"),
    colors: list(p, "color"),
    min: num(get(p, "min")),
    max: num(get(p, "max")),
    inStock: get(p, "stock") === "1",
    sale: get(p, "sale") === "1",
    isNew: get(p, "new") === "1",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortKey) : "popular",
  };
}

export function serializeShopQuery(q: Partial<ShopQuery>): string {
  const sp = new URLSearchParams();
  if (q.gender) sp.set("gender", q.gender);
  if (q.category) sp.set("category", q.category);
  if (q.style) sp.set("style", q.style);
  if (q.season) sp.set("season", q.season);
  if (q.q) sp.set("q", q.q);
  if (q.sizes?.length) sp.set("size", q.sizes.join(","));
  if (q.colors?.length) sp.set("color", q.colors.join(","));
  if (q.min !== undefined) sp.set("min", String(q.min));
  if (q.max !== undefined) sp.set("max", String(q.max));
  if (q.inStock) sp.set("stock", "1");
  if (q.sale) sp.set("sale", "1");
  if (q.isNew) sp.set("new", "1");
  if (q.sort && q.sort !== "popular") sp.set("sort", q.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function shopTitle(q: ShopQuery): string {
  if (q.q) return `Results for “${q.q}”`;
  if (q.sale) return "Sale";
  if (q.isNew) return "New Arrivals";
  const g = q.gender === "men" ? "Men" : q.gender === "women" ? "Women" : "";
  const bits = [g, q.category, q.style ? q.style[0].toUpperCase() + q.style.slice(1) : ""].filter(Boolean);
  if (q.season === "aw26") bits.push("Autumn Winter 26");
  return bits.length ? bits.join(" · ") : "All Products";
}
