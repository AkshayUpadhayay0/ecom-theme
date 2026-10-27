"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { openRazorpay } from "@/lib/razorpay-client";

export function OrderPay({ number, token }: { number: string; token?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setErr(""); setBusy(true);
    const r = await fetch(`/api/orders/${number}/pay${token ? `?t=${token}` : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) { setErr(d.error ?? "Could not start payment."); setBusy(false); if (r?.status === 409 || r?.status === 410) router.refresh(); return; }
    await openRazorpay({
      keyId: d.keyId, razorpayOrderId: d.razorpayOrderId, amount: d.amount, currency: d.currency, number,
      prefill: { name: d.name, email: d.email, contact: d.phone },
      onPaid: async (p) => {
        const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number, ...p }) }).catch(() => null);
        if (!v || !v.ok) setErr("We couldn't confirm your payment yet. Please wait a minute and refresh this page.");
        setBusy(false);
        router.refresh();
      },
      onDismiss: () => setBusy(false),
      onFailed: (m) => { setErr(m); setBusy(false); },
    });
  }

  return (
    <div className="mt-8">
      <Button onClick={pay} loading={busy}>Pay now</Button>
      {err && <p className="mt-3 text-sm font-medium text-oxblood" role="alert">{err}</p>}
    </div>
  );
}
