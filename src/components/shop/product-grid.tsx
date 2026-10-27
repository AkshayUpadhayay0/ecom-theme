"use client";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 lg:gap-y-12";

/** Static grid that staggers in as it scrolls into view (home page sections). */
export function ProductGrid({ products, cols = 4, className }: { products: Product[]; cols?: 3 | 4; className?: string }) {
  return (
    <Stagger className={cn(GRID, cols === 4 ? "xl:grid-cols-4" : "", className)}>
      {products.map((p, i) => (
        <StaggerItem key={p.id}>
          <ProductCard product={p} priority={i < 4} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** Filterable grid: items animate in/out and reflow smoothly when filters change. */
export function AnimatedGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <motion.ul layout className={cn(GRID, "xl:grid-cols-4", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.li
            key={p.id}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.04 }}
          >
            <ProductCard product={p} priority={i < 4} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
