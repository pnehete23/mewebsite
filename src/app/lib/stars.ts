// Star arrival channel — deliberately dependency-free.
//
// SectionReveal is part of the main bundle; GoldenStars pulls in three. If the
// reveal imported the event helper from the star component, three would be
// dragged into first load. Keeping the channel here preserves the code-split.

export const STAR_EVENT = "stars:arrive";

/** Fired by a reveal when its text lands. x/y are normalised viewport coords. */
export function announceStars(x: number, y: number) {
  window.dispatchEvent(new CustomEvent(STAR_EVENT, { detail: { x, y } }));
}
