"use client";

// Intro orchestrator.
//
// Owns only the backdrop, the scroll lock and the timing. The swarm itself is
// drawn by the shared Scene canvas — this component just flips `introRunning`
// on the scene store, because a second WebGL context is what used to crash the
// page on mobile.
//
// The hand-off fires mid-dissipation (Scene does that), so the hero starts
// rising while particles are still flying apart. Skipped for reduced motion
// and when WebGL is unavailable; deliberately NOT gated on a session flag, so
// navigating back never feels like a different site.

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE } from "../lib/scroll";
import { HANDOFF_EVENT, willIntroRun } from "../lib/intro";
import { setScene } from "../lib/scene";

/** True once the page is cleared to animate. */
export function useIntroHandoff() {
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (!willIntroRun()) return;
    setReady(false);
    const on = () => setReady(true);
    window.addEventListener(HANDOFF_EVENT, on);
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
  const fired = useRef(false);

  useEffect(() => {
    if (!willIntroRun()) return;
    setRun(true);
    setScene({ introRunning: true });
  }, []);

  useEffect(() => {
    if (!run) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [run]);

  const handoff = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setFading(true);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    if (!run) return;
    window.addEventListener(HANDOFF_EVENT, handoff);
    // Wall-clock failsafes: timers keep running when rAF does not, so a canvas
    // that never renders can't leave the overlay up with scroll locked.
    const a = setTimeout(handoff, 3300);
    const b = setTimeout(() => {
      setRun(false);
      setScene({ introRunning: false });
    }, 4200);
    return () => {
      window.removeEventListener(HANDOFF_EVENT, handoff);
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [run, handoff]);

  return (
    <AnimatePresence>
      {run && (
        <motion.div
          key="intro"
          className="pointer-events-none fixed inset-0 z-[110]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE } }}
        >
          {/* Uncovers the page while particles are still dispersing above it. */}
          <motion.div
            className="absolute inset-0 bg-white dark:bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: 0.85, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
