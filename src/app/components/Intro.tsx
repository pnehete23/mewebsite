"use client";

// Intro orchestrator.
//
// Decides whether the intro runs, locks scroll for its ~2.6s, and fires the
// hand-off *during* dissipation so the page underneath starts moving while
// particles are still flying apart. That overlap is what keeps intro → page
// reading as one motion instead of two.
//
// Skipped entirely for reduced motion, missing WebGL, and repeat views in the
// same session — see lib/intro for why that decision is shared and cached.

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE } from "../lib/scroll";
import { fireHandoff, HANDOFF_EVENT, willIntroRun } from "../lib/intro";

const IntroField = dynamic(() => import("./IntroField"), { ssr: false });

/** True once the page is cleared to animate — either the intro handed off, or
 *  there was never an intro to wait for. */
export function useIntroHandoff() {
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (!willIntroRun()) return;
    setReady(false);
    const on = () => setReady(true);
    window.addEventListener(HANDOFF_EVENT, on);
    // Safety net: never leave the page hidden if the canvas failed to start.
    const bail = setTimeout(on, 4000);
    return () => {
      window.removeEventListener(HANDOFF_EVENT, on);
      clearTimeout(bail);
    };
  }, []);

  return ready;
}

export default function Intro() {
  const [run, setRun] = useState(false);
  const [fading, setFading] = useState(false);
  const [count, setCount] = useState(9000);
  const [span, setSpan] = useState(1);

  useEffect(() => {
    if (!willIntroRun()) return;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setCount(narrow ? 3500 : cores <= 4 ? 6000 : 11000);
    // Mobile gets a noticeably shorter intro — 0.7× the timeline.
    setSpan(narrow ? 0.7 : 1);
    setRun(true);
  }, []);

  // Lock scroll only while the intro owns the screen.
  useEffect(() => {
    if (!run) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [run]);

  const fired = useRef({ handoff: false, done: false });

  const handoff = useCallback(() => {
    if (fired.current.handoff) return;
    fired.current.handoff = true;
    setFading(true);
    document.body.style.overflow = "";
    fireHandoff();
  }, []);

  const done = useCallback(() => {
    if (fired.current.done) return;
    fired.current.done = true;
    setRun(false);
  }, []);

  // Failsafe on wall-clock timers, which keep running even when rAF does not.
  // If the canvas never renders a frame — lost WebGL context, blocked GPU, a
  // chunk that failed to load — the timeline would never advance and the
  // overlay would sit there with scroll locked. These guarantee the page is
  // always handed back. The field's own callbacks fire first in the normal
  // case and make these no-ops.
  useEffect(() => {
    if (!run) return;
    const a = setTimeout(handoff, span * 1750 + 1500);
    const b = setTimeout(done, span * 2600 + 2000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [run, span, handoff, done]);

  return (
    <AnimatePresence>
      {run && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE } }}
        >
          {/* Backdrop dims out on hand-off, uncovering the page while the
              particles are still dispersing over the top of it. */}
          <motion.div
            className="absolute inset-0 bg-white dark:bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: 0.85, ease: EASE }}
          />
          <div className="absolute inset-0">
            <IntroField count={count} span={span} onHandoff={handoff} onDone={done} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
