"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: "dot" | "dash";
  angle: number;
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    // Colors that match the dark theme — subtle whites and soft accent colors
    const colors = [
      "rgba(255, 255, 255, 0.6)",
      "rgba(255, 255, 255, 0.4)",
      "rgba(255, 255, 255, 0.25)",
      "rgba(147, 197, 253, 0.5)",  // soft blue
      "rgba(167, 139, 250, 0.4)",  // soft purple
      "rgba(52, 211, 153, 0.35)",  // soft green
    ];

    // Seed initial static particles scattered across the page
    const initParticles = () => {
      const particles: Particle[] = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x, y, baseX: x, baseY: y,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.05,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: 0, vy: 0,
          life: 0,
          maxLife: Infinity, // static particles never die
          type: Math.random() > 0.7 ? "dash" : "dot",
          angle: Math.random() * Math.PI * 2,
        });
      }
      return particles;
    };

    particlesRef.current = initParticles();

    // Spawn trail particles near cursor
    const spawnTrailParticle = (mx: number, my: number) => {
      const spread = 40;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * spread;
      const x = mx + Math.cos(angle) * dist;
      const y = my + Math.sin(angle) * dist;
      const speed = Math.random() * 1.5 + 0.5;
      const trailParticle: Particle = {
        x, y, baseX: x, baseY: y,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 60 + 30,
        type: Math.random() > 0.5 ? "dash" : "dot",
        angle: Math.random() * Math.PI * 2,
      };
      particlesRef.current.push(trailParticle);
    };

    // Animation loop
    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const influenceRadius = 180;
      const pushStrength = 50;

      // Spawn trail particles near cursor
      if (mx > 0 && my > 0 && time - lastSpawnRef.current > 30) {
        for (let i = 0; i < 3; i++) {
          spawnTrailParticle(mx, my);
        }
        lastSpawnRef.current = time;
      }

      // Update and draw
      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        // Update trail particle life
        if (p.maxLife !== Infinity) {
          p.life++;
          if (p.life > p.maxLife) continue; // remove dead
          p.opacity = (1 - p.life / p.maxLife) * 0.6;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.97;
          p.vy *= 0.97;
        } else {
          // Static particles: push away from cursor
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < influenceRadius && dist > 0) {
            const force = (1 - dist / influenceRadius) * pushStrength;
            const nx = dx / dist;
            const ny = dy / dist;
            p.x += nx * force * 0.08;
            p.y += ny * force * 0.08;
          } else {
            // Drift back to base position
            p.x += (p.baseX - p.x) * 0.03;
            p.y += (p.baseY - p.y) * 0.03;
          }
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === "dash") {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 2, -0.5, p.size * 4, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
        alive.push(p);
      }
      particlesRef.current = alive;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
