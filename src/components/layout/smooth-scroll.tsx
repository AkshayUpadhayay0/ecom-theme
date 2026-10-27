"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type W = Window & { __lenis?: Lenis };

/** Inertial smooth scrolling. Disabled for reduced-motion users; touch devices keep native scrolling. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: true });
    (window as W).__lenis = lenis;
    return () => {
      lenis.destroy();
      delete (window as W).__lenis;
    };
  }, []);

  useEffect(() => {
    (window as W).__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
