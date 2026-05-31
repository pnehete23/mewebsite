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

// ── Circular proficiency ring — animates 0 → value on every card switch ───────
function Ring({ value, h, animate }: { value: number; h: number; animate: boolean }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  const offset = C - (value / 100) * C;
  return (
    <span className="relative grid h-[78px] w-[78px] place-items-center">
      <svg width="78" height="78" viewBox="0 0 78 78" className="-rotate-90">
        <circle cx="39" cy="39" r={R} fill="none" strokeWidth="5" stroke={accent(h, 58, 0.16)} />
        <motion.circle
          cx="39"
          cy="39"
          r={R}
          fill="none"
          stroke={accent(h, 60)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={animate ? { strokeDashoffset: C } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${accent(h, 58, 0.7)})` }}
        />
      </svg>
      <span
        className="absolute font-mono text-lg font-bold tabular-nums text-black dark:text-white"
        style={{ textShadow: `0 0 14px ${accent(h, 58, 0.45)}` }}
      >
        {value}
      </span>
    </span>
  );
}

export default function SkillDeck({ data }: { data: SkillCategory[] }) {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // Idle auto-advance gives the deck life until the visitor takes over.
  useEffect(() => {
    if (!mounted || reduce || engaged) return;
    const id = setInterval(() => setActive((a) => (a + 1) % data.length), 2600);
    return () => clearInterval(id);
  }, [mounted, reduce, engaged, data.length]);

  const pick = (i: number) => {
    setEngaged(true);
    setActive(i);
  };

  const h = hueOf(active);
  const cur = data[active];

  // Faux-deck depth: how far behind the front card each *other* domain sits,
  // ordered so neighbours peek first. Drives the stacked-card silhouette.
  const depth = useMemo(() => {
    const order = data
      .map((_, i) => i)
      .filter((i) => i !== active)
      .sort((a, b) => Math.abs(a - active) - Math.abs(b - active));
    const map = new Map<number, number>();
    order.forEach((i, rank) => map.set(i, rank + 1));
    return map;
  }, [active, data]);

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
    <div className="grid gap-5 md:grid-cols-12">
      {/* LEFT — domain selector with a sliding magic-move highlight */}
      <div className="md:col-span-5">
        <div className="flex flex-col gap-1.5">
          {data.map((d, i) => {
            const dh = hueOf(i);
            const isOn = i === active;
            return (
              <button
                key={d.axis}
                type="button"
                onMouseEnter={() => pick(i)}
                onFocus={() => pick(i)}
                onClick={() => pick(i)}
                aria-pressed={isOn}
                aria-label={`${d.axis}, ${d.value}% proficiency`}
                className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple-400/60 dark:focus-visible:ring-purple-300/60"
              >
                {isOn && (
                  <motion.span
                    layoutId="skd-highlight"
                    className="absolute inset-0 rounded-xl border"
                    style={{
                      background: accent(dh, 58, 0.12),
                      borderColor: accent(dh, 58, 0.45),
                      boxShadow: `0 0 24px -10px ${accent(dh, 58, 0.8)}`,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full transition-transform"
                  style={{
                    background: accent(dh, 58),
                    boxShadow: isOn ? `0 0 10px ${accent(dh, 58, 0.9)}` : "none",
                    transform: isOn ? "scale(1.25)" : "scale(1)",
                  }}
                />
                <span className="relative z-10 flex-1 font-medium text-black dark:text-white">
                  {d.axis}
                </span>
                <span
                  className="relative z-10 font-mono text-xs tabular-nums"
                  style={{ color: accent(dh, 52) }}
                >
                  {d.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — stacked-card deck; front card swaps with a "dealt" motion */}
      <div className="md:col-span-7">
        <div className="relative min-h-[268px]">
          {/* Peeking deck behind the active card */}
          {data.map((d, i) => {
            if (i === active) return null;
            const rank = depth.get(i) ?? 1;
            if (rank > 3) return null;
            const dh = hueOf(i);
            return (
              <motion.div
                key={`stack-${d.axis}`}
                aria-hidden
                className="absolute inset-x-0 top-0 rounded-2xl border bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm"
                style={{ borderColor: accent(dh, 58, 0.22), height: 248, zIndex: 5 - rank }}
                animate={{
                  y: rank * 11,
                  scale: 1 - rank * 0.045,
                  opacity: rank === 1 ? 0.65 : rank === 2 ? 0.4 : 0.22,
                }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
              />
            );
          })}

          {/* Active card */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              className="relative z-10 overflow-hidden rounded-2xl border bg-white/90 dark:bg-slate-950/90 backdrop-blur-md"
              style={{
                borderColor: accent(h, 58, 0.5),
                boxShadow: `0 24px 60px -28px ${accent(h, 58, 0.7)}, inset 0 0 60px -40px ${accent(h, 58, 0.9)}`,
              }}
              initial={{ opacity: 0, y: -26, rotate: -2.5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, y: 22, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* soft hue wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl"
                style={{ background: accent(h, 58, 0.18) }}
              />

              <div className="relative flex items-center gap-4 p-5 sm:p-6">
                <Ring value={cur.value} h={h} animate />
                <div className="min-w-0">
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.32em]"
                    style={{ color: accent(h, 52) }}
                  >
                    Domain
                  </div>
                  <h4 className="truncate text-xl font-bold text-black dark:text-white sm:text-2xl">
                    {cur.axis}
                  </h4>
                  <div className="mt-0.5 font-mono text-[11px] text-black/55 dark:text-white/55">
                    {cur.tools.length} tools &middot; {cur.value}% proficiency
                  </div>
                </div>
              </div>

              {/* tool chips pop in with a staggered spring on every switch */}
              <motion.div
                className="relative flex flex-wrap gap-2 px-5 pb-6 sm:px-6"
                initial="hide"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } } }}
              >
                {cur.tools.map((t) => (
                  <motion.span
                    key={t}
                    variants={{
                      hide: { opacity: 0, y: 10, scale: 0.82 },
                      show: { opacity: 1, y: 0, scale: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="rounded-full border px-3 py-1.5 font-mono text-[12.5px] text-black dark:text-white/90"
                    style={{
                      borderColor: accent(h, 58, 0.4),
                      background: accent(h, 58, 0.1),
                    }}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
