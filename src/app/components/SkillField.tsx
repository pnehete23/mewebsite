"use client";

// GPU particle field for the Skills section.
//
// One BufferGeometry of N points is reused for every domain; each domain owns a
// procedural *formation* (sphere, torus, helix, …). Switching domains does not
// rebuild the geometry — it writes a new target attribute and lets a custom
// GLSL vertex shader interpolate, so the morph costs one attribute upload and
// runs entirely on the GPU. Per-particle delay + an outward bulge make the
// swarm swing between shapes instead of sliding in a straight line.
//
// Everything expensive lives in the shader: drift, pointer repulsion, size
// attenuation and the soft radial sprite. The CPU only bakes positions when a
// morph is interrupted, which keeps interrupted transitions continuous.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Formation =
  | "sphere"
  | "torus"
  | "lattice"
  | "helix"
  | "wave"
  | "spiral"
  | "cone"
  | "cloud";

// Morph duration in seconds. Slow enough to read as a journey, short enough
// that clicking through domains never feels like waiting.
const MORPH_S = 1.35;
// How much of the timeline is given away to per-particle stagger.
const STAGGER = 0.45;

// Matches the shader's easing exactly so an interrupted morph can be baked to
// the particle's true on-screen position without a visible jump.
function easeFor(delay: number, progress: number) {
  const span = 1 - delay * STAGGER;
  const p = Math.min(1, Math.max(0, (progress - delay * STAGGER) / span));
  return p * p * (3 - 2 * p);
}

// ── Formations ───────────────────────────────────────────────────────────────
// Each fills `out` with `count` xyz triples inside roughly a unit-2 sphere, so
// every shape occupies a similar volume and morphs read as a re-arrangement
// rather than a scale change.
function build(kind: Formation, count: number, out: Float32Array) {
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x = 0;
    let y = 0;
    let z = 0;

    switch (kind) {
      case "sphere": {
        // Fibonacci sphere — even coverage, no polar clumping.
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = GOLDEN * i;
        const r = 1.75;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case "torus": {
        const u = t * Math.PI * 2 * 7;
        const v = GOLDEN * i;
        const R = 1.5;
        const r = 0.5;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = (R + r * Math.cos(v)) * Math.sin(u);
        z = r * Math.sin(v);
        break;
      }
      case "lattice": {
        // Cubic grid — the "structured data" shape.
        const n = Math.ceil(Math.cbrt(count));
        const ix = i % n;
        const iy = Math.floor(i / n) % n;
        const iz = Math.floor(i / (n * n)) % n;
        const s = 2.6 / (n - 1 || 1);
        x = ix * s - 1.3;
        y = iy * s - 1.3;
        z = iz * s - 1.3;
        break;
      }
      case "helix": {
        // Double helix — two strands offset by π.
        const strand = i % 2 === 0 ? 0 : Math.PI;
        const u = t * Math.PI * 2 * 4;
        x = Math.cos(u + strand) * 1.05;
        y = t * 3.4 - 1.7;
        z = Math.sin(u + strand) * 1.05;
        break;
      }
      case "wave": {
        const n = Math.ceil(Math.sqrt(count));
        const ix = i % n;
        const iy = Math.floor(i / n);
        const u = (ix / (n - 1 || 1)) * 2 - 1;
        const v = (iy / (n - 1 || 1)) * 2 - 1;
        x = u * 1.9;
        z = v * 1.9;
        y = Math.sin(u * 3.2) * Math.cos(v * 3.2) * 0.72;
        break;
      }
      case "spiral": {
        // Galaxy — four arms, density falling off toward the rim.
        const arm = (i % 4) * ((Math.PI * 2) / 4);
        const d = Math.pow(t, 0.62);
        const u = d * Math.PI * 2.4 + arm;
        const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        x = Math.cos(u) * d * 2.05 + jitter * 0.18;
        z = Math.sin(u) * d * 2.05 - jitter * 0.18;
        y = (jitter - 0.5) * 0.5 * (1 - d);
        break;
      }
      case "cone": {
        const u = GOLDEN * i;
        const d = Math.sqrt(t);
        x = Math.cos(u) * d * 1.6;
        z = Math.sin(u) * d * 1.6;
        y = 1.7 - d * 3.2;
        break;
      }
      default: {
        // Nebula — deterministic hash so SSR and client agree.
        const h = (n: number) => {
          const s = Math.sin(i * n) * 43758.5453;
          return (s - Math.floor(s)) * 2 - 1;
        };
        const r = 1.85 * Math.pow(Math.abs(h(1.7)), 0.45);
        const phi = Math.acos(h(3.1));
        const theta = h(5.3) * Math.PI;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
        z = r * Math.cos(phi);
      }
    }

    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uDpr;
  uniform float uRadius;
  uniform float uStrength;
  uniform vec3  uPointer;

  attribute vec3  aTarget;
  attribute float aDelay;
  attribute float aScale;

  varying float vAlpha;
  varying float vPush;

  void main() {
    // Per-particle stagger: later particles start later but all land together.
    float span = 1.0 - aDelay * ${STAGGER.toFixed(2)};
    float p = clamp((uProgress - aDelay * ${STAGGER.toFixed(2)}) / span, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);

    vec3 pos = mix(position, aTarget, p);

    // Swing outward at the midpoint so the swarm arcs between formations.
    float bulge = sin(p * 3.14159265);
    pos += normalize(pos + 0.0001) * bulge * 0.5 * aScale;

    // Cheap pseudo-curl drift — keeps the field alive while it sits still.
    float t = uTime * 0.28;
    pos += vec3(
      sin(pos.y * 0.8 + t),
      cos(pos.z * 0.7 + t * 0.9),
      sin(pos.x * 0.6 + t * 1.1)
    ) * 0.055;

    // Pointer repulsion — the swarm parts around the cursor.
    vec2 diff = pos.xy - uPointer.xy;
    float d = length(diff);
    float f = 1.0 - smoothstep(0.0, uRadius, d);
    pos.xy += normalize(diff + 0.0001) * f * uStrength;
    vPush = f;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * aScale * uDpr * (1.0 / max(-mv.z, 0.001));
    gl_Position = projectionMatrix * mv;

    vAlpha = 0.30 + 0.55 * aScale + bulge * 0.25;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vAlpha;
  varying float vPush;

  void main() {
    // Soft radial sprite — no texture needed.
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 2.0);
    // Particles shoved by the cursor flare toward the hot colour.
    vec3 c = mix(uColor, uHot, clamp(vPush * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(c, a * vAlpha);
    #include <colorspace_fragment>
  }
`;

function Swarm({
  count,
  formation,
  color,
}: {
  count: number;
  formation: Formation;
  color: string;
}) {
  const geom = useRef<THREE.BufferGeometry>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const progress = useRef(1);
  const { viewport, pointer } = useThree();

  // Buffers are allocated once and mutated in place — no per-morph GC churn.
  const { positions, targets, delays, scales } = useMemo(() => {
    const positions = build(formation, count, new Float32Array(count * 3));
    const targets = new Float32Array(positions);
    const delays = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const s = Math.sin(i * 78.233) * 43758.5453;
      const r = s - Math.floor(s);
      delays[i] = r;
      // Long tail of small particles, a few bright large ones.
      scales[i] = 0.35 + Math.pow(r, 3) * 1.5;
    }
    return { positions, targets, delays, scales };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 1 },
      uSize: { value: 26 },
      uDpr: { value: 1 },
      uRadius: { value: 1.1 },
      uStrength: { value: 0.42 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uColor: { value: new THREE.Color(color) },
      uHot: { value: new THREE.Color("#ffffff") },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Morph: bake where every particle actually is, then aim at the new shape
  useEffect(() => {
    if (!geom.current) return;
    const p = progress.current;
    if (p < 1) {
      // Interrupted mid-flight — freeze the true eased position as the new
      // origin so the swarm never snaps.
      for (let i = 0; i < count; i++) {
        const e = easeFor(delays[i], p);
        for (let k = 0; k < 3; k++) {
          const j = i * 3 + k;
          positions[j] = positions[j] + (targets[j] - positions[j]) * e;
        }
      }
    } else {
      positions.set(targets);
    }
    build(formation, count, targets);
    progress.current = 0;
    geom.current.attributes.position.needsUpdate = true;
    geom.current.attributes.aTarget.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation, count]);

  // Colour eases toward the active domain rather than cutting.
  const target = useMemo(() => new THREE.Color(color), [color]);
  useEffect(() => {
    target.set(color);
  }, [color, target]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05); // clamp: tab-switch shouldn't jump the morph
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + d / MORPH_S);
    }
    const u = uniforms;
    u.uTime.value += d;
    u.uProgress.value = progress.current;
    u.uDpr.value = state.gl.getPixelRatio();
    (u.uColor.value as THREE.Color).lerp(target, 1 - Math.pow(0.002, d));

    // NDC pointer → world units on the z=0 plane.
    (u.uPointer.value as THREE.Vector3).set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );

    if (group.current) {
      // Slow drift plus a gentle lean toward the cursor — parallax, not spin.
      group.current.rotation.y += d * 0.12;
      group.current.rotation.x +=
        (pointer.y * 0.22 - group.current.rotation.x) * (1 - Math.pow(0.01, d));
    }
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
          ref={mat}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function SkillField({
  formation,
  color,
  active,
  count,
}: {
  formation: Formation;
  color: string;
  /** Drives frameloop — the GPU idles completely when the section is offscreen. */
  active: boolean;
  count: number;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 5.4], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Swarm count={count} formation={formation} color={color} />
    </Canvas>
  );
}
