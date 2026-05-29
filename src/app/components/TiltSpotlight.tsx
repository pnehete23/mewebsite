"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

type TiltSpotlightProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. 0 = spotlight only, no tilt. */
  max?: number;
  /** Spotlight glare color (rgba/hex with alpha). */
  glare?: string;
  /** Lift the card toward the viewer on hover (px). */
  lift?: number;
  style?: CSSProperties;
};

/**
 * Cursor-reactive 3D tilt + radial spotlight. Pure transform/opacity writes,
 * throttled to one rAF per pointer move, so it stays on the GPU compositor and
 * never triggers layout. Disabled for touch (no real hover) and for users who
 * prefer reduced motion. The glare layer is pointer-events-none, so clicks,
 * links, and inner `group-hover` overlays keep working underneath.
 */
export default function TiltSpotlight({
  children,
  className = "",
  max = 7,
  glare = "rgba(168,85,247,0.18)",
  lift = 6,
  style,
}: TiltSpotlightProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const enabled = useRef<boolean>(true);

  if (typeof window !== "undefined" && enabled.current) {
    const noHover = window.matchMedia("(hover: none)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    enabled.current = !noHover && !reduce;
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled.current) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rx = (0.5 - py) * max * 2;
      const ry = (px - 0.5) * max * 2;
      el.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(${lift}px)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = "1";
        glareRef.current.style.background = `radial-gradient(420px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, ${glare}, transparent 60%)`;
      }
    });
  };

  const reset = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    const el = wrapRef.current;
    if (el) el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
      <div
        ref={glareRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[25] rounded-2xl mix-blend-screen"
        style={{ opacity: 0, transition: "opacity 0.3s ease" }}
      />
    </div>
  );
}
