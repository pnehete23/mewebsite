"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Group, BufferAttribute } from "three";
import type { MotionValue } from "framer-motion";

export type SphereAxis = {
  axis: string;
  value: number;
  tools: string[];
};

// Bright star hues per axis — index matches the order of axes passed in.
// These read as glowing stars against the dark sky panel in BOTH themes
// (the panel is intentionally dark in light mode so additive glow pops).
const AXIS_HEX = [
  "#60a5fa", // blue
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#f472b6", // pink
  "#fb7185", // rose
  "#fbbf24", // amber
  "#facc15", // yellow
  "#4ade80", // green
];

type ToolMeta = { axisIndex: number; label: string; value: number };

// Even point distribution on a unit sphere (golden-angle spiral).
function fib(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1);
  for (let i = 0; i < n; i++) {
    const y = n <= 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
  }
  return pts;
}

type Layout = {
  hubPos: Float32Array;
  hubColor: Float32Array;
  toolPos: Float32Array;
  toolColorBase: Float32Array; // immutable source colors
  toolMeta: ToolMeta[];
  linePos: Float32Array;
};

// Build a "galaxy of constellations": each axis is a hub on a sphere, its
// tools cluster around it, and faint lines wire each tool back to its hub.
function buildLayout(data: SphereAxis[]): Layout {
  const R = 1.55;
  const spread = 0.62;
  const hubDirs = fib(data.length);

  const hubPos = new Float32Array(data.length * 3);
  const hubColor = new Float32Array(data.length * 3);

  const toolPosArr: number[] = [];
  const toolColorArr: number[] = [];
  const toolMeta: ToolMeta[] = [];
  const lineArr: number[] = [];
  const col = new THREE.Color();

  data.forEach((d, ai) => {
    const dir = hubDirs[ai];
    const hub = dir.clone().multiplyScalar(R);
    hubPos[ai * 3] = hub.x;
    hubPos[ai * 3 + 1] = hub.y;
    hubPos[ai * 3 + 2] = hub.z;

    col.set(AXIS_HEX[ai % AXIS_HEX.length]);
    hubColor[ai * 3] = col.r;
    hubColor[ai * 3 + 1] = col.g;
    hubColor[ai * 3 + 2] = col.b;

    const local = fib(d.tools.length);
    d.tools.forEach((t, ti) => {
      const off = local[ti]
        .clone()
        .multiplyScalar(spread * (0.7 + 0.3 * Math.random()));
      const p = hub
        .clone()
        .add(off)
        .add(dir.clone().multiplyScalar(0.18 * Math.random()));
      toolPosArr.push(p.x, p.y, p.z);
      toolColorArr.push(col.r, col.g, col.b);
      toolMeta.push({ axisIndex: ai, label: t, value: d.value });
      lineArr.push(hub.x, hub.y, hub.z, p.x, p.y, p.z);
    });
  });

  return {
    hubPos,
    hubColor,
    toolPos: new Float32Array(toolPosArr),
    toolColorBase: new Float32Array(toolColorArr),
    toolMeta,
    linePos: new Float32Array(lineArr),
  };
}

// Soft radial sprite — gives every point a glowing-star falloff.
function makeGlowTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.22, "rgba(255,255,255,0.9)");
  g.addColorStop(0.5, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Distant background dust — a deep field of faint stars for parallax depth.
function makeDust(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(3.0 + Math.random() * 2.4);
    pos[i * 3] = v.x;
    pos[i * 3 + 1] = v.y;
    pos[i * 3 + 2] = v.z;
  }
  return pos;
}

function Scene({
  layout,
  glow,
  isMobile,
  reducedMotion,
  scrollProgress,
  activeAxis,
  hoverTool,
  setHoverTool,
  userInteracting,
}: {
  layout: Layout;
  glow: THREE.Texture;
  isMobile: boolean;
  reducedMotion: boolean;
  scrollProgress?: MotionValue<number>;
  activeAxis: number | null;
  hoverTool: number | null;
  setHoverTool: (i: number | null) => void;
  userInteracting: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const dustRef = useRef<Group>(null);
  const toolColorRef = useRef<BufferAttribute>(null);
  const { gl } = useThree();

  useEffect(() => {
    if (!isMobile) gl.domElement.style.cursor = "grab";
  }, [gl, isMobile]);

  const dust = useMemo(() => makeDust(isMobile ? 220 : 420), [isMobile]);

  // Recolor tools when a category is focused (legend / hover). 48 verts → free.
  useEffect(() => {
    const attr = toolColorRef.current;
    if (!attr) return;
    const base = layout.toolColorBase;
    for (let i = 0; i < layout.toolMeta.length; i++) {
      const on = activeAxis === null || layout.toolMeta[i].axisIndex === activeAxis;
      const k = on ? 1 : 0.14;
      attr.setXYZ(i, base[i * 3] * k, base[i * 3 + 1] * k, base[i * 3 + 2] * k);
    }
    attr.needsUpdate = true;
  }, [activeAxis, layout]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const sp = scrollProgress?.get() ?? 0;
    const g = groupRef.current;
    if (g) {
      const idle = !reducedMotion && !userInteracting && hoverTool === null;
      if (idle) {
        g.rotation.y += dt * (isMobile ? 0.14 : 0.2);
        g.rotation.x += dt * 0.03;
      }
      // Scroll ties a gentle banking roll so the galaxy feels page-aware.
      g.rotation.z = sp * Math.PI * 0.4;
    }
    if (dustRef.current && !reducedMotion) {
      dustRef.current.rotation.y -= dt * 0.025;
      dustRef.current.rotation.x += dt * 0.008;
    }
  });

  const hoverPos =
    hoverTool != null
      ? new THREE.Vector3(
          layout.toolPos[hoverTool * 3],
          layout.toolPos[hoverTool * 3 + 1],
          layout.toolPos[hoverTool * 3 + 2]
        )
      : null;
  const hoverHex =
    hoverTool != null
      ? AXIS_HEX[layout.toolMeta[hoverTool].axisIndex % AXIS_HEX.length]
      : "#ffffff";

  return (
    <>
      {/* Background dust — its own group for parallax (counter-rotates) */}
      <group ref={dustRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={dust}
              count={dust.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            map={glow}
            color="#9bb0ff"
            size={isMobile ? 0.05 : 0.045}
            sizeAttenuation
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      <group ref={groupRef}>
        {/* Faint structural shell for 3D depth cues */}
        <mesh>
          <icosahedronGeometry args={[1.62, 1]} />
          <meshBasicMaterial color="#3b2f6b" wireframe transparent opacity={0.1} />
        </mesh>

        {/* Constellation wires hub → tool */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={layout.linePos}
              count={layout.linePos.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#8b9bd4"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </lineSegments>

        {/* Axis hubs — big bright stars */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={layout.hubPos}
              count={layout.hubPos.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              array={layout.hubColor}
              count={layout.hubColor.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            map={glow}
            vertexColors
            size={isMobile ? 0.42 : 0.36}
            sizeAttenuation
            transparent
            opacity={1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Tool stars — hoverable */}
        <points
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (typeof e.index === "number") setHoverTool(e.index);
          }}
          onPointerOut={() => setHoverTool(null)}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={layout.toolPos}
              count={layout.toolPos.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              ref={toolColorRef}
              attach="attributes-color"
              array={new Float32Array(layout.toolColorBase)}
              count={layout.toolColorBase.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            map={glow}
            vertexColors
            size={isMobile ? 0.22 : 0.18}
            sizeAttenuation
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Hover highlight + single floating label (only 1 DOM node, ever) */}
        {hoverPos && (
          <group position={hoverPos}>
            <sprite scale={[0.6, 0.6, 0.6]}>
              <spriteMaterial
                map={glow}
                color={hoverHex}
                transparent
                opacity={0.95}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            <Html center distanceFactor={isMobile ? 9 : 7} zIndexRange={[50, 0]}>
              <div
                style={{
                  transform: "translateY(-26px)",
                  whiteSpace: "nowrap",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "#fff",
                  background: "rgba(8,10,24,0.82)",
                  border: `1px solid ${hoverHex}`,
                  borderRadius: "999px",
                  padding: "3px 9px",
                  boxShadow: `0 0 14px -2px ${hoverHex}`,
                  pointerEvents: "none",
                }}
              >
                {layout.toolMeta[hoverTool!].label}
              </div>
            </Html>
          </group>
        )}
      </group>
    </>
  );
}

export default function SkillSphere3D({
  data,
  scrollProgress,
}: {
  data: SphereAxis[];
  scrollProgress?: MotionValue<number>;
}) {
  const [hoverTool, setHoverTool] = useState<number | null>(null);
  const [activeAxis, setActiveAxis] = useState<number | null>(null);
  const [userInteracting, setUserInteracting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useTheme(); // keep the component theme-subscribed for remounts

  useEffect(() => {
    setMounted(true);
    const sizeMq = window.matchMedia("(max-width: 640px)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsMobile(sizeMq.matches);
      setReducedMotion(motionMq.matches);
    };
    sync();
    sizeMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);
    return () => {
      sizeMq.removeEventListener("change", sync);
      motionMq.removeEventListener("change", sync);
    };
  }, []);

  const layout = useMemo(() => buildLayout(data), [data]);
  const glow = useMemo(() => (mounted ? makeGlowTexture() : null), [mounted]);

  const hoverMeta = hoverTool != null ? layout.toolMeta[hoverTool] : null;
  const shownAxisIndex = hoverMeta?.axisIndex ?? activeAxis;
  const shownAxis = shownAxisIndex != null ? data[shownAxisIndex] : null;
  const shownTools = shownAxis ? shownAxis.tools : data.flatMap((d) => d.tools.slice(0, 1));
  const label = shownAxis ? shownAxis.axis : "Skill galaxy";
  const note = shownAxis
    ? `${shownAxis.value}/100 · ${shownAxis.tools.length} tools${hoverMeta ? ` · ${hoverMeta.label}` : ""}`
    : isMobile
    ? "Tap a cluster to focus"
    : "Drag to orbit · hover a star";

  return (
    <div className="space-y-3">
      {/* Dark sky panel — kept dark in both themes so the stars actually glow.
          A deliberate feature panel, not washed-out UI. */}
      <div
        className="relative rounded-xl overflow-hidden border border-blue-700/30 dark:border-purple-400/20"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 32%, #0c1230 0%, #070a1c 55%, #04050d 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 50px -24px rgba(76,29,149,0.55)",
        }}
      >
        {/* corner glow accents */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl" />

        <div
          className="relative w-full"
          style={{
            aspectRatio: isMobile ? "1 / 1" : "4 / 3",
            touchAction: "pan-y",
          }}
        >
          {mounted && glow ? (
            <Canvas
              dpr={isMobile ? [1, 1.5] : [1, 2]}
              camera={{ position: [0, 0, 5.2], fov: 50 }}
              gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
              raycaster={{ params: { Points: { threshold: isMobile ? 0.16 : 0.12 } } }}
              frameloop={reducedMotion ? "demand" : "always"}
              onPointerDown={() => setUserInteracting(true)}
              onPointerUp={() => setUserInteracting(false)}
              onPointerLeave={() => {
                setUserInteracting(false);
                setHoverTool(null);
              }}
              style={{ touchAction: "pan-y" }}
            >
              <Scene
                layout={layout}
                glow={glow}
                isMobile={isMobile}
                reducedMotion={reducedMotion}
                scrollProgress={scrollProgress}
                activeAxis={activeAxis}
                hoverTool={hoverTool}
                setHoverTool={setHoverTool}
                userInteracting={userInteracting}
              />
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[10px] text-purple-200/70 tracking-widest uppercase">
                Loading galaxy…
              </span>
            </div>
          )}

          {/* Static caption pinned in-panel */}
          <div className="pointer-events-none absolute top-2.5 left-3 font-mono text-[9px] tracking-[0.3em] uppercase text-white/45">
            Skill Galaxy · 3D
          </div>
        </div>

        {/* Axis legend — also the mobile tap selector */}
        <div className="relative flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
          {data.map((d, i) => {
            const active = (shownAxisIndex ?? null) === i;
            return (
              <button
                key={d.axis}
                type="button"
                onClick={() => setActiveAxis(active ? null : i)}
                onMouseEnter={() => !isMobile && setActiveAxis(i)}
                onMouseLeave={() => !isMobile && setActiveAxis(null)}
                className={
                  "px-2 py-1 text-[9px] rounded-full font-mono tracking-widest uppercase border transition-colors inline-flex items-center gap-1.5 " +
                  (active
                    ? "bg-white/15 border-white/50 text-white"
                    : "bg-white/[0.04] border-white/15 text-white/65 hover:text-white/90")
                }
              >
                <span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: AXIS_HEX[i % AXIS_HEX.length],
                    boxShadow: `0 0 6px ${AXIS_HEX[i % AXIS_HEX.length]}`,
                  }}
                />
                {d.axis}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail strip — theme-aware (lives on the page, not the sky) */}
      <div className="rounded-lg bg-blue-800/[0.08] dark:bg-purple-500/[0.06] border border-blue-800/30 dark:border-purple-400/20 px-3 py-2.5 min-h-[58px]">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] text-black dark:text-purple-100 tracking-[0.25em] uppercase truncate">
            {label}
          </span>
          <span className="font-mono text-[9px] text-black/70 dark:text-purple-300/70 tracking-wide shrink-0">
            {note}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {shownTools.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[10px] rounded-full bg-blue-800/15 dark:bg-purple-500/15 border border-blue-800/35 dark:border-purple-400/30 text-black dark:text-purple-100 font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
