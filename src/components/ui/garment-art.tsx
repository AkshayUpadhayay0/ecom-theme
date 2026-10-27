"use client";
import { useId, useMemo } from "react";
import { finishFor, garmentSvg, garmentViewBox } from "@/lib/garments";
import type { ArtKind } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  kind: ArtKind;
  color: string;
  view?: number;
  fabric?: string;
  className?: string;
  label?: string;
  bg?: string;
  /** "cover" crops to fill; "contain" shows the whole garment. */
  fit?: "cover" | "contain";
}

/** Generated, on-brand artwork used until real product photography is added. */
export function GarmentArt({ kind, color, view = 0, fabric, className, label, bg, fit = "cover" }: Props) {
  const uid = "ga" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const html = useMemo(() => garmentSvg({ kind, color, view, uid, bg, finish: finishFor(kind, fabric) }), [kind, color, view, uid, fabric, bg]);
  return (
    <svg
      viewBox={garmentViewBox(kind, view)}
      preserveAspectRatio={fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"}
      className={cn("block h-full w-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
