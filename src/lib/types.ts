export type Gender = "men" | "women" | "unisex";

export type ArtKind =
  | "tee" | "shirt" | "hoodie" | "sweat" | "jacket" | "blazer" | "coat"
  | "trousers" | "cargo" | "jeans" | "shorts" | "dress" | "skirt"
  | "knit" | "cardigan" | "tote" | "scarf" | "cap" | "belt" | "sneaker";

export type SizeGuideKey = "tops_men" | "tops_women" | "bottoms_men" | "bottoms_women" | "shoes" | "one";

export interface ColorOpt { name: string; hex: string }
export interface Variant { color: string; size: string; stock: number }

export interface Product {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  gender: Gender;
  category: string;
  style: string;
  kind: ArtKind;
  season: string;
  price: number;
  mrp: number;
  discountPct: number;
  isNew: boolean;
  isBestseller: boolean;
  onSale: boolean;
  description: string;
  fabric: string;
  fit: string;
  care: string[];
  details: string[];
  colors: ColorOpt[];
  sizes: string[];
  sizeGuide: SizeGuideKey;
  /** Photo URLs keyed by colour name; "*" is the default set. Empty = generated art is used. */
  images: Record<string, string[]>;
  rating: number;
  ratingCount: number;
  popularity: number;
  createdAt: string;
  variants: Variant[];
  inStock: boolean;
}

export interface Review {
  id: number;
  productId: number;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
}

export type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

export interface ShopQuery {
  gender?: string;
  category?: string;
  style?: string;
  season?: string;
  q?: string;
  sizes: string[];
  colors: string[];
  min?: number;
  max?: number;
  inStock: boolean;
  sale: boolean;
  isNew: boolean;
  sort: SortKey;
}

export interface CartLine {
  productId: number;
  slug: string;
  name: string;
  kind: ArtKind;
  color: string;
  colorHex: string;
  size: string;
  qty: number;
  price: number;
  mrp: number;
  image?: string;
}

export interface QuoteLine extends CartLine {
  lineTotal: number;
  available: number;
  problem?: string;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
  savings: number;
  coupon?: { code: string; description: string };
  couponError?: string;
  freeShippingRemaining: number;
  ok: boolean;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: number;
  slug: string;
  name: string;
  kind: ArtKind;
  color: string;
  colorHex: string;
  size: string;
  qty: number;
  price: number;
}

export interface Order {
  number: string;
  status: string;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed" | "cod_pending" | "expired";
  email: string;
  phone: string;
  address: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface SessionUser { id: number; name: string; email: string; phone: string | null }
