"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/config/site";

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = ANNOUNCEMENTS.length;

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, reduce, n]);

  return (
    <div
      className="on-dark relative bg-ink text-bone"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-label="Announcements"
    >
      <div className="container-x flex h-10 items-center justify-center gap-3">
        <button type="button" onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="Previous announcement" className="hidden size-8 place-items-center opacity-60 transition-opacity hover:opacity-100 sm:grid">
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <div className="relative h-5 w-full max-w-xl overflow-hidden text-center" aria-live="off">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={i}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 truncate text-[0.6875rem] font-medium uppercase tracking-[0.16em] sm:text-xs"
            >
              {ANNOUNCEMENTS[i]}
            </motion.p>
          </AnimatePresence>
        </div>
        <button type="button" onClick={() => setI((x) => (x + 1) % n)} aria-label="Next announcement" className="hidden size-8 place-items-center opacity-60 transition-opacity hover:opacity-100 sm:grid">
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
