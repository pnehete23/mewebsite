'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Star {
  // polar coords from screen center — stars drift outward from origin
  angle: number;
  radius: number;
  speed: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  // 0 (just born) → 1 (fully visible) — soft fade-in on respawn
  born: number;
}

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number | null>(null);
  // Theme: in light mode the stars render black, in dark they render white.
  // Track via a ref so the rAF draw loop always reads the latest value
  // without re-subscribing or restarting.
  const { resolvedTheme } = useTheme();
  const isLightRef = useRef(false);
  useEffect(() => {
    isLightRef.current = resolvedTheme === 'light';
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const makeStar = (existing: boolean): Star => {
      const depth = Math.random();
      return {
        angle: Math.random() * Math.PI * 2,
        radius: existing ? Math.random() * 0.8 + 0.05 : 0.02 + Math.random() * 0.05,
        speed: 0.018 + depth * 0.06,
        // pinprick cores — sub-pixel up to ~0.4px, glow comes from the halo
        size: 0.08 + Math.random() * 0.18,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.4 + Math.random() * 1.6,
        born: existing ? 1 : 0,
      };
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~50× denser than before (220000 → 4400 area-per-star). 1080p ≈ ~470 stars.
      const area = w * h;
      const target = Math.max(150, Math.floor(area / 4400));
      starsRef.current = Array.from({ length: target }, () => makeStar(true));
    };

    let lastT = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxR = Math.hypot(w, h) * 0.55;

      // Full clear every frame — no smear, no trails. The page bg shows through.
      ctx.clearRect(0, 0, w, h);

      const isLight = isLightRef.current;
      // 'lighter' is additive — perfect for white stars on dark bg, but it
      // would erase black stars on light bg. Use 'source-over' in light mode
      // so the black ink lands cleanly on the page.
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';

      const stars = starsRef.current;
      for (const s of stars) {
        s.radius += dt * s.speed * (0.25 + s.radius * 1.6);
        s.twinklePhase += dt * s.twinkleSpeed;
        s.born = Math.min(1, s.born + dt * 1.0);

        const r = s.radius * maxR;
        if (r > maxR) {
          s.radius = 0.02 + Math.random() * 0.05;
          s.angle = Math.random() * Math.PI * 2;
          s.twinklePhase = Math.random() * Math.PI * 2;
          s.size = 0.08 + Math.random() * 0.18;
          s.born = 0;
          continue;
        }

        const x = cx + Math.cos(s.angle) * r;
        const y = cy + Math.sin(s.angle) * r;

        const depthK = s.radius;
        const tw = 0.55 + 0.45 * Math.sin(s.twinklePhase);
        const baseAlpha = (0.22 + depthK * 0.78) * tw * s.born;
        // In light mode, beef up the ink so stars read as solid pitch-black
        // dots instead of washed-out gray pixels (sub-pixel cores blend with
        // white bg). Bigger size + higher alpha + pure-black halo.
        const sz = s.size * (isLight ? 2.8 : 1.0) * (0.6 + depthK * 1.1);

        const haloR = Math.max(1.4, sz * 8);
        const halo = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        if (isLight) {
          // Pitch-black ink — full alpha at the core, soft fade to transparent
          halo.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, baseAlpha * 1.9).toFixed(3)})`);
          halo.addColorStop(0.4, `rgba(0, 0, 0, ${(baseAlpha * 0.8).toFixed(3)})`);
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          halo.addColorStop(0, `rgba(255, 255, 255, ${(baseAlpha * 0.95).toFixed(3)})`);
          halo.addColorStop(0.4, `rgba(225, 230, 255, ${(baseAlpha * 0.35).toFixed(3)})`);
          halo.addColorStop(1, 'rgba(220, 230, 255, 0)');
        }
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Solid core — white in dark mode, pitch-black (alpha 1) in light mode
        ctx.fillStyle = isLight
          ? `rgba(0, 0, 0, 1)`
          : `rgba(255, 255, 255, ${Math.min(1, baseAlpha * 1.7).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, isLight ? Math.max(0.9, sz) : sz, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default Starfield;
