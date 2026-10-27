"use client";
import Image from "next/image";
import { useState } from "react";
import type { ArtKind, ColorOpt, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { photosFor } from "@/lib/photos";
import { GarmentArt } from "./garment-art";

export { viewCount } from "@/lib/photos";

type Imageable = Pick<Product, "kind" | "images" | "name" | "colors" | "fabric">;

interface Props {
  product: Imageable;
  color?: string;
  view?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({ product, color, view = 0, sizes = "(min-width:1024px) 25vw, 50vw", priority, className }: Props) {
  const c: ColorOpt = product.colors.find((x) => x.name === color) ?? product.colors[0];
  const photos = photosFor(product, c.name);
  const src = photos[view];
  const [failed, setFailed] = useState<string | null>(null);
  const alt = `${product.name} in ${c.name}`;

  if (src && failed !== src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(src)}
        className={cn("object-cover", className)}
      />
    );
  }
  return <GarmentArt kind={product.kind as ArtKind} color={c.hex} view={view} fabric={product.fabric} label={alt} className={className} />;
}
