"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { GarmentArt } from "@/components/ui/garment-art";
import { SplitHeading } from "@/components/ui/motion";

const VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO;
const IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const archY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const frameY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const real = VIDEO || IMAGE;

  return (
    <section ref={ref} className="on-dark grain relative isolate flex min-h-[calc(100svh-6.5rem)] items-center overflow-hidden bg-[#14120f] text-bone" aria-label="Autumn Winter 2026 collection">
      {/* background layer */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10 scale-110">
        {VIDEO ? (
          <video className="h-full w-full object-cover" src={VIDEO} poster={IMAGE} autoPlay muted loop playsInline preload="metadata" aria-hidden />
        ) : IMAGE ? (
          <Image src={IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_72%_40%,#3a3126_0%,#1b1812_46%,#0f0d0a_100%)]" />
        )}
        <div className={real ? "absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" : "hidden"} />
      </motion.div>

      <div className="container-x relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:py-10">
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="eyebrow text-sand">
            Autumn / Winter 2026
          </motion.p>
          <SplitHeading
            text="The quiet luxury of everyday dressing"
            delay={0.25}
            className="display mt-6 text-[clamp(2.6rem,6.3vw,6.1rem)] font-medium leading-[0.95]"
          />
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9 }} className="mt-7 max-w-md text-[1.0625rem] leading-relaxed text-bone/75">
            Tailored layers, heavyweight cotton and considered colour. New pieces for the cooler months, made to be worn on repeat.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.9 }} className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/shop?season=aw26" variant="light" arrow className="hero-cta !px-9 !py-4">Shop now</Button>
            <Button href="/collections" variant="outline" className="!border-bone/60 !text-bone hover:!border-bone">Explore collections</Button>
          </motion.div>
        </motion.div>

        {/* art-directed visual (replaced by real media when NEXT_PUBLIC_HERO_VIDEO / _IMAGE is set) */}
        {!real && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] lg:max-w-none" aria-hidden>
            <motion.div style={{ y: archY }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-y-0 right-0 w-[78%] overflow-hidden rounded-t-[50%] border border-white/15 shadow-[0_50px_90px_-30px_rgba(0,0,0,0.8)]">
              <GarmentArt kind="coat" color="#b58b5a" bg="#d9cdb8" />
            </motion.div>
            <motion.div style={{ y: frameY }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-[6%] left-0 aspect-[4/5] w-[40%] overflow-hidden border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
              <GarmentArt kind="hoodie" color="#151515" view={1} bg="#cbbda6" />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }} className="absolute right-[2%] top-[6%] grid size-24 place-items-center rounded-full border border-white/25 text-center text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.18em] backdrop-blur-sm">
              New<br />season
            </motion.div>
          </div>
        )}
      </div>

      <motion.a href="#new-arrivals" style={{ opacity: fade }} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-bone/70 hover:text-bone sm:flex" aria-label="Scroll to new arrivals">
        Scroll
        <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}><ArrowDown className="size-4" aria-hidden /></motion.span>
      </motion.a>
    </section>
  );
}
