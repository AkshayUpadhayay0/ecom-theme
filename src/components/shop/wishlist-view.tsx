"use client";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/store/wishlist";
import { AnimatedGrid } from "./product-grid";

export function WishlistView({ products }: { products: Product[] }) {
  const { ids } = useWishlist();
  const saved = useMemo(() => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[], [ids, products]);
  return (
    <div className="container-x py-14 lg:py-20">
      <h1 className="display text-5xl sm:text-6xl">Wishlist</h1>
      <p className="mt-3 text-sm text-taupe">{saved.length} saved {saved.length === 1 ? "piece" : "pieces"}. Sign in to keep your wishlist across devices.</p>
      <div className="mt-12">
        {saved.length ? <AnimatedGrid products={saved} /> : (
          <div className="py-20 text-center">
            <p className="display text-4xl">Nothing saved yet</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-taupe">Tap the heart on any piece to keep it here for later.</p>
            <Button href="/shop" arrow className="mt-8">Start browsing</Button>
          </div>
        )}
      </div>
    </div>
  );
}
