import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/wishlist-view";
import { getAllProducts } from "@/lib/repo";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function WishlistPage() {
  return <WishlistView products={getAllProducts()} />;
}
