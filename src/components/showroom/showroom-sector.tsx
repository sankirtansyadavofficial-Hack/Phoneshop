'use client';

import React, { useState } from 'react';
import { Smartphone, Check, ShoppingBag, Info, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

type DeviceColor = {
  name: string;
  hex: string;
  accentClass: string;
  bgGradient: string;
  shadowClass: string;
};

const DEVICE_COLORS: DeviceColor[] = [
  { name: 'Titanium Midnight', hex: '#111827', accentClass: 'bg-gray-900 border-gray-700', bgGradient: 'from-gray-900 to-slate-800', shadowClass: 'shadow-gray-900/40' },
  { name: 'Cyber Teal', hex: '#0ea5e9', accentClass: 'bg-sky-500 border-sky-400', bgGradient: 'from-sky-950 via-slate-900 to-slate-950', shadowClass: 'shadow-sky-500/30' },
  { name: 'Neon Purple', hex: '#a855f7', accentClass: 'bg-purple-500 border-purple-400', bgGradient: 'from-purple-950 via-slate-900 to-slate-950', shadowClass: 'shadow-purple-500/30' },
  { name: 'Aureum Gold', hex: '#eab308', accentClass: 'bg-yellow-500 border-yellow-400', bgGradient: 'from-yellow-950 via-slate-900 to-slate-950', shadowClass: 'shadow-yellow-500/20' }
];

export function ShowroomSector() {
  const [selectedColor, setSelectedColor] = useState<DeviceColor>(DEVICE_COLORS[1]); // default Cyber Teal
  const [rotation, setRotation] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isOrdered, setIsOrdered] = useState(false);
  const [storeStock, setStoreStock] = useState(3);

  const specifications = {
    screen: "6.8\" LTPO OLED, 120Hz Refresh Rate",
    processor: "OmniCore v4 AI Octa-Chip",
    camera: "200MP Triple Lens with Spatial LiDAR",
    battery: "5500mAh with 120W HyperCharge",
    ram: "16GB LPDDR5X + 512GB UFS 4.0 Storage"
  };

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const phoneNumber = "919876543210"; // Sample store contact number
    const text = encodeURIComponent(
      `*OmniHub 3D - Express Showroom Order*\n\n` +
      `👤 *Customer Name:* ${customerName}\n` +
      `📱 *Item:* OmniPhone Pro v4\n` +
      `🎨 *Color Selected:* ${selectedColor.name}\n` +
      `🔢 *Quantity:* ${quantity} unit(s)\n` +
      `💼 *Status:* Awaiting Counter Express Pick-up\n\n` +
      `Thank you! Ready to pick up at counter.`
    );
    
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
    setIsOrdered(true);
    setStoreStock(prev => Math.max(0, prev - quantity));
  };

  return (
    <section id="showroom" className="py-24 bg-black/20 border-t border-white/5 relative">
      {/* Decorative vector grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-blue-500 font-mono text-xs uppercase tracking-widest border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">
            Sector A: Device Showroom
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Interactive Device Floor
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Experience the next-gen OmniPhone Pro. Configure physical characteristics, inspect hardware specs, and secure real-time counter stock.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive 3D Phone Render Simulator (LHS) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-4">
            <div className={`relative w-72 h-[450px] rounded-[36px] bg-gradient-to-b ${selectedColor.bgGradient} p-4 border border-white/20 shadow-2xl transition-all duration-700 flex flex-col justify-between ${selectedColor.shadowClass}`}>
              
              {/* Camera Island */}
              <div className="w-full flex justify-center">
                <div className="w-24 h-6 bg-black/80 rounded-full flex items-center justify-around px-2 border border-white/5">
                  <div className="w-3 h-3 bg-sky-500/30 rounded-full border border-sky-400 flex items-center justify-center">
                    <div className="w-1 h-1 bg-sky-300 rounded-full" />
                  </div>
                  <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border border-white/10" />
                  <div className="w-2 h-2 bg-slate-900 rounded-full border border-white/10" />
                </div>
              </div>

              {/* Central Glowing Shield / Active Model Visual representation */}
              <motion.div
                className="flex-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing relative"
                animate={{ rotateY: rotation }}
                transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                drag="x"
                dragConstraints={{ left: -180, right: 180 }}
                onDrag={(_, info) => setRotation(prev => prev + info.delta.x * 0.5)}
              >
                {/* 3D phone body elements */}
                <div className="w-48 h-72 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center p-4 backdrop-blur-md relative overflow-hidden">
                  {/* Neon lining accent inside */}
                  <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${selectedColor.hex}15,transparent_70%)]`} />
                  
                  <Smartphone className="size-16 text-white/25 mb-4 relative z-10" />
                  <div className="text-center relative z-10">
                    <span className="text-white text-sm font-semibold tracking-wider block">OMNIPHONE PRO</span>
                    <span className="text-xs text-gray-500 mt-1 block">Swipe to Rotate 360°</span>
                  </div>
                </div>

                {/* Left/Right floating camera lens highlight tags */}
                <div className="absolute top-10 left-2 w-4 h-4 rounded-full bg-white/10 animate-ping" />
                <div className="absolute bottom-10 right-2 w-4 h-4 rounded-full bg-white/10 animate-ping delay-1000" />
              </motion.div>

              {/* Bottom Specs quick view bar */}
              <div className="text-center bg-black/30 border border-white/5 rounded-2xl p-2.5 backdrop-blur-md">
                <span className="text-[10px] text-gray-400 tracking-widest block uppercase">Color Selected</span>
                <span className="text-white text-xs font-semibold mt-0.5 block">{selectedColor.name}</span>
              </div>
            </div>
            
            {/* Color Configurator Switch Buttons */}
            <div className="flex gap-4 mt-6 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-full backdrop-blur-md">
              {DEVICE_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedColor(color); setRotation(prev => prev + 360); }}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor.name === color.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-65 hover:opacity-100'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColor.name === color.name && <Check className="size-4 text-black" />}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form & Order Integration (RHS) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card className="border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl md:text-2xl font-bold">Configure Order Details</CardTitle>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span>In-Store Stock: {storeStock}</span>
                  </div>
                </div>
                <CardDescription>
                  Review the dynamic technical capabilities and secure express store pick-up immediately.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Specifications grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Processor</span>
                    <span className="text-xs text-white font-medium">{specifications.processor}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">LiDAR Camera</span>
                    <span className="text-xs text-white font-medium">{specifications.camera}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Screen Panel</span>
                    <span className="text-xs text-white font-medium">{specifications.screen}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Core Battery</span>
                    <span className="text-xs text-white font-medium">{specifications.battery}</span>
                  </div>
                </div>

                {storeStock > 0 ? (
                  <form onSubmit={handleWhatsAppOrder} className="space-y-3 pt-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter name for counter pick-up"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 w-24">
                        <label className="text-xs text-gray-400">Quantity</label>
                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          {[1, 2, 3].map(q => (
                            <option key={q} value={q} className="bg-slate-950">{q}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1 pt-5">
                        <Button type="submit" className="w-full flex items-center justify-center gap-2 glow-btn">
                          <ShoppingBag className="size-4" />
                          <span>Reserve via WhatsApp Express</span>
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl">
                    <AlertTriangle className="size-5 shrink-0" />
                    <p className="text-xs font-medium">Out of showroom inventory slots. Contact help desk directly for reservation queues.</p>
                  </div>
                )}

                <AnimatePresence>
                  {isOrdered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-blue-400"
                    >
                      <Info className="size-4 shrink-0 mt-0.5" />
                      <p className="text-xs">
                        Order request compiled! We have redirected you to submit your reservation via WhatsApp. Please finalize the checkout.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 mt-4 pt-4">
                <span>Warranty: 2-Year International</span>
                <span>Returns: 14-Day Free Policy</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
