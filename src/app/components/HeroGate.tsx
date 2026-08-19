"use client";

// Holds the hero still until the intro hands off, then lifts it in.
//
// The hand-off fires *mid-dissipation*, so this rise overlaps the particles
// still flying apart — that overlap is what makes intro → page read as one
// move. It wraps the hero rather than editing its inner motion props, so the
// existing scroll parallax keeps its own opacity/y untouched.
//
// If there is no intro (reduced motion, repeat visit in-session, no WebGL),
// `useIntroHandoff` reports ready immediately and this is a no-op pass-through.

import { motion, useReducedMotion } from "framer-motion";
import { useIntroHandoff } from "./Intro";
import { EASE } from "../lib/scroll";

export default function HeroGate({ children }: { children: React.ReactNode }) {
  const ready = useIntroHandoff();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: ready ? 1 : 0,
        y: ready ? 0 : 34,
        scale: ready ? 1 : 0.985,
        filter: ready ? "blur(0px)" : "blur(6px)",
      }}
      // Slightly longer than the backdrop fade so the hero is still settling
      // as the last particles wink out — no beat where nothing moves.
      transition={{ duration: 1.05, ease: EASE }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
