'use client';

import React, { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  hue: number;
  twinklePhase: number;
}

const NEON_HUES = [330, 300, 270, 220, 195, 130, 55];

const SparkleTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const lastEmitRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const emit = (x: number, y: number, dx: number, dy: number) => {
      const speed = Math.hypot(dx, dy);
      // Emit a bunch of tiny stars per movement
      const count = Math.min(18, 6 + Math.floor(speed * 0.35));
      for (let i = 0; i < count; i++) {
        const jitterX = (Math.random() - 0.5) * 18;
        const jitterY = (Math.random() - 0.5) * 18;
        const driftBack = 0.18;
        sparksRef.current.push({
          x: x + jitterX,
          y: y + jitterY,
          vx: -dx * driftBack + (Math.random() - 0.5) * 6,
          vy: -dy * driftBack + (Math.random() - 0.5) * 6,
          life: 0,
          maxLife: 2.4 + Math.random() * 1.6,
          // Star core 50x smaller than before — pinprick dots
          r: (0.5 + Math.random() * 1.2) / 50,
          hue: NEON_HUES[Math.floor(Math.random() * NEON_HUES.length)],
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      if (sparksRef.current.length > 1400) {
        sparksRef.current.splice(0, sparksRef.current.length - 1400);
      }
    };

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const t = performance.now();
      const last = lastEmitRef.current;
      if (!last) {
        lastEmitRef.current = { x, y, t };
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      // Lower threshold → denser bunch of tiny stars along the trail
      if (dist < 3) return;
      lastEmitRef.current = { x, y, t };
      const dt = Math.max(0.001, (t - (last.t || t)) / 1000);
      emit(x, y, dx / dt / 60, dy / dt / 60);
    };

    const onTouch = (e: TouchEvent) => {
      const t0 = e.touches[0];
      if (!t0) return;
      onMove({ clientX: t0.clientX, clientY: t0.clientY } as MouseEvent);
    };

    let lastT = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 1 - dt * 0.8;
        s.vy *= 1 - dt * 0.8;
        s.twinklePhase += dt * 6;

        const k = 1 - s.life / s.maxLife;
        const tw = 0.55 + 0.45 * Math.sin(s.twinklePhase);
        // Slightly damped alpha to compensate for the denser bunch of sparks
        const a = k * k * tw * 0.7;

        const core = `hsla(${s.hue}, 100%, 80%, ${(a * 0.95).toFixed(3)})`;
        const halo = `hsla(${s.hue}, 100%, 60%, ${(a * 0.45).toFixed(3)})`;
        const outer = `hsla(${s.hue}, 100%, 55%, 0)`;

        const r = s.r;
        // Halo decoupled from the (50x-smaller) core so the neon still glows
        const haloR = 3.4;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
        grad.addColorStop(0, core);
        grad.addColorStop(0.4, halo);
        grad.addColorStop(1, outer);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Pinprick core — the actual "star". With r ~ 0.02px on hi-DPI it's
        // barely a single pixel but the surrounding halo provides the glow.
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch as EventListener);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
};

export default SparkleTrail;
