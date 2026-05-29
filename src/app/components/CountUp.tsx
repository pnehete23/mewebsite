"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  value: number | null;
  fallback?: string;
  duration?: number;
  // Once the count finishes, do we re-run on re-entry? Default no — feels
  // chintzy if the number resets every time the section scrolls back in.
  once?: boolean;
  className?: string;
};

/**
 * Tween a number from 0 → value once its container enters the viewport.
 *
 * Why a motion value (not setState every frame): framer's `animate` writes
 * directly to the MotionValue without React re-renders, and we sync to the
 * DOM via a `change` subscriber. That's why this can run smoothly even on
 * lower-end devices where setState-per-frame would jank.
 */
export default function CountUp({
  value,
  fallback = "—",
  duration = 1.2,
  once = true,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState<string>(
    value !== null ? "0" : fallback
  );

  useEffect(() => {
    if (value === null) {
      setDisplay(fallback);
      return;
    }
    if (!inView) return;
    if (reduce) {
      setDisplay(value.toLocaleString());
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = mv.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, inView, reduce, mv, duration, fallback]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
