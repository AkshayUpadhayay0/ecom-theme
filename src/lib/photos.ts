import type { Product } from "./types";

export function photosFor(p: Pick<Product, "images">, colorName?: string): string[] {
  return (colorName && p.images[colorName]) || p.images["*"] || [];
}

/** Number of gallery views: real photos if supplied, otherwise the 4 generated views. */
export function viewCount(p: Pick<Product, "images">, colorName?: string): number {
  const ph = photosFor(p, colorName);
  return ph.length || 4;
}
