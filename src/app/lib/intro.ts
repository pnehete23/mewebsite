// Intro decision, resolved once and shared.
//
// Both the intro overlay and the hero gate need the same answer to "is there
// an intro to wait for?". They cannot each read sessionStorage on mount: the
// overlay's effect runs first, so by the time the hero asked, the flag would
// already be set and the hero would un-gate instantly — losing the overlap
// that makes the hand-off continuous.
//
// So the decision is computed lazily on first call and cached for the page's
// lifetime, and the "seen" flag is only written when the intro *finishes*.

const FLAG = "intro_seen_v1";
export const HANDOFF_EVENT = "intro:handoff";

let decision: boolean | null = null;

/** True if the intro should play. Cached — every caller gets the same answer. */
export function willIntroRun() {
  if (decision !== null) return decision;
  if (typeof window === "undefined") return false;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = sessionStorage.getItem(FLAG) === "1";
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }

  decision = !reduce && !seen && webgl;
  return decision;
}

/** Written only once the intro has actually played, so a reload mid-intro replays it. */
export function markIntroSeen() {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {
    /* private mode — worst case the intro plays again */
  }
}

export function fireHandoff() {
  window.dispatchEvent(new Event(HANDOFF_EVENT));
}
