// Shared state for the single WebGL scene.
//
// WHY THIS EXISTS: the page previously mounted three separate r3f <Canvas>
// elements (intro, ambient stars, skills field) on top of FluidCanvas's own
// WebGL context. Browsers cap live WebGL contexts, and on mobile that cap is
// low — context creation failed, three threw, and the whole app went to
// "Application error: a client-side exception". One canvas, one context.
//
// DOM components publish what they want drawn (a tracked element rect, the
// active skills formation); the scene subscribes and renders it. No React
// state crosses the boundary per frame.

import type { Formation } from "../components/particles/core";

export type Rect = { x: number; y: number; w: number; h: number } | null;

type SceneState = {
  /** Viewport rect of the skills canvas slot. */
  skillsRect: Rect;
  skillsFormation: Formation;
  skillsColor: string;
  skillsVisible: boolean;
  /** Contrast colour for the selected sub-skill. */
  skillsHot: string;
  /** Which deterministic particle bucket lights up; -1 = none. */
  skillsHiBucket: number;
  /** How many buckets the swarm is divided into (= tools in the cluster). */
  skillsBuckets: number;
};

const state: SceneState = {
  skillsRect: null,
  // Idle shape is the Data Science track's double helix, not a plain sphere —
  // the field should land on real content, not a generic circle. It still
  // drifts: the shader's curl noise and the group rotation run regardless.
  skillsFormation: "helix",
  skillsColor: "hsl(266, 82%, 62%)",
  skillsVisible: false,
  skillsHot: "#e0119a",
  skillsHiBucket: -1,
  skillsBuckets: 6,
};

const subs = new Set<() => void>();

export function setScene(patch: Partial<SceneState>) {
  Object.assign(state, patch);
  subs.forEach((s) => s());
}

export function getScene() {
  return state;
}

export function subscribeScene(fn: () => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

/** Measure an element into viewport coords, or null when off screen. */
export function measure(el: HTMLElement | null): Rect {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.bottom < -200 || r.top > window.innerHeight + 200) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}
