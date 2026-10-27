"use client";
import { motion } from "motion/react";
import { BadgeCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/bits";
import { Reveal } from "@/components/ui/motion";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";

export function Reviews({ productId, productName, rating, reviews, breakdown }: { productId: number; productName: string; rating: number; reviews: Review[]; breakdown: number[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const total = breakdown.reduce((a, b) => a + b, 0);
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const ui = useUI();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, rating: stars, title, body: text }) }).catch(() => null);
    setBusy(false);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) { setErr(j.error ?? "Could not save your review. Please try again."); return; }
    setDone(true); setOpen(false);
    router.refresh();
  }

  return (
    <div id="reviews" className="scroll-mt-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-taupe">Reviews</p>
          <h2 id="reviews-h" className="display mt-3 text-4xl sm:text-5xl">What customers say</h2>
        </div>
        {!done && <Button variant="outline" onClick={() => (user ? setOpen(!open) : (ui.showToast({ title: "Sign in to write a review" }), router.push("/account?next=" + encodeURIComponent(location.pathname))))}>{open ? "Cancel" : "Write a review"}</Button>}
      </Reveal>
      {done && <p className="mt-6 bg-cream px-4 py-3 text-sm" role="status">Thank you. Your review has been posted.</p>}

      {open && (
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="mt-8 max-w-2xl space-y-4 bg-cream p-6">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[0.16em]">Your rating</legend>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setStars(n)} className="p-1">
                  <Star className={cn("size-7 transition-colors", n <= stars ? "fill-ink text-ink" : "text-sand")} aria-hidden />
                </button>
              ))}
            </div>
          </fieldset>
          <div><label htmlFor="rv-title" className="text-xs font-semibold uppercase tracking-[0.16em]">Title</label><input id="rv-title" className="field mt-2" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required /></div>
          <div><label htmlFor="rv-body" className="text-xs font-semibold uppercase tracking-[0.16em]">Your review of {productName}</label><textarea id="rv-body" className="field mt-2 min-h-28" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} required /></div>
          {err && <p className="text-sm font-medium text-oxblood" role="alert">{err}</p>}
          <Button loading={busy} disabled={!stars}>Submit review</Button>
        </motion.form>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[18rem_1fr]">
        <div>
          <p className="display text-7xl">{total ? rating.toFixed(1) : "–"}</p>
          <div className="mt-2"><Stars rating={rating} size={18} /></div>
          <p className="mt-1 text-sm text-taupe">{total} review{total === 1 ? "" : "s"}</p>
          <ul className="mt-6 space-y-2" aria-label="Rating breakdown">
            {[5, 4, 3, 2, 1].map((n) => (
              <li key={n} className="flex items-center gap-3 text-xs">
                <span className="w-3">{n}</span>
                <span className="h-1.5 flex-1 bg-beige"><motion.span className="block h-full bg-ink" initial={{ width: 0 }} whileInView={{ width: total ? `${(breakdown[n - 1] / total) * 100}%` : 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} /></span>
                <span className="w-5 text-right text-taupe">{breakdown[n - 1]}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="divide-y divide-line">
          {reviews.length === 0 && <li className="py-6 text-taupe">No reviews yet. Be the first to share your thoughts.</li>}
          {reviews.map((r) => (
            <li key={r.id} className="py-7 first:pt-0">
              <div className="flex flex-wrap items-center gap-3"><Stars rating={r.rating} size={15} /><h3 className="text-[0.9375rem] font-semibold">{r.title}</h3></div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/80">{r.body}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 text-xs text-taupe">
                <span>{r.author}{r.city && `, ${r.city}`}</span>
                {r.verified && <span className="inline-flex items-center gap-1 text-ink"><BadgeCheck className="size-3.5" aria-hidden /> Verified purchase</span>}
                <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
