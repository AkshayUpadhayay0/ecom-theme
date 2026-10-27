"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TrendingCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);
  useEffect(() => { update(); }, [update]);

  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  const btn = "grid size-12 place-items-center rounded-full border border-ink transition-all duration-300 hover:bg-ink hover:text-bone disabled:pointer-events-none disabled:opacity-25";
  return (
    <div>
      <div className="mb-6 flex justify-end gap-3">
        <button type="button" onClick={() => scroll(-1)} disabled={edge.start} aria-label="Previous products" className={btn}><ArrowLeft className="size-5" aria-hidden /></button>
        <button type="button" onClick={() => scroll(1)} disabled={edge.end} aria-label="Next products" className={btn}><ArrowRight className="size-5" aria-hidden /></button>
      </div>
      <ul
        ref={track}
        onScroll={update}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-8 sm:gap-6 sm:px-8 lg:-mx-12 lg:px-12 [&::-webkit-scrollbar]:hidden"
        aria-label="Trending products"
        tabIndex={0}
        data-lenis-prevent-wheel
      >
        {products.map((p, i) => (
          <li key={p.id} className={cn("w-[62%] shrink-0 snap-start sm:w-[38%] md:w-[30%] lg:w-[23.5%]")}>
            <div className="relative">
              <span aria-hidden className="display pointer-events-none absolute -left-1 -top-6 z-10 text-7xl font-normal italic text-ink/10">{String(i + 1).padStart(2, "0")}</span>
              <ProductCard product={p} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
