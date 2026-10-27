import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { OrderPay } from "@/components/checkout/order-pay";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Reveal } from "@/components/ui/motion";
import { checkOrderToken, getUser } from "@/lib/auth";
import { expireStaleOrders, getOrder, getOrderOwner, STATUS_LABEL } from "@/lib/orders";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: SP }) {
  const { number } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : undefined;
  expireStaleOrders();
  const o = getOrder(number);
  const user = await getUser();
  // Access: the signed-in owner, or a holder of the signed order link.
  const allowed = !!o && (checkOrderToken(number, token) || (!!user && getOrderOwner(number)?.userId === user.id));
  if (!o || !allowed) notFound();

  const verifyFailed = sp.verify === "failed" && o.paymentStatus === "pending";
  const state =
    o.paymentStatus === "paid" ? { icon: CheckCircle2, tone: "text-ink", title: "Thank you. Your order is confirmed", body: "We've received your payment and will start preparing your order." }
    : o.paymentStatus === "cod_pending" ? { icon: CheckCircle2, tone: "text-ink", title: "Thank you. Your order is placed", body: `Pay ${formatINR(o.total)} in cash when it is delivered.` }
    : o.paymentStatus === "pending" ? { icon: Clock, tone: "text-ink", title: "Payment not completed yet", body: verifyFailed ? "We couldn't confirm your payment yet. If money was debited, it will be reflected here shortly or refunded by your bank. Don't pay again unless this page asks you to." : "Your items are held for a short time. Complete payment to confirm your order." }
    : o.status === "refund_due" ? { icon: AlertTriangle, tone: "text-oxblood", title: "Payment received, order could not be fulfilled", body: "An item sold out while your payment was processing. We'll refund you in full. Contact support with your order number." }
    : { icon: XCircle, tone: "text-oxblood", title: "This order has expired", body: "Payment wasn't completed in time and the items were released. You can place a new order any time." };
  const Icon = state.icon;
  const a = o.address;

  return (
    <div className="container-x max-w-4xl py-14 lg:py-20">
      <Reveal>
        <Icon className={`size-10 ${state.tone}`} strokeWidth={1.25} aria-hidden />
        <p className="eyebrow mt-6 text-taupe">Order {o.number}</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl" role="status">{state.title}</h1>
        <p className="mt-4 max-w-xl text-taupe">{state.body}</p>
      </Reveal>

      {o.paymentStatus === "pending" && o.paymentMethod === "razorpay" && <OrderPay number={o.number} token={token} />}

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_18rem]">
        <section aria-label="Items">
          <ul className="divide-y divide-line border-y border-line">
            {o.items.map((i) => (
              <li key={`${i.productId}${i.color}${i.size}`} className="flex gap-4 py-5">
                <Link href={`/product/${i.slug}`} className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden bg-cream" aria-label={i.name}>
                  <ProductImage product={{ kind: i.kind, images: {}, name: i.name, fabric: "", colors: [{ name: i.color, hex: i.colorHex }] }} color={i.color} sizes="80px" />
                </Link>
                <div className="flex-1 text-sm"><p className="font-medium">{i.name}</p><p className="text-xs text-taupe">{i.color}{i.size !== "One size" && ` · ${i.size}`} · Qty {i.qty}</p></div>
                <p className="text-sm tabular-nums">{formatINR(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="ml-auto mt-5 max-w-xs space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-taupe">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-oxblood"><dt>Discount{o.couponCode && ` (${o.couponCode})`}</dt><dd>−{formatINR(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-taupe">Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd></div>
            {o.codFee > 0 && <div className="flex justify-between"><dt className="text-taupe">COD fee</dt><dd>{formatINR(o.codFee)}</dd></div>}
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>
        </section>
        <aside className="space-y-7 text-sm">
          <div><h2 className="label">Status</h2><p className="mt-2">{STATUS_LABEL[o.status] ?? o.status}</p></div>
          <div><h2 className="label">Payment</h2><p className="mt-2">{o.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"} · {o.paymentStatus === "paid" ? "Paid" : o.paymentStatus === "cod_pending" ? "Due on delivery" : o.paymentStatus === "pending" ? "Awaiting payment" : o.paymentStatus}</p></div>
          <div><h2 className="label">Delivering to</h2><address className="mt-2 not-italic leading-relaxed">{a.fullName}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.city}, {a.state} {a.pincode}<br />{o.phone}</address></div>
          <div><h2 className="label">Contact</h2><p className="mt-2 break-all">{o.email}</p></div>
        </aside>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Button href="/shop" arrow>Continue shopping</Button>
        <Button href="/track" variant="outline">Track another order</Button>
      </div>
      <p className="mt-6 text-xs text-taupe">Bookmark this page to check your order later. This store does not send confirmation emails yet, so keep your order number.</p>
    </div>
  );
}
