import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Printer,
  ShoppingBag,
  Monitor,
  RefreshCw,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  getDashboardStats,
  getAllPrintOrders,
  getAllTerminalBookings,
  type DashboardStats,
  type TerminalBooking,
} from '@/lib/store';

// ─── Custom Hook: useAnimatedCounter ─────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1000): number {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return current;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ─── Revenue Data for last 7 days ────────────────────────────────────────────

interface DayRevenue {
  label: string;
  amount: number;
  date: string;
}

function getLast7DaysRevenue(): DayRevenue[] {
  const printOrders = getAllPrintOrders();
  const terminalBookings = getAllTerminalBookings();
  const days: DayRevenue[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date).setHours(0, 0, 0, 0);
    const dayEnd = new Date(date).setHours(23, 59, 59, 999);

    const printRev = printOrders
      .filter((o) => o.timestamp >= dayStart && o.timestamp <= dayEnd)
      .reduce((sum, o) => sum + o.totalCost, 0);

    const termRev = terminalBookings
      .filter((b) => b.timestamp >= dayStart && b.timestamp <= dayEnd)
      .reduce((sum, b) => sum + b.totalCost, 0);

    days.push({
      label: getDayLabel(date),
      amount: printRev + termRev,
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    });
  }

  return days;
}

// ─── Terminal Grid Data ──────────────────────────────────────────────────────

interface TerminalInfo {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'booked';
  bookedBy?: string;
}

function getTerminalGrid(): TerminalInfo[] {
  const bookings = getAllTerminalBookings();
  const terminals: TerminalInfo[] = [];

  for (let i = 1; i <= 8; i++) {
    const activeBooking = bookings.find(
      (b: TerminalBooking) => b.terminalId === i && b.status === 'active'
    );
    terminals.push({
      id: i,
      name: `Terminal ${i}`,
      status: activeBooking ? 'occupied' : 'available',
      bookedBy: activeBooking?.customerName,
    });
  }

  return terminals;
}

// ─── Status Badge Component ──────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  active: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  ready: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  collected: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
  printing: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

// ─── Type dot colors for timeline ────────────────────────────────────────────

const typeDotColor: Record<string, string> = {
  print: 'bg-blue-400',
  showroom: 'bg-purple-400',
  terminal: 'bg-emerald-400',
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

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 28, delay: 0.2 },
  },
};

// ─── Dashboard Page Component ────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<DayRevenue[]>([]);
  const [terminals, setTerminals] = useState<TerminalInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(() => {
    setIsRefreshing(true);
    // Small timeout to show the refresh animation
    setTimeout(() => {
      setStats(getDashboardStats());
      setRevenueData(getLast7DaysRevenue());
      setTerminals(getTerminalGrid());
      setIsRefreshing(false);
    }, 300);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Animated counters
  const animatedRevenue = useAnimatedCounter(stats?.totalRevenue ?? 0, 1200);
  const animatedPrintOrders = useAnimatedCounter(stats?.totalPrintOrders ?? 0, 900);
  const animatedShowroom = useAnimatedCounter(stats?.totalShowroomInquiries ?? 0, 900);
  const animatedTerminal = useAnimatedCounter(stats?.totalTerminalBookings ?? 0, 900);

  // Revenue chart max value
  const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 1);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, Pankaj — here's your shop overview
          </p>
        </div>
        <motion.button
          onClick={loadData}
          disabled={isRefreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-gray-300 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>

      {/* ─── Stats Grid ──────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Revenue */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            {/* Gradient glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Today: ₹{stats.todayRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Total Revenue
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                ₹{animatedRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Print Orders */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Printer className="w-5 h-5 text-blue-400" />
                </div>
                {stats.pendingPrintOrders > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {stats.pendingPrintOrders} pending
                  </span>
                )}
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Print Orders
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {animatedPrintOrders}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Showroom Inquiries */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                </div>
                {stats.pendingShowroomInquiries > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {stats.pendingShowroomInquiries} pending
                  </span>
                )}
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Showroom Inquiries
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {animatedShowroom}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terminal Bookings */}
        <motion.div variants={cardVariants}>
          <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Monitor className="w-5 h-5 text-indigo-400" />
                </div>
                {stats.activeTerminalBookings > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {stats.activeTerminalBookings} active
                  </span>
                )}
              </div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Terminal Bookings
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {animatedTerminal}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Revenue Chart ────────────────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gradient-to-t from-blue-600 to-blue-400" />
              Revenue
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 sm:gap-4 h-48 sm:h-56">
            {revenueData.map((day, i) => {
              const heightPercent = maxRevenue > 0 ? (day.amount / maxRevenue) * 100 : 0;
              const isToday = i === revenueData.length - 1;

              return (
                <div
                  key={day.label + i}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  {/* Amount tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap">
                    ₹{day.amount.toLocaleString('en-IN')}
                  </div>

                  {/* Bar */}
                  <div className="w-full relative flex justify-center" style={{ height: '100%' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                        delay: 0.3 + i * 0.06,
                      }}
                      className={`w-full max-w-[48px] rounded-t-lg self-end cursor-pointer transition-all duration-200 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
                          : 'bg-gradient-to-t from-blue-600/60 via-blue-500/40 to-blue-400/30 group-hover:from-blue-600/80 group-hover:via-blue-500/60 group-hover:to-blue-400/50'
                      }`}
                    />
                  </div>

                  {/* Day label */}
                  <span
                    className={`text-[10px] sm:text-xs font-medium ${
                      isToday ? 'text-blue-400' : 'text-gray-500'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Zero-data fallback */}
          {revenueData.every((d) => d.amount === 0) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-sm text-gray-600">No revenue data yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Bottom Section: Timeline + Terminal Grid ──────────────── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
      >
        {/* Recent Orders Timeline — 60% */}
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
                <p className="text-[11px] text-gray-500">Latest across all sectors</p>
              </div>
            </div>
            {/* Type legend */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Print
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Showroom
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Terminal
              </span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="max-h-[420px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Zap className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs text-gray-700 mt-1">Orders will appear here as they come in</p>
              </div>
            ) : (
              stats.recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200 group"
                >
                  {/* Type indicator dot + line */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${typeDotColor[order.type]} ring-2 ring-offset-1 ring-offset-[#030303] ${
                        order.type === 'print'
                          ? 'ring-blue-400/30'
                          : order.type === 'showroom'
                          ? 'ring-purple-400/30'
                          : 'ring-emerald-400/30'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">
                      {order.description}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {timeAgo(order.timestamp)}
                    </p>
                  </div>

                  {/* Amount */}
                  {order.amount > 0 && (
                    <span className="text-sm font-semibold text-gray-300 tabular-nums shrink-0">
                      ₹{order.amount.toLocaleString('en-IN')}
                    </span>
                  )}

                  {/* Status */}
                  <div className="shrink-0">
                    <StatusBadge status={order.status} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Terminal Grid — 40% */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <Monitor className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Terminals</h2>
                <p className="text-[11px] text-gray-500">Live status</p>
              </div>
            </div>
            {/* Status legend */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Free
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                In use
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {terminals.map((terminal, i) => (
              <motion.div
                key={terminal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className={`relative p-4 rounded-xl border transition-all duration-300 cursor-default group ${
                  terminal.status === 'available'
                    ? 'bg-emerald-500/[0.04] border-emerald-500/20 hover:bg-emerald-500/[0.08] hover:border-emerald-500/30'
                    : terminal.status === 'occupied'
                    ? 'bg-amber-500/[0.04] border-amber-500/20 hover:bg-amber-500/[0.08] hover:border-amber-500/30'
                    : 'bg-blue-500/[0.04] border-blue-500/20 hover:bg-blue-500/[0.08] hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Monitor
                    className={`w-4 h-4 ${
                      terminal.status === 'available'
                        ? 'text-emerald-400'
                        : terminal.status === 'occupied'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      terminal.status === 'available'
                        ? 'bg-emerald-400'
                        : terminal.status === 'occupied'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-blue-400'
                    }`}
                  />
                </div>
                <p className="text-sm font-semibold text-white">{terminal.name}</p>
                <p
                  className={`text-[11px] mt-0.5 capitalize ${
                    terminal.status === 'available'
                      ? 'text-emerald-400/70'
                      : terminal.status === 'occupied'
                      ? 'text-amber-400/70'
                      : 'text-blue-400/70'
                  }`}
                >
                  {terminal.status === 'occupied' || terminal.status === 'booked'
                    ? terminal.bookedBy || terminal.status
                    : terminal.status}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Quick Actions ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 28 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link to="/admin/print-orders">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/[0.04] to-transparent border border-blue-500/15 hover:border-blue-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Printer className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pending Print Orders</p>
                <p className="text-[11px] text-gray-500 mt-0.5">View & manage queue</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
          </motion.div>
        </Link>

        <Link to="/admin/showroom-orders">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/[0.04] to-transparent border border-purple-500/15 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Check Showroom</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Inquiries & confirmations</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400/50 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-200" />
          </motion.div>
        </Link>

        <Link to="/admin/terminal-bookings">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/[0.04] to-transparent border border-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <Monitor className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Manage Terminals</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Bookings & availability</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400/50 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
