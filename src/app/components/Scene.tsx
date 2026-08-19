"use client";

// THE single WebGL canvas for the site.
//
// It draws one thing: the skills particle swarm. It stays a shared, fixed,
// full-viewport canvas rather than a canvas inside the skills section because
// the browser's WebGL context budget is small — running several contexts is
// what previously produced "WebGL not supported" and a client-side crash on
// mobile. Anything added later belongs in here too, not in a new <Canvas>.
//
// The swarm is positioned over its DOM slot by measuring that element and
// converting viewport pixels into world units against this camera; `px()` and
// `toWorld()` are that bridge.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { build, easeFor, seeds, themeTuning, FRAG, MORPH_S, VERT } from "./particles/core";
import { getScene, measure, setScene, subscribeScene, type Rect } from "../lib/scene";

const CAM_Z = 6;
const FOV = 50;

/** Viewport-pixel → world-unit conversion for the fixed camera above. */
function px(size: { width: number; height: number }) {
  const vh = 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z;
  return { perPixel: vh / size.height, worldH: vh, worldW: vh * (size.width / size.height) };
}

function toWorld(rect: NonNullable<Rect>, size: { width: number; height: number }) {
  const { perPixel } = px(size);
  return {
    x: (rect.x - size.width / 2) * perPixel,
    y: -(rect.y - size.height / 2) * perPixel,
    r: (Math.min(rect.w, rect.h) / 2) * perPixel,
  };
}

// ── Skills particle swarm ────────────────────────────────────────────────────
// Morphs between formations on the GPU: the DOM publishes a formation, the
// vertex shader interpolates every particle with per-particle stagger and a
// mid-flight outward arc.

function Swarm({ count, light }: { count: number; light: boolean }) {
  const geom = useRef<THREE.BufferGeometry>(null);
  const group = useRef<THREE.Group>(null);
  const progress = useRef(1);
  const formation = useRef(getScene().skillsFormation);
  const { size, pointer } = useThree();
  const tune = themeTuning(light);

  const { positions, targets, delays, scales } = useMemo(() => {
    const positions = build(formation.current, count, new Float32Array(count * 3));
    const targets = build(formation.current, count, new Float32Array(count * 3));
    const { delays, scales } = seeds(count);
    return { positions, targets, delays, scales };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 1 },
      uSize: { value: 26 },
      uDpr: { value: 1 },
      uRadius: { value: 1.1 },
      uStrength: { value: 0.42 },
      uDissipate: { value: 0 },
      uAlpha: { value: tune.alpha },
      uLight: { value: light ? 1 : 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uColor: { value: new THREE.Color(getScene().skillsColor) },
      uHot: { value: new THREE.Color(tune.hot) },
      uHiColor: { value: new THREE.Color(getScene().skillsHot) },
      uHiBucket: { value: -1 },
      uHiMix: { value: 0 },
      uBuckets: { value: getScene().skillsBuckets },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Re-aim when the DOM publishes a new formation. An interrupted morph is
  // baked to each particle's true eased position first, so it never snaps.
  useEffect(
    () =>
      subscribeScene(() => {
        const next = getScene().skillsFormation;
        if (next === formation.current || !geom.current) return;
        const p = progress.current;
        for (let i = 0; i < count; i++) {
          const e = easeFor(delays[i], p);
          for (let k = 0; k < 3; k++) {
            const j = i * 3 + k;
            positions[j] = positions[j] + (targets[j] - positions[j]) * e;
          }
        }
        build(next, count, targets);
        formation.current = next;
        progress.current = 0;
        geom.current.attributes.position.needsUpdate = true;
        geom.current.attributes.aTarget.needsUpdate = true;
      }),
    [count, delays, positions, targets],
  );

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const u = uniforms;
    u.uTime.value += d;
    u.uDpr.value = state.gl.getPixelRatio();
    if (progress.current < 1) progress.current = Math.min(1, progress.current + d / MORPH_S);
    u.uProgress.value = progress.current;

    const sc = getScene();
    const pw = px(size);
    u.uPointer.value.set((pointer.x * pw.worldW) / 2, (pointer.y * pw.worldH) / 2, 0);

    if (group.current) {
      if (sc.skillsRect) {
        const w = toWorld(sc.skillsRect, size);
        group.current.position.set(w.x, w.y, 0);
        const fit = (Math.min(sc.skillsRect.w, sc.skillsRect.h) * pw.perPixel) / 4.2;
        group.current.scale.setScalar(Math.max(0.35, fit));
        group.current.visible = true;
      } else {
        group.current.visible = false;
      }
      // A touch more life than before, still calm. Multiplied by delta, so the
      // speed is identical at 60/120/240Hz — a faster panel just renders it
      // more smoothly rather than spinning it faster.
      group.current.rotation.y += d * 0.26;
      group.current.rotation.x += d * 0.05;
    }

    // Every easing below is framerate-independent: pow(base, dt) converges at
    // the same rate per SECOND regardless of how many frames arrive.
    const k = 1 - Math.pow(0.01, d);
    (u.uColor.value as THREE.Color).lerp(new THREE.Color(sc.skillsColor), k);
    (u.uHiColor.value as THREE.Color).lerp(new THREE.Color(sc.skillsHot), k);
    u.uAlpha.value += (tune.alpha - u.uAlpha.value) * k;
    u.uLight.value += ((tune.additive ? 0 : 1) - u.uLight.value) * k;
    u.uBuckets.value = sc.skillsBuckets;

    // Selection: hold the bucket while fading the mix, so deselecting eases
    // out instead of cutting.
    const wantHi = sc.skillsHiBucket >= 0;
    if (wantHi) u.uHiBucket.value = sc.skillsHiBucket;
    const hiTarget = wantHi ? 1 : 0;
    u.uHiMix.value += (hiTarget - u.uHiMix.value) * (1 - Math.pow(0.004, d));
    if (!wantHi && u.uHiMix.value < 0.01) u.uHiBucket.value = -1;
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry ref={geom}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
          <bufferAttribute attach="attributes-aDelay" args={[delays, 1]} />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        </bufferGeometry>
        {/* Blending cannot be tweened, so the material is rebuilt on theme
            change — the eased uniforms cover the swap. */}
        <shaderMaterial
          key={tune.additive ? "add" : "normal"}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={tune.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

// A failed WebGL context must degrade, never take the page down with it.
class GLBoundary extends Component<{ children: ReactNode }, { dead: boolean }> {
  state = { dead: false };
  static getDerivedStateFromError() {
    return { dead: true };
  }
  componentDidCatch() {
    /* swallow — the site is fully usable without the canvas */
  }
  render() {
    return this.state.dead ? null : this.props.children;
  }
}

function Contents({ light, tier }: { light: boolean; tier: "low" | "mid" | "high" }) {
  const [, force] = useState(0);
  useEffect(() => subscribeScene(() => force((n) => n + 1)), []);
  const visible = getScene().skillsVisible;
  const count = tier === "low" ? 2600 : tier === "mid" ? 5000 : 9000;
  return visible ? <Swarm count={count} light={light} /> : null;
}

export default function Scene() {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [tier, setTier] = useState<"low" | "mid" | "high">("mid");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      webgl = !!gl;
      // Release the probe immediately — it counts against the context budget.
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setTier(narrow || cores <= 4 ? "low" : cores <= 8 ? "mid" : "high");
    setOk(webgl);
    setReady(true);
  }, []);

  // Keep the skills slot's rect current on one rAF loop.
  useEffect(() => {
    if (!ok) return;
    let raf = 0;
    const tick = () => {
      const s = measure(document.querySelector<HTMLElement>("[data-skills-slot]"));
      const prev = getScene();
      if (JSON.stringify(s) !== JSON.stringify(prev.skillsRect)) {
        setScene({ skillsRect: s, skillsVisible: !!s });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ok]);

  if (!ready || !ok) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[6]" aria-hidden>
      <GLBoundary>
        <Canvas
          dpr={[1, tier === "low" ? 1.25 : 1.6]}
          camera={{ position: [0, 0, CAM_Z], fov: FOV }}
          gl={{
            antialias: tier !== "low",
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
        >
          <Contents light={resolvedTheme === "light"} tier={tier} />
        </Canvas>
      </GLBoundary>
    </div>
  );
}
