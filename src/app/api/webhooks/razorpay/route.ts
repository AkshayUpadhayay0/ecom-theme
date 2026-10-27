import { getOrderByRazorpayId, markPaid } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/payments";

/**
 * Razorpay webhook (subscribe to payment.captured and order.paid). It confirms payments even when
 * the customer closes the tab before returning to the site. Configure the URL:
 *   https://YOUR-DOMAIN/api/webhooks/razorpay   and set RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const pay = event.payload?.payment?.entity;
    const rzpOrderId = pay?.order_id as string | undefined;
    const paymentId = pay?.id as string | undefined;
    if (rzpOrderId && paymentId) {
      const order = getOrderByRazorpayId(rzpOrderId);
      // Only trust the event if the captured amount matches what we charged.
      if (order && pay.amount === order.total * 100) markPaid(rzpOrderId, paymentId);
      else console.error("[webhook] amount mismatch or unknown order", rzpOrderId, pay?.amount);
    }
  }
  return new Response("ok");
}
