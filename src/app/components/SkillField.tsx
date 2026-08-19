"use client";

// GPU particle field for the Skills section. Shader + formations come from
// ./particles/core so the intro overlay and this field are literally the same
// system — switching domains uploads one attribute and the GPU does the rest.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import {
  build,
  easeFor,
  seeds,
  themeTuning,
  FRAG,
  MORPH_S,
  VERT,
  type Formation,
} from "./particles/core";

export type { Formation };

function Swarm({
  count,
  formation,
  color,
  light,
}: {
  count: number;
  formation: Formation;
  color: string;
  light: boolean;
}) {
  const tune = themeTuning(light);
  const geom = useRef<THREE.BufferGeometry>(null);
  const group = useRef<THREE.Group>(null);
  const progress = useRef(1);
  const { viewport, pointer } = useThree();

  // Buffers are allocated once and mutated in place — no per-morph GC churn.
  const { positions, targets, delays, scales } = useMemo(() => {
    const positions = build(formation, count, new Float32Array(count * 3));
    const targets = new Float32Array(positions);
    const { delays, scales } = seeds(count);
    return { positions, targets, delays, scales };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 1 },
      uSize: { value: tune.size },
      uDpr: { value: 1 },
      uRadius: { value: 1.1 },
      uStrength: { value: 0.42 },
      uDissipate: { value: 0 },
      uAlpha: { value: tune.alpha },
      uLight: { value: light ? 1 : 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uColor: { value: new THREE.Color(color) },
      uHot: { value: new THREE.Color(tune.hot) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Morph: bake where every particle actually is, then aim at the new shape
  useEffect(() => {
    if (!geom.current) return;
    const p = progress.current;
    if (p < 1) {
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

  const target = useMemo(() => new THREE.Color(color), [color]);
  useEffect(() => {
    target.set(color);
  }, [color, target]);

  // Theme flips are eased, not cut: uAlpha/uSize/uLight are lerped in the frame
  // loop below and uColor already eases, so toggling light/dark cross-fades.
  const themeTargets = useRef(tune);
  themeTargets.current = tune;
  const hotTarget = useMemo(() => new THREE.Color(tune.hot), [tune.hot]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    if (progress.current < 1) progress.current = Math.min(1, progress.current + d / MORPH_S);
    const u = uniforms;
    u.uTime.value += d;
    u.uProgress.value = progress.current;
    u.uDpr.value = state.gl.getPixelRatio();
    (u.uColor.value as THREE.Color).lerp(target, 1 - Math.pow(0.002, d));

    // Ease every theme-dependent uniform toward its target.
    const k = 1 - Math.pow(0.01, d);
    const tt = themeTargets.current;
    u.uAlpha.value += (tt.alpha - u.uAlpha.value) * k;
    u.uSize.value += (tt.size - u.uSize.value) * k;
    u.uLight.value += ((tt.additive ? 0 : 1) - u.uLight.value) * k;
    (u.uHot.value as THREE.Color).lerp(hotTarget, k);
    (u.uPointer.value as THREE.Vector3).set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );
    if (group.current) {
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
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === "light";
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 5.4], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Swarm count={count} formation={formation} color={color} light={light} />
    </Canvas>
  );
}
