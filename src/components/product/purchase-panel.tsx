"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QtyStepper, Swatch } from "@/components/ui/bits";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/store/wishlist";
import { SizeGuideButton } from "./size-guide";

interface Props {
  product: Product;
  color: string;
  onColorChange: (c: string) => void;
  /** quick-view uses the drawer for feedback; the product page shows a toast */
  openCartOnAdd?: boolean;
  onAdded?: () => void;
}

export function PurchasePanel({ product, color, onColorChange, openCartOnAdd, onAdded }: Props) {
  const router = useRouter();
  const add = useAddToCart();
  const wish = useWishlist();
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [needSize, setNeedSize] = useState(false);

  const stock = (s: string) => product.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const selectedStock = size ? stock(size) : 0;
  const wished = wish.has(product.id);

  // if the chosen size is not available in the newly chosen colour, clear it
  useEffect(() => {
    if (size && stock(size) <= 0) setSize(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);
  useEffect(() => { if (size) setNeedSize(false); }, [size]);
  useEffect(() => { if (qty > Math.max(1, Math.min(10, selectedStock))) setQty(Math.max(1, Math.min(10, selectedStock))); }, [selectedStock, qty]);

  const colorInStock = product.sizes.some((s) => stock(s) > 0);

  function submit(buyNow: boolean) {
    if (!size) { setNeedSize(true); return; }
    const ok = add(product, { color, size, qty, openCart: buyNow ? false : openCartOnAdd });
    if (!ok) return;
    if (buyNow) { router.push("/checkout"); onAdded?.(); return; }
    setJustAdded(true);
    onAdded?.();
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          Colour <span className="ml-1 font-normal normal-case tracking-normal text-taupe">{color}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Colour">
          {product.colors.map((c) => <Swatch key={c.name} hex={c.hex} name={c.name} size={30} selected={c.name === color} onClick={() => onColorChange(c.name)} />)}
        </div>
      </div>

      {!oneSize && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", needSize && "text-oxblood")} id={`size-label-${product.id}`}>
              Size {needSize && <span className="ml-1 font-normal normal-case tracking-normal" role="alert">· please select a size</span>}
            </p>
            <SizeGuideButton guide={product.sizeGuide} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`size-label-${product.id}`}>
            {product.sizes.map((s) => {
              const st = stock(s);
              const out = st <= 0;
              const sel = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  disabled={out}
                  onClick={() => setSize(s)}
                  aria-label={`Size ${s}${out ? ", sold out" : st <= 3 ? `, only ${st} left` : ""}`}
                  className={cn(
                    "relative h-11 min-w-[3.25rem] border px-3 text-sm font-medium transition-all duration-300",
                    sel ? "border-ink bg-ink text-bone" : out ? "cursor-not-allowed border-line text-sand" : "border-sand hover:border-ink",
                    needSize && !sel && !out && "border-oxblood/60",
                  )}
                >
                  {s}
                  {out && <span aria-hidden className="absolute inset-0 overflow-hidden"><span className="absolute left-0 top-1/2 h-px w-[140%] origin-left -rotate-[35deg] bg-sand" /></span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 h-5 text-[0.8125rem]" aria-live="polite">
            {!colorInStock ? <span className="font-medium text-oxblood">This colour is sold out.</span>
              : size && selectedStock <= 3 ? <span className="font-medium text-oxblood">Only {selectedStock} left in this size</span>
              : size ? <span className="text-taupe">In stock</span> : null}
          </p>
        </div>
      )}
      {oneSize && (
        <p className="mt-4 text-[0.8125rem]" aria-live="polite">
          {selectedStock <= 0 ? <span className="font-medium text-oxblood">Sold out in this colour.</span> : selectedStock <= 3 ? <span className="font-medium text-oxblood">Only {selectedStock} left</span> : <span className="text-taupe">In stock</span>}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(n, selectedStock || 10, 10)))} max={Math.max(1, Math.min(10, selectedStock || 10))} />
        <motion.div className="flex-1" animate={justAdded ? { scale: [1, 1.03, 1] } : {}} transition={{ duration: 0.5 }}>
          <Button full onClick={() => submit(false)} disabled={!colorInStock} className={cn(justAdded && "!bg-ink")}>
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span key="added" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="inline-flex items-center gap-2">
                  <Check className="size-4" aria-hidden /> Added
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="inline-flex items-center gap-2">
                  <ShoppingBag className="size-4" aria-hidden /> {colorInStock ? "Add to bag" : "Sold out"}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
        <button
          type="button"
          onClick={() => wish.toggle(product.id)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="grid size-[3.2rem] shrink-0 place-items-center border border-sand transition-colors hover:border-ink"
        >
          <Heart className={cn("size-5 transition-colors", wished && "fill-oxblood text-oxblood")} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <Button variant="outline" full className="mt-3" onClick={() => submit(true)} disabled={!colorInStock}>Buy now</Button>
    </div>
  );
}
