"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { markStarted, publishScroll } from "../lib/scroll";

// Site-wide smooth-scroll using Lenis. ~3 KB gzipped.
// Why a provider instead of inline in layout: layout.tsx is a Server Component;
// Lenis touches `window` and must mount client-side via a small wrapper.
//
// This is also the site's single rAF driver for scroll: every scroll-linked
// effect subscribes through lib/scroll rather than adding its own listener,
// so section reveals, the intro hand-off and the star layer all read the exact
// same scroll value on the same frame.
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Honor reduced-motion users — they get native scrolling (instant). Still
    // publish native scroll so subscribers keep working without Lenis.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const onScroll = () => publishScroll(window.scrollY);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // wheelMultiplier slightly under 1 keeps it from feeling "drifty"
      wheelMultiplier: 0.9,
      // Touch devices keep native scroll for accessibility + scroll-chaining.
      smoothWheel: true,
    });

    lenis.on("scroll", ({ scroll }: { scroll: number }) => publishScroll(scroll));
    markStarted();

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
