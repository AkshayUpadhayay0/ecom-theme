import "server-only";
import { COMMERCE } from "@/config/site";
import { db } from "./db";
import { getProductsByIds } from "./repo";
import type { Quote, QuoteLine } from "./types";

export interface RequestedItem { productId: number; color: string; size: string; qty: number }

interface CouponResult {
  discount: number;
  freeShipping: boolean;
  description: string;
}

export function evaluateCoupon(code: string, subtotal: number): CouponResult | { error: string } {
  const c = db().prepare("SELECT * FROM coupons WHERE code = ?").get(code.trim());
  if (!c || !c.active) return { error: "That code isn't valid." };
  if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) return { error: "That code has expired." };
  if (subtotal < c.min_subtotal) {
    return { error: `Add ₹${(c.min_subtotal - subtotal).toLocaleString("en-IN")} more to use ${c.code.toUpperCase()}.` };
  }
  if (c.type === "percent") {
    let d = Math.floor((subtotal * c.value) / 100);
    if (c.max_discount > 0) d = Math.min(d, c.max_discount);
    return { discount: d, freeShipping: false, description: c.description };
  }
  if (c.type === "flat") return { discount: Math.min(c.value, subtotal), freeShipping: false, description: c.description };
  if (c.type === "freeship") return { discount: 0, freeShipping: true, description: c.description };
  return { error: "That code isn't valid." };
}

/** The single source of truth for prices: the browser only ever sends product ids, variants and quantities. */
export function quote(items: RequestedItem[], couponCode?: string | null, paymentMethod?: "cod" | "razorpay"): Quote {
  const clean = items
    .filter((i) => Number.isInteger(i.productId) && Number.isInteger(i.qty) && i.qty > 0 && typeof i.color === "string" && typeof i.size === "string")
    .slice(0, 50);
  const products = getProductsByIds([...new Set(clean.map((i) => i.productId))]);
  const lines: QuoteLine[] = [];

  for (const it of clean) {
    const p = products.find((x) => x.id === it.productId);
    const color = p?.colors.find((c) => c.name === it.color);
    const variant = p?.variants.find((v) => v.color === it.color && v.size === it.size);
    if (!p || !color || !variant) continue;
    const qty = Math.min(it.qty, 10);
    const merged = lines.find((l) => l.productId === p.id && l.color === it.color && l.size === it.size);
    const base = {
      productId: p.id, slug: p.slug, name: p.name, kind: p.kind, color: it.color, colorHex: color.hex, size: it.size,
      price: p.price, mrp: p.mrp, available: variant.stock,
    };
    if (merged) {
      merged.qty = Math.min(merged.qty + qty, 10);
      merged.lineTotal = merged.qty * merged.price;
      continue;
    }
    lines.push({ ...base, qty, lineTotal: qty * p.price });
  }
  for (const l of lines) {
    if (l.available <= 0) l.problem = "Sold out";
    else if (l.qty > l.available) l.problem = `Only ${l.available} left`;
  }

  const valid = lines.filter((l) => !l.problem);
  const subtotal = valid.reduce((s, l) => s + l.lineTotal, 0);
  let discount = 0;
  let freeShip = false;
  let coupon: Quote["coupon"];
  let couponError: string | undefined;
  if (couponCode?.trim()) {
    const r = evaluateCoupon(couponCode, subtotal);
    if ("error" in r) couponError = r.error;
    else {
      discount = r.discount;
      freeShip = r.freeShipping;
      coupon = { code: couponCode.trim().toUpperCase(), description: r.description };
    }
  }
  const shipping = !valid.length || freeShip || subtotal >= COMMERCE.freeShippingThreshold ? 0 : COMMERCE.shippingFee;
  const codFee = paymentMethod === "cod" && valid.length ? COMMERCE.codFee : 0;
  const total = Math.max(0, subtotal - discount + shipping + codFee);
  const savings = valid.reduce((s, l) => s + (l.mrp - l.price) * l.qty, 0) + discount;

  return {
    lines, subtotal, discount, shipping, codFee, total, savings, coupon, couponError,
    freeShippingRemaining: freeShip ? 0 : Math.max(0, COMMERCE.freeShippingThreshold - subtotal),
    ok: lines.length > 0 && lines.every((l) => !l.problem),
  };
}
