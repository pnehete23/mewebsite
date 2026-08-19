"use client";

// Scroll-linked section reveal.
//
// Unlike a whileInView trigger, this is *scrubbed*: opacity, lift and blur are
// continuous functions of where the section sits in the viewport, read from the
// shared Lenis scroll value in lib/scroll. One subscription, no per-component
// rAF, no scroll listeners — so every section on the page moves on the same
// frame and in the same phase as the intro hand-off and the star layer.
//
// Values are written to motion values, never to React state, so scrubbing
// costs no re-renders.

import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { subscribeScroll } from "../lib/scroll";

export default function SectionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const p = useMotionValue(0);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (reduce) {
      p.set(1);
      return;
    }
    const el = host.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top edge is one-sixth of a screen below the fold,
      // 1 once it has travelled to 65% of viewport height.
      const start = vh * 1.02;
      const end = vh * 0.62;
      const raw = (start - r.top) / (start - end);
      p.set(Math.min(1, Math.max(0, raw)));
    };

    measure();
    const unsub = subscribeScroll(measure);
    window.addEventListener("resize", measure);
    return () => {
      unsub();
      window.removeEventListener("resize", measure);
    };
  }, [p, reduce]);

  const opacity = useTransform(p, [0, 0.75], [0, 1]);
  const y = useTransform(p, [0, 1], [46, 0]);
  const blur = useTransform(p, [0, 0.8], [8, 0]);
  const filter = useTransform(blur, (b) => (b < 0.05 ? "none" : `blur(${b.toFixed(2)}px)`));

  // Before hydration (and for reduced motion) render plain and fully visible,
  // so content is never trapped behind an animation that cannot run.
  if (reduce || !ready) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={host} className={className} style={{ opacity, y, filter, willChange: "transform, opacity" }}>
      {children}
    </motion.div>
  );
}
