"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartLine, Quote } from "@/lib/types";

export const lineKey = (l: Pick<CartLine, "productId" | "color" | "size">) => `${l.productId}|${l.color}|${l.size}`;
const STORAGE = "mn_cart_v1";
const MAX_QTY = 10;

interface CartState {
  ready: boolean;
  lines: CartLine[];
  count: number;
  subtotal: number;
  coupon: string;
  setCoupon: (c: string) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartState | null>(null);
export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside <Providers>");
  return v;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [coupon, setCouponState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE) ?? "null");
      if (raw?.lines && Array.isArray(raw.lines)) setLines(raw.lines);
      if (typeof raw?.coupon === "string") setCouponState(raw.coupon);
    } catch { /* corrupted storage: start fresh */ }
    setReady(true);
    // keep several tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE || !e.newValue) return;
      try {
        const raw = JSON.parse(e.newValue);
        setLines(raw.lines ?? []);
        setCouponState(raw.coupon ?? "");
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE, JSON.stringify({ lines, coupon })); } catch { /* storage full or blocked */ }
  }, [lines, coupon, ready]);

  const add = useCallback<CartState["add"]>((line, qty = 1) => {
    setLines((prev) => {
      const key = lineKey(line);
      const found = prev.find((l) => lineKey(l) === key);
      if (found) return prev.map((l) => (lineKey(l) === key ? { ...l, ...line, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      return [...prev, { ...line, qty: Math.min(MAX_QTY, qty) }];
    });
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => lineKey(l) !== key) : prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))));
  }, []);
  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)), []);
  const clear = useCallback(() => { setLines([]); setCouponState(""); }, []);
  const setCoupon = useCallback((c: string) => setCouponState(c.trim().toUpperCase()), []);

  const value = useMemo<CartState>(() => ({
    ready, lines, coupon, setCoupon, add, setQty, remove, clear,
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.qty * l.price, 0),
  }), [ready, lines, coupon, setCoupon, add, setQty, remove, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Asks the server to price the bag (live prices, stock, coupon, shipping). The browser's own
 * totals are only used while this is loading.
 */
export function useQuote(paymentMethod?: "cod" | "razorpay", enabled = true) {
  const { lines, coupon, ready } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const seq = useRef(0);

  const payload = useMemo(
    () => JSON.stringify({ items: lines.map((l) => ({ productId: l.productId, color: l.color, size: l.size, qty: l.qty })), coupon, paymentMethod }),
    [lines, coupon, paymentMethod],
  );

  useEffect(() => {
    if (!ready || !enabled) return;
    if (!lines.length) { setQuote(null); setLoading(false); return; }
    const mine = ++seq.current;
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, signal: ctrl.signal });
        const data = (await res.json()) as Quote;
        if (mine === seq.current) { setQuote(data); setError(false); }
      } catch (e) {
        if ((e as Error).name !== "AbortError" && mine === seq.current) setError(true);
      } finally {
        if (mine === seq.current) setLoading(false);
      }
    }, 220);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [payload, ready, enabled, lines.length]);

  return { quote, loading, error };
}
