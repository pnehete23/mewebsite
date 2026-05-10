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
    chip: "bg-emerald-500/15 border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-400/60",
    tooltipBorder: "border-emerald-400/40",
  },
  cyan: {
    chip: "bg-cyan-500/15 border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/30 hover:border-cyan-400/60",
    tooltipBorder: "border-cyan-400/40",
  },
  blue: {
    chip: "bg-blue-500/15 border-blue-400/30 text-blue-100 hover:bg-blue-500/30 hover:border-blue-400/60",
    tooltipBorder: "border-blue-400/40",
  },
  purple: {
    chip: "bg-purple-500/15 border-purple-400/30 text-purple-100 hover:bg-purple-500/30 hover:border-purple-400/60",
    tooltipBorder: "border-purple-400/40",
  },
  rose: {
    chip: "bg-rose-500/15 border-rose-400/30 text-rose-100 hover:bg-rose-500/30 hover:border-rose-400/60",
    tooltipBorder: "border-rose-400/40",
  },
  amber: {
    chip: "bg-amber-500/15 border-amber-400/30 text-amber-100 hover:bg-amber-500/30 hover:border-amber-400/60",
    tooltipBorder: "border-amber-400/40",
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
    <span className="relative inline-block group/chip align-middle">
      <span
        className={`rounded-full border font-medium cursor-default transition-colors duration-200 ${sz.chip} ${v.chip} ${
          tooltip ? "underline decoration-dotted decoration-white/25 underline-offset-[5px]" : ""
        }`}
      >
        {label}
      </span>
      {tooltip && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 ${sideClasses} ${sz.tooltip} rounded-md bg-slate-950/95 backdrop-blur-md border ${v.tooltipBorder} leading-snug text-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] opacity-0 translate-y-1 group-hover/chip:opacity-100 group-hover/chip:translate-y-0 transition-[opacity,transform] duration-200`}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}
