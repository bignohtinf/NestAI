'use client';

import { useEffect, useRef } from 'react';

export function AnimatedSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Two character sets — front layer (coral) and back layer (sage)
    const charsA = '·∘○◌◎◉●';   // circular dots — depth from open→filled
    const charsB = '░▒▓';        // block fill — subtle back face

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.44;

      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const points: { x: number; y: number; z: number; char: string; front: boolean }[] = [];

      for (let phi = 0; phi < Math.PI * 2; phi += 0.16) {
        for (let theta = 0; theta < Math.PI; theta += 0.16) {
          // Base sphere coords
          const x0 = Math.sin(theta) * Math.cos(phi);
          const y0 = Math.sin(theta) * Math.sin(phi);
          const z0 = Math.cos(theta);

          // Rotate Y
          const ry = time * 0.28;
          const x1 = x0 * Math.cos(ry) - z0 * Math.sin(ry);
          const z1 = x0 * Math.sin(ry) + z0 * Math.cos(ry);

          // Rotate X (gentle tilt)
          const rx = time * 0.14 + 0.3;
          const y1 = y0 * Math.cos(rx) - z1 * Math.sin(rx);
          const z2 = y0 * Math.sin(rx) + z1 * Math.cos(rx);

          const depth = (z2 + 1) / 2; // 0 = back, 1 = front
          const isFront = z2 > 0;

          let char: string;
          if (isFront) {
            char = charsA[Math.floor(depth * (charsA.length - 1))];
          } else {
            char = charsB[Math.floor((1 - depth) * (charsB.length - 1))];
          }

          points.push({
            x: cx + x1 * radius,
            y: cy + y1 * radius,
            z: z2,
            char,
            front: isFront,
          });
        }
      }

      // Painter's algorithm — back to front
      points.sort((a, b) => a.z - b.z);

      points.forEach(p => {
        const depth = (p.z + 1) / 2;

        if (p.front) {
          // Coral: #c8564a  →  rgb(200, 86, 74)
          const alpha = 0.15 + depth * 0.75;
          ctx.fillStyle = `rgba(200, 86, 74, ${alpha.toFixed(2)})`;
        } else {
          // Sage back face: #4f9678  →  rgb(79, 150, 120)
          const alpha = 0.06 + depth * 0.18;
          ctx.fillStyle = `rgba(79, 150, 120, ${alpha.toFixed(2)})`;
        }

        ctx.fillText(p.char, p.x, p.y);
      });

      time += 0.018;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}
