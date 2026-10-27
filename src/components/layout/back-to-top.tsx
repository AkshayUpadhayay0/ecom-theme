"use client";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const w = window as unknown as { __lenis?: { scrollTo(n: number): void } };
        if (w.__lenis) w.__lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
    >
      Back to top <ArrowUp className="size-4 transition-transform duration-300 group-hover:-translate-y-1" aria-hidden />
    </button>
  );
}
