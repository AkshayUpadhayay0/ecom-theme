"use client";
import { Ruler } from "lucide-react";
import { useState } from "react";
import { Overlay } from "@/components/ui/overlay";
import { SIZE_GUIDES } from "@/config/size-guides";
import type { SizeGuideKey } from "@/lib/types";

export function SizeGuideButton({ guide, className }: { guide: SizeGuideKey; className?: string }) {
  const [open, setOpen] = useState(false);
  if (guide === "one") return null;
  const g = SIZE_GUIDES[guide];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "link-u inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em]"}>
        <Ruler className="size-3.5" aria-hidden /> Size guide
      </button>
      <Overlay open={open} onClose={() => setOpen(false)} label={`${g.title} size guide`} className="w-full max-w-xl p-6 sm:p-9" z="z-[90]">
        <p className="eyebrow text-taupe">Size guide</p>
        <h2 className="display mt-2 text-3xl">{g.title}</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink">
                {g.head.map((h) => <th key={h} scope="col" className="py-2.5 pr-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em]">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r[0]} className="border-b border-line transition-colors hover:bg-cream">
                  {r.map((c, i) => (i === 0 ? <th key={i} scope="row" className="py-3 pr-4 font-semibold">{c}</th> : <td key={i} className="py-3 pr-4 tabular-nums">{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-[0.8125rem] leading-relaxed text-taupe">{g.note}</p>
      </Overlay>
    </>
  );
}
