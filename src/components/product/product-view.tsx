"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, Maximize2, RotateCcw, ShieldCheck, Truck, X } from "lucide-react";
import { useRef, useState } from "react";
import { Badge, Price, Stars } from "@/components/ui/bits";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage, viewCount } from "@/components/ui/product-image";
import { COMMERCE } from "@/config/site";
import type { Product } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { PurchasePanel } from "./purchase-panel";

export function ProductView({ product: p }: { product: Product }) {
  const [color, setColor] = useState(p.colors[0].name);
  const [view, setView] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const n = viewCount(p, color);
  const badges = [p.isNew && "NEW", p.isBestseller && "BESTSELLER", p.onSale && "SALE"].filter(Boolean) as ("NEW" | "BESTSELLER" | "SALE")[];
  const step = (d: number) => setView((v) => (v + d + n) % n);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  return (
    <div className="container-x pb-4 pt-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-taupe">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="link-u">Home</Link></li><li aria-hidden>/</li>
          <li><Link href={`/shop?gender=${p.gender === "women" ? "women" : "men"}`} className="link-u capitalize">{p.gender === "unisex" ? "Shop" : p.gender}</Link></li><li aria-hidden>/</li>
          <li><Link href={`/shop?category=${encodeURIComponent(p.category)}`} className="link-u">{p.category}</Link></li><li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">{p.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
        {/* gallery */}
        <div className="flex flex-col-reverse gap-3 lg:sticky lg:top-28 lg:flex-row lg:self-start">
          <div className="flex gap-2.5 overflow-x-auto lg:flex-col lg:overflow-visible" role="tablist" aria-label="Product views">
            {Array.from({ length: n }, (_, i) => (
              <button key={i} type="button" role="tab" aria-selected={view === i} aria-label={`View ${i + 1} of ${n}`} onClick={() => setView(i)}
                className={cn("relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-cream outline-offset-2 transition-opacity lg:w-20", view === i ? "ring-1 ring-ink" : "opacity-60 hover:opacity-100")}>
                <ProductImage product={p} color={color} view={i} sizes="80px" />
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <div
              ref={frame}
              onPointerMove={onMove}
              onPointerLeave={() => setZoom(null)}
              onClick={() => setLightbox(true)}
              className="relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-cream"
              role="button"
              tabIndex={0}
              aria-label="Open image in full screen"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightbox(true); } }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={`${color}-${view}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="absolute inset-0"
                  style={{ transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%", scale: zoom ? 1.9 : 1, transition: "scale .35s cubic-bezier(.22,1,.36,1)" }}>
                  <ProductImage product={p} color={color} view={view} priority sizes="(min-width:1024px) 50vw, 100vw" />
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-1.5">
                {badges.map((b) => <Badge key={b} kind={b} label={b === "SALE" ? `SALE −${p.discountPct}%` : b} />)}
              </div>
              <span className="pointer-events-none absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-bone/90"><Maximize2 className="size-4" aria-hidden /></span>
            </div>
            {n > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bone/90 lg:hidden"><ChevronLeft className="size-5" aria-hidden /></button>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bone/90 lg:hidden"><ChevronRight className="size-5" aria-hidden /></button>
              </>
            )}
          </div>
        </div>

        {/* details */}
        <div className="lg:pt-2">
          <p className="eyebrow text-taupe">{p.category} · {p.fit}</p>
          <h1 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">{p.name}</h1>
          <p className="mt-2 text-taupe">{p.subtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Price price={p.price} mrp={p.mrp} discountPct={p.discountPct} size="lg" />
            {p.ratingCount > 0 && (
              <a href="#reviews" className="inline-flex items-center gap-2 text-sm"><Stars rating={p.rating} size={16} /> <span className="link-u">{p.rating.toFixed(1)} ({p.ratingCount})</span></a>
            )}
          </div>
          <p className="mt-1 text-xs text-taupe">Inclusive of all taxes. {p.price >= COMMERCE.freeShippingThreshold ? "Ships free." : `Free shipping above ${formatINR(COMMERCE.freeShippingThreshold)}.`}</p>

          <div className="mt-8">
            <PurchasePanel product={p} color={color} onColorChange={(c) => { setColor(c); setView(0); }} />
          </div>

          <ul className="mt-8 grid gap-3 border-y border-line py-6 text-[0.8125rem]">
            <li className="flex items-center gap-3"><Truck className="size-5 shrink-0" strokeWidth={1.5} aria-hidden /> Delivery in 3–7 business days across India</li>
            <li className="flex items-center gap-3"><RotateCcw className="size-5 shrink-0" strokeWidth={1.5} aria-hidden /> {COMMERCE.returnDays}-day easy returns and exchanges</li>
            <li className="flex items-center gap-3"><ShieldCheck className="size-5 shrink-0" strokeWidth={1.5} aria-hidden /> Secure payments · Cash on Delivery available</li>
          </ul>

          <div className="mt-2">
            <Accordion title="Description" defaultOpen>
              <p>{p.description}</p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
            </Accordion>
            <Accordion title="Fabric & care">
              <p><b className="font-semibold">Fabric.</b> {p.fabric}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">{p.care.map((c) => <li key={c}>{c}</li>)}</ul>
            </Accordion>
            <Accordion title="Delivery & returns">
              <p>Orders ship within 1–2 business days. Standard delivery takes 3–7 business days. Shipping is free above {formatINR(COMMERCE.freeShippingThreshold)}, otherwise {formatINR(COMMERCE.shippingFee)}. Cash on Delivery is available up to {formatINR(COMMERCE.codMaxOrder)} for a {formatINR(COMMERCE.codFee)} fee.</p>
              <p className="mt-3">Unworn items with tags can be returned or exchanged within {COMMERCE.returnDays} days of delivery. <Link href="/pages/returns" className="link-u">Read the returns policy</Link>.</p>
            </Accordion>
          </div>
        </div>
      </div>

      <Overlay open={lightbox} onClose={() => setLightbox(false)} label={`${p.name} images`} side="center" closeButton={false} className="h-[92svh] w-[min(94vw,70svh)] bg-cream">
        <div className="relative h-full w-full">
          <ProductImage product={p} color={color} view={view} sizes="100vw" />
          <button type="button" onClick={() => setLightbox(false)} aria-label="Close" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-bone"><X className="size-5" aria-hidden /></button>
          {n > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-bone"><ChevronLeft className="size-5" aria-hidden /></button>
              <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-bone"><ChevronRight className="size-5" aria-hidden /></button>
            </>
          )}
        </div>
      </Overlay>
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <h2>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left text-xs font-semibold uppercase tracking-[0.16em]">
          {title}
          <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-6 text-sm leading-relaxed text-ink/80">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
