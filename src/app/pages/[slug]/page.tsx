import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PAGES } from "@/config/pages";
import { SIZE_GUIDES } from "@/config/size-guides";
import { Reveal } from "@/components/ui/motion";

type P = Promise<{ slug: string }>;
export const generateStaticParams = () => [...Object.keys(PAGES), "size-guide"].map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "size-guide") return { title: "Size guide" };
  const p = PAGES[slug];
  return p ? { title: p.title, description: p.lead } : {};
}

export default async function InfoPage({ params }: { params: P }) {
  const { slug } = await params;
  if (slug === "size-guide") {
    return (
      <div className="container-x max-w-3xl py-16 lg:py-24">
        <h1 className="display text-5xl sm:text-6xl">Size guide</h1>
        <p className="mt-4 text-taupe">Find your fit. Measurements are in centimetres.</p>
        {Object.entries(SIZE_GUIDES).filter(([k]) => k !== "one").map(([k, g]) => (
          <Reveal key={k} className="mt-12">
            <h2 className="display text-2xl">{g.title}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[22rem] text-left text-sm">
                <thead><tr className="border-b border-ink">{g.head.map((h) => <th key={h} scope="col" className="py-2.5 pr-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em]">{h}</th>)}</tr></thead>
                <tbody>{g.rows.map((r) => <tr key={r[0]} className="border-b border-line">{r.map((c, i) => i === 0 ? <th key={i} scope="row" className="py-3 pr-4 font-semibold">{c}</th> : <td key={i} className="py-3 pr-4 tabular-nums">{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-taupe">{g.note}</p>
          </Reveal>
        ))}
      </div>
    );
  }
  const p = PAGES[slug];
  if (!p) notFound();
  return (
    <div className="container-x max-w-2xl py-16 lg:py-24">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-taupe"><Link href="/" className="link-u">Home</Link> / {p.title}</nav>
      <h1 className="display text-5xl sm:text-6xl">{p.title}</h1>
      <p className="mt-4 text-lg text-taupe">{p.lead}</p>
      <div className="mt-8 leading-relaxed text-ink/85">{p.body}</div>
    </div>
  );
}
