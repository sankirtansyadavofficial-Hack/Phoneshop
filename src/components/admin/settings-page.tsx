import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Store,
  Printer,
  Monitor,
  Database,
  Save,
  Download,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Lock,
  Phone,
  IndianRupee,
  FileText,
  Palette,
  Layers,
  BookOpen,
  LampDesk,
  Clock,
} from 'lucide-react';
import {
  getShopSettings,
  updateShopSettings,
  updateAdminPassword,
  verifyAdminLogin,
  exportAllData,
  clearAllData,
  type ShopSettings,
} from '@/lib/store';

// ─── Toast System ────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[320px] ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-0.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Confirmation Modal ──────────────────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">{description}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20 transition-all duration-200"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Section Card Wrapper ────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  index,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/10">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <p className="text-xs text-white/40 mt-0.5">{description}</p>
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </motion.div>
  );
}

// ─── Input Components ────────────────────────────────────────────────────────

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  placeholder,
  prefix,
  suffix,
}: {
  label: string;
  icon?: React.ElementType;
  value: string | number;
  onChange?: (val: string) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-white/30" />
          </div>
        )}
        {prefix && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-white/40 font-medium">
            {prefix}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full rounded-xl border text-sm text-white placeholder-white/20 outline-none transition-all duration-200 ${
            readOnly
              ? 'bg-white/[0.02] border-white/[0.06] text-white/40 cursor-not-allowed'
              : 'bg-white/[0.05] border-white/10 focus:border-blue-500/40 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500/20'
          } ${Icon ? 'pl-10' : prefix ? 'pl-9' : 'pl-4'} ${suffix ? 'pr-14' : isPassword ? 'pr-11' : 'pr-4'} py-3`}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-white/30 font-medium">
            {suffix}
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-white/40" />
            ) : (
              <Eye className="w-4 h-4 text-white/40" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SaveButton({ onClick, loading, label = 'Save Changes' }: { onClick: () => void; loading?: boolean; label?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {label}
    </motion.button>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Account Security State ──────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = useCallback(() => {
    if (!currentPassword) {
      showToast('error', 'Please enter your current password');
      return;
    }
    if (!newPassword) {
      showToast('error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (!verifyAdminLogin('admin', currentPassword)) {
      showToast('error', 'Current password is incorrect');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      updateAdminPassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordLoading(false);
      showToast('success', 'Password updated successfully');
    }, 600);
  }, [currentPassword, newPassword, confirmPassword, showToast]);

  // ─── Shop Configuration State ────────────────────────────────────────────
  const [settings, setSettings] = useState<ShopSettings>(getShopSettings());
  const [shopLoading, setShopLoading] = useState(false);

  useEffect(() => {
    setSettings(getShopSettings());
  }, []);

  const handleSaveShopConfig = useCallback(() => {
    setShopLoading(true);
    setTimeout(() => {
      updateShopSettings({
        whatsappNumber: settings.whatsappNumber,
      });
      setShopLoading(false);
      showToast('success', 'Shop settings saved successfully');
    }, 500);
  }, [settings.whatsappNumber, showToast]);

  // ─── Print Pricing State ─────────────────────────────────────────────────
  const [printRates, setPrintRates] = useState(settings.printRates);
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    setPrintRates(settings.printRates);
  }, [settings.printRates]);

  const updateRate = useCallback(
    (key: keyof ShopSettings['printRates'], value: string) => {
      const num = value === '' ? 0 : parseFloat(value);
      if (!isNaN(num)) {
        setPrintRates((prev) => ({ ...prev, [key]: num }));
      }
    },
    []
  );

  const handleSavePrintRates = useCallback(() => {
    setPrintLoading(true);
    setTimeout(() => {
      updateShopSettings({ printRates });
      setSettings((prev) => ({ ...prev, printRates }));
      setPrintLoading(false);
      showToast('success', 'Print pricing updated successfully');
    }, 500);
  }, [printRates, showToast]);

  // ─── Terminal Pricing State ───────────────────────────────────────────────
  const [terminalRate, setTerminalRate] = useState(settings.terminalRate);
  const [terminalLoading, setTerminalLoading] = useState(false);

  useEffect(() => {
    setTerminalRate(settings.terminalRate);
  }, [settings.terminalRate]);

  const handleSaveTerminalRate = useCallback(() => {
    setTerminalLoading(true);
    setTimeout(() => {
      updateShopSettings({ terminalRate });
      setSettings((prev) => ({ ...prev, terminalRate }));
      setTerminalLoading(false);
      showToast('success', 'Terminal rate updated successfully');
    }, 500);
  }, [terminalRate, showToast]);

  // ─── Data Management State ────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportData = useCallback(() => {
    try {
      const data = exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pkg-shop-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('success', 'Data exported successfully');
    } catch {
      showToast('error', 'Failed to export data');
    }
  }, [showToast]);

  const handleClearData = useCallback(() => {
    clearAllData();
    setShowClearConfirm(false);
    showToast('success', 'All order data has been cleared');
  }, [showToast]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        open={showClearConfirm}
        title="Clear All Data"
        description="Are you sure? This will permanently delete all print orders, showroom inquiries, and terminal bookings. This cannot be undone."
        confirmLabel="Yes, Clear Everything"
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Page Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="text-2xl font-bold text-white tracking-tight"
          >
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-sm text-white/40 mt-1"
          >
            Manage your account, shop configuration, and pricing
          </motion.p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ──── Account Security ──────────────────────────────────────── */}
          <SectionCard
            icon={Shield}
            title="Account Security"
            description="Update your admin password"
            index={0}
          >
            <div className="space-y-4">
              <InputField
                label="Current Password"
                icon={Lock}
                value={currentPassword}
                onChange={setCurrentPassword}
                type="password"
                placeholder="Enter current password"
              />
              <InputField
                label="New Password"
                icon={Lock}
                value={newPassword}
                onChange={setNewPassword}
                type="password"
                placeholder="Enter new password (min 6 chars)"
              />
              <InputField
                label="Confirm New Password"
                icon={Lock}
                value={confirmPassword}
                onChange={setConfirmPassword}
                type="password"
                placeholder="Re-enter new password"
              />
              <div className="pt-2">
                <SaveButton onClick={handleChangePassword} loading={passwordLoading} label="Update Password" />
              </div>
            </div>
          </SectionCard>

          {/* ──── Shop Configuration ────────────────────────────────────── */}
          <SectionCard
            icon={Store}
            title="Shop Configuration"
            description="General shop settings"
            index={1}
          >
            <div className="space-y-4">
              <InputField
                label="Shop Name"
                icon={Store}
                value={settings.shopName}
                readOnly
              />
              <InputField
                label="WhatsApp Number"
                icon={Phone}
                value={settings.whatsappNumber}
                onChange={(val) => setSettings((prev) => ({ ...prev, whatsappNumber: val }))}
                placeholder="e.g. 918420919571"
              />
              <InputField
                label="Currency"
                icon={IndianRupee}
                value="₹ INR (Indian Rupee)"
                readOnly
              />
              <div className="pt-2">
                <SaveButton onClick={handleSaveShopConfig} loading={shopLoading} />
              </div>
            </div>
          </SectionCard>

          {/* ──── Print Pricing ─────────────────────────────────────────── */}
          <SectionCard
            icon={Printer}
            title="Print Pricing"
            description="Configure per-page and flat-rate charges"
            index={2}
          >
            <div className="space-y-5">
              {/* Per-page Rates */}
              <div>
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Per-Page Rates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="B&W per page"
                    icon={FileText}
                    value={printRates.bw}
                    onChange={(v) => updateRate('bw', v)}
                    type="number"
                    prefix="₹"
                  />
                  <InputField
                    label="Color per page"
                    icon={Palette}
                    value={printRates.color}
                    onChange={(v) => updateRate('color', v)}
                    type="number"
                    prefix="₹"
                  />
                </div>
              </div>

              {/* Paper Surcharges */}
              <div>
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Paper GSM Surcharge</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField
                    label="75 GSM"
                    icon={Layers}
                    value={printRates.paper75}
                    onChange={(v) => updateRate('paper75', v)}
                    type="number"
                    prefix="₹"
                  />
                  <InputField
                    label="100 GSM"
                    icon={Layers}
                    value={printRates.paper100}
                    onChange={(v) => updateRate('paper100', v)}
                    type="number"
                    prefix="₹"
                  />
                  <InputField
                    label="200 GSM"
                    icon={Layers}
                    value={printRates.paper200}
                    onChange={(v) => updateRate('paper200', v)}
                    type="number"
                    prefix="₹"
                  />
                </div>
              </div>

              {/* Flat-Rate Add-ons */}
              <div>
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Flat-Rate Add-ons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Lamination"
                    icon={LampDesk}
                    value={printRates.lamination}
                    onChange={(v) => updateRate('lamination', v)}
                    type="number"
                    prefix="₹"
                  />
                  <InputField
                    label="Binding"
                    icon={BookOpen}
                    value={printRates.binding}
                    onChange={(v) => updateRate('binding', v)}
                    type="number"
                    prefix="₹"
                  />
                </div>
              </div>

              <div className="pt-1">
                <SaveButton onClick={handleSavePrintRates} loading={printLoading} />
              </div>
            </div>
          </SectionCard>

          {/* ──── Terminal Pricing ──────────────────────────────────────── */}
          <div className="space-y-6">
            <SectionCard
              icon={Monitor}
              title="Terminal Pricing"
              description="Set the hourly rate for computer terminals"
              index={3}
            >
              <div className="space-y-4">
                <InputField
                  label="Rate per hour"
                  icon={Clock}
                  value={terminalRate}
                  onChange={(v) => {
                    const num = v === '' ? 0 : parseFloat(v);
                    if (!isNaN(num)) setTerminalRate(num);
                  }}
                  type="number"
                  prefix="₹"
                  suffix="/hour"
                />
                <div className="pt-2">
                  <SaveButton onClick={handleSaveTerminalRate} loading={terminalLoading} />
                </div>
              </div>
            </SectionCard>

            {/* ──── Data Management ──────────────────────────────────────── */}
            <SectionCard
              icon={Database}
              title="Data Management"
              description="Export or clear all shop data"
              index={4}
            >
              <div className="space-y-4">
                {/* Export Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportData}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/80 hover:to-indigo-500/80 border border-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-200"
                >
                  <Download className="w-4.5 h-4.5" />
                  <div className="text-left">
                    <div className="font-semibold">Export All Data</div>
                    <div className="text-xs text-white/50 mt-0.5">Download a JSON backup of all orders &amp; settings</div>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="border-t border-white/[0.06]" />

                {/* Danger Zone */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400/60" />
                    <span className="text-xs font-semibold text-red-400/60 uppercase tracking-wider">Danger Zone</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.12] border border-red-500/10 hover:border-red-500/20 transition-all duration-200"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                    <div className="text-left">
                      <div className="font-semibold">Clear All Order Data</div>
                      <div className="text-xs text-red-400/50 mt-0.5">Permanently delete all print orders, inquiries &amp; bookings</div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-xs text-white/20 pb-4"
        >
          PKG Shop Admin Dashboard &middot; Settings
        </motion.div>
      </motion.div>
    </>
  );
}
