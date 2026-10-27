"use client";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "light" | "ghost";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition-[color,border-color,transform,opacity] duration-500 ease-[var(--ease-premium)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50";

const styles: Record<Variant, { box: string; sweep: string }> = {
  primary: { box: "bg-ink text-bone border border-ink hover:text-ink", sweep: "bg-bone" },
  outline: { box: "border border-ink text-ink hover:text-bone", sweep: "bg-ink" },
  light: { box: "bg-bone text-ink border border-bone hover:text-bone", sweep: "bg-ink" },
  ghost: { box: "border border-transparent text-ink hover:text-bone", sweep: "bg-ink" },
};

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  href?: string;
  arrow?: boolean;
  loading?: boolean;
  full?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", href, arrow, loading, full, className, children, disabled, ...rest }: Props) {
  const s = styles[variant];
  const cls = cn(base, s.box, full && "w-full", className);
  const inner = (
    <>
      <span aria-hidden className={cn("absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-x-100", s.sweep)} />
      <span className="relative z-10 inline-flex items-center gap-2.5">
        {loading && <Loader2 className="size-4 animate-[spin_0.9s_linear_infinite]" aria-hidden />}
        {children}
        {arrow && <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1.5" aria-hidden />}
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {inner}
    </button>
  );
}
