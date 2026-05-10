"use client";

import React from "react";

export type SkillChipVariant =
  | "emerald"
  | "cyan"
  | "blue"
  | "purple"
  | "rose"
  | "amber";

export type SkillChipSize = "sm" | "md" | "lg";

type Variant = {
  chip: string;
  tooltipBorder: string;
};

const variants: Record<SkillChipVariant, Variant> = {
  emerald: {
    chip: "bg-yellow-500/15 dark:bg-emerald-500/15 border-yellow-500/35 dark:border-emerald-500/35 text-black hover:bg-yellow-500/30 dark:hover:bg-emerald-500/30 hover:border-yellow-500/60 dark:hover:border-emerald-500/60 dark:border-emerald-400/30 dark:text-emerald-100 dark:hover:border-emerald-400/60",
    tooltipBorder: "border-yellow-500/45 dark:border-emerald-400/40",
  },
  cyan: {
    chip: "bg-blue-500/15 dark:bg-cyan-500/15 border-blue-500/35 dark:border-cyan-500/35 text-black hover:bg-blue-500/30 dark:hover:bg-cyan-500/30 hover:border-blue-500/60 dark:hover:border-cyan-500/60 dark:border-cyan-400/30 dark:text-cyan-100 dark:hover:border-cyan-400/60",
    tooltipBorder: "border-blue-500/45 dark:border-cyan-400/40",
  },
  blue: {
    chip: "bg-blue-500/15 border-blue-500/35 text-black hover:bg-blue-500/30 hover:border-blue-500/60 dark:border-blue-400/30 dark:text-blue-100 dark:hover:border-blue-400/60",
    tooltipBorder: "border-blue-500/45 dark:border-blue-400/40",
  },
  purple: {
    chip: "bg-blue-800/15 dark:bg-purple-500/15 border-blue-800/35 dark:border-purple-500/35 text-black hover:bg-blue-800/30 dark:hover:bg-purple-500/30 hover:border-blue-800/60 dark:hover:border-purple-500/60 dark:border-purple-400/30 dark:text-purple-100 dark:hover:border-purple-400/60",
    tooltipBorder: "border-blue-800/45 dark:border-purple-400/40",
  },
  rose: {
    chip: "bg-yellow-500/15 dark:bg-rose-500/15 border-yellow-500/35 dark:border-rose-500/35 text-black hover:bg-yellow-500/30 dark:hover:bg-rose-500/30 hover:border-yellow-500/60 dark:hover:border-rose-500/60 dark:border-rose-400/30 dark:text-rose-100 dark:hover:border-rose-400/60",
    tooltipBorder: "border-yellow-500/45 dark:border-rose-400/40",
  },
  amber: {
    chip: "bg-yellow-500/15 dark:bg-amber-500/15 border-yellow-500/35 dark:border-amber-500/35 text-black hover:bg-yellow-500/30 dark:hover:bg-amber-500/30 hover:border-yellow-500/60 dark:hover:border-amber-500/60 dark:border-amber-400/30 dark:text-amber-100 dark:hover:border-amber-400/60",
    tooltipBorder: "border-yellow-500/45 dark:border-amber-400/40",
  },
};

const sizeClasses: Record<
  SkillChipSize,
  { chip: string; tooltip: string }
> = {
  sm: {
    chip: "px-2.5 py-1 text-[11px]",
    tooltip: "w-60 max-w-[15rem] px-3 py-2 text-[10.5px]",
  },
  md: {
    chip: "px-3 py-1.5 text-[12.5px]",
    tooltip: "w-64 max-w-[16rem] px-3.5 py-2.5 text-[11.5px]",
  },
  lg: {
    chip: "px-3.5 py-2 text-[13.5px]",
    tooltip: "w-72 max-w-[18rem] px-4 py-3 text-[12px]",
  },
};

export type SkillChipProps = {
  label: string;
  /** Interviewer-friendly explanation shown on hover. */
  tooltip?: string;
  variant?: SkillChipVariant;
  /** Visual size. Default "sm" for inline use; "md"/"lg" for hover overlays. */
  size?: SkillChipSize;
  /** Tooltip side. Default "top". Use "bottom" near the top of a panel. */
  tooltipSide?: "top" | "bottom";
};

/**
 * Pill-shaped skill chip with an optional hover tooltip. Designed to live
 * inside dark-glass concept-stack panels and live-demo cards. Tooltip
 * surfaces an interview-ready 1-2 line explanation of the underlying
 * concept (e.g. "Walk-forward backtesting" → "Out-of-sample testing on
 * rolling time slices to avoid look-ahead bias").
 */
export default function SkillChip({
  label,
  tooltip,
  variant = "emerald",
  size = "sm",
  tooltipSide = "top",
}: SkillChipProps) {
  const v = variants[variant];
  const sz = sizeClasses[size];
  const sideClasses = tooltipSide === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <span
      className="relative inline-block group/chip align-middle"
      // Make focusable on mobile so a tap reveals the tooltip
      // (no hover state on touch devices). Desktop keeps cursor hover.
      tabIndex={tooltip ? 0 : undefined}
    >
      <span
        className={`rounded-full border font-medium cursor-default transition-colors duration-200 ${sz.chip} ${v.chip} ${
          tooltip ? "underline decoration-dotted decoration-black/30 dark:decoration-white/25 underline-offset-[5px]" : ""
        }`}
      >
        {label}
      </span>
      {tooltip && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 ${sideClasses} ${sz.tooltip} rounded-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border ${v.tooltipBorder} leading-snug text-black dark:text-gray-100 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] opacity-0 translate-y-1 group-hover/chip:opacity-100 group-hover/chip:translate-y-0 group-focus/chip:opacity-100 group-focus/chip:translate-y-0 group-focus-within/chip:opacity-100 group-focus-within/chip:translate-y-0 transition-[opacity,transform] duration-200`}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}
