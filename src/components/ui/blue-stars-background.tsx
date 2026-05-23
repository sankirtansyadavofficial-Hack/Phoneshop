'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  color: string;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  depth: number; // 0, 1, or 2 for parallax layers
}

export function BlueStarsBackground({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const scrollRef = useRef(0);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Track scroll position
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle resizing & high-DPI scaling
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      initStars();
    };

    // Beautiful premium blue colors
    const blueColors = [
      'rgba(59, 130, 246, ',  // Blue (Cobalt)
      'rgba(6, 182, 212, ',  // Cyan (Electric)
      'rgba(99, 102, 241, ',  // Indigo
      'rgba(147, 51, 234, ',  // Purple (Neon)
    ];

    // Initialize stars
    const initStars = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const density = 80; // Total number of stars
      const stars: Star[] = [];

      for (let i = 0; i < density; i++) {
        const depth = Math.floor(Math.random() * 3); // 3 layers of parallax depth
        const baseSize = Math.random() * 1.5 + 0.5; // size between 0.5 and 2.0px
        
        // Random colors from the premium palette
        const colorPrefix = blueColors[Math.floor(Math.random() * blueColors.length)];

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: baseSize,
          baseSize,
          color: colorPrefix,
          speed: (depth + 1) * 0.15 + Math.random() * 0.1, // deeper layer falls slower
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          depth,
        });
      }
      starsRef.current = stars;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Animation Loop
    let lastTime = 0;
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const currentScroll = scrollRef.current;

      starsRef.current.forEach((star) => {
        // Twinkle factor using sine wave
        star.twinklePhase += star.twinkleSpeed;
        const twinkleFactor = Math.sin(star.twinklePhase) * 0.4 + 0.6; // opacity between 0.2 and 1.0

        // Slow falling drift
        star.y += star.speed * (delta > 0 ? delta * 0.05 : 1);
        if (star.y > height) {
          star.y = -10;
          star.x = Math.random() * width;
        }

        // Parallax scroll calculation: layers scroll up at different rates
        // layer 0 (background): moves 0.05x scroll
        // layer 1 (midground): moves 0.12x scroll
        // layer 2 (foreground): moves 0.22x scroll
        const parallaxOffset = currentScroll * (star.depth * 0.08 + 0.06);
        let renderY = (star.y - parallaxOffset) % height;
        if (renderY < 0) renderY += height;

        // Draw Star Core
        ctx.beginPath();
        ctx.arc(star.x, renderY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${twinkleFactor})`;
        ctx.fill();

        // Draw Glowing Halo for larger/foreground stars
        if (star.baseSize > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, renderY, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color}${twinkleFactor * 0.15})`;
          ctx.fill();
        }
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none touch-none transition-opacity duration-300"
      style={{ opacity, zIndex: 0 }}
    />
  );
}