"use client";

import React, { useEffect, useRef } from "react";

interface MatrixRainProps {
  fontSize?: number;
  color?: string;
  characters?: string;
  fadeOpacity?: number;
  speed?: number;
}

const MatrixRain: React.FC<MatrixRainProps> = ({
  fontSize = 18,
  color = "#00ff66",
  characters = "0123456789ABCDEF$%&*",
  fadeOpacity = 0.08,
  speed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Accessibility: users who prefer reduced motion get a single static
    // frame instead of the animation loop.
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("nr-motion-off");
    const effectiveSpeed = reduced ? 0 : speed;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const chars = characters.split("");
    const columnCount = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array.from({ length: columnCount }, () => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += effectiveSpeed;
      }
    };

    if (effectiveSpeed === 0) {
      draw(); // one static frame
      return () => window.removeEventListener("resize", resizeCanvas);
    }

    const interval = setInterval(draw, 33 / effectiveSpeed);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [fontSize, color, characters, fadeOpacity, speed]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden />;
};

export default MatrixRain;
