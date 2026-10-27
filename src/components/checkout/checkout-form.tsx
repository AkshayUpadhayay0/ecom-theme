"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Banknote, CreditCard, Lock, Tag } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/bits";
import { ProductImage } from "@/components/ui/product-image";
import { COMMERCE, INDIAN_STATES, SITE } from "@/config/site";
import { openRazorpay } from "@/lib/razorpay-client";
import type { SessionUser } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { lineKey, useCart, useQuote } from "@/store/cart";

type Method = "razorpay" | "cod";

export function CheckoutForm({ onlineEnabled, user }: { onlineEnabled: boolean; user: SessionUser | null }) {
  const router = useRouter();
  const cart = useCart();
  const [method, setMethod] = useState<Method>(onlineEnabled ? "razorpay" : "cod");
  const { quote, loading } = useQuote(method);
  const [f, setF] = useState({ email: user?.email ?? "", phone: user?.phone ?? "", fullName: user?.name ?? "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [create, setCreate] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<{ field?: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const errRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const invalid = (k: string) => (err?.field === k ? true : undefined);

  if (cart.ready && cart.lines.length === 0 && !busy) {
    return (
      <div className="container-x py-28 text-center">
        <h1 className="display text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-taupe">Add a few pieces before checking out.</p>
        <Button href="/shop" arrow className="mt-8">Continue shopping</Button>
      </div>
    );
  }

  const fail = (message: string, field?: string) => {
    setErr({ message, field });
    setBusy(false);
    requestAnimationFrame(() => { errRef.current?.focus(); if (field) document.getElementById(`co-${field}`)?.focus(); });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.lines.map((l) => ({ productId: l.productId, color: l.color, size: l.size, qty: l.qty })),
        coupon: cart.coupon, paymentMethod: method, email: f.email, phone: f.phone,
        address: { fullName: f.fullName, line1: f.line1, line2: f.line2, city: f.city, state: f.state, pincode: f.pincode },
        account: !user && create ? { password } : undefined,
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) { fail(data.error ?? "We couldn't reach the server. Please try again.", data.field); return; }

    const go = (q = "") => { cart.clear(); router.push(`/order/${data.number}?t=${data.token}${q}`); };
    if (!data.payment) { go(); return; }

    // The order exists and stock is reserved. It is only marked paid after the server verifies Razorpay's signature.
    await openRazorpay({
      ...data.payment, number: data.number,
      prefill: { name: f.fullName, email: f.email, contact: f.phone },
      onPaid: async (r) => {
        const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: data.number, ...r }) }).catch(() => null);
        go(v && v.ok ? "" : "&verify=failed");
      },
      onDismiss: () => go("&paying=1"),
      onFailed: (m) => { fail(m); go("&paying=1"); },
    });
  }

  const subtotal = quote?.subtotal ?? cart.subtotal;
  const problems = quote?.lines.some((l) => l.problem);
  const cod = method === "cod";
  const codTooBig = quote ? quote.subtotal - quote.discount > COMMERCE.codMaxOrder : false;

  return (
    <form onSubmit={submit} className="container-x grid gap-12 py-12 lg:grid-cols-[1fr_26rem] lg:gap-16 lg:py-16" noValidate>
      <div>
        <h1 className="display text-5xl">Checkout</h1>
        {!user && <p className="mt-3 text-sm text-taupe">Have an account? <Link href="/account?next=/checkout" className="link-u text-ink">Sign in</Link> for faster checkout, or continue as a guest.</p>}

        {err && (
          <div ref={errRef} tabIndex={-1} role="alert" className="mt-6 flex gap-3 border border-oxblood/40 bg-oxblood/5 p-4 text-sm text-oxblood outline-none">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {err.message}
          </div>
        )}

        <Section n={1} title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} invalid={invalid("email")} />
            <Field id="phone" label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={set("phone")} invalid={invalid("phone")} placeholder="10-digit number" />
          </div>
        </Section>

        <Section n={2} title="Delivery address">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" autoComplete="name" value={f.fullName} onChange={set("fullName")} invalid={invalid("fullName")} className="sm:col-span-2" />
            <Field id="line1" label="Address" autoComplete="address-line1" value={f.line1} onChange={set("line1")} invalid={invalid("line1")} className="sm:col-span-2" />
            <Field id="line2" label="Apartment, landmark (optional)" autoComplete="address-line2" value={f.line2} onChange={set("line2")} className="sm:col-span-2" required={false} />
            <Field id="city" label="City" autoComplete="address-level2" value={f.city} onChange={set("city")} invalid={invalid("city")} />
            <Field id="pincode" label="PIN code" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={f.pincode} onChange={set("pincode")} invalid={invalid("pincode")} />
            <div className="sm:col-span-2">
              <label htmlFor="co-state" className="label">State</label>
              <select id="co-state" className="field mt-2" value={f.state} onChange={set("state")} aria-invalid={invalid("state")} autoComplete="address-level1" required>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section n={3} title="Payment">
          <div className="space-y-3" role="radiogroup" aria-label="Payment method">
            <Method active={method === "razorpay"} disabled={!onlineEnabled} onClick={() => setMethod("razorpay")} icon={<CreditCard className="size-5" aria-hidden />} title="UPI, cards & net banking" sub={onlineEnabled ? "Pay securely with Razorpay: UPI, Visa, Mastercard, RuPay, net banking." : "Online payments are not enabled on this store yet."} />
            <Method active={method === "cod"} disabled={codTooBig} onClick={() => setMethod("cod")} icon={<Banknote className="size-5" aria-hidden />} title="Cash on Delivery" sub={codTooBig ? `Available on orders up to ${formatINR(COMMERCE.codMaxOrder)}.` : `Pay when your order arrives. ${formatINR(COMMERCE.codFee)} handling fee.`} />
          </div>
          {SITE.demoMode && !onlineEnabled && <p className="mt-3 text-xs text-taupe">Store owner: add Razorpay keys to .env.local to enable online payments. See the README.</p>}
        </Section>

        {!user && (
          <div className="mt-10 border-t border-line pt-8">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={create} onChange={(e) => setCreate(e.target.checked)} /> Create an account to track orders and save your wishlist
            </label>
            {create && <Field id="password" label="Password (8+ characters)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={invalid("password")} className="mt-4 max-w-sm" />}
          </div>
        )}
      </div>

      <aside className="h-fit bg-cream p-6 sm:p-8 lg:sticky lg:top-28" aria-label="Order summary">
        <h2 className="display text-3xl">Order summary</h2>
        <ul className="mt-6 divide-y divide-line/70">
          {cart.lines.map((l) => {
            const q = quote?.lines.find((x) => lineKey(x) === lineKey(l));
            return (
              <li key={lineKey(l)} className="flex gap-4 py-4">
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-beige">
                  <ProductImage product={{ kind: l.kind, images: l.image ? { "*": [l.image] } : {}, name: l.name, fabric: "", colors: [{ name: l.color, hex: l.colorHex }] }} color={l.color} sizes="64px" />
                  <span className="absolute -right-0 top-0 grid size-5 place-items-center bg-ink text-[0.65rem] text-bone">{l.qty}</span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-taupe">{l.color}{l.size !== "One size" && ` · ${l.size}`}</p>
                  {q?.problem && <p className="mt-1 text-xs font-medium text-oxblood" role="alert">{q.problem}. <Link href="/shop" className="underline">Update bag</Link></p>}
                </div>
                <p className="text-sm tabular-nums">{formatINR((q?.price ?? l.price) * l.qty)}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 border-t border-line pt-4">
          {quote?.coupon ? (
            <p className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Tag className="size-4" aria-hidden /> <b>{quote.coupon.code}</b> applied</span><button type="button" onClick={() => cart.setCoupon("")} className="text-xs underline">Remove</button></p>
          ) : (
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="co-coupon">Discount code</label>
              <input id="co-coupon" className="field uppercase" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (code.trim()) cart.setCoupon(code); } }} autoComplete="off" />
              <button type="button" onClick={() => code.trim() && cart.setCoupon(code)} className="border border-ink px-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] hover:bg-ink hover:text-bone">Apply</button>
            </div>
          )}
          {quote?.couponError && <p className="mt-2 text-xs font-medium text-oxblood" role="alert">{quote.couponError}</p>}
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <Row k="Subtotal" v={formatINR(subtotal)} />
          {quote && quote.discount > 0 && <Row k="Discount" v={`−${formatINR(quote.discount)}`} accent />}
          <Row k="Shipping" v={quote ? (quote.shipping ? formatINR(quote.shipping) : "Free") : "–"} />
          {cod && quote && quote.codFee > 0 && <Row k="COD fee" v={formatINR(quote.codFee)} />}
          <div className="flex items-baseline justify-between border-t border-line pt-4 text-lg font-semibold">
            <dt>Total</dt><dd className="flex items-center gap-2 tabular-nums">{loading && <Spinner className="size-4" />}{formatINR(quote?.total ?? subtotal)}</dd>
          </div>
        </dl>

        <Button full loading={busy} disabled={busy || !!problems || !quote || (method === "razorpay" && !onlineEnabled)} className="mt-6">
          <Lock className="size-4" aria-hidden /> {cod ? "Place order" : "Pay securely"} · {formatINR(quote?.total ?? subtotal)}
        </Button>
        <p className="mt-3 text-center text-xs text-taupe">{cod ? "You'll pay in cash when the order is delivered." : "You'll complete payment in a secure Razorpay window."}</p>
      </aside>
    </form>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]"><span className="grid size-6 place-items-center rounded-full bg-ink text-[0.7rem] text-bone">{n}</span>{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ id, label, className, invalid, required = true, ...rest }: { id: string; label: string; className?: string; invalid?: boolean; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={`co-${id}`} className="label">{label}</label>
      <input id={`co-${id}`} className="field mt-2" aria-invalid={invalid} required={required} {...rest} />
    </div>
  );
}

function Method({ active, disabled, onClick, icon, title, sub }: { active: boolean; disabled?: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button type="button" role="radio" aria-checked={active} disabled={disabled} onClick={onClick}
      className={cn("flex w-full items-start gap-4 border p-4 text-left transition-colors", active ? "border-ink bg-cream" : "border-line hover:border-taupe", disabled && "cursor-not-allowed opacity-50")}>
      <span className={cn("mt-1 grid size-4 shrink-0 place-items-center rounded-full border", active ? "border-ink" : "border-sand")}>{active && <span className="size-2 rounded-full bg-ink" />}</span>
      <span className="flex-1"><span className="flex items-center gap-2 text-sm font-medium">{icon}{title}</span><span className="mt-1 block text-xs text-taupe">{sub}</span></span>
    </button>
  );
}

const Row = ({ k, v, accent }: { k: string; v: string; accent?: boolean }) => <div className={cn("flex justify-between", accent && "text-oxblood")}><dt className={accent ? "" : "text-taupe"}>{k}</dt><dd className="tabular-nums">{v}</dd></div>;
