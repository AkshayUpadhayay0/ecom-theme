"use client";
import { motion, type HTMLMotionProps, type Variants } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and slides content up when it scrolls into view. */
export function Reveal({
  children, delay = 0, y = 28, className, as = "div", ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" | "p" | "h2" | "h3" } & Omit<HTMLMotionProps<"div">, "children">) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

/** Staggers its StaggerItem children as the group enters the viewport. */
export function Stagger({ children, className, once = true, as = "div" }: { children: ReactNode; className?: string; once?: boolean; as?: "div" | "ul" }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp variants={container} initial="hidden" whileInView="show" viewport={{ once, margin: "0px 0px -60px 0px" }} className={className}>
      {children}
    </Comp>
  );
}
export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as] as typeof motion.div;
  return <Comp variants={item} className={className}>{children}</Comp>;
}

/** Headline where each word rises out of a mask. */
export function SplitHeading({ text, className, delay = 0, as = "h1" }: { text: string; className?: string; delay?: number; as?: "h1" | "h2" | "h3" }) {
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease, delay: delay + i * 0.07 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
