"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/ui/overlay";
import { Swatch } from "@/components/ui/bits";
import type { Facets } from "@/lib/repo";
import { SORT_OPTIONS, serializeShopQuery } from "@/lib/shop-query";
import type { Product, ShopQuery } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { AnimatedGrid } from "./product-grid";

const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹2,000", max: 2000 },
  { label: "₹2,000 – ₹4,000", min: 2000, max: 4000 },
  { label: "₹4,000 – ₹7,000", min: 4000, max: 7000 },
  { label: "Above ₹7,000", min: 7000 },
];

export function ShopView({ products, facets, query, title }: { products: Product[]; facets: Facets; query: ShopQuery; title: string }) {
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const [drawer, setDrawer] = useState(false);

  const go = (patch: Partial<ShopQuery>) => start(() => router.push(`${path}${serializeShopQuery({ ...query, ...patch })}`, { scroll: false }));
  const toggle = (key: "sizes" | "colors", v: string) => go({ [key]: query[key].includes(v) ? query[key].filter((x) => x !== v) : [...query[key], v] });

  const chips: { label: string; clear: () => void }[] = [
    ...(query.gender ? [{ label: query.gender === "men" ? "Men" : "Women", clear: () => go({ gender: undefined }) }] : []),
    ...(query.category ? [{ label: query.category, clear: () => go({ category: undefined }) }] : []),
    ...(query.style ? [{ label: query.style, clear: () => go({ style: undefined }) }] : []),
    ...(query.sale ? [{ label: "Sale", clear: () => go({ sale: false }) }] : []),
    ...(query.isNew ? [{ label: "New", clear: () => go({ isNew: false }) }] : []),
    ...(query.inStock ? [{ label: "In stock", clear: () => go({ inStock: false }) }] : []),
    ...query.sizes.map((s) => ({ label: `Size ${s}`, clear: () => toggle("sizes", s) })),
    ...query.colors.map((c) => ({ label: c, clear: () => toggle("colors", c) })),
    ...(query.min !== undefined || query.max !== undefined ? [{ label: `${query.min !== undefined ? formatINR(query.min) : "₹0"} – ${query.max !== undefined ? formatINR(query.max) : "any"}`, clear: () => go({ min: undefined, max: undefined }) }] : []),
  ];
  const clearAll = () => go({ gender: undefined, category: undefined, style: undefined, season: undefined, sale: false, isNew: false, inStock: false, sizes: [], colors: [], min: undefined, max: undefined });

  const panel = (
    <div className="space-y-1">
      <Group title="Category" defaultOpen>
        <ul className="space-y-2.5">
          <li><FilterLink active={!query.category} onClick={() => go({ category: undefined })}>All</FilterLink></li>
          {facets.categories.map((c) => (
            <li key={c.name}><FilterLink active={query.category === c.name} onClick={() => go({ category: query.category === c.name ? undefined : c.name })}>{c.name} <span className="text-taupe">({c.count})</span></FilterLink></li>
          ))}
        </ul>
      </Group>
      <Group title="Size" defaultOpen>
        {facets.sizeGroups.filter((g) => g.sizes.length).map((g) => (
          <div key={g.label} className="mb-4 last:mb-0">
            <p className="mb-2 text-xs text-taupe">{g.label}</p>
            <div className="flex flex-wrap gap-2">
              {g.sizes.map((s) => {
                const on = query.sizes.includes(s);
                return <button key={s} type="button" aria-pressed={on} onClick={() => toggle("sizes", s)} className={cn("min-w-11 border px-3 py-2 text-xs transition-colors", on ? "border-ink bg-ink text-bone" : "border-line hover:border-ink")}>{s}</button>;
              })}
            </div>
          </div>
        ))}
      </Group>
      <Group title="Colour" defaultOpen>
        <div className="flex flex-wrap gap-3">
          {facets.colors.map((c) => <Swatch key={c.name} hex={c.hex} name={c.name} size={26} selected={query.colors.includes(c.name)} onClick={() => toggle("colors", c.name)} />)}
        </div>
      </Group>
      <Group title="Price" defaultOpen>
        <ul className="space-y-2.5">
          {PRICE_BANDS.map((b) => {
            const on = query.min === b.min && query.max === b.max;
            return <li key={b.label}><FilterLink active={on} onClick={() => go(on ? { min: undefined, max: undefined } : { min: b.min, max: b.max })}>{b.label}</FilterLink></li>;
          })}
        </ul>
      </Group>
      <Group title="Availability" defaultOpen>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={query.inStock} onChange={(e) => go({ inStock: e.target.checked })} /> In stock only
        </label>
        <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={query.sale} onChange={(e) => go({ sale: e.target.checked })} /> On sale
        </label>
      </Group>
    </div>
  );

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <nav aria-label="Breadcrumb" className="text-xs text-taupe"><Link href="/" className="link-u">Home</Link> <span aria-hidden>/</span> <span aria-current="page">Shop</span></nav>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        <p className="text-sm text-taupe" aria-live="polite">{products.length} {products.length === 1 ? "piece" : "pieces"}</p>
      </div>

      <div className="sticky top-[4.25rem] z-30 -mx-[var(--gutter,1rem)] mt-8 flex items-center justify-between gap-3 border-y border-line bg-bone/95 px-[var(--gutter,1rem)] py-3 backdrop-blur sm:top-[4.75rem]">
        <button type="button" onClick={() => setDrawer(true)} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden /> Filters{chips.length > 0 && ` (${chips.length})`}
        </button>
        <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] lg:block">Filters</p>
        <label className="flex items-center gap-3 text-xs">
          <span className="uppercase tracking-[0.16em] text-taupe">Sort</span>
          <select value={query.sort} onChange={(e) => go({ sort: e.target.value as ShopQuery["sort"] })} className="border border-line bg-transparent px-3 py-2 text-sm">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {chips.map((c) => (
              <motion.button key={c.label} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} type="button" onClick={c.clear} aria-label={`Remove filter ${c.label}`} className="inline-flex items-center gap-1.5 bg-cream px-3 py-1.5 text-xs capitalize transition-colors hover:bg-beige">
                {c.label} <X className="size-3" aria-hidden />
              </motion.button>
            ))}
          </AnimatePresence>
          <button type="button" onClick={clearAll} className="link-u ml-2 text-xs text-taupe">Clear all</button>
        </div>
      )}

      <div className="mt-8 grid gap-12 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters"><div className="sticky top-40 max-h-[calc(100svh-11rem)] overflow-y-auto pr-3" data-lenis-prevent>{panel}</div></aside>
        <div className={cn("transition-opacity duration-300", pending && "opacity-50")} aria-busy={pending}>
          {products.length ? (
            <AnimatedGrid products={products} className="xl:grid-cols-3 2xl:grid-cols-4" />
          ) : (
            <div className="py-24 text-center">
              <p className="display text-4xl">Nothing matches just yet</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-taupe">Try removing a filter or two, or browse everything we have.</p>
              <div className="mt-8 flex justify-center gap-3">
                <Button onClick={clearAll}>Clear filters</Button>
                <Button href="/shop" variant="outline">Shop all</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Overlay open={drawer} onClose={() => setDrawer(false)} label="Filters" side="left" closeButton={false} className="flex flex-col">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="display text-2xl">Filters</h2>
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full hover:bg-beige"><X className="size-5" aria-hidden /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-2" data-lenis-prevent>{panel}</div>
        <footer className="flex gap-3 border-t border-line p-5">
          <Button variant="outline" onClick={clearAll} className="flex-1">Clear</Button>
          <Button onClick={() => setDrawer(false)} className="flex-1">Show {products.length}</Button>
        </footer>
      </Overlay>
    </div>
  );
}

function Group({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="border-b border-line py-5">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]">
        {title}
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FilterLink({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("text-left text-sm transition-colors hover:text-ink", active ? "font-semibold text-ink" : "text-ink/70")}>{children}</button>;
}
