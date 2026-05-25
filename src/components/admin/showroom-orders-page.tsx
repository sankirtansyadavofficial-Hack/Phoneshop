import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Trash2, MessageCircle, RefreshCw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllShowroomInquiries, updateShowroomInquiryStatus, deleteShowroomInquiry } from '@/lib/store';
import type { ShowroomInquiry } from '@/lib/store';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'collected', 'cancelled'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  collected: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CATEGORY_STYLES: Record<string, string> = {
  smartphones: 'bg-violet-500/10 text-violet-400',
  'screen-protectors': 'bg-emerald-500/10 text-emerald-400',
  headphones: 'bg-amber-500/10 text-amber-400',
  bluetooth: 'bg-cyan-500/10 text-cyan-400',
  cables: 'bg-rose-500/10 text-rose-400',
  chargers: 'bg-lime-500/10 text-lime-400',
  accessories: 'bg-fuchsia-500/10 text-fuchsia-400',
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ShowroomOrdersPage() {
  const [inquiries, setInquiries] = useState<ShowroomInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadInquiries = () => setInquiries(getAllShowroomInquiries());
  useEffect(() => { loadInquiries(); }, []);

  const filtered = inquiries.filter(i => {
    const matchTab = activeTab === 'all' || i.status === activeTab;
    const matchSearch = i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        i.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleStatusChange = (id: string, status: ShowroomInquiry['status']) => {
    updateShowroomInquiryStatus(id, status);
    loadInquiries();
  };

  const handleDelete = (id: string) => {
    deleteShowroomInquiry(id);
    loadInquiries();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Showroom Orders</h1>
          <p className="text-sm text-gray-400 mt-1">{inquiries.length} total inquiries</p>
        </div>
        <button onClick={loadInquiries} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
          <RefreshCw className="size-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name or product..."
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
              activeTab === tab
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20'
            }`}
          >
            {tab} {tab !== 'all' && `(${inquiries.filter(i => i.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Inquiry Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(inquiry => (
            <motion.div
              key={inquiry.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">{inquiry.customerName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(inquiry.timestamp)}</span>
              </div>

              {/* Product Info */}
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 mb-3">
                <div>
                  <p className="text-sm text-gray-200 font-medium">{inquiry.productName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[inquiry.productCategory] || 'bg-white/5 text-gray-400'}`}>
                      {inquiry.productCategory}
                    </span>
                    <span className="text-[10px] text-gray-500">Variant: {inquiry.variant}</span>
                    <span className="text-[10px] text-gray-500">Qty: {inquiry.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {inquiry.whatsappSent ? (
                    <div className="flex items-center gap-1 text-green-400 text-[10px]">
                      <Check className="size-3" />
                      <span>WhatsApp sent</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                      <X className="size-3" />
                      <span>Not sent</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(inquiry.id, e.target.value as ShowroomInquiry['status'])}
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="pending" className="bg-slate-950">Pending</option>
                    <option value="confirmed" className="bg-slate-950">Confirmed</option>
                    <option value="collected" className="bg-slate-950">Collected</option>
                    <option value="cancelled" className="bg-slate-950">Cancelled</option>
                  </select>
                  <a
                    href={`https://wa.me/918420919571?text=${encodeURIComponent(`Hi ${inquiry.customerName}, your order for ${inquiry.productName} at PKG Shop is ${inquiry.status}. Please visit our counter.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-all"
                  >
                    <MessageCircle className="size-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <button onClick={() => handleDelete(inquiry.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="size-12 text-gray-700 mx-auto mb-3 animate-pulse" />
            <p className="text-gray-400 text-sm">No showroom inquiries found</p>
            <p className="text-gray-500 text-xs mt-1">Inquiries will appear here when customers order via WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
