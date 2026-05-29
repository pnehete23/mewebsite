"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode, type ElementType } from "react";

type Variant = "fade-up" | "fade-in" | "mask" | "scale-in" | "slide-left" | "slide-right";

type RevealProps = {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  // Triggers reveal slightly before the element actually enters viewport,
  // so users never see the "pop in" right at the edge of the screen.
  rootMargin?: string;
  once?: boolean;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
};

const variantMap: Record<Variant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  mask: {
    // clipPath wipe — pure compositor op on modern browsers
    hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    show: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -32 },
    show: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 32 },
    show: { opacity: 1, x: 0 },
  },
};

/**
 * Site-wide scroll-reveal wrapper. Uses framer's whileInView (IntersectionObserver
 * under the hood) — never attaches scroll listeners. Animates `transform` and
 * `opacity` only, so it stays on the GPU compositor and won't trigger layout.
 *
 * Reduced motion: skips the animation and renders content visible immediately.
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  rootMargin = "-12% 0px -12% 0px",
  once = true,
  as = "div",
  className,
  style,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduce) {
    const Tag = as as ElementType;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      style={style}
      variants={variantMap[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: rootMargin }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

type StaggerProps = {
  children: ReactNode;
  stagger?: number;
  delayChildren?: number;
  rootMargin?: string;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Container for staggered child reveals. Pair with <Reveal.Item> (or any
 * motion child using `variants`). Children inherit `whileInView` state from
 * this parent — they don't re-observe individually, which is the cheapest
 * way to do a long stagger.
 */
export function Stagger({
  children,
  stagger = 0.08,
  delayChildren = 0.05,
  rootMargin = "-10% 0px -10% 0px",
  once = true,
  className,
  style,
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: rootMargin }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  variant?: Exclude<Variant, "mask">;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Child of <Stagger>. Inherits viewport-trigger from parent. */
export function StaggerItem({
  children,
  variant = "fade-up",
  duration = 0.55,
  className,
  style,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={variantMap[variant]}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
