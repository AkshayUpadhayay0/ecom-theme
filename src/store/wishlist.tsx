"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./auth";

const STORAGE = "mn_wishlist_v1";

interface WishState {
  ids: number[];
  has: (id: number) => boolean;
  toggle: (id: number) => boolean; // returns the new state
}
const Ctx = createContext<WishState | null>(null);
export const useWishlist = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be used inside <Providers>");
  return v;
};

const post = (body: unknown) =>
  fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

export function WishlistProvider({ initialIds, children }: { initialIds: number[]; children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<number[]>(initialIds);
  const synced = useRef<number | null>(user?.id ?? null);

  // guests: read local storage once on mount
  useEffect(() => {
    if (user) return;
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
      if (Array.isArray(raw)) setIds(raw.filter((n) => Number.isInteger(n)));
    } catch { /* ignore */ }
  }, [user]);

  // when someone signs in, merge their guest wishlist into their account
  useEffect(() => {
    if (!user || synced.current === user.id) return;
    synced.current = user.id;
    let local: number[] = [];
    try { local = JSON.parse(localStorage.getItem(STORAGE) ?? "[]"); } catch { /* ignore */ }
    post({ merge: local }).then((r) => r?.ids && setIds(r.ids));
  }, [user]);

  const persist = useCallback((next: number[]) => {
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback((id: number) => {
    let on = false;
    setIds((prev) => {
      on = !prev.includes(id);
      const next = on ? [id, ...prev] : prev.filter((x) => x !== id);
      persist(next);
      return next;
    });
    if (user) post({ productId: id, on });
    return on;
  }, [user, persist]);

  const value = useMemo(() => ({ ids, has: (id: number) => ids.includes(id), toggle }), [ids, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
