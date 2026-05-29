"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Top-of-viewport progress bar. Cost is ~zero: framer's useScroll is a
// passive IntersectionObserver-driven hook, and we only animate transform
// (GPU-composited, no layout/paint).
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  // Spring smooths the spring vs the linear scroll for a softer feel.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.25,
  });

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        willChange: "transform",
      }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-gradient-to-r from-blue-700 via-blue-600 to-blue-900 dark:from-violet-400 dark:via-fuchsia-400 dark:to-amber-300"
    />
  );
}
