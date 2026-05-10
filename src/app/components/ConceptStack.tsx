"use client";

import React from "react";
import type { IconType } from "react-icons";
import SkillChip, { type SkillChipVariant } from "./SkillChip";

export type ConceptGroup = {
  Icon: IconType;
  title: string;
  iconColor: string; // tailwind text color class (e.g. "text-black dark:text-purple-300")
  titleColor: string; // tailwind text color class
  variant: SkillChipVariant;
  chips: ReadonlyArray<{ label: string; tooltip: string }>;
};

export type ConceptStackProps = {
  groups: ReadonlyArray<ConceptGroup>;
  /** Tailwind text-color class for the "Concept Stack" header (e.g. "text-black"). */
  accentColor: string;
  /**
   * "overlay" — animated reveal inside the project visual's hover overlay.
   *   Group-hover staggers each group up + fades in.
   * "static"  — always visible, no animations. Used for mobile/no-hover.
   */
  mode?: "overlay" | "static";
};

const overlayGroupClasses = [
  "delay-100 group-hover:opacity-100 group-hover:translate-y-0",
  "delay-200 group-hover:opacity-100 group-hover:translate-y-0",
  "delay-300 group-hover:opacity-100 group-hover:translate-y-0",
];

export default function ConceptStack({
  groups,
  accentColor,
  mode = "overlay",
}: ConceptStackProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`font-mono text-[10px] tracking-[0.4em] uppercase ${accentColor} dark:text-gray-300`}
        >
          Concept Stack
        </span>
        <span
          className={`h-px flex-1 bg-gradient-to-r from-current/60 to-transparent ${accentColor}`}
        />
        <span className="font-mono text-[9px] text-black dark:text-gray-300/55 tracking-widest uppercase">
          {mode === "overlay" ? "Hover a chip" : "Tap a chip"}
        </span>
      </div>

      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div
            key={group.title}
            className={
              mode === "overlay"
                ? `opacity-0 translate-y-3 transition-all duration-500 ${overlayGroupClasses[gi] ?? ""}`
                : ""
            }
          >
            <div className="flex items-center gap-2 mb-2">
              <group.Icon className={`${group.iconColor} text-sm dark:text-gray-300`} />
              <span
                className={`text-[11px] font-mono uppercase tracking-widest ${group.titleColor} dark:text-gray-300`}
              >
                {group.title}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.chips.map((c) => (
                <SkillChip
                  key={c.label}
                  label={c.label}
                  tooltip={c.tooltip}
                  variant={group.variant}
                  size="md"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
