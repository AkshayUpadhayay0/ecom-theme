import "server-only";
import crypto from "node:crypto";
import { COMMERCE } from "@/config/site";
import { db, tx } from "./db";
import { quote, type RequestedItem } from "./pricing";
import type { Address, Order, OrderItem } from "./types";

export class OrderError extends Error {
  constructor(message: string, public code: "STOCK" | "PRICE" | "COUPON" | "INVALID") {
    super(message);
  }
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newOrderNumber(): string {
  const bytes = crypto.randomBytes(8);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `MN-${s}`;
}

export interface CreateOrderInput {
  number: string;
  items: RequestedItem[];
  coupon?: string | null;
  paymentMethod: "cod" | "razorpay";
  email: string;
  phone: string;
  address: Address;
  userId: number | null;
  razorpayOrderId?: string;
  expectedTotal: number;
}

/**
 * Creates the order and reserves stock atomically. Prices are recomputed here from the
 * database; if they differ from what the customer was shown (and what Razorpay was told),
 * the whole thing is rolled back.
 */
export function createOrder(i: CreateOrderInput): Order {
  tx((d) => {
    const q = quote(i.items, i.coupon, i.paymentMethod);
    if (i.coupon?.trim() && q.couponError) throw new OrderError(q.couponError, "COUPON");
    if (!q.ok) throw new OrderError("Some items in your bag are no longer available in the quantity requested.", "STOCK");
    if (q.total !== i.expectedTotal) throw new OrderError("Prices changed while you were checking out. Please review your order.", "PRICE");

    const dec = d.prepare("UPDATE variants SET stock = stock - ? WHERE product_id = ? AND color = ? AND size = ? AND stock >= ?");
    for (const l of q.lines) {
      const r = dec.run(l.qty, l.productId, l.color, l.size, l.qty);
      if (Number(r.changes) !== 1) throw new OrderError(`${l.name} (${l.color}, ${l.size}) just sold out.`, "STOCK");
    }

    const cod = i.paymentMethod === "cod";
    const res = d
      .prepare(
        `INSERT INTO orders (number,user_id,email,phone,status,payment_method,payment_status,razorpay_order_id,
           subtotal,discount,shipping,cod_fee,total,coupon_code,address,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        i.number, i.userId, i.email, i.phone, cod ? "placed" : "awaiting_payment", i.paymentMethod,
        cod ? "cod_pending" : "pending", i.razorpayOrderId ?? null,
        q.subtotal, q.discount, q.shipping, q.codFee, q.total, q.coupon?.code ?? null,
        JSON.stringify(i.address), new Date().toISOString(),
      );
    const orderId = Number(res.lastInsertRowid);
    const insItem = d.prepare(
      "INSERT INTO order_items (order_id,product_id,slug,name,kind,color,color_hex,size,qty,price) VALUES (?,?,?,?,?,?,?,?,?,?)",
    );
    for (const l of q.lines) insItem.run(orderId, l.productId, l.slug, l.name, l.kind, l.color, l.colorHex, l.size, l.qty, l.price);
  });
  return getOrder(i.number)!;
}

function mapOrder(r: Record<string, any>, items: Record<string, any>[]): Order & { razorpayOrderId: string | null } {
  return {
    number: r.number, status: r.status, paymentMethod: r.payment_method, paymentStatus: r.payment_status,
    email: r.email, phone: r.phone, address: JSON.parse(r.address),
    subtotal: r.subtotal, discount: r.discount, shipping: r.shipping, codFee: r.cod_fee, total: r.total,
    couponCode: r.coupon_code, createdAt: r.created_at, razorpayOrderId: r.razorpay_order_id,
    items: items.map<OrderItem>((x) => ({
      productId: x.product_id, slug: x.slug, name: x.name, kind: x.kind, color: x.color,
      colorHex: x.color_hex, size: x.size, qty: x.qty, price: x.price,
    })),
  };
}

export function getOrder(number: string) {
  const d = db();
  const r = d.prepare("SELECT * FROM orders WHERE number = ?").get(number);
  if (!r) return null;
  return mapOrder(r, d.prepare("SELECT * FROM order_items WHERE order_id = ?").all(r.id));
}

export function getOrderByRazorpayId(rzpOrderId: string) {
  const r = db().prepare("SELECT number FROM orders WHERE razorpay_order_id = ?").get(rzpOrderId);
  return r ? getOrder(r.number) : null;
}

export function getOrderOwner(number: string): { userId: number | null; email: string } | null {
  const r = db().prepare("SELECT user_id, email FROM orders WHERE number = ?").get(number);
  return r ? { userId: r.user_id, email: r.email } : null;
}

export function getOrdersForUser(userId: number) {
  const d = db();
  return d
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId)
    .map((r) => mapOrder(r, d.prepare("SELECT * FROM order_items WHERE order_id = ?").all(r.id)));
}

/** Marks an order paid once Razorpay has confirmed the payment (verified signature or webhook). */
export function markPaid(razorpayOrderId: string, paymentId: string): { ok: boolean; number?: string; reason?: "not_found" | "unavailable" } {
  return tx((d) => {
    const o = d.prepare("SELECT * FROM orders WHERE razorpay_order_id = ?").get(razorpayOrderId);
    if (!o) return { ok: false, reason: "not_found" as const };
    if (o.payment_status === "paid") return { ok: true, number: o.number };
    const now = new Date().toISOString();

    if (o.payment_status === "expired") {
      // Customer paid after the stock reservation lapsed. Try to take the stock again.
      const items = d.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
      const dec = d.prepare("UPDATE variants SET stock = stock - ? WHERE product_id = ? AND color = ? AND size = ? AND stock >= ?");
      const taken: typeof items = [];
      let all = true;
      for (const it of items) {
        if (Number(dec.run(it.qty, it.product_id, it.color, it.size, it.qty).changes) === 1) taken.push(it);
        else { all = false; break; }
      }
      if (!all) {
        const inc = d.prepare("UPDATE variants SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?");
        for (const it of taken) inc.run(it.qty, it.product_id, it.color, it.size);
        d.prepare("UPDATE orders SET status='refund_due', payment_status='paid', razorpay_payment_id=?, paid_at=? WHERE id=?").run(paymentId, now, o.id);
        return { ok: false, number: o.number, reason: "unavailable" as const };
      }
    }
    d.prepare("UPDATE orders SET status='confirmed', payment_status='paid', razorpay_payment_id=?, paid_at=? WHERE id=?").run(paymentId, now, o.id);
    return { ok: true, number: o.number };
  });
}

/** Releases stock held by online-payment orders that were never paid. */
export function expireStaleOrders() {
  const cutoff = new Date(Date.now() - COMMERCE.reservationMinutes * 60000).toISOString();
  const d = db();
  const stale = d
    .prepare("SELECT id FROM orders WHERE payment_method='razorpay' AND payment_status='pending' AND created_at < ?")
    .all(cutoff);
  if (!stale.length) return;
  tx((t) => {
    const inc = t.prepare("UPDATE variants SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?");
    for (const o of stale) {
      const fresh = t.prepare("SELECT payment_status FROM orders WHERE id = ?").get(o.id);
      if (fresh?.payment_status !== "pending") continue;
      for (const it of t.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id)) inc.run(it.qty, it.product_id, it.color, it.size);
      t.prepare("UPDATE orders SET status='cancelled', payment_status='expired' WHERE id = ?").run(o.id);
    }
  });
}

export const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  placed: "Order placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_due: "Refund pending",
};
