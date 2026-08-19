"use client";

// The intro swarm — same shader as the skills field, run as a one-shot
// timeline instead of an interactive one.
//
// Timeline (seconds, `SPAN` scales the whole thing down on mobile):
//   0.00 → gather    particles converge out of a scattered cloud into a sphere
//   0.95 → hold      slow rotation, camera eases in
//   1.55 → dissipate uDissipate 0→1: the field tears outward and fades
//   1.75 → HANDOFF   fired mid-blast, so the hero rises while particles are
//                    still flying — the two motions overlap rather than cut
//   2.60 → done      canvas unmounts
//
// The hand-off firing *during* dissipation is the whole point: there is never
// a frame where nothing is moving.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { build, seeds, themeTuning, FRAG, VERT } from "./particles/core";

const T_GATHER = 0.95;
const T_HOLD = 1.55;
const T_HANDOFF = 1.75;
const T_END = 2.6;

function IntroSwarm({
  count,
  span,
  light,
  onHandoff,
  onDone,
}: {
  count: number;
  span: number;
  light: boolean;
  onHandoff: () => void;
  onDone: () => void;
}) {
  const tune = themeTuning(light);
  const group = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const firedHandoff = useRef(false);
  const firedDone = useRef(false);
  const { camera } = useThree();

  const { positions, targets, delays, scales } = useMemo(() => {
    // Start scattered, land on a sphere — the gather reads as "assembling".
    const positions = build("cloud", count, new Float32Array(count * 3));
    for (let i = 0; i < positions.length; i++) positions[i] *= 2.6;
    const targets = build("sphere", count, new Float32Array(count * 3));
    const { delays, scales } = seeds(count);
    return { positions, targets, delays, scales };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: light ? 26 : 30 },
      uDpr: { value: 1 },
      uRadius: { value: 1.3 },
      uStrength: { value: 0.5 },
      uDissipate: { value: 0 },
      uAlpha: { value: tune.alpha },
      uLight: { value: light ? 1 : 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      // Deep indigo on white, luminous violet on black.
      uColor: { value: new THREE.Color(light ? "hsl(258, 68%, 42%)" : "hsl(266, 82%, 64%)") },
      uHot: { value: new THREE.Color(light ? "#b8860b" : "#ffe9a8") },
    }),
    // Theme is fixed for the ~2.6s the intro lives; no need to re-tune mid-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    clock.current += d / span;
    const t = clock.current;
    const u = uniforms;
    u.uTime.value += d;
    u.uDpr.value = state.gl.getPixelRatio();

    // Gather.
    u.uProgress.value = Math.min(1, t / T_GATHER);

    // Dissipate — starts the instant the hold ends, easing out of the hold's
    // rotation speed rather than restarting motion from zero.
    if (t > T_HOLD) {
      const k = Math.min(1, (t - T_HOLD) / (T_END - T_HOLD));
      u.uDissipate.value = k * k * (3 - 2 * k);
    }

    if (!firedHandoff.current && t >= T_HANDOFF) {
      firedHandoff.current = true;
      onHandoff();
    }
    if (!firedDone.current && t >= T_END) {
      firedDone.current = true;
      onDone();
    }

    if (group.current) {
      // Rotation accelerates slightly into the blast so the tear has spin.
      const spin = 0.16 + Math.max(0, t - T_HOLD) * 0.5;
      group.current.rotation.y += d * spin;
      group.current.rotation.x = Math.sin(t * 0.6) * 0.12;
    }
    // Camera eases in through the hold, then pulls back as the field bursts —
    // the pull-back is what carries the eye down into the hero.
    const z = t < T_HOLD ? 6.4 - Math.min(1, t / T_HOLD) * 1.1 : 5.3 + (t - T_HOLD) * 1.4;
    camera.position.z += (z - camera.position.z) * (1 - Math.pow(0.005, d));
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
          <bufferAttribute attach="attributes-aDelay" args={[delays, 1]} />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
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

export default function IntroField({
  count,
  span,
  onHandoff,
  onDone,
}: {
  count: number;
  span: number;
  onHandoff: () => void;
  onDone: () => void;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6.4], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <IntroSwarm
        count={count}
        span={span}
        light={resolvedTheme === "light"}
        onHandoff={onHandoff}
        onDone={onDone}
      />
    </Canvas>
  );
}
