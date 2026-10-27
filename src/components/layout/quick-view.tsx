"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { Price, Stars, Badge } from "@/components/ui/bits";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage, viewCount } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

export function QuickView() {
  const { quickView: p, closeQuickView, setCartOpen } = useUI();
  const [color, setColor] = useState("");
  const [view, setView] = useState(0);
  useEffect(() => { if (p) { setColor(p.colors[0].name); setView(0); } }, [p]);

  return (
    <Overlay open={!!p} onClose={closeQuickView} label={p ? `Quick view: ${p.name}` : "Quick view"} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto">
      {p && color && (
        <div className="grid md:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-cream md:aspect-auto md:h-full md:min-h-[34rem]">
              <ProductImage product={p} color={color} view={view} sizes="(min-width:768px) 400px, 100vw" />
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                {p.isNew && <Badge kind="NEW" />}
                {p.onSale && <Badge kind="SALE" label={`SALE −${p.discountPct}%`} />}
              </div>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {Array.from({ length: Math.min(4, viewCount(p, color)) }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setView(i)} aria-label={`Show image ${i + 1}`} className={cn("h-1.5 rounded-full bg-ink transition-all", view === i ? "w-6" : "w-1.5 opacity-30")} />
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-9">
            <p className="eyebrow text-taupe">{p.category}</p>
            <h2 className="display mt-2 text-3xl sm:text-4xl">{p.name}</h2>
            <p className="mt-1.5 text-sm text-taupe">{p.subtitle}</p>
            <div className="mt-4 flex items-center gap-3">
              <Price price={p.price} mrp={p.mrp} discountPct={p.discountPct} size="lg" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-taupe">
              <Stars rating={p.rating} /> <span>{p.rating.toFixed(1)} ({p.ratingCount})</span>
            </div>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-soft">{p.description}</p>
            <div className="mt-7">
              <PurchasePanel product={p} color={color} onColorChange={setColor} openCartOnAdd onAdded={() => { closeQuickView(); setCartOpen(true); }} />
            </div>
            <Link href={`/product/${p.slug}`} onClick={closeQuickView} className="link-u mt-6 inline-block text-xs font-semibold uppercase tracking-[0.16em]">
              View full details
            </Link>
          </div>
        </div>
      )}
    </Overlay>
  );
}
