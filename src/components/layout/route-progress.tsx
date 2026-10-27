"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Thin top progress bar: starts when an internal link is clicked, finishes when the route changes. */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const fail = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setPhase("loading");
      clearTimeout(fail.current);
      fail.current = setTimeout(() => setPhase("idle"), 10000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    setPhase((p) => (p === "loading" ? "done" : p));
    clearTimeout(fail.current);
    const t = setTimeout(() => setPhase("idle"), 500);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[2px]" aria-hidden>
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="bar"
            className="h-full origin-left bg-ink"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={phase === "done" ? { scaleX: 1, opacity: 0 } : { scaleX: 0.85 }}
            exit={{ opacity: 0 }}
            transition={phase === "done" ? { duration: 0.35 } : { duration: 6, ease: [0.1, 0.8, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
