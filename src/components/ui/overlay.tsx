"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useScrollLock } from "@/store/ui";
import { cn } from "@/lib/utils";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "center" | "right" | "left" | "top";
  children: ReactNode;
  className?: string;
  /** when false the default close button is omitted (the child renders its own) */
  closeButton?: boolean;
  z?: string;
}

/**
 * Accessible dialog/drawer: traps focus, closes on Escape or backdrop click, restores focus,
 * locks page scroll and animates in and out.
 */
export function Overlay({ open, onClose, label, side = "center", children, className, closeButton = true, z = "z-[80]" }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const el = panel.current;
      if (!el) return;
      (el.querySelector<HTMLElement>("[data-autofocus]") ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el).focus({ preventScroll: true });
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      opener.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const variants = {
    center: { initial: { opacity: 0, y: 24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.985 } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    top: { initial: { opacity: 0, y: -24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } },
  }[side];

  const position = {
    center: "inset-0 grid place-items-center p-3 sm:p-6",
    right: "inset-y-0 right-0 flex w-full max-w-[28rem]",
    left: "inset-y-0 left-0 flex w-full max-w-[24rem]",
    top: "inset-x-0 top-0",
  }[side];

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0", z)}>
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            onClick={onClose}
            aria-hidden
          />
          <div className={cn("pointer-events-none absolute", position)}>
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              aria-labelledby={undefined}
              id={titleId}
              tabIndex={-1}
              data-lenis-prevent
              className={cn("pointer-events-auto relative bg-bone shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] outline-none", side === "right" || side === "left" ? "h-full w-full" : "", className)}
              {...variants}
              transition={{ duration: 0.55, ease }}
            >
              {closeButton && (
                <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-bone/90 transition-colors hover:bg-beige">
                  <X className="size-5" aria-hidden />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
