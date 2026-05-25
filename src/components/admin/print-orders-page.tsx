import { useState, useEffect } from 'react';
import { Printer, Search, ChevronRight, Trash2, FileText, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPrintOrders, updatePrintOrderStatus, deletePrintOrder } from '@/lib/store';
import type { PrintOrder } from '@/lib/store';

const STATUS_TABS = ['all', 'pending', 'printing', 'ready', 'collected'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  printing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ready: 'bg-green-500/10 text-green-400 border-green-500/20',
  collected: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const NEXT_STATUS: Record<string, PrintOrder['status']> = {
  pending: 'printing',
  printing: 'ready',
  ready: 'collected',
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

export function PrintOrdersPage() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = () => setOrders(getAllPrintOrders());
  useEffect(() => { loadOrders(); }, []);

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleAdvanceStatus = (id: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (next) {
      updatePrintOrderStatus(id, next);
      loadOrders();
    }
  };

  const handleDelete = (id: string) => {
    deletePrintOrder(id);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Print Orders</h1>
          <p className="text-sm text-gray-400 mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={loadOrders} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
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
          placeholder="Search by ticket ID..."
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
            {tab} {tab !== 'all' && `(${orders.filter(o => o.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(order => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-mono font-bold text-sm">{order.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(order.timestamp)}</span>
              </div>

              {/* Files */}
              <div className="space-y-1.5 mb-3">
                {order.jobs.map((job, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-3.5 text-blue-400 shrink-0" />
                      <span className="text-gray-300 truncate">{job.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 shrink-0">
                      <span>{job.pages}pg</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">{job.color === 'bw' ? 'B&W' : 'Color'}</span>
                      <span>{job.copies}×</span>
                      {job.options.lamination && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Lam</span>}
                      {job.options.binding && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">Bind</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-white font-bold text-sm">₹{order.totalCost.toFixed(0)}</span>
                <div className="flex items-center gap-2">
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, order.status)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all"
                    >
                      <span>Mark {NEXT_STATUS[order.status]}</span>
                      <ChevronRight className="size-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Printer className="size-12 text-gray-700 mx-auto mb-3 animate-pulse" />
            <p className="text-gray-400 text-sm">No print orders found</p>
            <p className="text-gray-500 text-xs mt-1">Orders will appear here when customers submit print jobs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
