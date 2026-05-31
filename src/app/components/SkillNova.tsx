"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

export type SkillCategory = {
  axis: string;
  value: number;
  tools: string[];
};

// One neon hue per domain — drawn from the site's existing neon palette
// (SparkleTrail / FluidCanvas): magenta → purple → violet → blue → cyan →
// teal → green → amber. Index matches the order of categories.
const DOMAIN_HUES = [320, 285, 258, 222, 192, 162, 132, 45];
const hueOf = (i: number) => DOMAIN_HUES[i % DOMAIN_HUES.length];
const neon = (h: number, l = 62, a = 1) => `hsla(${h}, 100%, ${l}%, ${a})`;
const IDLE_HUE = 268; // calm violet for the resting frame

// Loose perimeter constellation — domains float around an open center where
// the hint lives and skills bloom inward. Fractions of the stage box.
const NODE_POS = [
  { fx: 0.18, fy: 0.32 },
  { fx: 0.37, fy: 0.17 },
  { fx: 0.58, fy: 0.16 },
  { fx: 0.79, fy: 0.27 },
  { fx: 0.82, fy: 0.55 },
  { fx: 0.64, fy: 0.81 },
  { fx: 0.41, fy: 0.84 },
  { fx: 0.19, fy: 0.66 },
];

const BURST_PARTICLES = 70;
const FOV = 340;

// Deterministic pseudo-random so layouts are stable per render but organic.
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── The neon star explosion (canvas), fired from a given origin on hover ─────
interface Particle {
  ox: number;
  oy: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  size: number;
  hue: number;
  tw: number;
  tws: number;
}

function useStarburst(enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();
  const isLightRef = useRef(false);
  useEffect(() => {
    isLightRef.current = resolvedTheme === "light";
  }, [resolvedTheme]);

  const fireBurst = useCallback((h: number, ox: number, oy: number) => {
    const ps = particlesRef.current;
    for (let i = 0; i < BURST_PARTICLES; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.sin(phi) * Math.sin(theta);
      const dz = Math.cos(phi);
      const speed = 55 + Math.random() * 230;
      ps.push({
        ox,
        oy,
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5,
        z: 0,
        vx: dx * speed,
        vy: dy * speed - 22, // gentle upward bias → stars "come up" as they splash
        vz: dz * speed,
        life: 0,
        max: 1.3 + Math.random() * 1.5,
        size: 0.8 + Math.random() * 1.7,
        hue: h + (Math.random() - 0.5) * 44,
        tw: Math.random() * Math.PI * 2,
        tws: 3 + Math.random() * 5,
      });
    }
    if (ps.length > 800) ps.splice(0, ps.length - 800);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(canvas);

    let last = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const isLight = isLightRef.current;
      ctx.globalCompositeOperation = isLight ? "source-over" : "lighter";

      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        if (p.life >= p.max) {
          ps.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vx *= 1 - dt * 1.1;
        p.vy = p.vy * (1 - dt * 1.1) - 9 * dt;
        p.vz *= 1 - dt * 1.1;
        p.tw += dt * p.tws;

        const zc = Math.max(-FOV * 0.7, p.z);
        const scale = FOV / (FOV + zc);
        const sx = p.ox + p.x * scale;
        const sy = p.oy + p.y * scale;
        if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue;

        const k = 1 - p.life / p.max;
        const twinkle = 0.6 + 0.4 * Math.sin(p.tw);
        const a = k * k * twinkle * Math.min(1, scale);
        const r = Math.max(0.4, p.size * scale);
        const haloR = r * 5.5;

        const coreL = isLight ? 52 : 80;
        const haloL = isLight ? 48 : 62;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
        grad.addColorStop(0, neon(p.hue, coreL, a * 0.95));
        grad.addColorStop(0.4, neon(p.hue, haloL, a * 0.4));
        grad.addColorStop(1, neon(p.hue, haloL, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = neon(p.hue, isLight ? 45 : 92, a);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [enabled]);

  return { canvasRef, fireBurst };
}

// ── A floating domain orb: mini neon score-ring + label ──────────────────────
function DomainOrb({ value, hue }: { value: number; hue: number }) {
  const R = 19;
  const C = 2 * Math.PI * R;
  const offset = C - (value / 100) * C;
  return (
    <span className="relative grid h-[52px] w-[52px] place-items-center">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={R} fill="none" strokeWidth="3.5" stroke={neon(hue, 60, 0.18)} />
        <circle
          cx="26"
          cy="26"
          r={R}
          fill="none"
          stroke={neon(hue, 65)}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 5px ${neon(hue, 60, 0.9)})` }}
        />
      </svg>
      <span
        className="absolute font-mono text-[13px] font-bold tabular-nums"
        style={{ color: neon(hue, 70), textShadow: `0 0 10px ${neon(hue, 60, 0.7)}` }}
      >
        {value}
      </span>
    </span>
  );
}

export default function SkillNova({ data }: { data: SkillCategory[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const prefersReduced = useReducedMotion();
  const stageObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => setMounted(true), []);
  const animateOn = mounted && !prefersReduced;

  const { canvasRef, fireBurst } = useStarburst(animateOn);

  // Measure the stage so orbs/bursts use real pixel positions. A callback ref
  // (not an effect) guarantees we attach + measure the instant the stage
  // mounts — the stage only appears once `animateOn` is true, so an empty-dep
  // effect bails on the pre-mount fallback render and never re-runs, leaving
  // box at {0,0} (bursts fire top-left, skills get hidden).
  const setStage = useCallback((el: HTMLDivElement | null) => {
    stageObserver.current?.disconnect();
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    stageObserver.current = ro;
  }, []);

  const activate = useCallback(
    (i: number) => {
      setHovered(i);
      const pos = NODE_POS[i % NODE_POS.length];
      fireBurst(hueOf(i), pos.fx * box.w, pos.fy * box.h);
    },
    [box.w, box.h, fireBurst]
  );

  const activeHue = hovered != null ? hueOf(hovered) : IDLE_HUE;

  // Skills of the hovered domain, fanned inward toward the open center so they
  // never run off the edge — each settles at a floating resting spot.
  const bloom = useMemo(() => {
    if (hovered == null || !box.w) return [];
    const node = NODE_POS[hovered % NODE_POS.length];
    const nx = node.fx * box.w;
    const ny = node.fy * box.h;
    const dir = Math.atan2(box.h / 2 - ny, box.w / 2 - nx);
    const tools = data[hovered].tools;
    const n = tools.length;
    const spread = (150 * Math.PI) / 180;
    const baseR = Math.min(box.w, box.h) * 0.26;
    return tools.map((t, i) => {
      const a = dir - spread / 2 + (n > 1 ? (spread * i) / (n - 1) : spread / 2);
      const rr = baseR * (0.78 + rand(hovered * 17 + i) * 0.55);
      return {
        t,
        x: nx + Math.cos(a) * rr,
        y: ny + Math.sin(a) * rr,
        delay: 0.03 * i,
        dur: 3 + rand(hovered * 5 + i) * 2.5,
        drift: 5 + rand(hovered * 9 + i) * 6,
      };
    });
  }, [hovered, box.w, box.h, data]);

  // ── Reduced-motion / pre-mount fallback: calm neon list, no canvas ─────────
  if (!animateOn) {
    return (
      <div className="space-y-2.5">
        {data.map((d, i) => {
          const h = hueOf(i);
          return (
            <div
              key={d.axis}
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: neon(h, 60, 0.3), background: neon(h, 60, 0.05) }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-black dark:text-white">{d.axis}</span>
                <span className="font-mono text-sm" style={{ color: neon(h, 60) }}>
                  {d.value}%
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${d.value}%`, background: neon(h, 60) }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-2 py-0.5 font-mono text-[11px] text-black dark:text-white/90"
                    style={{ borderColor: neon(h, 60, 0.35), background: neon(h, 60, 0.08) }}
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
    <motion.div
      className="relative overflow-hidden rounded-3xl"
      animate={{
        borderColor: neon(activeHue, 60, 0.32),
        boxShadow: `0 0 60px -20px ${neon(activeHue, 60, 0.45)}, inset 0 0 70px -34px ${neon(activeHue, 60, 0.6)}`,
      }}
      transition={{ duration: 0.8 }}
      style={{ borderWidth: 1, borderStyle: "solid" }}
    >
      <div ref={setStage} className="relative h-[420px] sm:h-[480px]">
        {/* neon star canvas — splashes into the page background behind it */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* core readability glow, recolored to whatever is hovered */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          animate={{ background: `radial-gradient(circle, ${neon(activeHue, 55, 0.14)}, transparent 70%)` }}
          transition={{ duration: 0.8 }}
        />

        {/* idle hint — fades away the moment a domain is engaged */}
        <AnimatePresence>
          {hovered == null && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="font-mono text-[13px] tracking-[0.18em]"
                  style={{ color: neon(IDLE_HUE, 72), textShadow: `0 0 16px ${neon(IDLE_HUE, 60, 0.6)}` }}
                >
                  ✦ hover a domain
                </div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.32em] uppercase text-black/45 dark:text-white/45">
                  to reveal its skills
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the floating skills of the hovered domain — bloom in on top.
            Centering uses the CSS `translate` property so framer is free to
            own `transform` (scale-in + the infinite float on y). */}
        <AnimatePresence>
          {bloom.map((item) => (
            <motion.div
              key={`${hovered}-${item.t}`}
              className="pointer-events-none absolute z-30 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[11px] backdrop-blur-[2px]"
              style={{
                left: item.x,
                top: item.y,
                translate: "-50% -50%",
                color: neon(activeHue, 74),
                borderColor: neon(activeHue, 62, 0.5),
                background: neon(activeHue, 60, 0.1),
                textShadow: `0 0 10px ${neon(activeHue, 60, 0.7)}`,
                boxShadow: `0 0 18px -6px ${neon(activeHue, 60, 0.85)}`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [0, -item.drift, 0] }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                default: { type: "spring", stiffness: 230, damping: 18, delay: item.delay },
                y: { duration: item.dur, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {item.t}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* the floating domain orbs (no tabs!) */}
        {data.map((d, i) => {
          const pos = NODE_POS[i % NODE_POS.length];
          const h = hueOf(i);
          const isOn = hovered === i;
          const dimmed = hovered != null && !isOn;
          return (
            <div
              key={d.axis}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.fx * 100}%`, top: `${pos.fy * 100}%` }}
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 4.5 + (i % 4) * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              >
                <motion.button
                  type="button"
                  onMouseEnter={() => activate(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => activate(i)}
                  onBlur={() => setHovered(null)}
                  onClick={() => (isOn ? setHovered(null) : activate(i))}
                  aria-pressed={isOn}
                  aria-label={`${d.axis}, ${d.value}% proficiency`}
                  className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1 outline-none"
                  animate={{ scale: isOn ? 1.14 : 1, opacity: dimmed ? 0.32 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <DomainOrb value={d.value} hue={h} />
                  <span
                    className="font-mono text-[10px] tracking-wide"
                    style={{
                      color: isOn ? neon(h, 74) : undefined,
                      textShadow: isOn ? `0 0 10px ${neon(h, 60, 0.7)}` : undefined,
                    }}
                  >
                    <span className={isOn ? "" : "text-black/70 dark:text-white/65"}>{d.axis}</span>
                  </span>
                </motion.button>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
