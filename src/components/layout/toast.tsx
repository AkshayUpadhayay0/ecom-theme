"use client";
import { AnimatePresence, motion } from "motion/react";
import { Check, AlertCircle, X } from "lucide-react";
import { GarmentArt } from "@/components/ui/garment-art";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

export function Toast() {
  const { toast, dismissToast } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[95] flex justify-center px-4 sm:justify-end sm:px-8" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn("pointer-events-auto flex w-full max-w-sm items-center gap-3.5 border bg-bone p-3 pr-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]", toast.tone === "error" ? "border-oxblood/40" : "border-line")}
          >
            {toast.art ? (
              <div className="relative size-14 shrink-0 overflow-hidden bg-cream">
                <GarmentArt kind={toast.art.kind} color={toast.art.color} />
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 500, damping: 15 }} className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-ink text-bone">
                  <Check className="size-3" aria-hidden />
                </motion.span>
              </div>
            ) : (
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", toast.tone === "error" ? "bg-oxblood/10 text-oxblood" : "bg-beige")}>
                {toast.tone === "error" ? <AlertCircle className="size-5" aria-hidden /> : <Check className="size-5" aria-hidden />}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.subtitle && <p className="truncate text-[0.8125rem] text-taupe">{toast.subtitle}</p>}
            </div>
            {toast.action && (
              <button type="button" onClick={() => { toast.action!.onClick(); dismissToast(); }} className="link-u shrink-0 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
                {toast.action.label}
              </button>
            )}
            <button type="button" onClick={dismissToast} aria-label="Dismiss" className="grid size-8 shrink-0 place-items-center text-taupe hover:text-ink">
              <X className="size-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
