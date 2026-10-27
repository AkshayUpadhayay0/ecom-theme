"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";
import { useAuth } from "@/store/auth";

interface OrderRow { number: string; createdAt: string; total: number; status: string; paymentStatus: string; count: number; token: string; items: string[] }

export function AccountView({ orders }: { orders: OrderRow[] }) {
  const { user, setUser, logout } = useAuth();
  const sp = useSearchParams();
  const next = sp.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r || !r.ok) { setErr(d.error ?? "Something went wrong. Please try again."); return; }
    setUser(d.user);
    // reload so server-rendered state (orders, wishlist) reflects the new session
    window.location.assign(safeNext ?? "/account");
  }

  if (!user) {
    return (
      <div className="container-x max-w-md py-16 lg:py-24">
        <h1 className="display text-5xl">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <div className="mt-8 grid grid-cols-2 border-b border-line text-xs font-semibold uppercase tracking-[0.16em]" role="tablist">
          {(["login", "register"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setErr(""); }} className={cn("pb-3 transition-colors", mode === m ? "border-b-2 border-ink" : "text-taupe")}>{m === "login" ? "Sign in" : "Register"}</button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {mode === "register" && <div><label htmlFor="ac-name" className="label">Full name</label><input id="ac-name" className="field mt-2" value={f.name} onChange={set("name")} autoComplete="name" required /></div>}
          <div><label htmlFor="ac-email" className="label">Email</label><input id="ac-email" type="email" className="field mt-2" value={f.email} onChange={set("email")} autoComplete="email" required /></div>
          {mode === "register" && <div><label htmlFor="ac-phone" className="label">Mobile (optional)</label><input id="ac-phone" type="tel" className="field mt-2" value={f.phone} onChange={set("phone")} autoComplete="tel-national" /></div>}
          <div><label htmlFor="ac-pw" className="label">Password</label><input id="ac-pw" type="password" className="field mt-2" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required /></div>
          {err && <p className="text-sm font-medium text-oxblood" role="alert">{err}</p>}
          <Button full loading={busy}>{mode === "login" ? "Sign in" : "Create account"}</Button>
        </form>
        <p className="mt-6 text-xs text-taupe">Prefer not to sign in? You can <Link href="/checkout" className="link-u text-ink">check out as a guest</Link> or <Link href="/track" className="link-u text-ink">track an order</Link>.</p>
      </div>
    );
  }

  return (
    <div className="container-x max-w-4xl py-14 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow text-taupe">My account</p><h1 className="display mt-2 text-5xl">Hello, {user.name.split(" ")[0]}</h1><p className="mt-2 text-sm text-taupe">{user.email}</p></div>
        <Button variant="outline" onClick={() => logout()}>Sign out</Button>
      </div>
      <h2 className="label mt-14">Order history</h2>
      {orders.length === 0 ? (
        <div className="mt-6 border border-line p-10 text-center"><p className="display text-3xl">No orders yet</p><Button href="/shop" arrow className="mt-6">Start shopping</Button></div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <li key={o.number}>
              <Link href={`/order/${o.number}?t=${o.token}`} className="group flex flex-wrap items-center justify-between gap-4 py-5">
                <div><p className="font-medium">{o.number}</p><p className="mt-1 max-w-md truncate text-xs text-taupe">{o.items.join(", ")}</p></div>
                <div className="text-sm text-taupe">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                <div className="text-sm">{o.status}</div>
                <div className="text-sm font-medium tabular-nums">{formatINR(o.total)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
