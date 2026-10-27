import { Stars } from "@/components/ui/bits";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { TESTIMONIALS } from "@/config/site";

export function Testimonials() {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {TESTIMONIALS.map((t) => (
        <StaggerItem key={t.name} className="h-full">
          <figure className="group relative flex h-full flex-col justify-between border border-line bg-bone p-7 transition-all duration-700 ease-[var(--ease-premium)] hover:-translate-y-1.5 hover:border-ink hover:shadow-[0_26px_50px_-30px_rgba(0,0,0,0.4)]">
            <span aria-hidden className="display absolute right-6 top-3 text-7xl leading-none text-beige transition-colors group-hover:text-sand">”</span>
            <div>
              <Stars rating={t.rating} />
              <blockquote className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{t.text}</blockquote>
            </div>
            <figcaption className="mt-8 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-ink text-sm font-semibold text-bone" aria-hidden>{t.name[0]}</span>
              <span>
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-xs text-taupe">{t.city}</span>
              </span>
            </figcaption>
          </figure>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
