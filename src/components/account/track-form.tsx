"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TrackForm() {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number, email }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) { setErr(d.error ?? "Something went wrong. Please try again."); setBusy(false); return; }
    router.push(d.url);
  }
  return (
    <div className="container-x max-w-xl py-16 lg:py-24">
      <h1 className="display text-5xl">Track your order</h1>
      <p className="mt-3 text-taupe">Enter the order number from your confirmation page and the email you used at checkout.</p>
      <form onSubmit={submit} className="mt-10 space-y-5">
        <div><label htmlFor="tr-n" className="label">Order number</label><input id="tr-n" className="field mt-2" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="MN-XXXXXX" required /></div>
        <div><label htmlFor="tr-e" className="label">Email</label><input id="tr-e" type="email" className="field mt-2" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        {err && <p className="text-sm font-medium text-oxblood" role="alert">{err}</p>}
        <Button loading={busy} full>Find my order</Button>
      </form>
    </div>
  );
}
