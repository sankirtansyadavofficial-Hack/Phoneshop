import { useState, useEffect } from 'react';
import { Monitor, Trash2, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTerminalBookings, updateTerminalBookingStatus, deleteTerminalBooking } from '@/lib/store';
import type { TerminalBooking } from '@/lib/store';

const STATUS_TABS = ['all', 'active', 'completed', 'cancelled'] as const;

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TERMINALS = [
  { id: 1, name: 'T-01 RTX 4090' },
  { id: 2, name: 'T-02 RTX 4090' },
  { id: 3, name: 'T-03 RTX 4080' },
  { id: 4, name: 'T-04 RTX 4080' },
  { id: 5, name: 'T-05 Dev Node' },
  { id: 6, name: 'T-06 Dev Node' },
  { id: 7, name: 'T-07 Design WS' },
  { id: 8, name: 'T-08 Design WS' },
];

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

export function TerminalBookingsPage() {
  const [bookings, setBookings] = useState<TerminalBooking[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadBookings = () => setBookings(getAllTerminalBookings());
  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => activeTab === 'all' || b.status === activeTab);

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayBookings = bookings.filter(b => b.timestamp >= todayStart);
  const todayHours = todayBookings.reduce((sum, b) => sum + b.hours, 0);
  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalCost, 0);

  const activeBookingTerminals = bookings.filter(b => b.status === 'active').map(b => b.terminalId);

  const handleMarkCompleted = (id: string) => {
    updateTerminalBookingStatus(id, 'completed');
    loadBookings();
  };

  const handleCancel = (id: string) => {
    updateTerminalBookingStatus(id, 'cancelled');
    loadBookings();
  };

  const handleDelete = (id: string) => {
    deleteTerminalBooking(id);
    loadBookings();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Terminal Bookings</h1>
          <p className="text-sm text-gray-400 mt-1">{bookings.length} total bookings</p>
        </div>
        <button onClick={loadBookings} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
          <RefreshCw className="size-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Terminal Grid */}
      <div className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Monitor className="size-4 text-blue-400" />
          Terminal Status Grid
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TERMINALS.map(term => {
            const isActive = activeBookingTerminals.includes(term.id);
            const booking = isActive ? bookings.find(b => b.terminalId === term.id && b.status === 'active') : null;
            return (
              <motion.div
                key={term.id}
                whileHover={{ scale: 1.03 }}
                className={`rounded-xl p-3 border text-center transition-all ${
                  isActive
                    ? 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                    : 'border-green-500/20 bg-green-500/5'
                }`}
              >
                <Monitor className={`size-6 mx-auto ${isActive ? 'text-blue-400' : 'text-green-400'}`} />
                <p className="text-xs text-white font-semibold mt-1.5">{term.name}</p>
                <span className={`text-[9px] uppercase font-bold tracking-wider mt-1 inline-block px-2 py-0.5 rounded ${
                  isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {isActive ? 'Occupied' : 'Available'}
                </span>
                {booking && <p className="text-[10px] text-gray-400 mt-1">{booking.customerName}</p>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Clock className="size-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Hours Today</p>
            <p className="text-lg font-bold text-white">{todayHours}h</p>
          </div>
        </div>
        <div className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/10">
            <Monitor className="size-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Revenue Today</p>
            <p className="text-lg font-bold text-white">₹{todayRevenue}</p>
          </div>
        </div>
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
            {tab} {tab !== 'all' && `(${bookings.filter(b => b.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(booking => (
            <motion.div
              key={booking.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">{booking.customerName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(booking.timestamp)}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 mb-3">
                <span className="flex items-center gap-1"><Monitor className="size-3 text-blue-400" />{booking.terminalName}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{booking.hours}h</span>
                <span className="text-white font-semibold">₹{booking.totalCost}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04]">
                {booking.status === 'active' && (
                  <>
                    <button onClick={() => handleMarkCompleted(booking.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-all">
                      <CheckCircle className="size-3" />
                      <span>Complete</span>
                    </button>
                    <button onClick={() => handleCancel(booking.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-all">
                      <XCircle className="size-3" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(booking.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Monitor className="size-12 text-gray-700 mx-auto mb-3 animate-pulse" />
            <p className="text-gray-400 text-sm">No terminal bookings found</p>
            <p className="text-gray-500 text-xs mt-1">Bookings will appear here when customers reserve terminals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
