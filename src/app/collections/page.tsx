import type { Metadata } from "next";
import { CollectionCards } from "@/components/home/collections";
import { SplitHeading } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Collections", description: "Explore Maison Noir collections: menswear, womenswear, streetwear, casual and accessories." };

export default function CollectionsPage() {
  return (
    <div className="container-x py-14 lg:py-20">
      <p className="eyebrow text-taupe">Maison Noir</p>
      <SplitHeading text="Collections" className="display mt-3 text-6xl sm:text-7xl" />
      <p className="mt-4 max-w-md text-taupe">Five ways into the wardrobe. Start with the edit that feels most like you.</p>
      <div className="mt-12"><CollectionCards /></div>
    </div>
  );
}
