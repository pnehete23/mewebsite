// Intro decision, resolved once and shared.
//
// Both the intro overlay and the hero gate need the same answer to "is there
// an intro to wait for?", and they must agree regardless of which effect runs
// first — so the decision is computed lazily on first call and cached for the
// page's lifetime.
//
// Deliberately NOT gated on a session flag: the intro plays on every load.
// Suppressing it on a return visit made navigating back feel like a different
// site, which is exactly the break in flow we're avoiding.

export const HANDOFF_EVENT = "intro:handoff";

let decision: boolean | null = null;

/** True if the intro should play. Cached — every caller gets the same answer. */
export function willIntroRun() {
  if (decision !== null) return decision;
  if (typeof window === "undefined") return false;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }

  decision = !reduce && webgl;
  return decision;
}

export function fireHandoff() {
  window.dispatchEvent(new Event(HANDOFF_EVENT));
}
