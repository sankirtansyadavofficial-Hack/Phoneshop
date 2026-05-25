import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, Printer, Sparkles, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { savePrintOrder, generatePrintOrderId } from '@/lib/store';

type PrintJob = {
  name: string;
  size: string;
  pages: number;
  color: 'bw' | 'color';
  paperWeight: '75' | '100' | '200';
  copies: number;
  options: {
    lamination: boolean;
    binding: boolean;
  };
};

export function PrintDeskSector() {
  const [dragActive, setDragActive] = useState(false);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [orderTicket, setOrderTicket] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Print Desk parameters (₹ INR)
  const RATES = {
    bw: 2, // ₹2 per B&W page
    color: 5, // ₹5 per Color page
    paper: {
      '75': 0, // Standard is free
      '100': 1, // Premium (+₹1)
      '200': 3, // Cardboard (+₹3)
    },
    lamination: 30, // ₹30 flat
    binding: 40, // ₹40 flat
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  const addFiles = (files: FileList) => {
    const jobs: PrintJob[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Create a default print job configuration for this file
      jobs.push({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        pages: 5, // Simulated default page count
        color: 'bw',
        paperWeight: '75',
        copies: 1,
        options: {
          lamination: false,
          binding: false
        }
      });
    }
    setPrintJobs(prev => [...prev, ...jobs]);
    setOrderTicket(null);
  };

  const removeJob = (index: number) => {
    setPrintJobs(prev => prev.filter((_, i) => i !== index));
    setOrderTicket(null);
  };

  const updateJob = <K extends keyof PrintJob>(index: number, key: K, value: PrintJob[K]) => {
    setPrintJobs(prev => prev.map((job, i) => {
      if (i === index) {
        return { ...job, [key]: value };
      }
      return job;
    }));
    setOrderTicket(null);
  };

  const updateJobOption = (index: number, optionKey: keyof PrintJob['options'], value: boolean) => {
    setPrintJobs(prev => prev.map((job, i) => {
      if (i === index) {
        return {
          ...job,
          options: {
            ...job.options,
            [optionKey]: value
          }
        };
      }
      return job;
    }));
    setOrderTicket(null);
  };

  const calculateJobCost = (job: PrintJob) => {
    const pageRate = job.color === 'bw' ? RATES.bw : RATES.color;
    const paperRate = RATES.paper[job.paperWeight];
    let baseCost = (pageRate + paperRate) * job.pages;
    
    if (job.options.lamination) baseCost += RATES.lamination;
    if (job.options.binding) baseCost += RATES.binding;
    
    return baseCost * job.copies;
  };

  const calculateTotalCost = () => {
    return printJobs.reduce((acc, job) => acc + calculateJobCost(job), 0);
  };

  const handleGenerateTicket = () => {
    if (printJobs.length === 0) return;
    const ticketId = generatePrintOrderId();
    setOrderTicket(ticketId);

    // Save to localStorage for admin dashboard
    savePrintOrder({
      id: ticketId,
      timestamp: Date.now(),
      jobs: printJobs,
      totalCost: calculateTotalCost(),
      status: 'pending',
    });
  };

  return (
    <section id="printdesk" className="py-24 bg-black/20 border-t border-white/5 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-blue-500 font-mono text-xs uppercase tracking-widest border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">
            Sector B: Cloud Print Desk
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Quick-Xerox Engine
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Upload document briefs directly to the scanner queue. Configure density and finishing properties, and obtain a secure QR ticket for Express Kiosk collection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* File Upload Drop zone (LHS) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card className="border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Printer className="size-5 text-blue-500" />
                  <span>Interactive Scanner Slot</span>
                </CardTitle>
                <CardDescription>
                  Drag and drop PDF or PNG documents to compile printing orders.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden ${dragActive ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/15 bg-white/[0.01] hover:border-white/30 hover:bg-white/[0.02]'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  
                  {/* Styled scanning glowing laser line */}
                  {dragActive && (
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-blue-400 z-10"
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  <Upload className={`size-12 text-gray-500 mb-4 transition-transform ${dragActive ? 'scale-110 text-blue-400' : ''}`} />
                  <p className="text-sm text-gray-300 font-semibold text-center">
                    Drag & Drop File Here
                  </p>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Supports PDF, PNG, JPG (Max 25MB)
                  </p>
                </div>

                {/* Print Jobs List */}
                {printJobs.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400">Scan Queue ({printJobs.length})</span>
                      <button onClick={() => setPrintJobs([])} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                        Clear All
                      </button>
                    </div>
                    
                    <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1.5">
                      {printJobs.map((job, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <FileText className="size-5 text-blue-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-200 font-medium block truncate">{job.name}</span>
                              <span className="text-[10px] text-gray-500 block mt-0.5">{job.size} • {job.pages} pages</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeJob(idx)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors ml-2"
                            title="Remove file"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Calculator Options (RHS) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card className="border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Configuration & Pricing</span>
                  {printJobs.length > 0 && (
                    <span className="text-blue-400 text-sm font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                      Est. Total: ₹{calculateTotalCost().toFixed(0)}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Tune page options, copies, and binder additions for each document.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {printJobs.length > 0 ? (
                  <div className="space-y-6">
                    {printJobs.map((job, idx) => (
                      <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-blue-400 font-medium block truncate max-w-[200px]">
                            {idx + 1}. {job.name}
                          </span>
                          <span className="text-xs text-white font-mono">₹{calculateJobCost(job).toFixed(0)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {/* Color Switch */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-semibold">Mode</label>
                            <select
                              value={job.color}
                              onChange={(e) => updateJob(idx, 'color', e.target.value as any)}
                              className="bg-white/[0.03] border border-white/10 rounded-lg p-1.5 text-white"
                            >
                              <option value="bw" className="bg-slate-950">B&W</option>
                              <option value="color" className="bg-slate-950">Color</option>
                            </select>
                          </div>
                          
                          {/* Pages Count */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-semibold">Pages</label>
                            <input
                              type="number"
                              min="1"
                              value={job.pages}
                              onChange={(e) => updateJob(idx, 'pages', Math.max(1, Number(e.target.value)))}
                              className="bg-white/[0.03] border border-white/10 rounded-lg p-1.5 text-white w-full"
                            />
                          </div>

                          {/* Paper Weight Density */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-semibold">Density</label>
                            <select
                              value={job.paperWeight}
                              onChange={(e) => updateJob(idx, 'paperWeight', e.target.value as any)}
                              className="bg-white/[0.03] border border-white/10 rounded-lg p-1.5 text-white"
                            >
                              <option value="75" className="bg-slate-950">75 GSM (Normal)</option>
                              <option value="100" className="bg-slate-950">100 GSM (Heavy)</option>
                              <option value="200" className="bg-slate-950">200 GSM (Card)</option>
                            </select>
                          </div>

                          {/* Copies */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-semibold">Copies</label>
                            <input
                              type="number"
                              min="1"
                              value={job.copies}
                              onChange={(e) => updateJob(idx, 'copies', Math.max(1, Number(e.target.value)))}
                              className="bg-white/[0.03] border border-white/10 rounded-lg p-1.5 text-white w-full"
                            />
                          </div>
                        </div>

                        {/* Additional Finishing Checkboxes */}
                        <div className="flex gap-4 mt-3 pl-1">
                          <label className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={job.options.lamination}
                              onChange={(e) => updateJobOption(idx, 'lamination', e.target.checked)}
                              className="rounded border-white/10 bg-white/5 accent-blue-500"
                            />
                            <span>Lamination (+ ₹30)</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={job.options.binding}
                              onChange={(e) => updateJobOption(idx, 'binding', e.target.checked)}
                              className="rounded border-white/10 bg-white/5 accent-blue-500"
                            />
                            <span>Spiral Binding (+ ₹40)</span>
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <Button onClick={handleGenerateTicket} className="w-full mt-4 flex items-center justify-center gap-2 glow-btn">
                      <Sparkles className="size-4" />
                      <span>Compile Xerox Ticket</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Printer className="size-12 text-gray-700 animate-pulse mb-3" />
                    <p className="text-sm text-gray-400">Scan Queue is Empty</p>
                    <p className="text-xs text-gray-500 mt-1">Please drop digital files inside the scanner slot first.</p>
                  </div>
                )}

                {/* QR Code Output block */}
                {orderTicket && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-5 border border-blue-500/20 bg-blue-500/5 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between"
                  >
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center gap-1.5 justify-center md:justify-start px-2 py-0.5 w-max bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] rounded-full font-mono font-semibold">
                        <Check className="size-3" />
                        <span>Ready for Counter Express</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2">Print Kiosk Pick-up Slip</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                        Scan this QR code at the physical shop print desk. Payment is processed automatically.
                      </p>
                      <span className="text-xs text-blue-400 font-mono font-bold block mt-3 select-all bg-black/40 px-3 py-1 rounded border border-white/5">
                        {orderTicket}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
                      <QRCodeSVG
                        value={JSON.stringify({
                          id: orderTicket,
                          jobs: printJobs.length,
                          total: `₹${calculateTotalCost().toFixed(0)}`,
                          shop: 'PKG Shop'
                        })}
                        size={120}
                        bgColor="#ffffff"
                        fgColor="#030303"
                        level="H"
                      />
                    </div>
                  </motion.div>
                )}
              </CardContent>
              
              <CardFooter className="text-xs text-gray-500 border-t border-white/5 mt-4 pt-4 flex justify-between">
                <span>Color Rate: ₹5/page</span>
                <span>B&W Rate: ₹2/page</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
