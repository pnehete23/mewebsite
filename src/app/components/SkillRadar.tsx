"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export type RadarAxis = {
  axis: string;
  value: number;
  tools: string[];
};

// viewBox is intentionally larger than the polygon radius so axis labels
// (e.g. "MACHINE LEARNING", "CLOUD / APIS") have horizontal clearance and
// don't get clipped at the SVG edge.
const SIZE = 500;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 130;
const LABEL_OFFSET = 24;

export default function SkillRadar({ data }: { data: RadarAxis[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  // Avoid hydration flash — server has no theme; default to dark to match
  // first-paint (provider's defaultTheme). Once mounted, follow the user.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  // Theme-aware ink for the SVG (Tailwind utilities don't apply inside
  // SVG fill/stroke attributes, so we branch in JS).
  const ink = isLight
    ? {
        // Light mode: blue polygon edge, pitch-black labels and vertices.
        polygonStroke: "#1d4ed8", // blue-700
        polygonFillId: "skillRadarFillLight",
        vertexFill: "#000000",
        vertexStroke: "#000000",
        ringStroke: "rgba(0, 0, 0, 0.18)",
        axisStroke: "rgba(0, 0, 0, 0.22)",
        axisLabelFill: "#000000",
        axisLabelActive: "#000000",
      }
    : {
        polygonStroke: "#ddd6fe", // violet-200
        polygonFillId: "skillRadarFillDark",
        vertexFill: "#ffffff",
        vertexStroke: "#a78bfa", // violet-400
        ringStroke: "rgba(168, 85, 247, 0.18)",
        axisStroke: "rgba(168, 85, 247, 0.22)",
        axisLabelFill: "rgba(216, 180, 254, 0.85)",
        axisLabelActive: "#f5f3ff",
      };

  const angle = (i: number) => (Math.PI * 2 * i) / data.length - Math.PI / 2;

  const point = (i: number, v: number) => {
    const a = angle(i);
    const rad = R * (v / 100);
    return { x: CX + rad * Math.cos(a), y: CY + rad * Math.sin(a) };
  };

  const axisEnd = (i: number) => {
    const a = angle(i);
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  };

  const labelPos = (i: number) => {
    const a = angle(i);
    const lr = R + LABEL_OFFSET;
    return { x: CX + lr * Math.cos(a), y: CY + lr * Math.sin(a) };
  };

  const polygonPoints = data
    .map((d, i) => {
      const p = point(i, d.value);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ");

  const rings = [25, 50, 75, 100];

  const ringPoints = (pct: number) =>
    data
      .map((_, i) => {
        const p = point(i, pct);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ");

  const activeTools =
    hover !== null
      ? data[hover].tools
      : data.flatMap((d) => d.tools.slice(0, 1));
  const activeLabel = hover !== null ? data[hover].axis : "Stack at a glance";
  const activeNote =
    hover !== null
      ? `${data[hover].value} / 100 · ${data[hover].tools.length} tools`
      : "Hover an axis to see tools";

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-black/[0.025] dark:bg-white/[0.025] border border-blue-700/30 dark:border-purple-400/15 backdrop-blur-sm p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Skills radar chart"
        >
          <defs>
            {/* Two gradients defined; we pick which to reference based on theme */}
            <radialGradient id="skillRadarFillLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.50" />
              <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.10" />
            </radialGradient>
            <radialGradient id="skillRadarFillDark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.55" />
              <stop offset="65%" stopColor="#8b5cf6" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.12" />
            </radialGradient>
            <filter id="skillRadarGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {rings.map((pct) => (
            <polygon
              key={pct}
              points={ringPoints(pct)}
              fill="none"
              stroke={ink.ringStroke}
              strokeWidth={pct === 100 ? 1 : 0.6}
              strokeDasharray={pct === 100 ? "0" : "2 3"}
            />
          ))}

          {data.map((_, i) => {
            const e = axisEnd(i);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={e.x}
                y2={e.y}
                stroke={ink.axisStroke}
                strokeWidth={0.8}
              />
            );
          })}

          <motion.polygon
            points={polygonPoints}
            fill={`url(#${ink.polygonFillId})`}
            stroke={ink.polygonStroke}
            strokeWidth={1.5}
            strokeLinejoin="round"
            filter="url(#skillRadarGlow)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />

          {data.map((d, i) => {
            const p = point(i, d.value);
            const active = hover === i;
            return (
              <motion.circle
                key={d.axis}
                cx={p.x}
                cy={p.y}
                r={active ? 5.5 : 3.8}
                fill={ink.vertexFill}
                stroke={ink.vertexStroke}
                strokeWidth={2}
                filter="url(#skillRadarGlow)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.04 }}
              />
            );
          })}

          {data.map((d, i) => {
            const lp = labelPos(i);
            let anchor: "start" | "middle" | "end" = "middle";
            if (lp.x > CX + 6) anchor = "start";
            else if (lp.x < CX - 6) anchor = "end";
            const active = hover === i;
            return (
              <g
                key={d.axis}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={lp.x - 70}
                  y={lp.y - 14}
                  width={140}
                  height={28}
                  fill="transparent"
                />
                <text
                  x={lp.x}
                  y={lp.y}
                  textAnchor={anchor}
                  fill={active ? ink.axisLabelActive : ink.axisLabelFill}
                  fontSize="10.5"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  letterSpacing="1"
                  dominantBaseline="middle"
                  style={{ textTransform: "uppercase" }}
                >
                  {d.axis}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const p = point(i, d.value);
            return (
              <circle
                key={`hit-${d.axis}`}
                cx={p.x}
                cy={p.y}
                r={18}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>
      </div>

      <div className="rounded-lg bg-blue-800/[0.08] dark:bg-purple-500/[0.06] border border-blue-800/30 dark:border-purple-400/20 px-3 py-2.5 min-h-[58px]">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] text-black dark:text-purple-100 tracking-[0.25em] uppercase truncate">
            {activeLabel}
          </span>
          <span className="font-mono text-[9px] text-black dark:text-purple-300/70 tracking-wide shrink-0">
            {activeNote}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeTools.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[10px] rounded-full bg-blue-800/15 dark:bg-purple-500/15 border border-blue-800/35 dark:border-purple-400/30 text-black dark:text-purple-100 font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
