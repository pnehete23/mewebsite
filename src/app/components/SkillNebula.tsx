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

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { themeTuning } from "./particles/core";
import { setScene } from "../lib/scene";
import { TRACKS, type Cluster } from "./skills-data";
import { TOOL_LOGOS } from "./ToolLogos";

const accent = (h: number, l = 58, a = 1, s = 82) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

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
  const [mounted, setMounted] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === "light";

  useEffect(() => setMounted(true), []);

  const track = TRACKS[active];
  const hue = track.hue;

  // Publish the active track's colour to the shared scene. The field itself is
  // drawn by Scene over the [data-skills-slot] element below — one canvas for
  // the whole site, because separate contexts crashed mobile.
  useEffect(() => {
    setScene({ skillsColor: accent(hue, themeTuning(isLight).lightness) });
  }, [hue, isLight]);

  const pickTrack = (i: number) => {
    setActive(i);
    setScene({ skillsFormation: TRACKS[i].clusters[0].formation });
  };

  const focusCluster = (c: Cluster) => setScene({ skillsFormation: c.formation });

  return (
    <div ref={host} className="relative space-y-5">
      {/* ── Role-family selector ─────────────────────────────────────────
          Mobile: full-width stacked buttons at 48px min height — three long
          labels can't share a row at 360px without wrapping into mush. */}
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center">
        {TRACKS.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => pickTrack(i)}
              aria-pressed={on}
              className="relative min-h-[48px] w-full rounded-full px-4 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple-400/60 sm:w-auto"
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

      {/* ── Particle field slot ──────────────────────────────────────────
          Just a measured box: Scene parks the shared swarm over it. Shorter on
          phones so the content below stays above the fold. If WebGL is
          unavailable the box is simply empty and the blurb still reads. */}
      <div
        data-skills-slot
        className="relative h-[170px] w-full sm:h-[260px] lg:h-[320px]"
      />

      {/* Blurb sits BELOW the particle stage, not over it — overlaid on a
          170px phone slot it landed on top of the swarm and neither read. */}
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 8, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(5px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center text-[13px] leading-relaxed text-black/75 dark:text-white/70 sm:text-sm"
        >
          {track.blurb}
        </motion.p>
      </AnimatePresence>

      {/* ── Clusters — every tool visible, no second click ───────────────── */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {track.clusters.map((c) => (
          <ClusterBlock
            key={c.name}
            cluster={c}
            hue={hue}
            light={isLight}
            onFocus={() => focusCluster(c)}
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
