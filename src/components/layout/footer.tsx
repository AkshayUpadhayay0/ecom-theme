import Link from "next/link";
import { FOOTER_LINKS, PAYMENT_METHODS, SITE } from "@/config/site";
import { Logo } from "./header";
import { BackToTop } from "./back-to-top";

const SocialIcon = ({ name }: { name: string }) => {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "Instagram": return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>;
    case "Pinterest": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M11 8.5c2.5-1 4.5.5 4 3-.4 2-1.8 3.3-3.2 3-1.2-.3-1.3-1.5-1-2.8.4-1.7.8-3.4.3-4.2M10.5 13.5 9.5 18" /></svg>;
    case "YouTube": return <svg {...common}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" /></svg>;
    default: return <svg {...common}><path d="M4 4l16 16M20 4 4 20" /></svg>;
  }
};

export function Footer() {
  return (
    <footer className="on-dark mt-28 bg-ink text-bone">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo className="!text-3xl" />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-sand">{SITE.description}</p>
            <ul className="mt-7 flex gap-3">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${SITE.shortName} on ${s.label}`} className="grid size-11 place-items-center rounded-full border border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-bone hover:bg-bone hover:text-ink">
                    <SocialIcon name={s.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <nav key={title} aria-label={title}>
                <h2 className="eyebrow text-sand">{title}</h2>
                <ul className="mt-5 space-y-3 text-[0.9375rem]">
                  {links.map(([label, href]) => (
                    <li key={href}><Link href={href} className="link-u">{label}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-t border-white/15 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-sand">Customer support</p>
            <p className="mt-2 text-[0.9375rem]">
              <a className="link-u" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> · Mon–Sat, 10am–7pm IST
            </p>
          </div>
          <div>
            <p className="eyebrow text-sand lg:text-right">We accept</p>
            <ul className="mt-2 flex flex-wrap gap-2 lg:justify-end">
              {PAYMENT_METHODS.map((m) => <li key={m} className="border border-white/20 px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em]">{m}</li>)}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 text-[0.8125rem] text-sand sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All prices include taxes.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/pages/privacy" className="link-u">Privacy</Link></li>
            <li><Link href="/pages/terms" className="link-u">Terms</Link></li>
            <li><Link href="/pages/returns" className="link-u">Returns</Link></li>
          </ul>
          <BackToTop />
        </div>
        {SITE.demoMode && <p className="mt-6 border-t border-white/10 pt-5 text-xs text-sand/70">Demo storefront: products, prices and reviews are sample data.</p>}
      </div>
    </footer>
  );
}
