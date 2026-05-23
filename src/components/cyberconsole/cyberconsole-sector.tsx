'use client';

import React, { useState } from 'react';
import { Monitor, Check, Calendar, Lock, Globe, UploadCloud, FileCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Terminal = {
  id: number;
  name: string;
  specs: string;
  status: 'available' | 'occupied' | 'booked';
  bookedBy?: string;
  hoursBooked?: number;
};

const INITIAL_TERMINALS: Terminal[] = [
  { id: 1, name: 'Terminal 01 (RTX 4090)', specs: 'Core i9, 64GB, 240Hz screen', status: 'available' },
  { id: 2, name: 'Terminal 02 (RTX 4090)', specs: 'Core i9, 64GB, 240Hz screen', status: 'occupied' },
  { id: 3, name: 'Terminal 03 (RTX 4080)', specs: 'Core i7, 32GB, 165Hz screen', status: 'available' },
  { id: 4, name: 'Terminal 04 (RTX 4080)', specs: 'Core i7, 32GB, 165Hz screen', status: 'occupied' },
  { id: 5, name: 'Terminal 05 (Developer Node)', specs: 'Linux Box, 32GB, 4K screen', status: 'available' },
  { id: 6, name: 'Terminal 06 (Developer Node)', specs: 'Linux Box, 32GB, 4K screen', status: 'available' },
  { id: 7, name: 'Terminal 07 (Design Workstation)', specs: 'Apple Mac Studio, 64GB RAM', status: 'occupied' },
  { id: 8, name: 'Terminal 08 (Design Workstation)', specs: 'Apple Mac Studio, 64GB RAM', status: 'available' }
];

type DigitalService = {
  title: string;
  description: string;
  requirements: string;
  status: 'idle' | 'uploading' | 'completed';
  fileName?: string;
};

const INITIAL_SERVICES: DigitalService[] = [
  { title: 'Government Job Applications', description: 'OPSC/SSC/State recruitment portal fillings.', requirements: 'Admit slips, signature crop, photo files', status: 'idle' },
  { title: 'University & College Admissions', description: 'Central admissions register submissions.', requirements: 'Graduation transcript sheet, ID card scan', status: 'idle' },
  { title: 'Utility Bill Payments', description: 'Reserve terminal support for tracking grid bills.', requirements: 'Past meter slip, electrical consumer number', status: 'idle' },
  { title: 'Passport Applications Desk', description: 'Generate counter applications slot.', requirements: 'Aadhaar certificate, residential address sheet', status: 'idle' }
];

export function CyberConsoleSector() {
  const [terminals, setTerminals] = useState<Terminal[]>(INITIAL_TERMINALS);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [services, setServices] = useState<DigitalService[]>(INITIAL_SERVICES);
  const [customerName, setCustomerName] = useState('');
  const [bookingHours, setBookingHours] = useState(1);

  const RATE_PER_HOUR = 2.00; // $2.00 per hour

  const handleBookTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTerminal || !customerName.trim()) return;

    setTerminals(prev => prev.map(t => {
      if (t.id === selectedTerminal.id) {
        return {
          ...t,
          status: 'booked',
          bookedBy: customerName,
          hoursBooked: bookingHours
        };
      }
      return t;
    }));

    // Trigger celebration confetti!
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    setSelectedTerminal(null);
    setCustomerName('');
    setBookingHours(1);
  };

  const handleSimulateUpload = (index: number, fileName: string) => {
    setServices(prev => prev.map((s, i) => {
      if (i === index) {
        return { ...s, status: 'uploading', fileName };
      }
      return s;
    }));

    // Simulate standard document compile
    setTimeout(() => {
      setServices(prev => prev.map((s, i) => {
        if (i === index) {
          return { ...s, status: 'completed' };
        }
        return s;
      }));
    }, 2000);
  };

  return (
    <section id="cyberconsole" className="py-24 bg-black/20 border-t border-white/5 relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-blue-500 font-mono text-xs uppercase tracking-widest border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">
            Sector C: Cyber Console
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Workstations & Cyber Console
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Book high-fidelity internet gaming and development terminal stations instantly. Access specialized online portals and upload verification files.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gaming Workstation matrix (LHS) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Monitor className="size-5 text-blue-500" />
                    <span>PC Reservation Matrix</span>
                  </CardTitle>
                  <span className="text-xs text-gray-500">Rate: ${RATE_PER_HOUR.toFixed(2)}/hour</span>
                </div>
                <CardDescription>
                  Click on any available workstation node to open booking schedules.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {terminals.map((t) => {
                    const isAvail = t.status === 'available';
                    const isBooked = t.status === 'booked';
                    
                    return (
                      <motion.div
                        key={t.id}
                        whileHover={isAvail ? { scale: 1.05 } : {}}
                        onClick={() => isAvail && setSelectedTerminal(t)}
                        className={`rounded-2xl p-4 border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative ${isAvail ? 'border-green-500/30 bg-green-500/5 hover:border-green-400 hover:bg-green-500/10' : isBooked ? 'border-blue-500/40 bg-blue-500/10 cursor-not-allowed shadow-[0_0_12px_rgba(59,130,246,0.15)]' : 'border-white/5 bg-white/[0.01] opacity-45 cursor-not-allowed'}`}
                      >
                        <Monitor className={`size-10 ${isAvail ? 'text-green-400' : isBooked ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`} />
                        <span className="text-xs text-white font-semibold mt-2.5 block truncate max-w-full">{t.name.split(' ')[1]}</span>
                        <span className="text-[10px] text-gray-500 mt-1 block truncate max-w-full font-mono font-medium">{t.specs.split(',')[0]}</span>
                        
                        {/* Dynamic Status tag */}
                        <div className="mt-3">
                          {isAvail ? (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">Available</span>
                          ) : isBooked ? (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Booked</span>
                          ) : (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-500">Busy</span>
                          )}
                        </div>

                        {isBooked && (
                          <div className="absolute inset-0 bg-blue-500/[0.02] rounded-2xl pointer-events-none" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Booking overlay inputs */}
                <AnimatePresence>
                  {selectedTerminal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 border-t border-white/5 pt-5 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Calendar className="size-4 text-blue-500" />
                          <span>Reserving {selectedTerminal.name}</span>
                        </h4>
                        <button onClick={() => setSelectedTerminal(null)} className="text-xs text-gray-500 hover:text-white">
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleBookTerminal} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label className="text-[10px] text-gray-400 uppercase font-semibold">User Name</label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Counter register name"
                            className="bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-gray-400 uppercase font-semibold">Duration (Hours)</label>
                          <select
                            value={bookingHours}
                            onChange={(e) => setBookingHours(Number(e.target.value))}
                            className="bg-white/[0.03] border border-white/10 rounded-xl p-1.5 text-xs text-white"
                          >
                            {[1, 2, 4, 8].map(h => (
                              <option key={h} value={h} className="bg-slate-950">{h} hour{h > 1 ? 's' : ''} - ${(h * RATE_PER_HOUR).toFixed(2)}</option>
                            ))}
                          </select>
                        </div>

                        <Button type="submit" size="sm" className="w-full glow-btn">
                          Confirm Seat Reservation
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Active online portal list (RHS) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Globe className="size-5 text-blue-500" />
                  <span>Digital Application Desk</span>
                </CardTitle>
                <CardDescription>
                  Submit documentation for official fillings. Secure kiosk uploads.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3.5">
                {services.map((s, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <span className="text-xs text-white font-bold block">{s.title}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">{s.description}</span>
                      </div>
                      
                      {s.status === 'completed' ? (
                        <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] rounded-full font-semibold flex items-center gap-1">
                          <FileCheck className="size-3" />
                          <span>Attached</span>
                        </div>
                      ) : s.status === 'uploading' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                          <span className="text-[9px] text-blue-400 font-mono">Syncing...</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-600 font-mono">Ready</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-white/[0.03] pt-2">
                      <span className="text-[9px] text-gray-500 truncate max-w-[200px] flex items-center gap-1">
                        <Lock className="size-2.5 shrink-0" />
                        <span>Requires: {s.requirements.split(',')[0]}</span>
                      </span>

                      {s.status === 'idle' ? (
                        <button
                          onClick={() => handleSimulateUpload(idx, `doc_${s.title.toLowerCase().replace(/ /g, '_')}.pdf`)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
                        >
                          <UploadCloud className="size-3" />
                          <span>Attach File</span>
                        </button>
                      ) : s.status === 'completed' ? (
                        <span className="text-[10px] text-gray-500 font-semibold select-none flex items-center gap-0.5">
                          <Check className="size-3 text-green-400" />
                          <span>Attached</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
              
              <CardFooter className="text-xs text-gray-500 border-t border-white/5 mt-4 pt-4 justify-between">
                <span>Portal Sync: Active SSL</span>
                <span>Verification: 24h Queue</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
