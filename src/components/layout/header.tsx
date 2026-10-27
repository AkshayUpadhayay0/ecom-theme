"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GarmentArt } from "@/components/ui/garment-art";
import { Overlay } from "@/components/ui/overlay";
import { NAV, SITE, type NavItem, type NavMega } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

type MegaItem = NavItem & { mega: NavMega };
const hasMega = (n: NavItem): n is MegaItem => !!n.mega;

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${SITE.name} home`} className={cn("display whitespace-nowrap text-[1.1rem] font-semibold tracking-[0.06em] min-[420px]:text-[1.45rem] min-[420px]:tracking-[0.08em] sm:text-[1.7rem]", className)}>
      {SITE.name}
    </Link>
  );
}

function Counter({ n }: { n: number }) {
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 18 }}
          className="absolute -right-1.5 -top-1.5 grid min-w-[1.1rem] place-items-center rounded-full bg-ink px-1 text-[0.625rem] font-semibold leading-[1.1rem] text-bone"
          aria-hidden
        >
          {n > 9 ? "9+" : n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const pathname = usePathname();
  const ui = useUI();
  const cart = useCart();
  const wish = useWishlist();
  const { user } = useAuth();
  const [mega, setMega] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    setHidden(y > prev && y > 220 && !mega);
  });
  useEffect(() => { setMega(null); ui.setMenuOpen(false); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hover = (label: string | null) => {
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setMega(label), label ? 90 : 160);
  };

  return (
    <motion.header
      className="sticky top-0 z-50"
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseLeave={() => hover(null)}
    >
      <div className={cn("border-b bg-bone/90 backdrop-blur-lg transition-[border-color,box-shadow] duration-500", scrolled ? "border-line shadow-[0_8px_30px_-20px_rgba(0,0,0,0.25)]" : "border-transparent")}>
        <div className="container-x relative flex h-[4.25rem] items-center sm:h-[4.75rem]">
          <button type="button" onClick={() => ui.setMenuOpen(true)} aria-label="Open menu" className="-ml-2 grid size-11 place-items-center xl:hidden">
            <Menu className="size-6" strokeWidth={1.5} aria-hidden />
          </button>

          <Logo className="absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0" />

          <nav aria-label="Primary" className="mx-auto hidden items-center gap-8 xl:flex 2xl:gap-11">
            {NAV.map((n) =>
              hasMega(n) ? (
                <div key={n.label} onMouseEnter={() => hover(n.label)}>
                  <button
                    type="button"
                    aria-expanded={mega === n.label}
                    aria-haspopup="true"
                    onClick={() => setMega(mega === n.label ? null : n.label)}
                    className={cn("link-u inline-flex items-center gap-1 whitespace-nowrap py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em]", mega === n.label && "[background-size:100%_1px]")}
                  >
                    {n.label}
                    <ChevronDown className={cn("size-3 transition-transform duration-300", mega === n.label && "rotate-180")} aria-hidden />
                  </button>
                </div>
              ) : (
                <Link
                  key={n.label}
                  href={n.href}
                  onMouseEnter={() => hover(null)}
                  aria-current={n.href === "/" && pathname === "/" ? "page" : undefined}
                  className={cn("link-u whitespace-nowrap py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em]", n.accent && "text-oxblood")}
                >
                  {n.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center justify-end gap-0.5 sm:gap-1.5 xl:ml-0">
            <button type="button" onClick={() => ui.setSearchOpen(true)} aria-label="Search" className="grid size-11 place-items-center transition-transform hover:scale-110">
              <Search className="size-[22px]" strokeWidth={1.5} aria-hidden />
            </button>
            <Link href="/account" aria-label={user ? `Account, ${user.name}` : "Sign in or create an account"} className="hidden size-11 place-items-center transition-transform hover:scale-110 sm:grid">
              <User className="size-[22px]" strokeWidth={1.5} aria-hidden />
            </Link>
            <Link href="/wishlist" aria-label={`Wishlist, ${wish.ids.length} item${wish.ids.length === 1 ? "" : "s"}`} className="relative hidden size-11 place-items-center transition-transform hover:scale-110 sm:grid">
              <Heart className="size-[22px]" strokeWidth={1.5} aria-hidden />
              <Counter n={wish.ids.length} />
            </Link>
            <button type="button" onClick={() => ui.setCartOpen(true)} aria-label={`Shopping bag, ${cart.count} item${cart.count === 1 ? "" : "s"}`} className="relative grid size-11 place-items-center">
              <motion.span key={ui.bump} animate={ui.bump ? { rotate: [0, -14, 12, -6, 0], scale: [1, 1.22, 1] } : {}} transition={{ duration: 0.65 }} className="grid place-items-center">
                <ShoppingBag className="size-[22px]" strokeWidth={1.5} aria-hidden />
              </motion.span>
              <Counter n={cart.count} />
            </button>
          </div>
        </div>
      </div>

      {/* mega menu */}
      <AnimatePresence>
        {NAV.filter(hasMega).map((n) =>
          mega === n.label ? (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-line bg-bone shadow-[0_30px_50px_-30px_rgba(0,0,0,0.35)] xl:block"
              onMouseEnter={() => hover(n.label)}
            >
              <div className="container-x grid grid-cols-[1fr_1fr_20rem] gap-12 py-10">
                {n.mega.columns.map((col, ci) => (
                  <div key={col.title}>
                    <p className="eyebrow text-taupe">{col.title}</p>
                    <ul className="mt-5 space-y-3">
                      {col.links.map(([label, href], li) => (
                        <motion.li key={href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * (li + ci * 2), duration: 0.4 }}>
                          <Link href={href} className="link-u display text-2xl font-normal">{label}</Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link href={n.mega.feature.href} className="group block">
                  <div className="aspect-[5/4] overflow-hidden bg-cream">
                    <div className="h-full w-full transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-105"><GarmentArt kind={n.mega.feature.kind} color={n.mega.feature.color} view={1} /></div>
                  </div>
                  <p className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]">{n.mega.feature.label}<span aria-hidden className="transition-transform group-hover:translate-x-1.5">→</span></p>
                </Link>
              </div>
            </motion.div>
          ) : null,
        )}
      </AnimatePresence>

      <MobileMenu />
    </motion.header>
  );
}

function MobileMenu() {
  const { menuOpen, setMenuOpen, setSearchOpen } = useUI();
  const { user } = useAuth();
  const wish = useWishlist();
  const [open, setOpen] = useState<string | null>(null);
  const close = () => setMenuOpen(false);
  return (
    <Overlay open={menuOpen} onClose={close} label="Menu" side="left" closeButton={false} className="flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <Logo className="!text-xl" />
        <button type="button" onClick={close} aria-label="Close menu" className="grid size-10 place-items-center rounded-full hover:bg-beige">✕</button>
      </div>
      <nav aria-label="Mobile" className="flex-1 px-5 py-6">
        <ul className="divide-y divide-line">
          {NAV.map((n, i) => (
            <motion.li key={n.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05, duration: 0.5 }}>
              {hasMega(n) ? (
                <>
                  <button type="button" aria-expanded={open === n.label} onClick={() => setOpen(open === n.label ? null : n.label)} className="flex w-full items-center justify-between py-4 text-left">
                    <span className="display text-3xl">{n.label}</span>
                    <ChevronDown className={cn("size-5 transition-transform duration-300", open === n.label && "rotate-180")} aria-hidden />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === n.label && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 pb-5 pl-1 text-[0.9375rem]">
                          <li className="col-span-2"><Link href={n.href} onClick={close} className="font-semibold underline underline-offset-4">Shop all {n.label}</Link></li>
                          {n.mega.columns.flatMap((c) => c.links).map(([label, href]) => <li key={href}><Link href={href} onClick={close} className="text-ink-soft">{label}</Link></li>)}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href={n.href} onClick={close} className={cn("display block py-4 text-3xl", n.accent && "text-oxblood")}>{n.label}</Link>
              )}
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-1 border-t border-line px-5 py-5 text-[0.9375rem]">
        <button type="button" onClick={() => { close(); setSearchOpen(true); }} className="flex items-center gap-3 py-2.5 text-left"><Search className="size-5" strokeWidth={1.5} aria-hidden /> Search</button>
        <Link href="/account" onClick={close} className="flex items-center gap-3 py-2.5"><User className="size-5" strokeWidth={1.5} aria-hidden /> {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in / Create account"}</Link>
        <Link href="/wishlist" onClick={close} className="flex items-center gap-3 py-2.5"><Heart className="size-5" strokeWidth={1.5} aria-hidden /> Wishlist ({wish.ids.length})</Link>
        <Link href="/track" onClick={close} className="flex items-center gap-3 py-2.5 text-taupe">Track an order</Link>
      </div>
    </Overlay>
  );
}
