"use client";

// Skills section shell.
//
// Owns the domain list, the detail panel and the lazy-mount gate for the WebGL
// swarm. The 3D bundle is code-split via next/dynamic AND withheld until the
// section actually scrolls into view, so it never touches first load. When the
// section leaves the viewport the canvas frameloop stops entirely.
//
// Reduced motion / no-JS / no-WebGL all fall through to the same calm static
// grid the section used before — no canvas is ever created in that path.

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Formation } from "./SkillField";
import { themeTuning } from "./particles/core";

export type SkillCategory = {
  axis: string;
  value: number;
  tools: string[];
};

const SkillField = dynamic(() => import("./SkillField"), { ssr: false });

// One hue per domain, walked across the site's violet → blue → cyan → teal →
// emerald → amber → magenta family. Tasteful, theme-agnostic accents — no neon.
const HUES = [266, 224, 282, 198, 168, 142, 320, 38];
const hueOf = (i: number) => HUES[i % HUES.length];
const accent = (h: number, l = 58, a = 1, s = 82) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

// Formation per domain — the shape is a read on the discipline: structured
// grids for data, a double helix for modelling, a galaxy for LLM/NLP, …
const FORMATIONS: Formation[] = [
  "wave",
  "lattice",
  "torus",
  "helix",
  "spiral",
  "sphere",
  "cone",
  "cloud",
];

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(
        !!(
          window.WebGLRenderingContext &&
          (c.getContext("webgl2") || c.getContext("webgl"))
        ),
      );
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

export default function SkillNebula({ data }: { data: SkillCategory[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(9000);
  const host = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const webgl = useWebGL();
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === "light";

  useEffect(() => setMounted(true), []);

  // Particle budget by device: phones get a third of the swarm, and anything
  // reporting few cores gets trimmed too. Read once — no resize thrash.
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setCount(narrow ? 3000 : cores <= 4 ? 5000 : 9000);
  }, []);

  // Mount the canvas only once the section is near the viewport, and stop its
  // frameloop as soon as it leaves.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cur = data[active];
  const h = hueOf(active);
  const heavyOk = mounted && !reduce && webgl === true;

  const stats = useMemo(
    () => `${cur.tools.length} tools · ${cur.value}% proficiency`,
    [cur],
  );

  // ── Reduced motion / no WebGL: the original calm static grid ───────────────
  if (mounted && (reduce || webgl === false)) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2">
        {data.map((d, i) => {
          const dh = hueOf(i);
          return (
            <div
              key={d.axis}
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: accent(dh, 58, 0.3), background: accent(dh, 58, 0.05) }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-black dark:text-white">{d.axis}</span>
                <span className="font-mono text-sm text-black dark:text-white">{d.value}%</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${d.value}%`, background: accent(dh, 58) }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-2 py-0.5 font-mono text-[11px] text-black dark:text-white/90"
                    style={{ borderColor: accent(dh, 58, 0.35), background: accent(dh, 58, 0.08) }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={host} className="relative">
      {/* ── The swarm ───────────────────────────────────────────────────────
          Sits behind the content, pointer-events off, so the whole section
          stays clickable and the canvas never traps scroll on touch. */}
      <div className="relative h-[340px] w-full sm:h-[420px]">
        <div className="absolute inset-0">
          {heavyOk && inView && (
            <SkillField
              formation={FORMATIONS[active % FORMATIONS.length]}
              // Darker, more saturated ink on white; luminous on black.
              color={accent(h, themeTuning(isLight).lightness)}
              active={inView}
              count={count}
            />
          )}
        </div>

        {/* Domain readout floating over the field */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 pb-1 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-[0.34em]"
                style={{ color: accent(h, 52) }}
              >
                Domain
              </div>
              <div className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
                {cur.axis}
              </div>
              <div className="font-mono text-[11px] text-black/55 dark:text-white/55">{stats}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Domain selector ────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {data.map((d, i) => {
          const dh = hueOf(i);
          const on = i === active;
          return (
            <button
              key={d.axis}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-pressed={on}
              aria-label={`${d.axis}, ${d.value}% proficiency`}
              className="relative rounded-full px-3 py-1.5 font-mono text-[11px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple-400/60"
              style={{ color: on ? accent(dh, 46) : undefined }}
            >
              {on && (
                <motion.span
                  layoutId="nebula-pill"
                  className="absolute inset-0 rounded-full border"
                  style={{
                    background: accent(dh, 58, 0.12),
                    borderColor: accent(dh, 58, 0.45),
                    boxShadow: `0 0 24px -10px ${accent(dh, 58, 0.9)}`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className={`relative z-10 ${on ? "font-semibold" : "text-black/60 dark:text-white/55"}`}>
                {d.axis}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tools for the active domain ────────────────────────────────────── */}
      <div className="mt-4 min-h-[92px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="flex flex-wrap justify-center gap-2"
            initial="hide"
            animate="show"
            exit="out"
            variants={{
              show: { transition: { staggerChildren: 0.035 } },
              out: { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
            }}
          >
            {cur.tools.map((t) => (
              <motion.span
                key={t}
                variants={{
                  hide: { opacity: 0, y: 10, scale: 0.86 },
                  show: { opacity: 1, y: 0, scale: 1 },
                  out: { opacity: 0, y: -6, scale: 0.9 },
                }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="rounded-full border px-3 py-1.5 font-mono text-[12.5px] text-black dark:text-white/90"
                style={{ borderColor: accent(h, 58, 0.4), background: accent(h, 58, 0.1) }}
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
