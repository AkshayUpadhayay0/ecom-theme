"use client";
import { Minus, Plus, Star } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className={cn("relative inline-flex", className)} role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="flex gap-0.5 text-sand" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} width={size} height={size} strokeWidth={1.5} />)}
      </span>
      <span className="absolute inset-0 overflow-hidden text-ink" style={{ width: `${pct}%` }} aria-hidden>
        <span className="flex gap-0.5" style={{ width: size * 5 + 8 }}>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} width={size} height={size} strokeWidth={1.5} fill="currentColor" />)}
        </span>
      </span>
    </span>
  );
}

const badgeStyle = {
  NEW: "bg-ink text-bone",
  BESTSELLER: "bg-beige text-ink",
  SALE: "bg-oxblood text-bone",
} as const;
export function Badge({ kind, label }: { kind: keyof typeof badgeStyle; label?: string }) {
  return <span className={cn("px-2.5 py-1 text-[0.6rem] font-semibold uppercase leading-none tracking-[0.18em]", badgeStyle[kind])}>{label ?? kind}</span>;
}

export function Price({ price, mrp, discountPct, size = "md", className }: { price: number; mrp: number; discountPct?: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const sale = mrp > price;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5", size === "lg" ? "text-xl" : size === "sm" ? "text-[0.8125rem]" : "text-[0.9375rem]", className)}>
      <span className={cn("font-medium tabular-nums", sale && "text-oxblood")}>
        <span className="sr-only">{sale ? "Sale price " : "Price "}</span>
        {formatINR(price)}
      </span>
      {sale && (
        <>
          <s className="text-taupe tabular-nums" aria-label={`Original price ${formatINR(mrp)}`}>{formatINR(mrp)}</s>
          {discountPct ? <span className="text-[0.7em] font-semibold uppercase tracking-wider text-oxblood">{discountPct}% off</span> : null}
        </>
      )}
    </p>
  );
}

export function QtyStepper({ value, onChange, min = 1, max = 10, small, label = "Quantity" }: { value: number; onChange: (n: number) => void; min?: number; max?: number; small?: boolean; label?: string }) {
  const btn = cn("grid place-items-center transition-colors hover:bg-beige disabled:opacity-30 disabled:hover:bg-transparent", small ? "size-8" : "size-11");
  return (
    <div className={cn("inline-flex items-stretch border border-sand", small ? "h-8" : "h-11")} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="size-3.5" aria-hidden />
      </button>
      <output className={cn("grid place-items-center font-medium tabular-nums", small ? "w-8 text-sm" : "w-10")} aria-live="polite">{value}</output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function Swatch({ hex, name, selected, onClick, size = 20, disabled }: { hex: string; name: string; selected?: boolean; onClick?: () => void; size?: number; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={name}
      aria-label={`${name}${selected ? " (selected)" : ""}`}
      aria-pressed={selected}
      className={cn("relative grid shrink-0 place-items-center rounded-full transition-transform duration-300 hover:scale-110 disabled:opacity-40", selected ? "ring-1 ring-ink ring-offset-2 ring-offset-bone" : "ring-1 ring-black/10")}
      style={{ width: size, height: size }}
    >
      <span className="block rounded-full" style={{ background: hex, width: size - 4, height: size - 4 }} />
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block size-5 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-sand border-t-ink", className)} role="status" aria-label="Loading" />;
}
