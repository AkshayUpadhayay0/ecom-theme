import { checkOrderToken, getUser, rateLimit } from "@/lib/auth";
import { clientIp, fail, json, sameOrigin } from "@/lib/http";
import { expireStaleOrders, getOrder, getOrderOwner } from "@/lib/orders";
import { razorpayEnabled, razorpayKeyId } from "@/lib/payments";

/** Returns the parameters needed to (re)open Razorpay Checkout for an unpaid online order. */
export async function POST(req: Request, ctx: { params: Promise<{ number: string }> }) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (!rateLimit(`pay:${clientIp(req)}`, 20, 10 * 60_000)) return fail("Too many attempts.", 429);
  const { number } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t");
  const owner = getOrderOwner(number);
  const user = await getUser();
  if (!owner || !((user && owner.userId === user.id) || checkOrderToken(number, token))) return fail("Order not found.", 404);
  expireStaleOrders();
  const o = getOrder(number);
  if (!o || o.paymentMethod !== "razorpay" || !o.razorpayOrderId) return fail("This order does not need payment.", 400);
  if (o.paymentStatus === "paid") return fail("This order is already paid.", 409);
  if (o.paymentStatus !== "pending") return fail("This order has expired. Please place a new order.", 410);
  if (!razorpayEnabled()) return fail("Online payments are not set up on this store yet.", 503);
  return json({ keyId: razorpayKeyId(), razorpayOrderId: o.razorpayOrderId, amount: o.total * 100, currency: "INR", email: o.email, phone: o.phone, name: o.address.fullName });
}
