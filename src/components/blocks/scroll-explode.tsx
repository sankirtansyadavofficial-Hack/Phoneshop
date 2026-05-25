'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 50;
const FRAME_PREFIX = '/frames/ezgif-frame-';
const BG_COLOR = '#080810';
const SCROLL_HEIGHT_VH = 300;

// Lerp factor: lower = smoother/slower easing, higher = snappier
// 0.08 gives that premium Apple-like buttery feel
const LERP_FACTOR = 0.08;

function getFrameSrc(index: number): string {
  const padded = String(index + 1).padStart(3, '0');
  return `${FRAME_PREFIX}${padded}.png`;
}

// ─── Text Section Config ─────────────────────────────────────────────────────
interface TextSection {
  start: number;
  end: number;
  peak: number;
  headline: string;
  sub: string;
  align: 'center' | 'left' | 'right';
}

const TEXT_SECTIONS: TextSection[] = [
  {
    start: 0.0,
    end: 0.16,
    peak: 0.05,
    headline: 'Crafted to Perfection',
    sub: 'Every curve, every edge — designed with obsessive precision.',
    align: 'center',
  },
  {
    start: 0.22,
    end: 0.42,
    peak: 0.32,
    headline: 'Precision Engineering',
    sub: 'Aerospace-grade titanium chassis with nano-coated internals.',
    align: 'left',
  },
  {
    start: 0.48,
    end: 0.68,
    peak: 0.58,
    headline: 'Every Component Matters',
    sub: '142 individual parts, assembled with micrometer accuracy.',
    align: 'right',
  },
  {
    start: 0.74,
    end: 0.96,
    peak: 0.85,
    headline: 'The Inside Story',
    sub: 'Scroll back up to reassemble. The future is in your hands.',
    align: 'center',
  },
];

// ─── Preloader ───────────────────────────────────────────────────────────────
function Preloader({ progress }: { progress: number }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: BG_COLOR }}
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-white/[0.06] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-amber-500/60 animate-spin" />
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/60 tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #c77533, #e8a063, #c77533)',
          }}
        />
      </div>
      <p className="text-[10px] text-white/20 mt-4 uppercase tracking-[0.3em] font-medium">
        Loading Experience
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ScrollExplode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Animation state — all in refs for zero re-renders during scroll
  const targetProgress = useRef(0);   // Where scroll says we should be (0–1)
  const currentProgress = useRef(0);  // Where the animation currently is (lerped)
  const lastDrawnFrame = useRef(-1);  // Last frame index drawn to canvas
  const animLoopId = useRef(0);       // RAF loop id
  const isInViewRef = useRef(true);

  // Only these trigger re-renders
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // DOM refs for text overlays (to avoid re-renders)
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const frameCounterRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const fixedLayerRef = useRef<HTMLDivElement>(null);

  // ─── Draw a frame with crossfade ──────────────────────────────────────────
  const drawFrame = useCallback((frameFloat: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Resize canvas buffer if needed
    if (canvas.width !== vw * dpr || canvas.height !== vh * dpr) {
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Determine two frames to crossfade between
    const floorIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameFloat)));
    const ceilIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.ceil(frameFloat)));
    const blend = frameFloat - floorIdx; // 0–1 fractional part

    const imgA = imagesRef.current[floorIdx];
    const imgB = imagesRef.current[ceilIdx];

    if (!imgA || !imgA.complete || imgA.naturalWidth === 0) return;

    // Calculate "cover" fit dimensions
    const imgAspect = imgA.naturalWidth / imgA.naturalHeight;
    const vpAspect = vw / vh;

    let dw: number, dh: number, dx: number, dy: number;
    if (imgAspect > vpAspect) {
      dw = vw;
      dh = vw / imgAspect;
      dx = 0;
      dy = (vh - dh) / 2;
    } else {
      dh = vh;
      dw = vh * imgAspect;
      dx = (vw - dw) / 2;
      dy = 0;
    }

    // Fill background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, vw, vh);

    if (floorIdx === ceilIdx || blend < 0.01 || !imgB || !imgB.complete) {
      // Single frame — no crossfade needed
      ctx.drawImage(imgA, dx, dy, dw, dh);
    } else {
      // Crossfade: draw frame A, then blend frame B on top
      ctx.globalAlpha = 1;
      ctx.drawImage(imgA, dx, dy, dw, dh);
      ctx.globalAlpha = blend;
      ctx.drawImage(imgB, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }
  }, []);

  // ─── Update text overlays via DOM (no React re-renders) ──────────────────
  const updateOverlays = useCallback((p: number) => {
    // Update text sections
    TEXT_SECTIONS.forEach((section, i) => {
      const el = textRefs.current[i];
      if (!el) return;

      let opacity = 0;
      if (p >= section.start && p <= section.end) {
        if (p <= section.peak) {
          opacity = (p - section.start) / (section.peak - section.start);
        } else {
          opacity = 1 - (p - section.peak) / (section.end - section.peak);
        }
      }
      opacity = Math.pow(Math.max(0, Math.min(1, opacity)), 1.4);
      const translateY = (1 - opacity) * 30;

      el.style.opacity = String(opacity);
      el.style.transform = `translateY(${translateY}px)`;
      el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
    });

    // Progress bar
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${p * 100}%`;
    }

    // Frame counter
    if (frameCounterRef.current) {
      const f = Math.round(p * (TOTAL_FRAMES - 1)) + 1;
      frameCounterRef.current.textContent = `${String(f).padStart(2, '0')}/${TOTAL_FRAMES}`;
    }

    // Scroll indicator
    if (scrollIndicatorRef.current) {
      scrollIndicatorRef.current.style.opacity = p < 0.03 ? '1' : '0';
    }
  }, []);

  // ─── The core animation loop (lerp-based) ───────────────────────────────
  const startAnimationLoop = useCallback(() => {
    const tick = () => {
      // Lerp current toward target
      const target = targetProgress.current;
      const current = currentProgress.current;
      const diff = target - current;

      // Only update if there's meaningful difference
      if (Math.abs(diff) > 0.0001) {
        currentProgress.current += diff * LERP_FACTOR;
      } else {
        currentProgress.current = target;
      }

      const p = currentProgress.current;

      // Map to floating-point frame index for crossfade
      const frameFloat = p * (TOTAL_FRAMES - 1);
      const roundedFrame = Math.round(frameFloat);

      // Draw frame (with crossfade for sub-frame smoothness)
      if (Math.abs(frameFloat - lastDrawnFrame.current) > 0.05) {
        drawFrame(frameFloat);
        lastDrawnFrame.current = frameFloat;
      }

      // Update DOM overlays
      updateOverlays(p);

      // Show/hide fixed layer
      if (fixedLayerRef.current) {
        fixedLayerRef.current.style.display = isInViewRef.current ? 'block' : 'none';
      }

      animLoopId.current = requestAnimationFrame(tick);
    };

    animLoopId.current = requestAnimationFrame(tick);
  }, [drawFrame, updateOverlays]);

  // ─── Preload images ──────────────────────────────────────────────────────
  useEffect(() => {
    let count = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const onReady = () => {
      count++;
      setLoadProgress((count / TOTAL_FRAMES) * 100);
      if (count === TOTAL_FRAMES) {
        imagesRef.current = images;
        setLoaded(true);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = onReady;
      img.onerror = onReady;
      images[i] = img;
    }
  }, []);

  // ─── Start animation loop + scroll listener once loaded ──────────────────
  useEffect(() => {
    if (!loaded) return;

    // Draw first frame immediately
    drawFrame(0);
    lastDrawnFrame.current = 0;
    updateOverlays(0);

    // Start the continuous animation loop
    startAnimationLoop();

    // Scroll listener: just updates the target, no drawing here
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollableDistance = container.offsetHeight - viewH;
      const scrolled = -rect.top;

      targetProgress.current = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      isInViewRef.current = rect.top <= viewH && rect.bottom >= 0;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animLoopId.current);
    };
  }, [loaded, drawFrame, updateOverlays, startAnimationLoop]);

  // ─── Resize handler ─────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      if (loaded && lastDrawnFrame.current >= 0) {
        drawFrame(currentProgress.current * (TOTAL_FRAMES - 1));
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [loaded, drawFrame]);

  // ─── Text alignment helper ──────────────────────────────────────────────
  const getAlignClass = (align: string) =>
    align === 'left'
      ? 'items-start text-left pl-8 sm:pl-16 lg:pl-24'
      : align === 'right'
        ? 'items-end text-right pr-8 sm:pr-16 lg:pr-24'
        : 'items-center text-center';

  return (
    <>
      {/* Scroll spacer */}
      <div
        ref={containerRef}
        style={{
          height: `${SCROLL_HEIGHT_VH}vh`,
          background: BG_COLOR,
          position: 'relative',
        }}
      />

      {/* Fixed fullscreen layer */}
      <div
        ref={fixedLayerRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          background: BG_COLOR,
          willChange: 'contents',
        }}
      >
        {/* Preloader */}
        {!loaded && <Preloader progress={loadProgress} />}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100vw',
            height: '100vh',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {/* Cinematic vignette */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(8,8,16,0.4) 100%)',
              'linear-gradient(to bottom, rgba(8,8,16,0.3) 0%, transparent 15%, transparent 85%, rgba(8,8,16,0.4) 100%)',
            ].join(', '),
          }}
        />

        {/* Text overlays — all pre-rendered, visibility controlled via refs */}
        {loaded && TEXT_SECTIONS.map((section, i) => (
          <div
            key={i}
            ref={(el) => { textRefs.current[i] = el; }}
            className={`absolute inset-0 z-30 flex flex-col justify-center ${getAlignClass(section.align)} pointer-events-none px-6`}
            style={{
              opacity: 0,
              visibility: 'hidden',
              willChange: 'opacity, transform',
              transition: 'none',
            }}
          >
            <h2
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white/90 max-w-2xl leading-[1.1]"
              style={{ fontFamily: "'Outfit', 'Inter', system-ui", textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}
            >
              {section.headline}
            </h2>
            <p
              className="text-sm sm:text-base lg:text-lg text-white/40 max-w-md mt-4 leading-relaxed font-light"
              style={{ textShadow: '0 1px 20px rgba(0,0,0,0.6)' }}
            >
              {section.sub}
            </p>
          </div>
        ))}

        {/* Scroll indicator */}
        {loaded && (
          <div
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500"
            style={{ opacity: 1 }}
          >
            <span className="text-[10px] text-white/25 uppercase tracking-[0.35em] font-medium">
              Scroll to Explore
            </span>
            <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-amber-500/50 animate-bounce" />
            </div>
          </div>
        )}

        {/* Progress bar */}
        {loaded && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] z-40 bg-white/[0.03]">
            <div
              ref={progressBarRef}
              className="h-full"
              style={{
                width: '0%',
                background:
                  'linear-gradient(90deg, rgba(199,117,51,0.3), rgba(232,160,99,0.9), rgba(199,117,51,0.3))',
                willChange: 'width',
              }}
            />
          </div>
        )}

        {/* Frame counter */}
        {loaded && (
          <div
            ref={frameCounterRef}
            className="absolute bottom-6 right-6 z-30 text-[10px] text-white/10 tabular-nums font-mono pointer-events-none"
          >
            01/{TOTAL_FRAMES}
          </div>
        )}
      </div>
    </>
  );
}
