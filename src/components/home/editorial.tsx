"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { GarmentArt } from "@/components/ui/garment-art";
import { Reveal } from "@/components/ui/motion";

export function Editorial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const b = useTransform(scrollYProgress, [0, 1], ["-6%", "14%"]);
  const num = useTransform(scrollYProgress, [0, 1], ["-4%", "10%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-cream py-24 lg:py-36" aria-labelledby="editorial-title">
      <motion.p style={{ y: num }} aria-hidden className="display pointer-events-none absolute -left-4 top-6 select-none text-[22vw] leading-none text-beige/70">AW26</motion.p>
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] max-w-lg overflow-hidden bg-[#cbbda6] lg:max-w-none">
            <motion.div style={{ y: a }} className="absolute -inset-y-[6%] inset-x-0">
              <GarmentArt kind="coat" color="#3a3a3a" bg="#cbbda6" fit="contain" label="Charcoal longline coat" />
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-4 lg:px-6">
          <Reveal>
            <p className="eyebrow text-taupe">The Autumn Edit</p>
            <h2 id="editorial-title" className="display mt-5 text-5xl sm:text-6xl xl:text-7xl">Layers, <em className="font-normal italic">considered.</em></h2>
            <p className="mt-6 max-w-sm text-[1.0625rem] leading-relaxed text-ink-soft">
              A wardrobe built in tones of camel, charcoal and bone. Start with a heavyweight tee, add a wool overshirt, finish with the coat you will reach for every morning.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/shop?season=aw26" arrow>Shop the edit</Button>
              <Button href="/shop?category=Outerwear" variant="outline">Outerwear</Button>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-3 lg:pt-32">
          <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden bg-[#8e8576] lg:max-w-none">
            <motion.div style={{ y: b }} className="absolute -inset-y-[6%] inset-x-0">
              <GarmentArt kind="knit" color="#d9cdb6" bg="#8e8576" view={1} fit="contain" label="Oat merino knit" />
            </motion.div>
          </div>
          <Reveal delay={0.1} className="mt-5">
            <p className="display text-2xl">Ribbed Merino Crew</p>
            <p className="mt-1 text-sm text-taupe">Fine-gauge, soft, made to layer.</p>
            <a href="/product/ribbed-merino-crew-knit" className="link-u mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em]">Discover</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
