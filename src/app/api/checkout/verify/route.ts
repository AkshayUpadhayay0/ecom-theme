import { clientIp, body, fail, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/auth";
import { getOrder, markPaid } from "@/lib/orders";
import { verifyCheckoutSignature } from "@/lib/payments";

/**
 * Called by the browser after Razorpay Checkout succeeds. An order is only marked paid
 * after the HMAC signature from Razorpay verifies against our secret key.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (!rateLimit(`verify:${clientIp(req)}`, 30, 10 * 60_000)) return fail("Too many attempts.", 429);
  const b = await body<{ number?: string; razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }>(req);
  if (!b?.number || !b.razorpay_order_id || !b.razorpay_payment_id || !b.razorpay_signature) return fail("Invalid request.");

  const order = getOrder(b.number);
  if (!order || order.razorpayOrderId !== b.razorpay_order_id) return fail("Order not found.", 404);
  if (!verifyCheckoutSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
    return fail("Payment could not be verified. If money was debited, it will be refunded automatically by your bank.", 400);
  }
  const r = markPaid(b.razorpay_order_id, b.razorpay_payment_id);
  if (!r.ok && r.reason === "unavailable") {
    return fail("Your payment went through, but an item sold out while you were paying. We will refund you in full; contact support with your order number.", 409);
  }
  if (!r.ok) return fail("Order not found.", 404);
  return json({ ok: true, number: r.number });
}
