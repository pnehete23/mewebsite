"use client";

// Skills section.
//
// Information architecture is built for two readers at once: a recruiter
// skimming for one of three role families, and an ATS keyword scan. So each
// track shows ALL of its tooling at once — grouped by cluster, never hidden
// behind a second click — with real product names and a hard number proving
// each claim. Hovering a cluster morphs the particle field to that cluster's
// formation, which is what ties the content to the visual system rather than
// leaving the canvas as decoration.
//
// The 3D swarm is code-split and only mounts when the section nears the
// viewport; reduced motion / no WebGL renders the identical content with no
// canvas at all, so the keywords and proof points are never motion-dependent.

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { themeTuning } from "./particles/core";
import { TRACKS, type Cluster } from "./skills-data";
import { TOOL_LOGOS } from "./ToolLogos";

const SkillField = dynamic(() => import("./SkillField"), { ssr: false });

const accent = (h: number, l = 58, a = 1, s = 82) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

function ToolChip({ tool, hue, light }: { tool: string; hue: number; light: boolean }) {
  const Logo = TOOL_LOGOS[tool];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11.5px] text-black dark:text-white/90"
      style={{
        borderColor: accent(hue, light ? 45 : 58, light ? 0.32 : 0.4),
        background: accent(hue, light ? 50 : 58, light ? 0.07 : 0.1),
      }}
    >
      {Logo && <Logo aria-hidden className="shrink-0 text-[13px] opacity-80" />}
      {tool}
    </span>
  );
}

function ClusterBlock({
  cluster,
  hue,
  light,
  onFocus,
}: {
  cluster: Cluster;
  hue: number;
  light: boolean;
  onFocus: () => void;
}) {
  return (
    <div
      onMouseEnter={onFocus}
      onFocus={onFocus}
      tabIndex={-1}
      className="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.03] p-3.5 transition-colors hover:border-black/15 dark:hover:border-white/15"
    >
      <h5
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: accent(hue, light ? 40 : 62) }}
      >
        {cluster.name}
      </h5>
      <div className="flex flex-wrap gap-1.5">
        {cluster.tools.map((t) => (
          <ToolChip key={t} tool={t} hue={hue} light={light} />
        ))}
      </div>
    </div>
  );
}

export default function SkillNebula() {
  const [active, setActive] = useState(0);
  const [cluster, setCluster] = useState(0);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(9000);
  const host = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const webgl = useWebGL();
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === "light";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setCount(narrow ? 3000 : cores <= 4 ? 5000 : 9000);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const track = TRACKS[active];
  const hue = track.hue;
  const heavyOk = mounted && !reduce && webgl === true;

  const pickTrack = (i: number) => {
    setActive(i);
    setCluster(0);
  };

  return (
    <div ref={host} className="relative space-y-5">
      {/* ── Role-family selector ─────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2">
        {TRACKS.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => pickTrack(i)}
              aria-pressed={on}
              className="relative rounded-full px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple-400/60"
              style={{ color: on ? accent(t.hue, isLight ? 38 : 68) : undefined }}
            >
              {on && (
                <motion.span
                  layoutId="track-pill"
                  className="absolute inset-0 rounded-full border"
                  style={{
                    background: accent(t.hue, 58, isLight ? 0.1 : 0.14),
                    borderColor: accent(t.hue, 58, 0.45),
                    boxShadow: `0 0 26px -12px ${accent(t.hue, 58, 0.9)}`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 ${on ? "font-semibold" : "text-black/60 dark:text-white/55"}`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Particle field, with the track framing laid over it ──────────── */}
      {heavyOk && (
        <div className="relative h-[260px] w-full sm:h-[320px]">
          <div className="absolute inset-0">
            {inView && (
              <SkillField
                formation={track.clusters[cluster]?.formation ?? "sphere"}
                color={accent(hue, themeTuning(isLight).lightness)}
                active={inView}
                count={count}
              />
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-1 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 8, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(5px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-2xl text-sm leading-relaxed text-black/75 dark:text-white/70"
              >
                {track.blurb}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Reduced motion / no WebGL: keep the framing line, drop the canvas. */}
      {mounted && !heavyOk && (
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-black/75 dark:text-white/70">
          {track.blurb}
        </p>
      )}

      {/* ── Clusters — every tool visible, no second click ───────────────── */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {track.clusters.map((c, i) => (
          <ClusterBlock
            key={c.name}
            cluster={c}
            hue={hue}
            light={isLight}
            onFocus={() => setCluster(i)}
          />
        ))}
      </div>

      {/* ── Full index, visually hidden ──────────────────────────────────
          The tabs only mount the active track, so an ATS keyword scan (and a
          screen reader) would otherwise see just one third of the stack. This
          block keeps every tool name and proof figure in the DOM at all times.
          Not aria-hidden: it is real, useful content, just not shown twice. */}
      <div className="sr-only">
        <h4>Full skills index</h4>
        {TRACKS.map((t) => (
          <section key={t.key}>
            <h5>{t.label}</h5>
            <p>{t.blurb}</p>
            {t.clusters.map((c) => (
              <p key={c.name}>
                {c.name}: {c.tools.join(", ")}.
              </p>
            ))}
            {t.proof.map((p) => (
              <p key={p.label}>
                {p.value} — {p.label} ({p.source}).
              </p>
            ))}
          </section>
        ))}
      </div>

      {/* ── Quantified proof ─────────────────────────────────────────────── */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        {track.proof.map((p) => (
          <div
            key={p.label}
            className="rounded-xl border p-3.5"
            style={{
              borderColor: accent(hue, 58, isLight ? 0.22 : 0.28),
              background: accent(hue, 58, isLight ? 0.05 : 0.07),
            }}
          >
            <div
              className="font-mono text-xl font-bold tabular-nums"
              style={{ color: accent(hue, isLight ? 38 : 66) }}
            >
              {p.value}
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-black/75 dark:text-white/75">
              {p.label}
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black/45 dark:text-white/40">
              {p.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
