"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ArtKind, Product } from "@/lib/types";

export interface ToastData {
  id: number;
  title: string;
  subtitle?: string;
  art?: { kind: ArtKind; color: string };
  action?: { label: string; onClick: () => void };
  tone?: "default" | "error";
}

interface UIState {
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  quickView: Product | null;
  openQuickView: (p: Product) => void;
  closeQuickView: () => void;
  toast: ToastData | null;
  showToast: (t: Omit<ToastData, "id">) => void;
  dismissToast: () => void;
  /** increments whenever something is added to the bag, to animate the cart icon */
  bump: number;
  triggerBump: () => void;
}

const Ctx = createContext<UIState | null>(null);
export const useUI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI must be used inside <Providers>");
  return v;
};

let locks = 0;
/** Locks page scroll while an overlay is open. Reference counted so stacked overlays are safe. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    const w = window as unknown as { __lenis?: { stop(): void; start(): void } };
    document.documentElement.classList.add("is-locked");
    w.__lenis?.stop();
    return () => {
      locks--;
      if (locks <= 0) {
        locks = 0;
        document.documentElement.classList.remove("is-locked");
        w.__lenis?.start();
      }
    };
  }, [active]);
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [bump, setBump] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((t: Omit<ToastData, "id">) => {
    clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4200);
  }, []);
  const dismissToast = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const value = useMemo<UIState>(
    () => ({
      cartOpen, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen,
      quickView, openQuickView: setQuickView, closeQuickView: () => setQuickView(null),
      toast, showToast, dismissToast, bump, triggerBump: () => setBump((b) => b + 1),
    }),
    [cartOpen, searchOpen, menuOpen, quickView, toast, bump, showToast, dismissToast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
