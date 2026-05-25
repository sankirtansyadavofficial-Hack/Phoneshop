// ─── PKG Shop — localStorage Data Persistence Layer ─────────────────────────
// This module provides all data CRUD operations for both the customer site
// and the admin dashboard. Data is stored in localStorage so it survives
// page refreshes but stays per-browser.

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface PrintJob {
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
}

export interface PrintOrder {
  id: string;
  timestamp: number;
  jobs: PrintJob[];
  totalCost: number;
  status: 'pending' | 'printing' | 'ready' | 'collected';
}

export interface ShowroomInquiry {
  id: string;
  timestamp: number;
  customerName: string;
  productName: string;
  productCategory: string;
  variant: string; // color, size, etc.
  quantity: number;
  status: 'pending' | 'confirmed' | 'collected' | 'cancelled';
  whatsappSent: boolean;
}

export interface TerminalBooking {
  id: string;
  timestamp: number;
  customerName: string;
  terminalId: number;
  terminalName: string;
  hours: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

export interface ShopSettings {
  shopName: string;
  whatsappNumber: string;
  currency: string;
  printRates: {
    bw: number;
    color: number;
    paper75: number;
    paper100: number;
    paper200: number;
    lamination: number;
    binding: number;
  };
  terminalRate: number;
}

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalPrintOrders: number;
  pendingPrintOrders: number;
  totalShowroomInquiries: number;
  pendingShowroomInquiries: number;
  totalTerminalBookings: number;
  activeTerminalBookings: number;
  recentOrders: Array<{
    id: string;
    type: 'print' | 'showroom' | 'terminal';
    description: string;
    timestamp: number;
    amount: number;
    status: string;
  }>;
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  PRINT_ORDERS: 'pkg_print_orders',
  SHOWROOM_INQUIRIES: 'pkg_showroom_inquiries',
  TERMINAL_BOOKINGS: 'pkg_terminal_bookings',
  ADMIN_CREDENTIALS: 'pkg_admin_credentials',
  ADMIN_SESSION: 'pkg_admin_session',
  SHOP_SETTINGS: 'pkg_shop_settings',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Simple hash for passwords (not cryptographically secure, but fine for localStorage)
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// ─── Print Orders ────────────────────────────────────────────────────────────

export function savePrintOrder(order: PrintOrder): void {
  const orders = getAllPrintOrders();
  orders.unshift(order);
  setItem(KEYS.PRINT_ORDERS, orders);
}

export function getAllPrintOrders(): PrintOrder[] {
  return getItem<PrintOrder[]>(KEYS.PRINT_ORDERS, []);
}

export function updatePrintOrderStatus(id: string, status: PrintOrder['status']): void {
  const orders = getAllPrintOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    setItem(KEYS.PRINT_ORDERS, orders);
  }
}

export function deletePrintOrder(id: string): void {
  const orders = getAllPrintOrders().filter(o => o.id !== id);
  setItem(KEYS.PRINT_ORDERS, orders);
}

// ─── Showroom Inquiries ──────────────────────────────────────────────────────

export function saveShowroomInquiry(inquiry: ShowroomInquiry): void {
  const inquiries = getAllShowroomInquiries();
  inquiries.unshift(inquiry);
  setItem(KEYS.SHOWROOM_INQUIRIES, inquiries);
}

export function getAllShowroomInquiries(): ShowroomInquiry[] {
  return getItem<ShowroomInquiry[]>(KEYS.SHOWROOM_INQUIRIES, []);
}

export function updateShowroomInquiryStatus(id: string, status: ShowroomInquiry['status']): void {
  const inquiries = getAllShowroomInquiries();
  const idx = inquiries.findIndex(i => i.id === id);
  if (idx !== -1) {
    inquiries[idx].status = status;
    setItem(KEYS.SHOWROOM_INQUIRIES, inquiries);
  }
}

export function deleteShowroomInquiry(id: string): void {
  const inquiries = getAllShowroomInquiries().filter(i => i.id !== id);
  setItem(KEYS.SHOWROOM_INQUIRIES, inquiries);
}

// ─── Terminal Bookings ───────────────────────────────────────────────────────

export function saveTerminalBooking(booking: TerminalBooking): void {
  const bookings = getAllTerminalBookings();
  bookings.unshift(booking);
  setItem(KEYS.TERMINAL_BOOKINGS, bookings);
}

export function getAllTerminalBookings(): TerminalBooking[] {
  return getItem<TerminalBooking[]>(KEYS.TERMINAL_BOOKINGS, []);
}

export function updateTerminalBookingStatus(id: string, status: TerminalBooking['status']): void {
  const bookings = getAllTerminalBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    bookings[idx].status = status;
    setItem(KEYS.TERMINAL_BOOKINGS, bookings);
  }
}

export function deleteTerminalBooking(id: string): void {
  const bookings = getAllTerminalBookings().filter(b => b.id !== id);
  setItem(KEYS.TERMINAL_BOOKINGS, bookings);
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  passwordHash: simpleHash('pkg2024'),
};

export function getAdminCredentials(): AdminCredentials {
  return getItem<AdminCredentials>(KEYS.ADMIN_CREDENTIALS, DEFAULT_CREDENTIALS);
}

export function updateAdminPassword(newPassword: string): void {
  const creds = getAdminCredentials();
  creds.passwordHash = simpleHash(newPassword);
  setItem(KEYS.ADMIN_CREDENTIALS, creds);
}

export function verifyAdminLogin(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return creds.username === username && creds.passwordHash === simpleHash(password);
}

export function setAdminSession(active: boolean): void {
  if (active) {
    setItem(KEYS.ADMIN_SESSION, { active: true, timestamp: Date.now() });
  } else {
    localStorage.removeItem(KEYS.ADMIN_SESSION);
  }
}

export function isAdminAuthenticated(): boolean {
  const session = getItem<{ active: boolean; timestamp: number } | null>(KEYS.ADMIN_SESSION, null);
  if (!session || !session.active) return false;
  // Session expires after 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  if (Date.now() - session.timestamp > TWENTY_FOUR_HOURS) {
    setAdminSession(false);
    return false;
  }
  return true;
}

// ─── Shop Settings ───────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'PKG Shop',
  whatsappNumber: '918420919571',
  currency: '₹',
  printRates: {
    bw: 2,
    color: 5,
    paper75: 0,
    paper100: 1,
    paper200: 3,
    lamination: 30,
    binding: 40,
  },
  terminalRate: 40,
};

export function getShopSettings(): ShopSettings {
  return getItem<ShopSettings>(KEYS.SHOP_SETTINGS, DEFAULT_SETTINGS);
}

export function updateShopSettings(settings: Partial<ShopSettings>): void {
  const current = getShopSettings();
  setItem(KEYS.SHOP_SETTINGS, { ...current, ...settings });
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  const printOrders = getAllPrintOrders();
  const showroomInquiries = getAllShowroomInquiries();
  const terminalBookings = getAllTerminalBookings();
  
  const todayStart = new Date().setHours(0, 0, 0, 0);
  
  const totalRevenue = 
    printOrders.reduce((sum, o) => sum + o.totalCost, 0) +
    terminalBookings.reduce((sum, b) => sum + b.totalCost, 0);
  
  const todayRevenue = 
    printOrders.filter(o => o.timestamp >= todayStart).reduce((sum, o) => sum + o.totalCost, 0) +
    terminalBookings.filter(b => b.timestamp >= todayStart).reduce((sum, b) => sum + b.totalCost, 0);

  // Build recent orders from all types
  const recentOrders: DashboardStats['recentOrders'] = [
    ...printOrders.map(o => ({
      id: o.id,
      type: 'print' as const,
      description: `Print: ${o.jobs.length} file(s)`,
      timestamp: o.timestamp,
      amount: o.totalCost,
      status: o.status,
    })),
    ...showroomInquiries.map(i => ({
      id: i.id,
      type: 'showroom' as const,
      description: `${i.productName} × ${i.quantity}`,
      timestamp: i.timestamp,
      amount: 0,
      status: i.status,
    })),
    ...terminalBookings.map(b => ({
      id: b.id,
      type: 'terminal' as const,
      description: `${b.terminalName} — ${b.hours}h`,
      timestamp: b.timestamp,
      amount: b.totalCost,
      status: b.status,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 15);

  return {
    totalRevenue,
    todayRevenue,
    totalPrintOrders: printOrders.length,
    pendingPrintOrders: printOrders.filter(o => o.status === 'pending' || o.status === 'printing').length,
    totalShowroomInquiries: showroomInquiries.length,
    pendingShowroomInquiries: showroomInquiries.filter(i => i.status === 'pending').length,
    totalTerminalBookings: terminalBookings.length,
    activeTerminalBookings: terminalBookings.filter(b => b.status === 'active').length,
    recentOrders,
  };
}

// ─── Data Export ──────────────────────────────────────────────────────────────

export function exportAllData(): string {
  return JSON.stringify({
    printOrders: getAllPrintOrders(),
    showroomInquiries: getAllShowroomInquiries(),
    terminalBookings: getAllTerminalBookings(),
    settings: getShopSettings(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function clearAllData(): void {
  localStorage.removeItem(KEYS.PRINT_ORDERS);
  localStorage.removeItem(KEYS.SHOWROOM_INQUIRIES);
  localStorage.removeItem(KEYS.TERMINAL_BOOKINGS);
}

// ─── ID Generators ───────────────────────────────────────────────────────────

export function generatePrintOrderId(): string {
  return `PKG-PRINT-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function generateShowroomInquiryId(): string {
  return `PKG-SHOP-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function generateTerminalBookingId(): string {
  return `PKG-TERM-${Math.floor(100000 + Math.random() * 900000)}`;
}
