"use client";

// Golden stars that drift around text as it arrives.
//
// These are real geometry, not sprites: a 5-pointed THREE.Shape run through
// ExtrudeGeometry with a bevel, so each star has thickness and bevelled facets
// that catch a specular hit as it turns. One InstancedMesh draws the whole
// field in a single call, so the count is nearly free.
//
// Motion is settle-based rather than looped: an arrival injects energy, each
// star drifts on its own bearing with damped velocity, and everything eases
// back to rest. Nothing plays on a fixed repeating cycle.

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STAR_EVENT } from "../lib/stars";

function starGeometry() {
  const shape = new THREE.Shape();
  const spikes = 5;
  const outer = 1;
  const inner = 0.42;
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
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelSegments: 2,
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
  energy: number;
};

function Field({ count, reduced }: { count: number; reduced: boolean }) {
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
      out.push({
        base: new THREE.Vector3((h(1.3) - 0.5) * 9, (h(2.7) - 0.5) * 5.4, (h(4.1) - 0.5) * 2.5 - 0.5),
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        axis: new THREE.Vector3(h(5.5) - 0.5, h(6.7) - 0.5, h(7.9) - 0.5).normalize(),
        spin: 0.25 + h(8.3) * 0.5,
        // Medium — reads as a star, never a speck or a prop.
        scale: 0.1 + h(9.1) * 0.075,
        phase: h(10.3) * Math.PI * 2,
        energy: 0,
      });
    }
    out.forEach((s) => s.pos.copy(s.base));
    return out;
  }, [count]);

  // An arrival nudges nearby stars: energy in, plus a small outward impulse
  // from the text's position so they scatter away from the words.
  useEffect(() => {
    const on = (e: Event) => {
      const { x = 0.5, y = 0.5 } = (e as CustomEvent).detail ?? {};
      const wx = (x - 0.5) * 9;
      const wy = -(y - 0.5) * 5.4;
      stars.forEach((s) => {
        const d = Math.hypot(s.base.x - wx, s.base.y - wy);
        const near = Math.max(0, 1 - d / 6);
        s.energy = Math.min(1, s.energy + 0.55 + near * 0.45);
        s.vel.x += (s.base.x - wx) * 0.012 * near;
        s.vel.y += (s.base.y - wy) * 0.012 * near + 0.01 * near;
      });
    };
    window.addEventListener(STAR_EVENT, on);
    return () => window.removeEventListener(STAR_EVENT, on);
  }, [stars]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;

    stars.forEach((s, i) => {
      // Energy bleeds off — stars settle instead of cycling forever.
      s.energy = Math.max(0, s.energy - d * 0.12);

      // Damped drift toward a slowly wandering anchor.
      const anchor = {
        x: s.base.x + Math.sin(t * 0.18 + s.phase) * 0.22,
        y: s.base.y + Math.cos(t * 0.14 + s.phase * 1.3) * 0.26,
      };
      s.vel.x += (anchor.x - s.pos.x) * 0.9 * d;
      s.vel.y += (anchor.y - s.pos.y) * 0.9 * d;
      s.vel.multiplyScalar(Math.pow(0.12, d));
      s.pos.x += s.vel.x;
      s.pos.y += s.vel.y;
      s.pos.z = s.base.z;

      dummy.position.copy(s.pos);
      // Turn on the star's own axis so bevels sweep through the highlight.
      const angle = t * s.spin + s.phase;
      dummy.quaternion.setFromAxisAngle(s.axis, angle);
      const pop = 0.35 + 0.65 * (reduced ? 1 : s.energy);
      dummy.scale.setScalar(s.scale * pop);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Key light rakes across the facets; the rim keeps the dark side legible. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#fff4d0" />
      <pointLight position={[-4, -2, 3]} intensity={12} distance={18} color="#ffb545" />
      <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial
          color="#f2c14e"
          metalness={0.92}
          roughness={0.22}
          emissive="#5a3c05"
          emissiveIntensity={0.45}
          transparent
          opacity={0.95}
        />
      </instancedMesh>
    </>
  );
}

export default function GoldenStars() {
  const [count, setCount] = useState(26);
  const [live, setLive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setCount(narrow ? 10 : cores <= 4 ? 16 : 26);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Render only while there is something to see — the canvas idles otherwise.
  useEffect(() => {
    const on = () => {
      setLive(true);
      if (idle.current) clearTimeout(idle.current);
      idle.current = setTimeout(() => setLive(false), 14000);
    };
    window.addEventListener(STAR_EVENT, on);
    return () => {
      window.removeEventListener(STAR_EVENT, on);
      if (idle.current) clearTimeout(idle.current);
    };
  }, []);

  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden>
      <Canvas
        frameloop={live ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Field count={count} reduced={reduced} />
      </Canvas>
    </div>
  );
}
