import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

export function SectionHeading({ eyebrow, title, href, cta, className, align = "left", id }: { eyebrow?: string; title: React.ReactNode; href?: string; cta?: string; className?: string; align?: "left" | "center"; id?: string }) {
  return (
    <Reveal className={cn("mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:mb-14", align === "center" && "flex-col items-center text-center", className)}>
      <div>
        {eyebrow && <p className="eyebrow text-taupe">{eyebrow}</p>}
        <h2 id={id} className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 pb-1 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="link-u">{cta ?? "View all"}</span>
          <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" aria-hidden />
        </Link>
      )}
    </Reveal>
  );
}
