"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Tag, Trash2, Truck, X } from "lucide-react";
import { useState } from "react";
import { QtyStepper, Spinner } from "@/components/ui/bits";
import { Button } from "@/components/ui/button";
import { GarmentArt } from "@/components/ui/garment-art";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage } from "@/components/ui/product-image";
import { COMMERCE } from "@/config/site";
import { cn, formatINR } from "@/lib/utils";
import { lineKey, useCart, useQuote } from "@/store/cart";
import { useUI } from "@/store/ui";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const cart = useCart();
  const { quote, loading } = useQuote(undefined, cartOpen);
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const close = () => setCartOpen(false);

  const subtotal = quote?.subtotal ?? cart.subtotal;
  const remaining = quote ? quote.freeShippingRemaining : Math.max(0, COMMERCE.freeShippingThreshold - cart.subtotal);
  const progress = Math.min(100, ((COMMERCE.freeShippingThreshold - remaining) / COMMERCE.freeShippingThreshold) * 100);
  const problems = quote?.lines.filter((l) => l.problem) ?? [];

  return (
    <Overlay open={cartOpen} onClose={close} label="Shopping bag" side="right" closeButton={false} className="flex flex-col">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
        <h2 className="display text-2xl">Your bag <span className="ml-1 font-sans text-sm font-normal text-taupe">({cart.count})</span></h2>
        <button type="button" onClick={close} aria-label="Close bag" className="grid size-10 place-items-center rounded-full transition-colors hover:bg-beige">
          <X className="size-5" aria-hidden />
        </button>
      </header>

      {cart.lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="size-44 overflow-hidden rounded-full bg-cream"><GarmentArt kind="tote" color="#a9753f" /></div>
          <p className="display mt-7 text-3xl">Your bag is empty</p>
          <p className="mt-2 max-w-xs text-sm text-taupe">Find something you love. New arrivals land every week.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/shop?new=1&sort=newest" onClick={close} arrow>New arrivals</Button>
            <Button href="/shop" variant="outline" onClick={close}>Shop all</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-line bg-cream/60 px-5 py-3.5 sm:px-7">
            <p className="flex items-center gap-2 text-[0.8125rem]" aria-live="polite">
              <Truck className="size-4 shrink-0" aria-hidden />
              {remaining > 0 ? <span>Add <b className="font-semibold">{formatINR(remaining)}</b> more for complimentary shipping</span> : <span className="font-medium">You've unlocked complimentary shipping</span>}
            </p>
            <div className="mt-2.5 h-[3px] overflow-hidden bg-beige" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
              <motion.div className="h-full bg-ink" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5 sm:px-7" data-lenis-prevent>
            <AnimatePresence initial={false}>
              {cart.lines.map((l) => {
                const key = lineKey(l);
                const q = quote?.lines.find((x) => lineKey(x) === key);
                const livePrice = q?.price ?? l.price;
                return (
                  <motion.li
                    key={key}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, x: 40 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-4 py-5">
                      <Link href={`/product/${l.slug}`} onClick={close} className="relative block aspect-[4/5] w-24 shrink-0 overflow-hidden bg-cream" aria-label={`View ${l.name}`}>
                        <ProductImage product={{ kind: l.kind, images: l.image ? { "*": [l.image] } : {}, name: l.name, fabric: "", colors: [{ name: l.color, hex: l.colorHex }] }} color={l.color} sizes="96px" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/product/${l.slug}`} onClick={close} className="link-u text-[0.9375rem] font-medium">{l.name}</Link>
                            <p className="mt-0.5 text-[0.8125rem] text-taupe">{l.color}{l.size !== "One size" && ` · ${l.size}`}</p>
                          </div>
                          <p className="shrink-0 text-[0.9375rem] font-medium tabular-nums">{formatINR(livePrice * l.qty)}</p>
                        </div>
                        {q?.problem && <p className="mt-1.5 text-xs font-medium text-oxblood" role="alert">{q.problem}. Please update the quantity.</p>}
                        {q && q.price !== l.price && !q.problem && <p className="mt-1.5 text-xs text-taupe">Price updated to {formatINR(q.price)}</p>}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QtyStepper small value={l.qty} max={Math.min(10, q?.available ? q.available : 10)} onChange={(n) => cart.setQty(key, n)} label={`Quantity for ${l.name}`} />
                          <button type="button" onClick={() => cart.remove(key)} className="inline-flex items-center gap-1.5 text-xs text-taupe transition-colors hover:text-oxblood" aria-label={`Remove ${l.name} from bag`}>
                            <Trash2 className="size-3.5" aria-hidden /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <footer className="border-t border-line bg-bone px-5 pb-5 pt-4 sm:px-7">
            {quote?.coupon ? (
              <p className="mb-3 flex items-center justify-between bg-cream px-3 py-2 text-[0.8125rem]">
                <span className="inline-flex items-center gap-2"><Check className="size-4" aria-hidden /> <b className="font-semibold">{quote.coupon.code}</b> applied</span>
                <button type="button" className="text-xs text-taupe underline underline-offset-2 hover:text-ink" onClick={() => cart.setCoupon("")}>Remove</button>
              </p>
            ) : showCode ? (
              <form className="mb-3" onSubmit={(e) => { e.preventDefault(); if (code.trim()) cart.setCoupon(code); }}>
                <div className="flex gap-2">
                  <label className="sr-only" htmlFor="drawer-coupon">Discount code</label>
                  <input id="drawer-coupon" className="field !py-2.5 uppercase" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
                  <button className="border border-ink px-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-bone">Apply</button>
                </div>
              </form>
            ) : (
              <button type="button" onClick={() => setShowCode(true)} className="link-u mb-3 inline-flex items-center gap-2 text-[0.8125rem]"><Tag className="size-4" aria-hidden /> Have a discount code?</button>
            )}
            {quote?.couponError && <p className="mb-3 text-xs font-medium text-oxblood" role="alert">{quote.couponError}</p>}

            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-taupe">Subtotal</dt><dd className="tabular-nums">{formatINR(subtotal)}</dd></div>
              {quote && quote.discount > 0 && <div className="flex justify-between text-oxblood"><dt>Discount</dt><dd className="tabular-nums">−{formatINR(quote.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-taupe">Shipping</dt><dd className="tabular-nums">{quote ? (quote.shipping === 0 ? "Free" : formatINR(quote.shipping)) : "Calculated at checkout"}</dd></div>
              <div className="flex items-baseline justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>Total <span className="text-xs font-normal text-taupe">(incl. taxes)</span></dt>
                <dd className="flex items-center gap-2 tabular-nums">{loading && <Spinner className="size-3.5" />}{formatINR(quote?.total ?? cart.subtotal)}</dd>
              </div>
            </dl>
            <Button full href="/checkout" onClick={close} arrow className={cn("mt-4", problems.length > 0 && "pointer-events-none opacity-50")} aria-disabled={problems.length > 0}>Checkout</Button>
            {problems.length > 0 && <p className="mt-2 text-center text-xs text-oxblood">Resolve the items above to continue.</p>}
            <button type="button" onClick={close} className="link-u mx-auto mt-3 block text-xs text-taupe">Continue shopping</button>
          </footer>
        </>
      )}
    </Overlay>
  );
}
