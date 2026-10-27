"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Eye, Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Badge, Price, Stars, Swatch } from "@/components/ui/bits";
import { ProductImage, viewCount } from "@/components/ui/product-image";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

export function ProductCard({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  const [color, setColor] = useState(product.colors[0].name);
  const add = useAddToCart();
  const ui = useUI();
  const wish = useWishlist();
  const wished = wish.has(product.id);
  const hasSecond = viewCount(product, color) > 1;
  const stockOf = (size: string) => product.variants.find((v) => v.color === color && v.size === size)?.stock ?? 0;
  const oneSize = product.sizes.length === 1;
  const badges = [product.isNew && "NEW", product.isBestseller && "BESTSELLER", product.onSale && "SALE"].filter(Boolean) as ("NEW" | "BESTSELLER" | "SALE")[];

  return (
    <article className={cn("group/card relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-cream transition-shadow duration-700 ease-[var(--ease-premium)] group-hover/card:shadow-[0_24px_50px_-24px_rgba(18,18,17,0.35)]">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block" aria-label={`${product.name}, ${product.subtitle}`}>
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-premium)] group-hover/card:scale-[1.045]">
            <ProductImage product={product} color={color} view={0} priority={priority} />
            {hasSecond && (
              <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
                <ProductImage product={product} color={color} view={1} />
              </div>
            )}
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {badges.map((b) => <Badge key={b} kind={b} label={b === "SALE" ? `SALE −${product.discountPct}%` : b} />)}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => wish.toggle(product.id)}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="grid size-10 place-items-center rounded-full bg-bone/90 shadow-sm backdrop-blur transition-transform duration-300 hover:scale-110 active:scale-90"
          >
            <motion.span key={String(wished)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} className="grid place-items-center">
              <Heart className={cn("size-[18px]", wished && "fill-oxblood text-oxblood")} strokeWidth={1.6} aria-hidden />
            </motion.span>
          </button>
          <button
            type="button"
            onClick={() => ui.openQuickView(product)}
            aria-label={`Quick view ${product.name}`}
            className="grid size-10 translate-x-3 place-items-center rounded-full bg-bone/90 opacity-0 shadow-sm backdrop-blur transition-all duration-500 ease-[var(--ease-premium)] hover:scale-110 focus-visible:translate-x-0 focus-visible:opacity-100 group-hover/card:translate-x-0 group-hover/card:opacity-100 [@media(hover:none)]:hidden"
          >
            <Eye className="size-[18px]" strokeWidth={1.6} aria-hidden />
          </button>
        </div>

        {/* quick add: size chips on hover (pointer devices) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-bone/95 p-3 backdrop-blur transition-transform duration-500 ease-[var(--ease-premium)] focus-within:translate-y-0 group-hover/card:translate-y-0 [@media(hover:none)]:hidden">
          {!product.inStock ? (
            <p className="py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-taupe">Sold out</p>
          ) : oneSize ? (
            <button type="button" onClick={() => add(product, { color, size: product.sizes[0] })} disabled={stockOf(product.sizes[0]) <= 0} className="w-full py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-oxblood disabled:opacity-40">
              Quick add · {stockOf(product.sizes[0]) > 0 ? "Add to bag" : "Sold out"}
            </button>
          ) : (
            <>
              <p className="mb-2 text-center text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-taupe">Quick add · select size</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {product.sizes.map((s) => {
                  const out = stockOf(s) <= 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={out}
                      onClick={() => add(product, { color, size: s })}
                      aria-label={`Add size ${s}${out ? " (sold out)" : ""} to bag`}
                      className={cn("min-w-9 border px-2 py-1.5 text-xs font-medium transition-colors", out ? "border-line text-sand line-through" : "border-sand hover:border-ink hover:bg-ink hover:text-bone")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* touch devices: no hover, so a visible add button opens quick view */}
        <button
          type="button"
          onClick={() => ui.openQuickView(product)}
          aria-label={`Choose size and add ${product.name} to bag`}
          className="absolute bottom-3 right-3 hidden size-10 place-items-center rounded-full bg-ink text-bone shadow-lg [@media(hover:none)]:grid"
        >
          <Plus className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover/card:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[0.9375rem] font-medium leading-snug">
            <Link href={`/product/${product.slug}`} className="link-u">{product.name}</Link>
          </h3>
          <Price price={product.price} mrp={product.mrp} size="sm" className="shrink-0 flex-col items-end gap-0 text-right [&>s]:order-2" />
        </div>
        <p className="mt-0.5 text-[0.8125rem] text-taupe">{product.subtitle}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5" role="group" aria-label="Colours">
            {product.colors.slice(0, 5).map((c) => <Swatch key={c.name} hex={c.hex} name={c.name} size={16} selected={c.name === color} onClick={() => setColor(c.name)} />)}
            {product.colors.length > 5 && <span className="text-xs text-taupe">+{product.colors.length - 5}</span>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-taupe">
            <Stars rating={product.rating} size={12} />
            <span aria-hidden>({product.ratingCount})</span>
          </div>
        </div>
        <AnimatePresence>
          {product.inStock && product.variants.some((v) => v.color === color && v.stock > 0 && v.stock <= 3) && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 text-[0.7rem] font-medium text-oxblood">
              Low stock in some sizes
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
