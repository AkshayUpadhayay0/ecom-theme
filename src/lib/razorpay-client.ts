/** Browser-side Razorpay Checkout helper. Payment is only trusted after the server verifies the signature. */
interface Opts {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  number: string;
  prefill: { name?: string; email?: string; contact?: string };
  onPaid: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss: () => void;
  onFailed: (message: string) => void;
}

declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: any) => void) => void } } }

let loading: Promise<boolean> | null = null;
function load(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => { loading = null; resolve(false); };
    document.body.appendChild(s);
  });
  return loading;
}

export async function openRazorpay(o: Opts) {
  if (!(await load()) || !window.Razorpay) { o.onFailed("We couldn't load the payment window. Check your connection and try again."); return; }
  const rzp = new window.Razorpay({
    key: o.keyId,
    amount: o.amount,
    currency: o.currency,
    order_id: o.razorpayOrderId,
    name: "Maison Noir",
    description: `Order ${o.number}`,
    prefill: o.prefill,
    theme: { color: "#121211" },
    handler: o.onPaid,
    modal: { ondismiss: o.onDismiss },
  });
  rzp.on("payment.failed", (r: any) => o.onFailed(r?.error?.description ?? "The payment failed. You have not been charged for a failed attempt."));
  rzp.open();
}
