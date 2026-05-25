import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header-3';
import { ShaderBackground } from '@/components/ui/animated-shader-background';
import { HeroSection } from '@/components/blocks/hero-section';
import SectionWithMockup from '@/components/blocks/section-with-mockup';
import { ShowroomSector } from '@/components/showroom/showroom-sector';
import { PrintDeskSector } from '@/components/printdesk/printdesk-sector';

import { CyberConsoleSector } from '@/components/cyberconsole/cyberconsole-sector';
import { MinimalFooter } from '@/components/ui/minimal-footer';
import { Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [scrolled, setScrolled] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    // default setup class dark on root
    document.documentElement.classList.add('dark');

    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#030303] text-white',
      'relative min-h-screen selection:bg-blue-500/30 selection:text-white font-sans antialiased overflow-x-hidden transition-all duration-500'
    )}>
      
      {/* 1. Futuristic Three.js Cosmic Shader Background (Flows globally beneath everything) */}
      {theme === 'dark' && scrolled && <ShaderBackground />}

      {/* 2. Premium Sticky Glassmorphic Navigation Menu */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* 3. Hero Landing Panel (Immersive Spline 3D shop or CSS fallback layout) */}
      <div className="relative z-10">
        <HeroSection theme={theme} />
      </div>

      {/* 4. Showcase Highlights Section using SectionWithMockup */}
      <div id="about" className="relative z-10">
        <SectionWithMockup
          title={
            <>
              A Premium Hybrid
              <br />
              <span className="text-blue-500">Tech retail & cafe core.</span>
            </>
          }
          description={
            <>
              OmniHub 3D bridges the gap between hardware retailing and digital convenience. 
              Explore custom devices, scan high-speed cloud print orders, and book premium internet workstation slots under a singular glowing ecosystem.
            </>
          }
          primaryImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800"
          secondaryImageSrc="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800"
        />

        <SectionWithMockup
          title={
            <>
              Express Counter Pickup,
              <br />
              <span className="text-indigo-400">delivered immediately.</span>
            </>
          }
          description={
            <>
              Skip the queues entirely. Pre-book smartphone variants with direct WhatsApp checkout integration, 
              or queue high-fidelity lamination print jobs to obtain instant pick-up tickets via secure QR codes.
            </>
          }
          primaryImageSrc="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800"
          secondaryImageSrc="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800"
          reverseLayout={true}
        />
      </div>

      {/* 5. Sector A: Smartphone & Tech Accessory Showroom */}
      <div className="relative z-10">
        <ShowroomSector />
      </div>

      {/* 6. Sector B: Quick-Xerox Cloud Print Desk Kiosk */}
      <div className="relative z-10">
        <PrintDeskSector />
      </div>



      {/* 8. Sector C: Workstations Reservation & Application Desk */}
      <div className="relative z-10">
        <CyberConsoleSector />
      </div>

      {/* 9. Feature Highlight Banner */}
      <section className="py-16 bg-black/20 border-t border-white/5 relative z-10">
        <div className="container max-w-5xl mx-auto px-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <Cpu className="size-8 text-blue-500 animate-pulse" />
              <h3 className="text-base font-bold">10Gbps Fiber Backbone</h3>
              <p className="text-xs text-gray-400">Ultra-low latency gaming and cloud document processing channels.</p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <ShieldAlert className="size-8 text-indigo-400 animate-pulse" />
              <h3 className="text-base font-bold">End-to-End Encryption</h3>
              <p className="text-xs text-gray-400">Secure identification uploads with automated file clearing.</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <Sparkles className="size-8 text-purple-400 animate-pulse" />
              <h3 className="text-base font-bold">Counter Express Queue</h3>
              <p className="text-xs text-gray-400">Show generated QR slip or WhatsApp receipt for instant counter pickup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Sleek Minimal Footer */}
      <MinimalFooter />

    </div>
  );
}

export default App;
