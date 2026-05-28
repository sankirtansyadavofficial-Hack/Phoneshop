import { useState, useEffect, useMemo } from 'react';
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Printer,
  ShoppingBag,
  Monitor,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import { isAdminAuthenticated, setAdminSession } from '@/lib/store';

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/admin/inventory', icon: BarChart3 },
  { label: 'Print Orders', path: '/admin/print-orders', icon: Printer },
  { label: 'Showroom', path: '/admin/showroom', icon: ShoppingBag },
  { label: 'Terminals', path: '/admin/terminals', icon: Monitor },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

// ─── Page title resolver ─────────────────────────────────────────────────────

function usePageTitle(): string {
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  return match?.label ?? 'Dashboard';
}

// ─── Sidebar Link ────────────────────────────────────────────────────────────

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
  onMobileClose?: () => void;
}

function SidebarLink({ item, collapsed, onMobileClose }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onMobileClose}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'text-blue-400 bg-blue-500/[0.08]'
            : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <Icon
            className={[
              'w-[18px] h-[18px] shrink-0 transition-colors duration-200',
              isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70',
            ].join(' ')}
            strokeWidth={1.8}
          />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Admin Layout ────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const navigate = useNavigate();
  const pageTitle = usePageTitle();

  // Sidebar state
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Close mobile sidebar on route change
  const { pathname } = useLocation();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    setAdminSession(false);
    navigate('/admin/login', { replace: true });
  };

  // Sidebar width
  const sidebarWidth = desktopCollapsed ? 72 : 256;

  // Greeting based on time
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#030303]">
      {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col shrink-0 border-r border-white/[0.06] relative z-30"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo */}
        <div
          className={[
            'flex items-center h-16 px-4 border-b border-white/[0.06] shrink-0',
            desktopCollapsed ? 'justify-center' : 'gap-3',
          ].join(' ')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          {!desktopCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-sm font-bold text-white tracking-tight"
              style={{ fontFamily: "'Outfit', 'Inter', system-ui" }}
            >
              PKG Shop
            </motion.span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              collapsed={desktopCollapsed}
            />
          ))}
        </nav>

        {/* Collapse + Logout */}
        <div className="border-t border-white/[0.06] px-3 py-3 space-y-1 shrink-0">
          <button
            onClick={() => setDesktopCollapsed((c) => !c)}
            className={[
              'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium',
              'text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200',
              desktopCollapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            <motion.div
              animate={{ rotate: desktopCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </motion.div>
            {!desktopCollapsed && <span>Collapse</span>}
          </button>

          <button
            onClick={handleLogout}
            className={[
              'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium',
              'text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200',
              desktopCollapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {!desktopCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ─── Mobile Sidebar Overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[264px] flex flex-col border-r border-white/[0.06] lg:hidden"
              style={{
                background:
                  'linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(5,5,5,0.99) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span
                    className="text-sm font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Outfit', 'Inter', system-ui" }}
                  >
                    PKG Shop
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    collapsed={false}
                    onMobileClose={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              {/* Logout */}
              <div className="border-t border-white/[0.06] px-3 py-3 shrink-0">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
                >
                  <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06]"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1
                className="text-lg font-semibold text-white tracking-tight"
                style={{ fontFamily: "'Outfit', 'Inter', system-ui" }}
              >
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-white/40 leading-none mb-0.5">
                {greeting}
              </p>
              <p className="text-sm font-medium text-white/80 leading-none">
                Pankaj
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/15 ring-2 ring-white/[0.06]">
              <span className="text-white text-xs font-bold">P</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 sm:p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
