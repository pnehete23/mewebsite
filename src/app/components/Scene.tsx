"use client";

// THE single WebGL canvas for the whole site.
//
// Everything three-related lives here: the golden stars that orbit the hero
// portrait, the load-in intro swarm, and the skills particle field. They share
// one context because the browser's context budget is small — especially on
// mobile, where four contexts meant "WebGL not supported" and a client-side
// crash.
//
// Because the canvas is fixed and full-viewport, anything that needs to sit
// over a DOM element (stars over the portrait, the skills field inside its
// section) is positioned by measuring that element and converting viewport
// pixels into world units against this camera. `px()` below is that bridge.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { build, easeFor, seeds, themeTuning, FRAG, MORPH_S, VERT } from "./particles/core";
import { getScene, measure, setScene, subscribeScene, type Rect } from "../lib/scene";
import { fireHandoff, willIntroRun } from "../lib/intro";

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

// ── Golden stars ─────────────────────────────────────────────────────────────
// Real extruded 5-point geometry, instanced. They orbit the hero portrait on
// slow elliptical paths, part around the cursor, and flare when it is close.

function GoldStars({ count, light }: { count: number; light: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { size, pointer } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Eased 0→1 presence, and the last known anchor so the fade-out happens in
  // place instead of snapping to the origin.
  const presence = useRef(0);
  const lastWorld = useRef({ x: 0, y: 0, r: 1 });

  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? 1 : 0.42;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 2,
      curveSegments: 1,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const h = (n: number) => {
        const s = Math.sin((i + 1) * n) * 43758.5453;
        return s - Math.floor(s);
      };
      return {
        // Orbit params, in multiples of the portrait radius.
        // Never inside 1.4× the portrait radius, so nothing crowds the face.
        // `spread` is scaled down on narrow screens — at full spread on a
        // 390px phone the outer stars drifted down over the hero quote.
        spread: h(1.7),
        squash: 0.55 + h(2.3) * 0.5,
        phase: h(3.1) * Math.PI * 2,
        speed: (0.1 + h(4.3) * 0.16) * (h(5.1) > 0.5 ? 1 : -1),
        tilt: (h(6.7) - 0.5) * 0.8,
        z: (h(7.3) - 0.5) * 1.4,
        // Fraction of the portrait radius, so they stay in proportion from a
        // 1440px desktop down to a 360px phone. ~30–48px across on desktop:
        // medium. At 0.3–0.5 they crowded the portrait and clipped the frame.
        scale: 0.12 + h(8.9) * 0.07,
        spin: 0.35 + h(9.7) * 0.5,
        // Wobble only — a free rotation axis turned stars edge-on, where the
        // thin extrusion reads as a brown plank instead of a star.
        wobble: 0.18 + h(10.1) * 0.16,
        pos: new THREE.Vector3(),
        flare: 0,
      };
    });
  }, [count]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const m = mesh.current;
    if (!m) return;

    const sc = getScene();
    // The stars belong to the portrait. When it scrolls away they fade out
    // rather than wandering over body copy — which is exactly what they did
    // on mobile, sitting on top of paragraphs.
    const visible = sc.anchor ? 1 : 0;
    presence.current += (visible - presence.current) * (1 - Math.pow(0.02, d));
    if (presence.current < 0.004) {
      if (m.visible) m.visible = false;
      return;
    }
    m.visible = true;

    const world = sc.anchor ? toWorld(sc.anchor, size) : lastWorld.current;
    lastWorld.current = world;

    const pw = px(size);
    const cursor = new THREE.Vector2(
      (pointer.x * pw.worldW) / 2,
      (pointer.y * pw.worldH) / 2,
    );

    const spreadK = size.width < 640 ? 0.45 : 1.15;

    stars.forEach((s, i) => {
      const a = t * s.speed + s.phase;
      const R = world.r * (1.45 + s.spread * spreadK);
      const tx = world.x + Math.cos(a) * R;
      const ty = world.y + Math.sin(a) * R * s.squash + Math.sin(t * 0.4 + s.phase) * 0.06;

      // Cursor interaction: stars near the pointer are pushed out and flare.
      const dx = tx - cursor.x;
      const dy = ty - cursor.y;
      const dist = Math.hypot(dx, dy);
      const near = Math.max(0, 1 - dist / 1.6);
      s.flare += (near - s.flare) * (1 - Math.pow(0.02, d));
      const push = s.flare * 0.55;

      const nx = tx + (dx / (dist || 1)) * push;
      const ny = ty + (dy / (dist || 1)) * push;
      // Ease toward the target so cursor pushes feel elastic, not instant.
      s.pos.x += (nx - s.pos.x) * (1 - Math.pow(0.005, d));
      s.pos.y += (ny - s.pos.y) * (1 - Math.pow(0.005, d));
      s.pos.z = s.z;

      dummy.position.copy(s.pos);
      // Spin in the screen plane, with a small tilt so facets still catch the
      // key light — but never far enough to present the extrusion edge-on.
      dummy.rotation.set(
        Math.sin(t * 0.5 + s.phase) * s.wobble,
        Math.cos(t * 0.42 + s.phase) * s.wobble,
        t * s.spin + s.phase,
      );
      dummy.scale.setScalar(world.r * s.scale * (1 + s.flare * 0.45) * presence.current);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={light ? 0.9 : 0.55} />
      <directionalLight position={[3, 4, 6]} intensity={light ? 2.2 : 2.8} color="#fff6dc" />
      <pointLight position={[-4, -2, 4]} intensity={light ? 8 : 14} distance={22} color="#ffb545" />
      <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
        {/* Lower metalness + a warmer emissive floor: at 0.9 metalness the
            faces turned away from the key light went muddy brown instead of
            reading as gold. */}
        <meshStandardMaterial
          color={light ? "#d1a02a" : "#ffd875"}
          metalness={0.55}
          roughness={0.3}
          emissive={light ? "#7a5510" : "#a87a12"}
          emissiveIntensity={light ? 0.3 : 0.75}
        />
      </instancedMesh>
    </>
  );
}

// ── Shared particle swarm (intro + skills) ──────────────────────────────────

function Swarm({
  count,
  mode,
  light,
}: {
  count: number;
  mode: "intro" | "skills";
  light: boolean;
}) {
  const geom = useRef<THREE.BufferGeometry>(null);
  const group = useRef<THREE.Group>(null);
  const progress = useRef(mode === "intro" ? 0 : 1);
  const clock = useRef(0);
  const handed = useRef(false);
  const formation = useRef(getScene().skillsFormation);
  const { size, pointer } = useThree();
  const tune = themeTuning(light);

  const { positions, targets, delays, scales } = useMemo(() => {
    const start = mode === "intro" ? "cloud" : formation.current;
    const positions = build(start, count, new Float32Array(count * 3));
    if (mode === "intro") for (let i = 0; i < positions.length; i++) positions[i] *= 2.6;
    const targets = build(mode === "intro" ? "sphere" : formation.current, count, new Float32Array(count * 3));
    const { delays, scales } = seeds(count);
    return { positions, targets, delays, scales };
  }, [count, mode]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: progress.current },
      uSize: { value: mode === "intro" ? 30 : 26 },
      uDpr: { value: 1 },
      uRadius: { value: 1.1 },
      uStrength: { value: 0.42 },
      uDissipate: { value: 0 },
      uAlpha: { value: tune.alpha },
      uLight: { value: light ? 1 : 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uColor: { value: new THREE.Color(getScene().skillsColor) },
      uHot: { value: new THREE.Color(tune.hot) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode],
  );

  // Skills mode: re-aim when the DOM publishes a new formation.
  useEffect(() => {
    if (mode !== "skills") return;
    return subscribeScene(() => {
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
    });
  }, [mode, count, delays, positions, targets]);

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

    if (mode === "intro") {
      clock.current += d;
      const t = clock.current;
      if (t > 1.55) {
        const k = Math.min(1, (t - 1.55) / 1.05);
        u.uDissipate.value = k * k * (3 - 2 * k);
      }
      if (!handed.current && t >= 1.75) {
        handed.current = true;
        fireHandoff();
      }
      if (group.current) group.current.rotation.y += d * (0.16 + Math.max(0, t - 1.55) * 0.5);
      return;
    }

    // Skills mode: park the swarm over its DOM slot and scale to fit it.
    if (group.current) {
      if (sc.skillsRect) {
        const w = toWorld(sc.skillsRect, size);
        group.current.position.set(w.x, w.y, 0);
        const fit = (Math.min(sc.skillsRect.w, sc.skillsRect.h) * px(size).perPixel) / 4.2;
        group.current.scale.setScalar(Math.max(0.35, fit));
        group.current.visible = true;
      } else {
        group.current.visible = false;
      }
      group.current.rotation.y += d * 0.12;
    }
    (u.uColor.value as THREE.Color).lerp(new THREE.Color(sc.skillsColor), 1 - Math.pow(0.01, d));
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
  const sc = getScene();
  const stars = tier === "low" ? 7 : tier === "mid" ? 10 : 13;
  const swarm = tier === "low" ? 2600 : tier === "mid" ? 5000 : 9000;

  return (
    <>
      <GoldStars count={stars} light={light} />
      {sc.introRunning && <Swarm key="intro" count={swarm} mode="intro" light={light} />}
      {sc.skillsVisible && <Swarm key="skills" count={swarm} mode="skills" light={light} />}
    </>
  );
}

export default function Scene() {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [tier, setTier] = useState<"low" | "mid" | "high">("mid");
  // The intro backdrop sits at z-110; the canvas has to clear it while the
  // swarm is the whole show, then drop back beneath the page content.
  const [onTop, setOnTop] = useState(false);
  useEffect(() => subscribeScene(() => setOnTop(getScene().introRunning)), []);

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

  // Keep every tracked element's rect current on the site's one rAF driver.
  useEffect(() => {
    if (!ok) return;
    let raf = 0;
    const tick = () => {
      const anchorEl = document.querySelector<HTMLElement>("[data-star-anchor]");
      const skillsEl = document.querySelector<HTMLElement>("[data-skills-slot]");
      const a = measure(anchorEl);
      const s = measure(skillsEl);
      const prev = getScene();
      // Only publish when something meaningfully moved.
      const changed =
        JSON.stringify(a) !== JSON.stringify(prev.anchor) ||
        JSON.stringify(s) !== JSON.stringify(prev.skillsRect);
      if (changed) setScene({ anchor: a, skillsRect: s, skillsVisible: !!s });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ok]);

  if (!ready || !ok) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 ${onTop ? "z-[130]" : "z-[6]"}`}
      aria-hidden
    >
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

export { willIntroRun };
