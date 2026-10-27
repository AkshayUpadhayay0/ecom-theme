"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GarmentArt } from "@/components/ui/garment-art";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { COLLECTIONS } from "@/config/site";
import { cn } from "@/lib/utils";

const SPANS = ["lg:col-span-3 aspect-[4/5] lg:aspect-square", "lg:col-span-3 aspect-[4/5] lg:aspect-square", "lg:col-span-2 aspect-[4/5]", "lg:col-span-2 aspect-[4/5]", "col-span-2 lg:col-span-2 aspect-[16/10] lg:aspect-[4/5]"];

export function CollectionCards({ className }: { className?: string }) {
  return (
    <Stagger className={cn("grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-6", className)}>
      {COLLECTIONS.map((c, i) => (
        <StaggerItem key={c.slug} className={cn("col-span-1", SPANS[i])}>
          <Link href={c.href} className="group relative block h-full w-full overflow-hidden" style={{ background: c.bg }}>
            <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]">
              <GarmentArt kind={c.kind} color={c.fg} bg={c.bg} view={i % 2 === 0 ? 0 : 1} fit={i < 2 ? "cover" : "contain"} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="on-dark absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-bone sm:p-6">
              <div>
                <p className="eyebrow text-bone/70">0{i + 1}</p>
                <h3 className="display mt-1 text-2xl sm:text-4xl">{c.title}</h3>
                <p className="mt-1 hidden max-w-[16rem] translate-y-2 text-sm text-bone/80 opacity-0 transition-all duration-700 ease-[var(--ease-premium)] group-hover:translate-y-0 group-hover:opacity-100 sm:block">{c.blurb}</p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-bone/70 transition-all duration-500 group-hover:rotate-45 group-hover:bg-bone group-hover:text-ink">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </div>
            <span className="sr-only">Shop {c.title}</span>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
