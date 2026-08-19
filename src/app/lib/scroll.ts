// Single scroll source for the whole site.
//
// Lenis owns the scroll position; every scroll-linked effect subscribes here
// instead of attaching its own listener or running its own rAF. One rAF, one
// scroll value, so nothing can drift out of phase with anything else.

type Sub = (scroll: number) => void;

const subs = new Set<Sub>();
let current = 0;
let started = false;

export function publishScroll(v: number) {
  current = v;
  subs.forEach((s) => s(v));
}

export function subscribeScroll(fn: Sub) {
  subs.add(fn);
  fn(current);
  return () => subs.delete(fn);
}

export function scrollY() {
  return current;
}

/** True once Lenis is live; consumers fall back to native scroll until then. */
export function scrollReady() {
  return started;
}

export function markStarted() {
  started = true;
}

/** Shared entry/exit easing — every reveal on the site uses this curve. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** One beat. Section reveals, intro phases and star fades are all multiples. */
export const BEAT = 0.55;
