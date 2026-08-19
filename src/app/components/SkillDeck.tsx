"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export type SkillCategory = {
  axis: string;
  value: number;
  tools: string[];
};

// One hue per domain, walked across the site's violet → blue → cyan → teal →
// emerald → amber → magenta family. Tasteful, theme-agnostic accents — no neon.
const HUES = [266, 224, 282, 198, 168, 142, 320, 38];
const hueOf = (i: number) => HUES[i % HUES.length];
const accent = (h: number, l = 58, a = 1, s = 82) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

// How long the diamond holds its mirrored back face before it dissipates.
const FLIP_MS = 620;

// ── Circular proficiency ring — animates 0 → value when the detail panel opens ─
function Ring({ value, h }: { value: number; h: number }) {
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <span className="relative grid h-[68px] w-[68px] shrink-0 place-items-center">
      <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
        <circle cx="34" cy="34" r={R} fill="none" strokeWidth="4" stroke={accent(h, 58, 0.16)} />
        <motion.circle
          cx="34"
          cy="34"
          r={R}
          fill="none"
          stroke={accent(h, 60)}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (value / 100) * C }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${accent(h, 58, 0.7)})` }}
        />
      </svg>
      <span
        className="absolute font-mono text-base font-bold tabular-nums text-black dark:text-white"
        style={{ textShadow: `0 0 14px ${accent(h, 58, 0.45)}` }}
      >
        {value}
      </span>
    </span>
  );
}

export default function SkillDeck({ data }: { data: SkillCategory[] }) {
  const [mounted, setMounted] = useState(false);
  // Index mid-flip: showing its mirrored back face, about to dissipate.
  const [flipping, setFlipping] = useState<number | null>(null);
  // Diamonds the visitor has already turned over and cleared away.
  const [cleared, setCleared] = useState<number[]>([]);
  // Domain shown in the detail panel below the grid.
  const [detail, setDetail] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // The flip is a two-beat move: turn to the mirror back, then dissipate. The
  // timer owns the second beat so the exit animation and panel land together.
  useEffect(() => {
    if (flipping === null) return;
    const id = setTimeout(() => {
      setCleared((c) => (c.includes(flipping) ? c : [...c, flipping]));
      setDetail(flipping);
      setFlipping(null);
    }, FLIP_MS);
    return () => clearTimeout(id);
  }, [flipping]);

  const reset = () => {
    setCleared([]);
    setDetail(null);
    setFlipping(null);
  };

  const cur = detail === null ? null : data[detail];
  const remaining = useMemo(
    () => data.length - cleared.length,
    [data.length, cleared.length],
  );

  // ── SSR / reduced-motion fallback: a calm, fully static grid ───────────────
  if (!mounted || reduce) {
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
                <span className="block h-full rounded-full" style={{ width: `${d.value}%`, background: accent(dh, 58) }} />
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
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/55 dark:text-white/50">
          Turn a facet &middot; {remaining} left
        </p>
        <AnimatePresence>
          {cleared.length > 0 && (
            <motion.button
              type="button"
              onClick={reset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-full border border-black/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-black/70 outline-none transition-colors hover:border-black/35 hover:text-black focus-visible:ring-2 focus-visible:ring-purple-400/60 dark:border-white/15 dark:text-white/60 dark:hover:border-white/35 dark:hover:text-white"
            >
              Recut
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Diamond field ─────────────────────────────────────────────────────
          Each cell is a square rotated 45°; the label counter-rotates so type
          stays upright. The mirrored face is a stack of translucent gradient
          plates — a specular sweep on hover, a cool ground tint, and a bright
          top-left edge — which reads as polished glass rather than flat fill. */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 py-2 sm:gap-x-3 sm:gap-y-3">
        {data.map((d, i) => {
          const dh = hueOf(i);
          const isFlipping = flipping === i;
          const isGone = cleared.includes(i);
          return (
            <div key={d.axis} className="relative aspect-square [perspective:900px]">
              <AnimatePresence>
                {!isGone && (
                  <motion.button
                    type="button"
                    onClick={() => flipping === null && setFlipping(i)}
                    aria-label={`${d.axis}, ${d.value}% proficiency — reveal tools`}
                    className="absolute inset-[14%] rotate-45 rounded-[10px] outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-purple-400/70"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateY: isFlipping ? 180 : 0,
                    }}
                    whileHover={isFlipping ? undefined : { scale: 1.07 }}
                    whileTap={{ scale: 0.95 }}
                    exit={{
                      opacity: 0,
                      scale: 1.35,
                      filter: "blur(10px)",
                      transition: { duration: 0.5, ease: "easeOut" },
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    style={{
                      border: `1px solid ${accent(dh, 62, 0.5)}`,
                      background: [
                        `linear-gradient(135deg, ${accent(dh, 72, 0.32)} 0%, ${accent(dh, 50, 0.1)} 42%, ${accent(dh, 78, 0.26)} 58%, ${accent(dh, 46, 0.14)} 100%)`,
                        `linear-gradient(315deg, rgba(255,255,255,0.34), rgba(255,255,255,0) 55%)`,
                      ].join(", "),
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 22px -12px ${accent(dh, 70, 0.9)}, 0 12px 30px -20px ${accent(dh, 58, 0.9)}`,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {/* travelling specular highlight — the "mirror" catch */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[10px]"
                    >
                      <motion.span
                        className="absolute -inset-y-8 w-1/2"
                        style={{
                          background:
                            "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
                        }}
                        initial={{ x: "-140%" }}
                        animate={{ x: isFlipping ? "160%" : "-140%" }}
                        whileHover={{ x: "160%" }}
                        transition={{ duration: 0.75, ease: "easeInOut" }}
                      />
                    </span>

                    {/* front face — label, upright */}
                    <span
                      className="absolute inset-0 grid -rotate-45 place-items-center px-1 text-center [backface-visibility:hidden]"
                    >
                      <span className="text-[10.5px] font-semibold leading-tight text-black drop-shadow-sm dark:text-white sm:text-xs">
                        {d.axis}
                      </span>
                    </span>

                    {/* back face — the reflected score, seen after the turn */}
                    <span
                      className="absolute inset-0 grid place-items-center rounded-[10px] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                      style={{ background: accent(dh, 58, 0.22) }}
                    >
                      <span className="-rotate-45 font-mono text-sm font-bold tabular-nums text-black dark:text-white">
                        {d.value}
                      </span>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Detail panel — the tools behind the facet just turned ─────────── */}
      <div className="min-h-[132px]">
        <AnimatePresence mode="wait">
          {cur && detail !== null ? (
            <motion.div
              key={detail}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden rounded-2xl border bg-white/85 p-5 backdrop-blur-md dark:bg-slate-950/80"
              style={{
                borderColor: accent(hueOf(detail), 58, 0.45),
                boxShadow: `0 24px 60px -34px ${accent(hueOf(detail), 58, 0.8)}`,
              }}
            >
              <div className="flex items-center gap-4">
                <Ring value={cur.value} h={hueOf(detail)} />
                <div className="min-w-0">
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.32em]"
                    style={{ color: accent(hueOf(detail), 52) }}
                  >
                    Domain
                  </div>
                  <h4 className="truncate text-xl font-bold text-black dark:text-white">{cur.axis}</h4>
                  <div className="mt-0.5 font-mono text-[11px] text-black/55 dark:text-white/55">
                    {cur.tools.length} tools &middot; {cur.value}% proficiency
                  </div>
                </div>
              </div>
              <motion.div
                className="mt-4 flex flex-wrap gap-2"
                initial="hide"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } }}
              >
                {cur.tools.map((t) => (
                  <motion.span
                    key={t}
                    variants={{
                      hide: { opacity: 0, y: 8, scale: 0.85 },
                      show: { opacity: 1, y: 0, scale: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="rounded-full border px-3 py-1.5 font-mono text-[12.5px] text-black dark:text-white/90"
                    style={{
                      borderColor: accent(hueOf(detail), 58, 0.4),
                      background: accent(hueOf(detail), 58, 0.1),
                    }}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid h-[132px] place-items-center rounded-2xl border border-dashed border-black/12 text-center font-mono text-[11px] text-black/45 dark:border-white/12 dark:text-white/40"
            >
              Click a diamond to turn it over.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
