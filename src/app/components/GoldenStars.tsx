"use client";

// Ambient golden stars.
//
// A permanent atmospheric layer, not a per-section effect: mounted once in the
// layout so it survives route changes, always drifting, never restarting. It
// is purely decorative — pointer-events off, aria-hidden, and it sits at z-5,
// under the page content at z-10, so text is never overlaid.
//
// These are real geometry, not sprites: a 5-pointed THREE.Shape run through
// ExtrudeGeometry so each star has thickness and bevelled facets that catch a
// specular glint as it turns. One InstancedMesh draws the field in a single
// call. The read is deliberately fine — small, sparse and low-opacity — so it
// registers as glinting detail rather than confetti.
//
// Both themes are tuned separately: warm metal + faint emissive on dark; a
// deeper, more saturated gold at lower opacity on light, where a bright gold
// would vanish against white.

import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Column (in world units) where page content lives. Stars fade out across it
// so they thin over dense text instead of sitting on top of it.
const CONTENT_HALF_WIDTH = 2.6;

function starGeometry() {
  const shape = new THREE.Shape();
  const spikes = 5;
  const outer = 1;
  // Deep notch → long thin points. A fatter inner radius reads as a blob.
  const inner = 0.3;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    // Thin plate — the old 0.34 depth is what made these look chunky.
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 1,
    curveSegments: 1,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

type Star = {
  base: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number;
  scale: number;
  phase: number;
  fade: number;
};

function Field({ count, light }: { count: number; light: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => starGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stars = useMemo<Star[]>(() => {
    const out: Star[] = [];
    for (let i = 0; i < count; i++) {
      const h = (n: number) => {
        const s = Math.sin((i + 1) * n) * 43758.5453;
        return s - Math.floor(s);
      };
      // Biased toward the edges: 1 - (1-u)^2 pushes |x| outward, keeping the
      // middle of the screen — where the text is — comparatively clear.
      const ux = h(1.3) * 2 - 1;
      const x = Math.sign(ux) * (1 - Math.pow(1 - Math.abs(ux), 2)) * 6.4;
      const base = new THREE.Vector3(x, (h(2.7) - 0.5) * 6.2, (h(4.1) - 0.5) * 2 - 1.2);
      // Dim anything that still lands over the content column.
      const overContent = 1 - Math.min(1, Math.abs(x) / CONTENT_HALF_WIDTH);
      out.push({
        base,
        pos: base.clone(),
        vel: new THREE.Vector3(),
        axis: new THREE.Vector3(h(5.5) - 0.5, h(6.7) - 0.5, h(7.9) - 0.5).normalize(),
        spin: 0.12 + h(8.3) * 0.22,
        // Small. These are glints, not ornaments.
        scale: 0.032 + h(9.1) * 0.03,
        phase: h(10.3) * Math.PI * 2,
        fade: 1 - overContent * 0.8,
      });
    }
    return out;
  }, [count]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;

    stars.forEach((s, i) => {
      // Damped drift toward a slowly wandering anchor. Two incommensurate
      // frequencies per axis, so the path never visibly repeats.
      const ax = s.base.x + Math.sin(t * 0.11 + s.phase) * 0.3 + Math.sin(t * 0.043 + s.phase * 2.1) * 0.18;
      const ay = s.base.y + Math.cos(t * 0.09 + s.phase * 1.3) * 0.34 + Math.cos(t * 0.037 + s.phase) * 0.16;
      s.vel.x += (ax - s.pos.x) * 0.8 * d;
      s.vel.y += (ay - s.pos.y) * 0.8 * d;
      s.vel.multiplyScalar(Math.pow(0.14, d));
      s.pos.x += s.vel.x;
      s.pos.y += s.vel.y;
      s.pos.z = s.base.z;

      dummy.position.copy(s.pos);
      dummy.quaternion.setFromAxisAngle(s.axis, t * s.spin + s.phase);
      // Breathe the scale a touch so glints come and go without a hard cycle.
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.5 + s.phase * 1.7);
      dummy.scale.setScalar(s.scale * s.fade * breathe);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Light mode needs a flatter, cooler key — a hot key on a white page
          blows the metal out to near-white and the stars disappear. */}
      <ambientLight intensity={light ? 0.85 : 0.5} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={light ? 1.5 : 2.2}
        color={light ? "#ffffff" : "#fff4d0"}
      />
      <pointLight
        position={[-4, -2, 3]}
        intensity={light ? 5 : 10}
        distance={18}
        color={light ? "#e0a838" : "#ffb545"}
      />
      <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial
          // Deeper, more saturated gold on light; brighter leaf on dark.
          color={light ? "#b8860b" : "#f0c65a"}
          metalness={light ? 0.75 : 0.9}
          roughness={light ? 0.35 : 0.24}
          emissive={light ? "#000000" : "#4a3104"}
          emissiveIntensity={light ? 0 : 0.35}
          transparent
          opacity={light ? 0.42 : 0.55}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}

export default function GoldenStars() {
  const [count, setCount] = useState(14);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    // Sparse on purpose — atmosphere, not confetti.
    setCount(narrow ? 6 : cores <= 4 ? 9 : 14);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!mounted || reduced) return null;

  const light = resolvedTheme === "light";

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Remount the field on theme change so material/lighting swap cleanly. */}
        <Field key={light ? "light" : "dark"} count={count} light={light} />
      </Canvas>
    </div>
  );
}
