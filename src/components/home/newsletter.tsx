"use client";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isEmail } from "@/lib/utils";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [already, setAlready] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email.trim())) { setError("Please enter a valid email address."); return; }
    setError(""); setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setAlready(!!data.already);
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <AnimatePresence mode="wait" initial={false}>
        {state === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6" role="status">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-ink text-bone"><Check className="size-7" aria-hidden /></span>
            <p className="display mt-5 text-4xl">{already ? "You're already on the list." : "Welcome to the house."}</p>
            <p className="mt-2 text-taupe">{already ? "We'll keep you posted." : "You're subscribed. First access to new drops is coming your way."}</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
            <p className="eyebrow text-taupe">Stay in the loop</p>
            <h2 className="display mt-4 text-4xl sm:text-6xl">First access to every drop</h2>
            <p className="mx-auto mt-4 max-w-md text-taupe">New arrivals, private sales and styling notes. One considered email a week.</p>
            <form onSubmit={submit} className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row" noValidate>
              <div className="flex-1 text-left">
                <label htmlFor="nl-email" className="sr-only">Email address</label>
                <input id="nl-email" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="field !py-4" aria-invalid={!!error} aria-describedby={error ? "nl-error" : undefined} />
              </div>
              <Button type="submit" loading={state === "loading"} arrow className="!py-4">Subscribe</Button>
            </form>
            <p id="nl-error" role="alert" className="mt-3 min-h-5 text-sm text-oxblood">{error}</p>
            <p className="mt-1 text-xs text-taupe">By subscribing you agree to our <a href="/pages/privacy" className="underline underline-offset-2">privacy policy</a>. Unsubscribe anytime.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
