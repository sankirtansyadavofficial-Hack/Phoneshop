'use client';

import { useState, useEffect, useRef } from 'react';
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Printer, Monitor, Cpu, Compass } from 'lucide-react';
import { cn } from "@/lib/utils";
import { BlueStarsBackground } from "@/components/ui/blue-stars-background";

export function HeroSection({ theme }: { theme: 'light' | 'dark' }) {
  const [webglSupported, setWebglSupported] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // WebGL Support check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setWebglSupported(support);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Smooth scroll tracking for parallax effects
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate parallax values
  const textOpacity = Math.max(0, 1 - scrollY / 600);
  const textTranslateY = scrollY * 0.15;
  const robotScale = 1 + scrollY * 0.0003;
  const starsOpacity = Math.max(0, 1 - scrollY / 800);

  return (
    <div
      ref={heroRef}
      className={cn(
        theme === 'light' ? 'bg-[#f8fafc]' : 'bg-[#030303]',
        'w-full relative min-h-screen flex items-center overflow-hidden'
      )}
      style={{ height: '100vh', zIndex: 1 }}
    >
      {/* 3D Blue Falling Stars background */}
      <BlueStarsBackground opacity={starsOpacity} />

      {/* Background Spotlight glows */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={theme === 'light' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.35)'}
      />
      
      {/* Subtle radial gradient atmosphere */}
      <div className={cn(
        theme === 'light' ? 'bg-[radial-gradient(ellipse_at_70%_50%,rgba(59,130,246,0.06),transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_70%_50%,rgba(59,130,246,0.04),transparent_70%)]',
        'absolute inset-0 pointer-events-none z-[1]'
      )} />

      {webglSupported ? (
        <>
          {/* ============================================================
             FULL-VIEWPORT 3D ROBOT — Takes the entire background
             ============================================================ */}
          <div
            className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
            style={{
              transform: `scale(${robotScale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s linear',
              willChange: 'transform',
            }}
          >
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>

          {/* Subtle edge vignette — helps text legibility without hiding the robot */}
          <div className={cn(
            theme === 'light'
              ? 'bg-gradient-to-r from-white/70 via-transparent to-transparent'
              : 'bg-gradient-to-r from-[#030303]/60 via-transparent to-transparent',
            'absolute inset-0 z-[2] pointer-events-none'
          )} />

          {/* Bottom fade for smooth transition into next section */}
          <div className={cn(
            theme === 'light'
              ? 'bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent'
              : 'bg-gradient-to-t from-[#030303] via-transparent to-transparent',
            'absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none'
          )} />

          {/* ============================================================
             LEFT-SIDE GLASSMORPHIC TEXT PANEL — Compact, premium
             ============================================================ */}
          <div
            className="relative z-10 w-full h-full flex items-center pointer-events-none"
            style={{
              opacity: textOpacity,
              transform: `translateY(${textTranslateY}px)`,
              transition: 'opacity 0.05s linear, transform 0.05s linear',
              willChange: 'opacity, transform',
            }}
          >
            <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
              <div className={cn(
                theme === 'light'
                  ? 'bg-white/25 border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
                  : 'bg-white/[0.04] border-white/[0.08] shadow-[0_8px_64px_rgba(0,0,0,0.4)]',
                'pointer-events-auto max-w-sm md:max-w-md backdrop-blur-2xl rounded-3xl border p-7 md:p-9 flex flex-col gap-5 transition-all duration-500'
              )}>
                {/* Label Badge */}
                <div className={cn(
                  theme === 'light' ? 'border-blue-500/30 bg-blue-500/10 text-blue-600' : 'border-blue-400/20 bg-blue-500/10 text-blue-400',
                  'flex items-center gap-2 px-3 py-1 w-max rounded-full border font-mono text-[10px] font-semibold uppercase tracking-wider'
                )}>
                  <Compass className="size-3.5 animate-spin-slow" />
                  <span>Interactive 3D Experience</span>
                </div>
                
                {/* Main Headline */}
                <h1 className={cn(
                  theme === 'light' 
                    ? 'bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900' 
                    : 'bg-gradient-to-br from-white via-slate-200 to-slate-400',
                  'text-3xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent leading-[1.15] tracking-tight'
                )}>
                  OmniHub <span className="text-blue-500">3D</span>
                </h1>
                
                {/* Description */}
                <p className={cn(
                  theme === 'light' ? 'text-slate-600/90' : 'text-gray-400/90',
                  'text-sm leading-relaxed font-normal'
                )}>
                  Your flagship hybrid Tech Retail showroom, Cloud Print desk, and cyber workstation ecosystem — all under one roof.
                </p>
                
                {/* CTA Button row */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button asChild className="glow-btn">
                    <a href="#showroom" className="flex items-center gap-2">
                      <span>Explore Showroom</span>
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                  <Button variant={theme === 'light' ? 'secondary' : 'outline'} asChild>
                    <a href="#printdesk">Cloud Print</a>
                  </Button>
                </div>

                {/* Sub-sector badges */}
                <div className={cn(theme === 'light' ? 'border-slate-200/60' : 'border-white/[0.06]', 'flex gap-5 items-center border-t pt-4 mt-1')}>
                  <div className={cn(theme === 'light' ? 'text-slate-500 hover:text-blue-600' : 'text-gray-500 hover:text-white', 'flex items-center gap-1.5 text-xs transition-colors cursor-pointer')}>
                    <Smartphone className="size-3.5 text-blue-500" />
                    <span>Showroom</span>
                  </div>
                  <div className={cn(theme === 'light' ? 'text-slate-500 hover:text-blue-600' : 'text-gray-500 hover:text-white', 'flex items-center gap-1.5 text-xs transition-colors cursor-pointer')}>
                    <Printer className="size-3.5 text-blue-500" />
                    <span>Cloud Xerox</span>
                  </div>
                  <div className={cn(theme === 'light' ? 'text-slate-500 hover:text-blue-600' : 'text-gray-500 hover:text-white', 'flex items-center gap-1.5 text-xs transition-colors cursor-pointer')}>
                    <Monitor className="size-3.5 text-blue-500" />
                    <span>Terminals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator at bottom */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            style={{ opacity: textOpacity }}
          >
            <span className={cn(theme === 'light' ? 'text-slate-400' : 'text-gray-500', 'text-[10px] uppercase tracking-widest font-mono')}>
              Scroll to explore
            </span>
            <div className={cn(
              theme === 'light' ? 'border-slate-300' : 'border-white/20',
              'w-5 h-8 rounded-full border-2 flex items-start justify-center p-1'
            )}>
              <div className={cn(
                theme === 'light' ? 'bg-slate-400' : 'bg-white/50',
                'w-1 h-2 rounded-full animate-bounce'
              )} />
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
           Stunning 2D High-Performance Fallback Grid: Light/Dark Adaptable
           ========================================================================= */
        <div className="relative z-10 container max-w-5xl mx-auto px-6 w-full">
          <div className="space-y-12 w-full text-center py-20">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              <div className={cn(
                theme === 'light' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600' : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
                'flex items-center gap-2 px-3 py-1 mx-auto rounded-full border font-mono text-xs font-semibold'
              )}>
                <Cpu className="size-4" />
                <span>WebGL Disabled - Seamless 2D Fallback Active</span>
              </div>
              <h1 className={cn(
                theme === 'light' ? 'text-slate-900' : 'text-white',
                'text-4xl md:text-6xl font-extrabold leading-tight'
              )}>
                OmniHub <span className="text-blue-500">3D</span> Ecosystem
              </h1>
              <p className={cn(theme === 'light' ? 'text-slate-600' : 'text-gray-400', "text-sm md:text-base leading-relaxed")}>
                Experience high-performance cyber-minimalism layout grids optimized for low-latency network loading and smooth viewport scanning.
              </p>
            </div>

            {/* Glowing 3-Column fallback sector cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              
              {/* Sector A fallback */}
              <div className={cn(
                theme === 'light' ? 'glass-light border-slate-200/60 shadow-lg shadow-slate-100/30' : 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-black/45 border-white/10',
                'group transition-all duration-300 rounded-2xl border p-6'
              )}>
                <div className="text-left flex flex-col gap-3">
                  <Smartphone className="size-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className={cn(theme === 'light' ? 'text-slate-800' : 'text-white', "text-xl font-bold")}>Device Showroom</h3>
                  <p className={cn(theme === 'light' ? 'text-slate-500' : 'text-gray-400', 'text-sm')}>
                    Explore metallic floating podiums and pre-configure next-generation smartphones.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <Button asChild size="sm" className="w-full">
                    <a href="#showroom">Go to Showroom</a>
                  </Button>
                </div>
              </div>

              {/* Sector B fallback */}
              <div className={cn(
                theme === 'light' ? 'glass-light border-slate-200/60 shadow-lg shadow-slate-100/30' : 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-black/45 border-white/10',
                'group transition-all duration-300 rounded-2xl border p-6'
              )}>
                <div className="text-left flex flex-col gap-3">
                  <Printer className="size-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className={cn(theme === 'light' ? 'text-slate-800' : 'text-white', "text-xl font-bold")}>Cloud Print Desk</h3>
                  <p className={cn(theme === 'light' ? 'text-slate-500' : 'text-gray-400', 'text-sm')}>
                    Stylized document slots with drag-and-drop support, cost estimates and express codes.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <Button asChild size="sm" className="w-full">
                    <a href="#printdesk">Go to Print Desk</a>
                  </Button>
                </div>
              </div>

              {/* Sector C fallback */}
              <div className={cn(
                theme === 'light' ? 'glass-light border-slate-200/60 shadow-lg shadow-slate-100/30' : 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-black/45 border-white/10',
                'group transition-all duration-300 rounded-2xl border p-6'
              )}>
                <div className="text-left flex flex-col gap-3">
                  <Monitor className="size-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className={cn(theme === 'light' ? 'text-slate-800' : 'text-white', "text-xl font-bold")}>Cyber Terminal Console</h3>
                  <p className={cn(theme === 'light' ? 'text-slate-500' : 'text-gray-400', 'text-sm')}>
                    Gaming and developer node reservations scheduler with active governmental applications.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <Button asChild size="sm" className="w-full">
                    <a href="#cyberconsole">Go to Terminals</a>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
