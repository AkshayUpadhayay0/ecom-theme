import { body, fail, json, sameOrigin } from "@/lib/http";
import { expireStaleOrders } from "@/lib/orders";
import { quote } from "@/lib/pricing";

/** Re-prices a bag on the server: current prices, live stock, coupon, shipping, totals. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  const b = await body<{ items?: any[]; coupon?: string; paymentMethod?: string }>(req);
  if (!b || !Array.isArray(b.items)) return fail("Invalid request.");
  expireStaleOrders();
  const method = b.paymentMethod === "cod" ? "cod" : b.paymentMethod === "razorpay" ? "razorpay" : undefined;
  return json(quote(b.items, b.coupon, method));
}
