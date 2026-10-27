"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GarmentArt } from "@/components/ui/garment-art";
import { Reveal } from "@/components/ui/motion";
import { ProductImage } from "@/components/ui/product-image";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

function CopyCode({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(code); } catch { /* clipboard blocked: the code is still visible */ }
        setDone(true);
        setTimeout(() => setDone(false), 2200);
      }}
      className="group inline-flex items-center gap-3 border border-dashed border-bone/60 px-5 py-3 transition-colors hover:border-bone hover:bg-bone/10"
      aria-label={`Copy discount code ${code}`}
    >
      <span className="font-mono text-lg font-semibold tracking-[0.22em]">{code}</span>
      <span className="relative grid size-5 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          {done ? <motion.span key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="size-4" aria-hidden /></motion.span> : <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="size-4" aria-hidden /></motion.span>}
        </AnimatePresence>
      </span>
      <span className="sr-only" role="status">{done ? "Code copied" : ""}</span>
    </button>
  );
}

export function Offers({ sale, maxDiscount }: { sale: Product[]; maxDiscount: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Reveal className="on-dark relative isolate overflow-hidden bg-ink p-8 text-bone sm:p-12 lg:col-span-2">
        <div className="absolute -bottom-10 -right-10 -z-10 w-72 opacity-25 [mask-image:linear-gradient(to_top_left,black,transparent_70%)]">
          <div className="aspect-[4/5]"><GarmentArt kind="coat" color="#b58b5a" bg="#14120f" /></div>
        </div>
        <p className="eyebrow text-sand">Festive Edit</p>
        <p className="display mt-5 text-6xl sm:text-7xl">15% <span className="text-4xl italic sm:text-5xl">off</span></p>
        <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-bone/75">On everything, on orders above ₹4,999. Up to ₹1,500 off. Valid until 30 November.</p>
        <div className="mt-8"><CopyCode code="FESTIVE15" /></div>
        <Button href="/shop?season=aw26" variant="light" arrow className="mt-8">Shop the edit</Button>
      </Reveal>

      <Reveal delay={0.1} className="relative overflow-hidden bg-beige p-8 sm:p-12 lg:col-span-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-taupe">Seasonal sale</p>
            <p className="display mt-4 text-5xl sm:text-6xl">Up to {maxDiscount}% off</p>
          </div>
          <Link href="/shop?sale=1" className="link-u text-xs font-semibold uppercase tracking-[0.18em]">Shop all sale →</Link>
        </div>
        <ul className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {sale.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                  <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.07]"><ProductImage product={p} sizes="(min-width:1024px) 14vw, 40vw" /></div>
                  <span className="absolute left-2 top-2 bg-oxblood px-2 py-1 text-[0.6rem] font-semibold leading-none tracking-[0.14em] text-bone">−{p.discountPct}%</span>
                </div>
                <p className="mt-2.5 truncate text-sm font-medium">{p.name}</p>
                <p className="text-[0.8125rem]"><span className="font-medium text-oxblood">{formatINR(p.price)}</span> <s className="text-taupe">{formatINR(p.mrp)}</s></p>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
