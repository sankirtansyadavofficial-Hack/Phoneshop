import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Package,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus,
  ShoppingCart,
  Upload,
  FileBarChart,
  Trash2,
  X,
  Check,
  Minus,
  BarChart3,
  RefreshCw,
  ChevronDown,
  Target,
  Clock,
  ImageIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  getAllInventory,
  saveInventoryItem,
  deleteInventoryItem,
  bulkImportInventory,
  updateInventoryStock,
  recordSale,
  getTodaySales,
  getFullStockAnalysis,
  generateEODReport,
  parseImportData,
  generateSKU,
} from '@/lib/store';
import type { InventoryItem, StockAnalysis, EODReport, StockStatus } from '@/lib/store';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Smartphones', 'Headphones', 'Cables', 'Chargers', 'Accessories', 'General'] as const;

const STATUS_BADGE: Record<StockStatus, { bg: string; text: string; dot: string; pulse: boolean }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', pulse: true },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', pulse: false },
  STABLE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: false },
  OUT_OF_STOCK: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400', pulse: false },
};

// ─── Framer Motion Variants ──────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getItemStatus(item: InventoryItem): StockStatus {
  if (item.currentStock <= 0) return 'OUT_OF_STOCK';
  if (item.currentStock <= item.safetyStock) return 'CRITICAL';
  if (item.currentStock <= item.reorderPoint) return 'WARNING';
  return 'STABLE';
}

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

// ─── Modal Wrapper ───────────────────────────────────────────────────────────

function Modal({ open, onClose, title, wide, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#0a0a0a] border border-white/[0.08] rounded-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StockBadge({ status }: { status: StockStatus }) {
  const cfg = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── Add Product Modal Content ───────────────────────────────────────────────

function AddProductForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [variant, setVariant] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [reorderPoint, setReorderPoint] = useState('5');
  const [leadTimeDays, setLeadTimeDays] = useState('3');
  const [safetyStock, setSafetyStock] = useState('2');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!model.trim()) return;
    const item: InventoryItem = {
      sku: generateSKU(),
      model: model.trim(),
      category,
      variant: variant.trim() || '-',
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      currentStock: parseInt(initialStock) || 0,
      initialStock: parseInt(initialStock) || 0,
      reorderPoint: parseInt(reorderPoint) || 5,
      leadTimeDays: parseInt(leadTimeDays) || 3,
      safetyStock: parseInt(safetyStock) || 2,
      lastRestocked: Date.now(),
      addedAt: Date.now(),
    };
    saveInventoryItem(item);
    setSaved(true);
    onSave();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const inputClass = 'w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all';
  const labelClass = 'block text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1.5';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Model / Product Name *</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="iPhone 15 Pro Max" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Variant</label>
          <input value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="128GB Black" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cost Price (₹)</label>
          <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="45000" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Selling Price (₹)</label>
          <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="52000" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Initial Stock</label>
          <input type="number" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} placeholder="10" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Reorder Point</label>
          <input type="number" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} placeholder="5" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lead Time (Days)</label>
          <input type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} placeholder="3" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Safety Stock</label>
          <input type="number" value={safetyStock} onChange={(e) => setSafetyStock(e.target.value)} placeholder="2" className={inputClass} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!model.trim() || saved}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 transition-all"
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Plus className="w-4 h-4" /> Add Product</>}
        </button>
      </div>
    </div>
  );
}

// ─── Record Sale Modal Content ───────────────────────────────────────────────

function RecordSaleForm({ inventory, onSave, onClose }: { inventory: InventoryItem[]; onSave: () => void; onClose: () => void }) {
  const [selectedSku, setSelectedSku] = useState('');
  const [unitsSold, setUnitsSold] = useState('1');
  const [saved, setSaved] = useState(false);

  const selectedItem = inventory.find((i) => i.sku === selectedSku);
  const revenue = selectedItem ? (parseInt(unitsSold) || 0) * selectedItem.sellingPrice : 0;

  const handleSave = () => {
    if (!selectedItem || !parseInt(unitsSold)) return;
    recordSale({
      sku: selectedItem.sku,
      model: selectedItem.model,
      variant: selectedItem.variant,
      unitsSold: parseInt(unitsSold),
      revenue,
      timestamp: Date.now(),
    });
    setSaved(true);
    onSave();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const inputClass = 'w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all';
  const labelClass = 'block text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1.5';

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Select Product *</label>
        <div className="relative">
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" className="bg-[#0a0a0a]">— Choose a product —</option>
            {inventory.filter((i) => i.currentStock > 0).map((item) => (
              <option key={item.sku} value={item.sku} className="bg-[#0a0a0a]">
                {item.model} ({item.variant}) — Stock: {item.currentStock}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Units Sold *</label>
        <input
          type="number"
          min="1"
          max={selectedItem?.currentStock || 999}
          value={unitsSold}
          onChange={(e) => setUnitsSold(e.target.value)}
          className={inputClass}
        />
      </div>

      {selectedItem && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Unit Price</span>
            <span className="text-white font-medium">{formatCurrency(selectedItem.sellingPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">Quantity</span>
            <span className="text-white font-medium">× {parseInt(unitsSold) || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-white/[0.06]">
            <span className="text-gray-300 font-semibold">Total Revenue</span>
            <span className="text-emerald-400 font-bold text-lg">{formatCurrency(revenue)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!selectedSku || !(parseInt(unitsSold) > 0) || saved}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 transition-all"
        >
          {saved ? <><Check className="w-4 h-4" /> Recorded!</> : <><ShoppingCart className="w-4 h-4" /> Record Sale</>}
        </button>
      </div>
    </div>
  );
}

// ─── Import Data Modal Content (Enhanced with File Upload + Photo OCR) ───────

type ImportMode = 'text' | 'file' | 'photo';

function ImportDataForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [mode, setMode] = useState<ImportMode>('file');
  const [rawText, setRawText] = useState('');
  const [preview, setPreview] = useState<InventoryItem[]>([]);
  const [imported, setImported] = useState<{ added: number; updated: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [ocrError, setOcrError] = useState('');

  const inputClass = 'w-full bg-white/[0.05] border border-white/10 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all font-mono resize-none';

  // ─── Read text/CSV/JSON files ────────────────────────────────────────────
  const handleFileRead = (file: File) => {
    setFileName(file.name);
    setProcessing(true);
    setProcessingMessage(`Reading ${file.name}...`);
    setOcrError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawText(text);
      const parsed = parseImportData(text);
      setPreview(parsed);
      setProcessing(false);
      if (parsed.length === 0) {
        setOcrError('Could not parse any items from this file. Check the format.');
      }
    };
    reader.onerror = () => {
      setProcessing(false);
      setOcrError('Failed to read file. Try again.');
    };
    reader.readAsText(file);
  };

  // ─── OCR: Read image with Tesseract.js ───────────────────────────────────
  const handleImageOCR = async (file: File) => {
    setFileName(file.name);
    setProcessing(true);
    setProcessingMessage('Analyzing image with AI OCR...');
    setOcrError('');
    setPreview([]);

    try {
      const Tesseract = await import('tesseract.js');
      setProcessingMessage('Extracting text from image...');

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProcessingMessage(`OCR Processing... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const extractedText = result.data.text;
      setRawText(extractedText);
      setProcessingMessage('Parsing extracted data...');

      // Try to parse the OCR text
      const parsed = parseImportData(extractedText);

      if (parsed.length > 0) {
        setPreview(parsed);
      } else {
        // If structured parse fails, show the raw text for manual editing
        setOcrError(
          'OCR extracted text but could not auto-parse it into inventory format. You can edit the extracted text below and try "Parse & Preview" again.'
        );
      }
      setProcessing(false);
    } catch {
      setProcessing(false);
      setOcrError('OCR processing failed. Try a clearer image or use text/file upload instead.');
    }
  };

  // ─── File input handler ──────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'photo') {
      handleImageOCR(file);
    } else {
      handleFileRead(file);
    }
  };

  // ─── Drag & Drop handlers ───────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (isImage) {
      setMode('photo');
      handleImageOCR(file);
    } else {
      setMode('file');
      handleFileRead(file);
    }
  };

  const handleParse = () => {
    const parsed = parseImportData(rawText);
    setPreview(parsed);
    if (parsed.length === 0) {
      setOcrError('No items could be parsed. Check the data format.');
    } else {
      setOcrError('');
    }
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    const result = bulkImportInventory(preview);
    setImported(result);
    onSave();
    setTimeout(() => {
      setImported(null);
      setPreview([]);
      setRawText('');
      setFileName('');
      onClose();
    }, 2000);
  };

  const modes: { key: ImportMode; label: string; icon: React.ReactNode }[] = [
    { key: 'file', label: 'Upload File', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'photo', label: 'Scan Photo', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { key: 'text', label: 'Paste Text', icon: <Upload className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setOcrError(''); setPreview([]); setFileName(''); }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === m.key
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className="flex flex-col items-center justify-center py-12 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
          <p className="text-sm text-white font-medium">{processingMessage}</p>
          <p className="text-[11px] text-gray-500 mt-1">This may take a moment...</p>
        </div>
      )}

      {/* ─── File Upload Mode ───────────────────────────────────────────── */}
      {mode === 'file' && !processing && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
              dragOver
                ? 'border-blue-500/60 bg-blue-500/[0.06]'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.03]'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <div className={`p-3 rounded-xl mb-3 transition-all ${
              dragOver ? 'bg-blue-500/20' : 'bg-white/[0.04] group-hover:bg-white/[0.06]'
            }`}>
              <Upload className={`w-6 h-6 ${dragOver ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
            </div>
            <p className="text-sm text-white font-medium">
              {fileName || 'Drop files here or click to browse'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Supports CSV, JSON, TXT files
            </p>
            <input
              id="file-upload-input"
              type="file"
              accept=".csv,.json,.txt,.tsv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {fileName && !preview.length && (
            <button onClick={handleParse} disabled={!rawText.trim()} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-500/20 disabled:opacity-40 transition-all">
              <Search className="w-4 h-4" /> Re-parse Data
            </button>
          )}
        </>
      )}

      {/* ─── Photo / Image OCR Mode ─────────────────────────────────────── */}
      {mode === 'photo' && !processing && (
        <>
          <div className="bg-gradient-to-r from-purple-500/[0.05] to-blue-500/[0.05] border border-purple-500/15 rounded-xl p-4 text-sm">
            <p className="text-purple-400 font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> AI-Powered Photo Import
            </p>
            <p className="text-gray-400 mt-1 text-xs leading-relaxed">
              Upload a photo of your daily sales list, product inventory sheet, or any handwritten/printed product data. 
              The AI will extract text using OCR and convert it into inventory data.
            </p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
              dragOver
                ? 'border-purple-500/60 bg-purple-500/[0.06]'
                : 'border-white/10 hover:border-purple-500/30 bg-white/[0.02] hover:bg-white/[0.03]'
            }`}
            onClick={() => document.getElementById('photo-upload-input')?.click()}
          >
            <div className={`p-3 rounded-xl mb-3 transition-all ${
              dragOver ? 'bg-purple-500/20' : 'bg-purple-500/[0.06] group-hover:bg-purple-500/10'
            }`}>
              <ImageIcon className={`w-6 h-6 ${dragOver ? 'text-purple-400' : 'text-purple-500 group-hover:text-purple-400'}`} />
            </div>
            <p className="text-sm text-white font-medium">
              {fileName || 'Drop photo here or click to upload'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              JPG, PNG, WEBP — photos of product lists, invoices, handwritten notes
            </p>
            <input
              id="photo-upload-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </>
      )}

      {/* ─── Paste Text Mode ────────────────────────────────────────────── */}
      {mode === 'text' && !processing && (
        <>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1.5">
              Paste CSV, JSON, or tabular data
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              placeholder={`model, category, variant, cost, price, qty\niPhone 15, Smartphones, 128GB Black, 45000, 52000, 10\nSamsung S24, Smartphones, 256GB Blue, 38000, 45000, 8`}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-500/20 disabled:opacity-40 transition-all"
          >
            <Search className="w-4 h-4" /> Parse & Preview
          </button>
        </>
      )}

      {/* ─── OCR Extracted Text (editable fallback) ─────────────────────── */}
      {mode === 'photo' && !processing && rawText && !preview.length && (
        <div className="space-y-3">
          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-medium">
            Extracted Text (edit if needed)
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            className={inputClass}
          />
          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-500/20 disabled:opacity-40 transition-all"
          >
            <Search className="w-4 h-4" /> Parse & Preview
          </button>
        </div>
      )}

      {/* ─── Error Message ──────────────────────────────────────────────── */}
      {ocrError && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400">
          <p className="font-medium">⚠ {ocrError}</p>
        </div>
      )}

      {/* ─── Preview Table ──────────────────────────────────────────────── */}
      {preview.length > 0 && !imported && (
        <div className="space-y-3">
          <p className="text-sm text-emerald-400 font-medium">✓ {preview.length} item(s) parsed successfully</p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">SKU</th>
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Model</th>
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Category</th>
                  <th className="text-right px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Stock</th>
                  <th className="text-right px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item) => (
                  <tr key={item.sku} className="border-t border-white/[0.04]">
                    <td className="px-3 py-2 text-blue-400 font-mono text-xs">{item.sku}</td>
                    <td className="px-3 py-2 text-white">{item.model}</td>
                    <td className="px-3 py-2 text-gray-400">{item.category}</td>
                    <td className="px-3 py-2 text-right text-white">{item.currentStock}</td>
                    <td className="px-3 py-2 text-right text-white">{formatCurrency(item.sellingPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" /> Confirm Import ({preview.length} items)
            </button>
            <button
              onClick={() => { setPreview([]); setOcrError(''); }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── Import Success ─────────────────────────────────────────────── */}
      {imported && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400">
          <p className="font-semibold">✓ Import Complete</p>
          <p className="mt-1 text-emerald-400/80">{imported.added} added, {imported.updated} updated</p>
        </div>
      )}
    </div>
  );
}

// ─── EOD Report Modal Content ────────────────────────────────────────────────

function EODReportView() {
  const [report, setReport] = useState<EODReport | null>(null);

  useEffect(() => {
    setReport(generateEODReport());
  }, []);

  if (!report) return <div className="text-gray-500 text-sm py-8 text-center">Generating report…</div>;

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">End of Day Report</p>
        <p className="text-2xl font-bold text-white mt-1">{report.date}</p>
      </div>

      {/* Daily Sales Summary */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Daily Sales Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Total Revenue</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(report.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Units Sold</p>
            <p className="text-xl font-bold text-white">{report.totalUnitsSold}</p>
          </div>
        </div>
        {report.topModel && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-400">Top model: </span>
            <span className="text-blue-400 font-semibold">{report.topModel.model}</span>
            <span className="text-gray-500"> — {report.topModel.units} units</span>
          </div>
        )}
        {report.soldOutItems.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-sm">
            <span className="text-red-400 font-semibold">⚠ Sold Out: </span>
            <span className="text-red-400/80">{report.soldOutItems.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Live Stock Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" /> Live Stock Status
        </h3>
        {report.stockAnalysis.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">SKU</th>
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Product</th>
                  <th className="text-right px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Stock</th>
                  <th className="text-center px-3 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.stockAnalysis.map((sa) => (
                  <tr key={sa.sku} className="border-t border-white/[0.04]">
                    <td className="px-3 py-2 text-blue-400 font-mono text-xs">{sa.sku}</td>
                    <td className="px-3 py-2 text-white">{sa.model} <span className="text-gray-500">{sa.variant}</span></td>
                    <td className="px-3 py-2 text-right text-white font-medium">{sa.currentStock}</td>
                    <td className="px-3 py-2 text-center"><StockBadge status={sa.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No inventory items yet.</p>
        )}
      </div>

      {/* JIT Restock */}
      {report.stockAnalysis.filter((sa) => sa.reorderQty > 0).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> JIT Restock Recommendations
          </h3>
          <div className="space-y-2">
            {report.stockAnalysis.filter((sa) => sa.reorderQty > 0).map((sa) => (
              <div key={sa.sku} className="bg-amber-500/[0.05] border border-amber-500/15 rounded-xl px-4 py-3 text-sm">
                <span className="text-amber-400 font-semibold">Order {sa.reorderQty} units</span>
                <span className="text-gray-400"> of </span>
                <span className="text-white font-medium">{sa.model}</span>
                <span className="text-gray-500"> — {sa.reorderReason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'analytics'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis[]>([]);
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEODModal, setShowEODModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadData = useCallback(() => {
    setInventory(getAllInventory());
    if (activeTab === 'analytics') {
      setStockAnalysis(getFullStockAnalysis());
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived stats
  const totalSkus = inventory.length;
  const totalStockValue = inventory.reduce((sum, i) => sum + i.currentStock * i.sellingPrice, 0);
  const criticalItems = inventory.filter((i) => {
    const s = getItemStatus(i);
    return s === 'CRITICAL' || s === 'OUT_OF_STOCK';
  }).length;
  const todaySalesTotal = getTodaySales().reduce((sum, r) => sum + r.unitsSold, 0);

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const matchSearch =
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Stock inline edit
  const handleStockUpdate = (sku: string) => {
    const newVal = parseInt(editingStock[sku]);
    if (isNaN(newVal) || newVal < 0) return;
    updateInventoryStock(sku, newVal);
    const next = { ...editingStock };
    delete next[sku];
    setEditingStock(next);
    loadData();
    showToast('Stock updated');
  };

  // Inline sale
  const handleQuickSale = (item: InventoryItem) => {
    if (item.currentStock <= 0) return;
    recordSale({
      sku: item.sku,
      model: item.model,
      variant: item.variant,
      unitsSold: 1,
      revenue: item.sellingPrice,
      timestamp: Date.now(),
    });
    loadData();
    showToast(`Sold 1× ${item.model}`);
  };

  // Delete
  const handleDelete = (sku: string) => {
    deleteInventoryItem(sku);
    setDeleteConfirm(null);
    loadData();
    showToast('Item deleted');
  };

  return (
    <div className="space-y-6">
      {/* ─── Toast ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-xl backdrop-blur-xl border ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
            <Cpu className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              OptiStock AI
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Inventory Intelligence & Predictive Analytics</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSaleModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Record Sale
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> Import Data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowEODModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <FileBarChart className="w-3.5 h-3.5" /> EOD Report
          </motion.button>
        </div>
      </div>

      {/* ─── Stats Grid ──────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">Total SKUs</p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{totalSkus}</p>
            </div>
          </div>
        </motion.div>

        {/* Stock Value */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">Total Stock Value</p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{formatCurrency(totalStockValue)}</p>
            </div>
          </div>
        </motion.div>

        {/* Critical Items */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                {criticalItems > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Action needed
                  </span>
                )}
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">Critical Items</p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{criticalItems}</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Sales */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">Today&apos;s Sales</p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{todaySalesTotal} units</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Tab Navigation ──────────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all border ${
            activeTab === 'inventory'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20'
          }`}
        >
          📦 Live Inventory
        </button>
        <button
          onClick={() => {
            setActiveTab('analytics');
            setStockAnalysis(getFullStockAnalysis());
          }}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all border ${
            activeTab === 'analytics'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20'
          }`}
        >
          📊 Stock Analytics
        </button>
        <div className="flex-1" />
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* ─── Tab 1: Live Inventory ───────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model, SKU, or variant…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  categoryFilter === cat
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                {cat} {cat !== 'All' && `(${inventory.filter((i) => i.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Inventory Table */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">SKU</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Model</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden md:table-cell">Variant</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden lg:table-cell">Category</th>
                    <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden sm:table-cell">Cost ₹</th>
                    <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Price ₹</th>
                    <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Stock</th>
                    <th className="text-center px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredInventory.map((item) => {
                      const status = getItemStatus(item);
                      const isEditingStock = editingStock[item.sku] !== undefined;
                      return (
                        <motion.tr
                          key={item.sku}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 text-blue-400 font-mono text-xs">{item.sku}</td>
                          <td className="px-4 py-3 text-white font-medium">{item.model}</td>
                          <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{item.variant}</td>
                          <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{item.category}</td>
                          <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">{formatCurrency(item.costPrice)}</td>
                          <td className="px-4 py-3 text-right text-white">{formatCurrency(item.sellingPrice)}</td>
                          <td className="px-4 py-3 text-right">
                            {isEditingStock ? (
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={editingStock[item.sku]}
                                  onChange={(e) =>
                                    setEditingStock((prev) => ({ ...prev, [item.sku]: e.target.value }))
                                  }
                                  className="w-16 bg-white/[0.05] border border-blue-500/40 rounded-lg px-2 py-1 text-sm text-white text-right outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleStockUpdate(item.sku);
                                    if (e.key === 'Escape') {
                                      const next = { ...editingStock };
                                      delete next[item.sku];
                                      setEditingStock(next);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleStockUpdate(item.sku)}
                                  className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingStock((prev) => ({
                                    ...prev,
                                    [item.sku]: String(item.currentStock),
                                  }))
                                }
                                className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer"
                                title="Click to edit stock"
                              >
                                {item.currentStock}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StockBadge status={status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleQuickSale(item)}
                                disabled={item.currentStock <= 0}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-medium hover:bg-emerald-500/20 disabled:opacity-30 transition-all"
                                title="Sell 1 unit"
                              >
                                <Minus className="w-3 h-3" /> Sell
                              </button>
                              {deleteConfirm === item.sku ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(item.sku)}
                                    className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-[11px] font-medium hover:bg-red-500/30 transition-all"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-1 text-gray-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(item.sku)}
                                  className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredInventory.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-700 mx-auto mb-3 animate-pulse" />
                <p className="text-gray-400 text-sm">No inventory items found</p>
                <p className="text-gray-500 text-xs mt-1">Add products or import data to get started.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Tab 2: Stock Analytics ──────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Analysis Table */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Full Stock Analysis
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Velocity-based analysis across all products</p>
            </div>
            {stockAnalysis.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Product</th>
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Stock</th>
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden sm:table-cell">Velocity</th>
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden md:table-cell">Time to Out</th>
                      <th className="text-center px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden sm:table-cell">Reorder Qty</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium hidden lg:table-cell">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAnalysis.map((sa) => {
                      const rowBorder =
                        sa.status === 'CRITICAL' ? 'border-l-2 border-l-red-500/50' :
                        sa.status === 'WARNING' ? 'border-l-2 border-l-amber-500/50' :
                        sa.status === 'OUT_OF_STOCK' ? 'border-l-2 border-l-gray-500/50' :
                        'border-l-2 border-l-emerald-500/30';
                      return (
                        <tr key={sa.sku} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${rowBorder}`}>
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{sa.model}</p>
                            <p className="text-gray-500 text-xs">{sa.variant}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-white font-medium">{sa.currentStock}</td>
                          <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">{sa.dailyVelocity} u/day</td>
                          <td className="px-4 py-3 text-right hidden md:table-cell">
                            <span className={`font-medium ${
                              sa.timeToExhaustion < 3 ? 'text-red-400' :
                              sa.timeToExhaustion < 7 ? 'text-amber-400' : 'text-gray-400'
                            }`}>
                              {sa.timeToExhaustion >= 999 ? '∞' : `${sa.timeToExhaustion}d`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center"><StockBadge status={sa.status} /></td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            {sa.reorderQty > 0 ? (
                              <span className="text-amber-400 font-semibold">{sa.reorderQty}</span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell max-w-[200px] truncate">{sa.reorderReason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-3 animate-pulse" />
                <p className="text-gray-400 text-sm">No data to analyze</p>
                <p className="text-gray-500 text-xs mt-1">Add inventory items and record sales to generate analytics.</p>
              </div>
            )}
          </div>

          {/* JIT Restock Recommendations */}
          {stockAnalysis.filter((sa) => sa.reorderQty > 0).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">🎯 JIT Restock Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stockAnalysis.filter((sa) => sa.reorderQty > 0).map((sa, i) => (
                  <motion.div
                    key={sa.sku}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white/[0.03] backdrop-blur-xl border border-amber-500/15 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-amber-500/25 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          Order exactly{' '}
                          <span className="text-amber-400 font-bold text-base">{sa.reorderQty} units</span>
                          {' '}of{' '}
                          <span className="text-white font-semibold">{sa.model}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {sa.reorderReason}
                        </p>
                      </div>
                      <StockBadge status={sa.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Modals ──────────────────────────────────────────────────── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product">
        <AddProductForm onSave={loadData} onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal open={showSaleModal} onClose={() => setShowSaleModal(false)} title="Record a Sale">
        <RecordSaleForm inventory={inventory} onSave={loadData} onClose={() => setShowSaleModal(false)} />
      </Modal>

      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Import Inventory Data" wide>
        <ImportDataForm onSave={loadData} onClose={() => setShowImportModal(false)} />
      </Modal>

      <Modal open={showEODModal} onClose={() => setShowEODModal(false)} title="End of Day Report" wide>
        <EODReportView />
      </Modal>
    </div>
  );
}

export default InventoryPage;
