"use client";

import { motion, AnimatePresence, animate, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SkillCategory = {
  axis: string;
  value: number;
  tools: string[];
};

// Accent per category — vivid hues tuned to read well on BOTH the light
// (white) and dark (black) themes. Index matches the order of categories.
const ACCENTS = [
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#6366f1", // indigo
  "#14b8a6", // teal
];

const AUTOPLAY_MS = 3400;
const RESUME_MS = 9000; // resume auto-cycle this long after the user interacts

// Animated count from 0 → value whenever `value` changes.
function useCountUp(value: number, animateOn: boolean) {
  const [display, setDisplay] = useState(animateOn ? 0 : value);
  useEffect(() => {
    if (!animateOn) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, animateOn]);
  return display;
}

function RadialGauge({
  value,
  accent,
  animateOn,
}: {
  value: number;
  accent: string;
  animateOn: boolean;
}) {
  const R = 64;
  const C = 2 * Math.PI * R;
  const count = useCountUp(value, animateOn);
  const offset = C - (value / 100) * C;

  return (
    <div className="relative grid place-items-center">
      <svg width="168" height="168" viewBox="0 0 168 168" className="-rotate-90">
        {/* track */}
        <circle
          cx="84"
          cy="84"
          r={R}
          fill="none"
          strokeWidth="9"
          className="stroke-black/[0.08] dark:stroke-white/[0.08]"
        />
        {/* progress */}
        <motion.circle
          cx="84"
          cy="84"
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={false}
          animate={{ strokeDashoffset: animateOn ? offset : offset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${accent}66)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div
            className="font-mono text-4xl font-bold tabular-nums leading-none"
            style={{ color: accent }}
          >
            {count}
            <span className="text-lg align-top opacity-60">%</span>
          </div>
          <div className="mt-1 font-mono text-[8px] tracking-[0.3em] uppercase text-black/45 dark:text-white/45">
            Proficiency
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkillMatrix({ data }: { data: SkillCategory[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const animateOn = mounted && !prefersReduced;

  // Auto-cycle through categories until the user takes over.
  useEffect(() => {
    if (!playing || prefersReduced || data.length <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % data.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(id);
  }, [playing, prefersReduced, data.length]);

  const select = useCallback((i: number) => {
    setActive(i);
    setPlaying(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPlaying(true), RESUME_MS);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    []
  );

  const accent = ACCENTS[active % ACCENTS.length];
  const current = data[active];
  const totalTools = useMemo(
    () => data.reduce((n, d) => n + d.tools.length, 0),
    [data]
  );

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-blue-700/25 dark:border-purple-400/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm transition-colors"
        style={{ boxShadow: "0 18px 50px -28px rgba(30,58,138,0.45)" }}
      >
        {/* Accent wash — recolors with the active category */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full blur-3xl"
          animate={{ backgroundColor: accent }}
          transition={{ duration: 0.6 }}
          style={{ opacity: 0.16 }}
        />
        {/* dotted texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 0.5px, transparent 0.5px)",
            backgroundSize: "16px 16px",
            color: "rgba(100,116,139,0.15)",
            maskImage:
              "radial-gradient(120% 100% at 70% 0%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(120% 100% at 70% 0%, black, transparent 75%)",
          }}
        />

        {/* header */}
        <div className="relative flex items-center justify-between px-4 pt-3.5">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-black/45 dark:text-white/45">
            Skill Matrix
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40">
            {data.length} domains · {totalTools} tools
          </span>
        </div>

        <div className="relative grid gap-4 p-4 md:grid-cols-5">
          {/* FOCUS PANEL */}
          <div className="md:col-span-3 md:order-2">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <RadialGauge value={current.value} accent={accent} animateOn={animateOn} />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={animateOn ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={animateOn ? { opacity: 0, y: -10 } : undefined}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <h4
                      className="text-2xl font-bold tracking-tight text-black dark:text-white"
                      style={{ textWrap: "balance" } as React.CSSProperties}
                    >
                      {current.axis}
                    </h4>
                    <div
                      className="mt-1 h-0.5 w-12 rounded-full mx-auto sm:mx-0"
                      style={{ backgroundColor: accent }}
                    />
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                      {current.tools.map((t, i) => (
                        <motion.span
                          key={t}
                          initial={animateOn ? { opacity: 0, scale: 0.85 } : false}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: animateOn ? i * 0.05 : 0 }}
                          className="rounded-full border px-2.5 py-1 font-mono text-[11px] text-black dark:text-white/90"
                          style={{
                            borderColor: `${accent}55`,
                            backgroundColor: `${accent}14`,
                          }}
                        >
                          {t}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* CATEGORY RAIL */}
          <div className="md:col-span-2 md:order-1">
            <ul className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
              {data.map((d, i) => {
                const on = i === active;
                const a = ACCENTS[i % ACCENTS.length];
                return (
                  <li key={d.axis}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      onMouseEnter={() => select(i)}
                      aria-pressed={on}
                      className={
                        "group flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all duration-200 " +
                        (on
                          ? "border-transparent bg-black/[0.04] dark:bg-white/[0.07]"
                          : "border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.04]")
                      }
                      style={on ? { boxShadow: `inset 2px 0 0 ${a}` } : undefined}
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
                        style={{
                          backgroundColor: a,
                          boxShadow: on ? `0 0 8px ${a}` : "none",
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={
                            "block truncate font-mono text-[11px] tracking-wide transition-colors " +
                            (on
                              ? "text-black dark:text-white"
                              : "text-black/60 dark:text-white/55")
                          }
                        >
                          {d.axis}
                        </span>
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                          <motion.span
                            className="block h-full rounded-full"
                            style={{ backgroundColor: a }}
                            initial={false}
                            animate={{ width: `${d.value}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
