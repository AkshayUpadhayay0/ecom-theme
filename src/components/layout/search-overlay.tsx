"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage } from "@/components/ui/product-image";
import { Spinner } from "@/components/ui/bits";
import type { ArtKind, ColorOpt } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useUI } from "@/store/ui";

interface Hit { id: number; slug: string; name: string; kind: ArtKind; price: number; mrp: number; category: string; color: ColorOpt; images: Record<string, string[]> }
interface Result { total: number; categories: string[]; products: Hit[] }

const POPULAR = ["Linen shirt", "Wool coat", "Sneakers", "Hoodie", "Wide-leg trousers", "Leather tote"];
const RECENT_KEY = "mn_recent_searches";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const seq = useRef(0);
  const close = () => setSearchOpen(false);

  useEffect(() => {
    if (!searchOpen) return;
    setQ(""); setRes(null); setActive(-1);
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")); } catch { setRecent([]); }
  }, [searchOpen]);

  // "/" opens search from anywhere outside a text field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(t.tagName) && !t.isContentEditable) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); setLoading(false); return; }
    const mine = ++seq.current;
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        const data = (await r.json()) as Result;
        if (mine === seq.current) { setRes(data); setActive(-1); }
      } catch { /* aborted */ } finally { if (mine === seq.current) setLoading(false); }
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  function go(term: string) {
    const t = term.trim();
    if (!t) return;
    try { localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5))); } catch { /* ignore */ }
    close();
    router.push(`/shop?q=${encodeURIComponent(t)}`);
  }

  const items = res?.products ?? [];
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) { close(); router.push(`/product/${items[active].slug}`); } else go(q);
    }
  }

  return (
    <Overlay open={searchOpen} onClose={close} label="Search" side="top" closeButton={false} className="max-h-[92vh] w-full overflow-y-auto" z="z-[85]">
      <div className="container-x py-6 sm:py-9">
        <div className="flex items-center gap-4 border-b border-ink pb-3">
          <Search className="size-6 shrink-0" strokeWidth={1.5} aria-hidden />
          <input
            data-autofocus
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="search-results"
            aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search products"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search for shirts, coats, sneakers…"
            className="display w-full bg-transparent text-2xl placeholder:text-sand focus:outline-none sm:text-4xl"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <Spinner />}
          <button type="button" onClick={close} aria-label="Close search" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-beige"><X className="size-6" aria-hidden /></button>
        </div>

        <div className="min-h-[14rem] py-7" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {q.trim().length < 2 ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-10 md:grid-cols-2">
                <div>
                  <p className="eyebrow text-taupe">Popular searches</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {POPULAR.map((p) => <li key={p}><button type="button" onClick={() => go(p)} className="border border-sand px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-ink hover:text-bone">{p}</button></li>)}
                  </ul>
                </div>
                {recent.length > 0 && (
                  <div>
                    <p className="eyebrow text-taupe">Recent</p>
                    <ul className="mt-4 space-y-2">
                      {recent.map((r) => <li key={r}><button type="button" onClick={() => go(r)} className="link-u inline-flex items-center gap-2.5 text-[0.9375rem]"><Clock className="size-4 text-taupe" aria-hidden /> {r}</button></li>)}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : items.length === 0 && !loading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="display text-3xl">No results for “{q.trim()}”</p>
                <p className="mt-2 text-taupe">Check the spelling, or try a broader term like “shirt” or “jacket”.</p>
                <ul className="mt-5 flex flex-wrap gap-2">{POPULAR.slice(0, 4).map((p) => <li key={p}><button onClick={() => go(p)} className="border border-sand px-4 py-2 text-sm hover:border-ink">{p}</button></li>)}</ul>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {res && res.categories.length > 0 && (
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="eyebrow mr-2 text-taupe">Categories</span>
                    {res.categories.map((c) => <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} onClick={close} className="border border-sand px-3.5 py-1.5 text-sm hover:border-ink">{c}</Link>)}
                  </div>
                )}
                <ul id="search-results" role="listbox" aria-label="Product suggestions" className="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((p, i) => (
                    <motion.li key={p.id} id={`search-opt-${i}`} role="option" aria-selected={active === i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}>
                      <Link href={`/product/${p.slug}`} onClick={close} className={`group flex items-center gap-4 p-2 transition-colors hover:bg-cream ${active === i ? "bg-cream" : ""}`}>
                        <span className="relative block aspect-[4/5] w-16 shrink-0 overflow-hidden bg-cream">
                          <ProductImage product={{ kind: p.kind, images: p.images, name: p.name, fabric: "", colors: [p.color] }} sizes="64px" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.9375rem] font-medium">{p.name}</span>
                          <span className="block text-[0.8125rem] text-taupe">{p.category}</span>
                        </span>
                        <span className="text-sm tabular-nums">{formatINR(p.price)}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                {res && res.total > 0 && (
                  <button type="button" onClick={() => go(q)} className="group mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    <span className="link-u">View all {res.total} result{res.total === 1 ? "" : "s"}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" aria-hidden />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Overlay>
  );
}
