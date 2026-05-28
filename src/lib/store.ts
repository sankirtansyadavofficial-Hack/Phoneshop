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

// ─── Inventory / OptiStock Types ─────────────────────────────────────────────

export interface InventoryItem {
  sku: string;
  model: string;
  category: string; // e.g. 'Smartphones', 'Headphones', 'Cables'
  variant: string;  // e.g. '128GB Black', 'Type-C 1m'
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  initialStock: number;
  reorderPoint: number; // minimum before restock
  leadTimeDays: number; // days to receive restock
  safetyStock: number;
  lastRestocked: number; // timestamp
  addedAt: number;
}

export interface SalesRecord {
  id: string;
  sku: string;
  model: string;
  variant: string;
  unitsSold: number;
  revenue: number;
  timestamp: number;
  date: string; // YYYY-MM-DD for grouping
}

export type StockStatus = 'CRITICAL' | 'WARNING' | 'STABLE' | 'OUT_OF_STOCK';

export interface StockAnalysis {
  sku: string;
  model: string;
  variant: string;
  currentStock: number;
  dailyVelocity: number;
  timeToExhaustion: number; // days
  status: StockStatus;
  reorderQty: number;
  reorderReason: string;
}

export interface EODReport {
  date: string;
  totalRevenue: number;
  totalUnitsSold: number;
  topModel: { model: string; units: number } | null;
  soldOutItems: string[];
  stockAnalysis: StockAnalysis[];
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  PRINT_ORDERS: 'pkg_print_orders',
  SHOWROOM_INQUIRIES: 'pkg_showroom_inquiries',
  TERMINAL_BOOKINGS: 'pkg_terminal_bookings',
  ADMIN_CREDENTIALS: 'pkg_admin_credentials',
  ADMIN_SESSION: 'pkg_admin_session',
  SHOP_SETTINGS: 'pkg_shop_settings',
  INVENTORY: 'pkg_inventory',
  SALES_LOG: 'pkg_sales_log',
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
    inventory: getAllInventory(),
    salesLog: getAllSalesRecords(),
    settings: getShopSettings(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function clearAllData(): void {
  localStorage.removeItem(KEYS.PRINT_ORDERS);
  localStorage.removeItem(KEYS.SHOWROOM_INQUIRIES);
  localStorage.removeItem(KEYS.TERMINAL_BOOKINGS);
  localStorage.removeItem(KEYS.INVENTORY);
  localStorage.removeItem(KEYS.SALES_LOG);
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

export function generateSKU(): string {
  return `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
}

// ─── Inventory CRUD ──────────────────────────────────────────────────────────

export function getAllInventory(): InventoryItem[] {
  return getItem<InventoryItem[]>(KEYS.INVENTORY, []);
}

export function saveInventoryItem(item: InventoryItem): void {
  const items = getAllInventory();
  const idx = items.findIndex((i) => i.sku === item.sku);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  setItem(KEYS.INVENTORY, items);
}

export function updateInventoryStock(sku: string, newStock: number): void {
  const items = getAllInventory();
  const idx = items.findIndex((i) => i.sku === sku);
  if (idx >= 0) {
    items[idx].currentStock = newStock;
    setItem(KEYS.INVENTORY, items);
  }
}

export function deleteInventoryItem(sku: string): void {
  const items = getAllInventory().filter((i) => i.sku !== sku);
  setItem(KEYS.INVENTORY, items);
}

export function bulkImportInventory(newItems: InventoryItem[]): { added: number; updated: number } {
  const existing = getAllInventory();
  let added = 0;
  let updated = 0;
  for (const ni of newItems) {
    const idx = existing.findIndex((e) => e.sku === ni.sku);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...ni, lastRestocked: Date.now() };
      updated++;
    } else {
      existing.push({ ...ni, addedAt: Date.now(), lastRestocked: Date.now() });
      added++;
    }
  }
  setItem(KEYS.INVENTORY, existing);
  return { added, updated };
}

// ─── Sales Log CRUD ──────────────────────────────────────────────────────────

export function getAllSalesRecords(): SalesRecord[] {
  return getItem<SalesRecord[]>(KEYS.SALES_LOG, []);
}

export function recordSale(sale: Omit<SalesRecord, 'id' | 'date'>): void {
  const records = getAllSalesRecords();
  const d = new Date(sale.timestamp);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  records.push({
    ...sale,
    id: `SALE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    date: dateStr,
  });
  setItem(KEYS.SALES_LOG, records);

  // Automatically deduct from inventory
  updateInventoryStock(
    sale.sku,
    Math.max(0, (getAllInventory().find((i) => i.sku === sale.sku)?.currentStock ?? 0) - sale.unitsSold)
  );
}

export function getTodaySales(): SalesRecord[] {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return getAllSalesRecords().filter((r) => r.date === dateStr);
}

// ─── Velocity Engine ─────────────────────────────────────────────────────────

export function calcSalesVelocity(sku: string, days: number = 7): number {
  const records = getAllSalesRecords();
  const cutoff = Date.now() - days * 86400000;
  const relevantSales = records.filter((r) => r.sku === sku && r.timestamp >= cutoff);
  const totalUnits = relevantSales.reduce((sum, r) => sum + r.unitsSold, 0);
  return totalUnits / days;
}

export function calcTimeToExhaustion(sku: string): number {
  const item = getAllInventory().find((i) => i.sku === sku);
  if (!item || item.currentStock <= 0) return 0;
  const velocity = calcSalesVelocity(sku);
  if (velocity <= 0) return 999; // No sales = effectively infinite
  return item.currentStock / velocity;
}

export function getStockStatus(sku: string): StockStatus {
  const item = getAllInventory().find((i) => i.sku === sku);
  if (!item || item.currentStock <= 0) return 'OUT_OF_STOCK';
  const tte = calcTimeToExhaustion(sku);
  if (tte < 3) return 'CRITICAL';
  if (tte < 7) return 'WARNING';
  return 'STABLE';
}

// ─── JIT Restock Calculator ──────────────────────────────────────────────────

export function calcReorderQuantity(sku: string): { qty: number; reason: string } {
  const item = getAllInventory().find((i) => i.sku === sku);
  if (!item) return { qty: 0, reason: 'Item not found' };

  const velocity = calcSalesVelocity(sku);
  if (velocity <= 0) return { qty: 0, reason: 'No recent sales — hold off restocking' };

  const tte = calcTimeToExhaustion(sku);
  const needed = Math.ceil((velocity * item.leadTimeDays) + item.safetyStock - item.currentStock);

  if (needed <= 0) return { qty: 0, reason: `Sufficient stock for ${Math.round(tte)} days` };

  return {
    qty: needed,
    reason: `Depletes in ${Math.round(tte)} days, lead time ${item.leadTimeDays} days`,
  };
}

// ─── Full Stock Analysis ─────────────────────────────────────────────────────

export function getFullStockAnalysis(): StockAnalysis[] {
  const items = getAllInventory();
  return items.map((item) => {
    const velocity = calcSalesVelocity(item.sku);
    const tte = calcTimeToExhaustion(item.sku);
    const status = getStockStatus(item.sku);
    const reorder = calcReorderQuantity(item.sku);

    return {
      sku: item.sku,
      model: item.model,
      variant: item.variant,
      currentStock: item.currentStock,
      dailyVelocity: Math.round(velocity * 100) / 100,
      timeToExhaustion: Math.round(tte * 10) / 10,
      status,
      reorderQty: reorder.qty,
      reorderReason: reorder.reason,
    };
  });
}

// ─── EOD Report Generator ────────────────────────────────────────────────────

export function generateEODReport(): EODReport {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todaySales = getTodaySales();

  const totalRevenue = todaySales.reduce((s, r) => s + r.revenue, 0);
  const totalUnitsSold = todaySales.reduce((s, r) => s + r.unitsSold, 0);

  // Top model
  const modelMap: Record<string, number> = {};
  todaySales.forEach((r) => {
    modelMap[r.model] = (modelMap[r.model] || 0) + r.unitsSold;
  });
  const topEntry = Object.entries(modelMap).sort((a, b) => b[1] - a[1])[0];
  const topModel = topEntry ? { model: topEntry[0], units: topEntry[1] } : null;

  // Sold out items
  const soldOutItems = getAllInventory()
    .filter((i) => i.currentStock <= 0)
    .map((i) => `${i.model} ${i.variant}`);

  return {
    date: dateStr,
    totalRevenue,
    totalUnitsSold,
    topModel,
    soldOutItems,
    stockAnalysis: getFullStockAnalysis(),
  };
}

// ─── Universal Import Parser ─────────────────────────────────────────────────

export function parseImportData(rawText: string): InventoryItem[] {
  const lines = rawText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Try JSON first
  try {
    const parsed = JSON.parse(rawText);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map(mapToInventoryItem).filter((i): i is InventoryItem => i !== null);
  } catch {
    // Not JSON
  }

  // Try CSV / TSV
  const sep = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  if (headers.length >= 2 && lines.length >= 2) {
    const results: InventoryItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(sep).map((v) => v.trim().replace(/['"]/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
      const item = mapToInventoryItem(row);
      if (item) results.push(item);
    }
    return results;
  }

  return [];
}

function mapToInventoryItem(obj: Record<string, unknown>): InventoryItem | null {
  const s = (key: string): string => {
    const aliases: Record<string, string[]> = {
      model: ['model', 'product', 'product_name', 'product name', 'name', 'item', 'device'],
      category: ['category', 'cat', 'type', 'product_type', 'product type'],
      variant: ['variant', 'color', 'size', 'spec', 'configuration', 'config', 'storage'],
      sku: ['sku', 'id', 'product_id', 'product id', 'item_code', 'code', 'barcode'],
      currentStock: ['qty', 'quantity', 'stock', 'current_stock', 'current stock', 'available', 'in_stock', 'units'],
      costPrice: ['cost', 'cost_price', 'cost price', 'purchase_price', 'buy_price', 'buying_price'],
      sellingPrice: ['price', 'selling_price', 'selling price', 'sell_price', 'mrp', 'retail_price', 'retail price'],
    };
    const keys = aliases[key] || [key];
    for (const k of keys) {
      const val = obj[k] ?? obj[k.toUpperCase()] ?? obj[k.charAt(0).toUpperCase() + k.slice(1)];
      if (val !== undefined && val !== null && val !== '') return String(val);
    }
    return '';
  };

  const model = s('model');
  if (!model) return null;

  const sku = s('sku') || generateSKU();
  const stock = parseInt(s('currentStock')) || 0;
  const cost = parseFloat(s('costPrice')) || 0;
  const sell = parseFloat(s('sellingPrice')) || 0;

  return {
    sku,
    model,
    category: s('category') || 'General',
    variant: s('variant') || '-',
    costPrice: cost,
    sellingPrice: sell,
    currentStock: stock,
    initialStock: stock,
    reorderPoint: 5,
    leadTimeDays: 3,
    safetyStock: 2,
    lastRestocked: Date.now(),
    addedAt: Date.now(),
  };
}
