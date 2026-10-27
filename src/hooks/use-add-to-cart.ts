"use client";
import { useCallback } from "react";
import { photosFor } from "@/lib/photos";
import type { Product } from "@/lib/types";
import { lineKey, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

interface Options { color: string; size: string; qty?: number; openCart?: boolean }

/** Adds a variant to the bag with stock checks, an animated toast and cart-icon feedback. */
export function useAddToCart() {
  const cart = useCart();
  const ui = useUI();
  return useCallback(
    (p: Product, { color, size, qty = 1, openCart }: Options): boolean => {
      const colorOpt = p.colors.find((c) => c.name === color);
      const variant = p.variants.find((v) => v.color === color && v.size === size);
      if (!colorOpt || !variant) {
        ui.showToast({ title: "Choose a size", subtitle: "Select a colour and size first.", tone: "error" });
        return false;
      }
      const inBag = cart.lines.find((l) => lineKey(l) === lineKey({ productId: p.id, color, size }))?.qty ?? 0;
      if (variant.stock <= 0) {
        ui.showToast({ title: "Sold out", subtitle: `${p.name} in ${color}, ${size} is unavailable.`, tone: "error" });
        return false;
      }
      if (inBag + qty > variant.stock) {
        ui.showToast({ title: "Limited stock", subtitle: `Only ${variant.stock} available in this size${inBag ? ` (you have ${inBag} in your bag)` : ""}.`, tone: "error" });
        return false;
      }
      cart.add({ productId: p.id, slug: p.slug, name: p.name, kind: p.kind, color, colorHex: colorOpt.hex, size, price: p.price, mrp: p.mrp, image: photosFor(p, color)[0] }, qty);
      ui.triggerBump();
      if (openCart) {
        ui.setCartOpen(true);
      } else {
        ui.showToast({
          title: "Added to your bag",
          subtitle: `${p.name} · ${color}${size === "One size" ? "" : ` · ${size}`}`,
          art: { kind: p.kind, color: colorOpt.hex },
          action: { label: "View bag", onClick: () => ui.setCartOpen(true) },
        });
      }
      return true;
    },
    [cart, ui],
  );
}
