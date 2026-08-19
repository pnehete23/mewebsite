"use client";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useAnimationControls,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

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

const COLS = 4;
// The turn: windup → flip → hold on the mirrored back, then the facet fractures.
const FLIP_MS = 780;
const SHARD_MS = 900;
// Six wedges struck from the centre — the fracture pattern for the dissipate.
const SHARDS = 6;

// Clip a pie wedge out of the tile box; radius overshoots the box so the cut
// reaches every corner and the pieces read as glass, not as pizza slices.
function wedge(k: number) {
  const a0 = (k / SHARDS) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((k + 1) / SHARDS) * Math.PI * 2 - Math.PI / 2;
  const am = (a0 + a1) / 2;
  const p = (a: number, r: number) =>
    `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`;
  // Mid-point pushed further out gives each shard an uneven, chipped edge.
  return `polygon(50% 50%, ${p(a0, 96)}, ${p(am, 118)}, ${p(a1, 96)})`;
}

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

type Impulse = { from: number; n: number } | null;

function Facet({
  d,
  i,
  flipping,
  gone,
  impulse,
  onPick,
}: {
  d: SkillCategory;
  i: number;
  flipping: boolean;
  gone: boolean;
  impulse: Impulse;
  onPick: () => void;
}) {
  const h = hueOf(i);
  const controls = useAnimationControls();
  const [shattering, setShattering] = useState(false);
  const wasGone = useRef(gone);

  // Pointer-tracked specular: raw position drives the highlight, a softened
  // spring copy drives the parallax tilt so the glass lags the cursor slightly.
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const sheen = useMotionTemplate`radial-gradient(120px circle at ${px}% ${py}%, rgba(255,255,255,0.62), rgba(255,255,255,0.12) 38%, rgba(255,255,255,0) 70%)`;

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 100;
    const ny = ((e.clientY - r.top) / r.height) * 100;
    px.set(nx);
    py.set(ny);
    tiltY.set((nx - 50) * 0.34);
    tiltX.set((50 - ny) * 0.34);
  };
  const onLeave = () => {
    px.set(50);
    py.set(50);
    tiltX.set(0);
    tiltY.set(0);
  };

  // Entrance — `animate` is driven by controls, so the mount beat is explicit.
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { type: "spring", stiffness: 260, damping: 22, delay: i * 0.045 },
    });
  }, [controls, i]);

  // Fire the shard burst exactly once, on the transition into `gone`.
  useEffect(() => {
    if (gone && !wasGone.current) {
      setShattering(true);
      const id = setTimeout(() => setShattering(false), SHARD_MS);
      wasGone.current = gone;
      return () => clearTimeout(id);
    }
    wasGone.current = gone;
  }, [gone]);

  // Shockwave: the struck facet's neighbours rock and dim, nearest first.
  useEffect(() => {
    if (!impulse || impulse.from === i || gone) return;
    const dx = (i % COLS) - (impulse.from % COLS);
    const dy = Math.floor(i / COLS) - Math.floor(impulse.from / COLS);
    const dist = Math.hypot(dx, dy);
    if (dist > 2.6) return;
    const away = dx === 0 && dy === 0 ? 0 : Math.sign(dx || 1);
    controls.start({
      scale: [1, 0.93, 1.03, 1],
      x: [0, away * 4, 0],
      opacity: [1, 0.72, 1],
      transition: {
        duration: 0.62,
        delay: dist * 0.055,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.35, 0.7, 1],
      },
    });
  }, [impulse, i, gone, controls]);

  const face =
    `linear-gradient(135deg, ${accent(h, 74, 0.34)} 0%, ${accent(h, 48, 0.1)} 40%, ` +
    `${accent(h, 80, 0.28)} 56%, ${accent(h, 44, 0.14)} 100%)`;

  return (
    <div className="relative aspect-square [perspective:1000px]">
      <div className="absolute inset-[13%] rotate-45 [transform-style:preserve-3d]">
        <AnimatePresence>
          {!gone && (
            <motion.button
              type="button"
              onClick={onPick}
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              aria-label={`${d.axis}, ${d.value}% proficiency — reveal tools`}
              className="absolute inset-0 rounded-[10px] outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-purple-400/70"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={controls}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Depth carrier: holds the flip, the pointer tilt, and the body.
                  Windup rocks back before the turn so the flip carries weight. */}
              <motion.span
                className="absolute inset-0 block rounded-[10px] [transform-style:preserve-3d]"
                style={{ rotateX: tiltX, rotateY: tiltY }}
                animate={
                  flipping
                    ? { rotateY: [0, -26, 180], scale: [1, 0.94, 1.1], z: [0, -14, 46] }
                    : { rotateY: 0, scale: 1, z: 0 }
                }
                whileHover={flipping ? undefined : { scale: 1.08, z: 18 }}
                whileTap={{ scale: 0.94 }}
                transition={
                  flipping
                    ? { duration: FLIP_MS / 1000, times: [0, 0.26, 1], ease: [0.6, -0.32, 0.24, 1.32] }
                    : { type: "spring", stiffness: 240, damping: 18, mass: 0.9 }
                }
              >
                {/* body — a plate set behind the face, so the turn shows edge */}
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-[10px]"
                  style={{
                    transform: "translateZ(-7px)",
                    background: accent(h, 34, 0.62),
                    boxShadow: `0 0 0 1px ${accent(h, 40, 0.5)}`,
                  }}
                />

                {/* front face */}
                <span
                  className="absolute inset-0 overflow-hidden rounded-[10px] [backface-visibility:hidden]"
                  style={{
                    background: face,
                    border: `1px solid ${accent(h, 64, 0.55)}`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 24px -12px ${accent(h, 72, 0.95)}, 0 14px 34px -22px ${accent(h, 58, 0.95)}`,
                    backdropFilter: "blur(7px)",
                  }}
                >
                  {/* caustic shimmer — a slow conic sweep, like light bending
                      through a cut stone. Low opacity keeps it a hint. */}
                  <motion.span
                    aria-hidden
                    className="absolute -inset-1/4 rounded-full opacity-40 mix-blend-overlay"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0deg, ${accent(h, 92, 0.55)} 40deg, transparent 96deg, ${accent(h, 88, 0.4)} 190deg, transparent 250deg, ${accent(h, 95, 0.5)} 320deg, transparent 360deg)`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14 + (i % 4) * 2.5, repeat: Infinity, ease: "linear" }}
                  />
                  {/* pointer-tracked specular */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: sheen }}
                  />
                  {/* refraction edge — bright rim lifted toward the viewer */}
                  <span
                    aria-hidden
                    className="absolute inset-[2px] rounded-[8px]"
                    style={{
                      boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 ${accent(h, 30, 0.35)}`,
                    }}
                  />
                  <span className="absolute inset-0 grid -rotate-45 place-items-center px-1 text-center">
                    <span className="text-[10.5px] font-semibold leading-tight text-black drop-shadow-sm dark:text-white sm:text-xs">
                      {d.axis}
                    </span>
                  </span>
                </span>

                {/* back face — the mirror: score reflected, colours inverted */}
                <span
                  className="absolute inset-0 grid place-items-center overflow-hidden rounded-[10px] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{
                    background: `linear-gradient(315deg, ${accent(h, 70, 0.4)}, ${accent(h, 30, 0.55)})`,
                    border: `1px solid ${accent(h, 70, 0.6)}`,
                    boxShadow: `inset 0 0 30px -8px ${accent(h, 88, 0.6)}`,
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 70%)",
                    }}
                  />
                  <span
                    className="-rotate-45 font-mono text-sm font-bold tabular-nums text-white"
                    style={{ textShadow: `0 0 12px ${accent(h, 90, 0.9)}` }}
                  >
                    {d.value}
                  </span>
                </span>
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Fracture: wedges fly off along their own bearing, tumbling and
               blurring out. Plus a single expanding shock ring. ───────────── */}
        <AnimatePresence>
          {shattering && (
            <>
              {Array.from({ length: SHARDS }).map((_, k) => {
                const a = ((k + 0.5) / SHARDS) * Math.PI * 2 - Math.PI / 2;
                return (
                  <motion.span
                    key={`shard-${k}`}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[10px]"
                    style={{
                      clipPath: wedge(k),
                      background: face,
                      border: `1px solid ${accent(h, 70, 0.5)}`,
                    }}
                    initial={{ opacity: 0.95, scale: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
                    animate={{
                      opacity: 0,
                      scale: 1.5 + (k % 3) * 0.12,
                      x: Math.cos(a) * (46 + (k % 3) * 12),
                      y: Math.sin(a) * (46 + (k % 3) * 12),
                      rotate: (k % 2 ? 1 : -1) * (28 + k * 7),
                      filter: "blur(7px)",
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: SHARD_MS / 1000,
                      ease: [0.16, 0.72, 0.3, 1],
                      delay: k * 0.022,
                    }}
                  />
                );
              })}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ border: `1px solid ${accent(h, 72, 0.75)}` }}
                initial={{ opacity: 0.8, scale: 0.35 }}
                animate={{ opacity: 0, scale: 2.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.62, ease: "easeOut" }}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SkillDeck({ data }: { data: SkillCategory[] }) {
  const [mounted, setMounted] = useState(false);
  // Index mid-flip: turning toward its mirrored back face, about to fracture.
  const [flipping, setFlipping] = useState<number | null>(null);
  // Diamonds the visitor has already turned over and cleared away.
  const [cleared, setCleared] = useState<number[]>([]);
  // Domain shown in the detail panel below the grid.
  const [detail, setDetail] = useState<number | null>(null);
  // Bumped on each strike so neighbouring facets can rock in response.
  const [impulse, setImpulse] = useState<Impulse>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // The turn is a two-beat move: flip to the mirror, then fracture. The timer
  // owns the second beat so the shard burst and the panel land together.
  useEffect(() => {
    if (flipping === null) return;
    const id = setTimeout(() => {
      setCleared((c) => (c.includes(flipping) ? c : [...c, flipping]));
      setDetail(flipping);
      setFlipping(null);
    }, FLIP_MS);
    return () => clearTimeout(id);
  }, [flipping]);

  const strike = (i: number) => {
    if (flipping !== null) return;
    setFlipping(i);
    setImpulse((p) => ({ from: i, n: (p?.n ?? 0) + 1 }));
  };

  const reset = () => {
    setCleared([]);
    setDetail(null);
    setFlipping(null);
    setImpulse(null);
  };

  const cur = detail === null ? null : data[detail];
  const remaining = useMemo(() => data.length - cleared.length, [data.length, cleared.length]);

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

      <div className="grid grid-cols-4 gap-x-2 gap-y-2 py-2 sm:gap-x-3 sm:gap-y-3">
        {data.map((d, i) => (
          <Facet
            key={d.axis}
            d={d}
            i={i}
            flipping={flipping === i}
            gone={cleared.includes(i)}
            impulse={impulse}
            onPick={() => strike(i)}
          />
        ))}
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
