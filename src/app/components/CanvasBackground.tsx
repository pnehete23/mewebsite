// src/app/components/CanvasBackground.tsx
"use client";

import React, { useRef, useEffect } from "react";

const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Array to store wave particles
    const waves: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      age: number;
      color: string;
    }[] = [];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Add new wave on mouse move
      waves.push({
        x: mouseX,
        y: mouseY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 20,
        age: 0,
        color: `hsla(${Math.random() * 360}, 70%, 50%, 1)`, // Use hsla with full opacity initially
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];

        w.radius += 1;
        w.age += 0.05;
        w.x += w.vx;
        w.y += w.vy;

        if (w.x - w.radius < 0 || w.x + w.radius > canvas.width) w.vx *= -0.9;
        if (w.y - w.radius < 0 || w.y + w.radius > canvas.height) w.vy *= -0.9;

        const opacity = Math.max(0, 1 - w.age / 2);
        if (opacity <= 0) {
          waves.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(
          w.x,
          w.y,
          0,
          w.x,
          w.y,
          w.radius
        );
        // Use hsla to incorporate opacity directly into the color
        gradient.addColorStop(0, `hsla(${Math.random() * 360}, 70%, 50%, ${opacity})`); // Random core color with opacity
        gradient.addColorStop(0.3, `rgba(0, 255, 255, ${opacity * 0.7})`); // Cyan accent
        gradient.addColorStop(0.6, `rgba(255, 0, 255, ${opacity * 0.5})`); // Magenta accent
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // Fade to transparent
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default CanvasBackground;