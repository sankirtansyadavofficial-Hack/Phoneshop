import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import LoginPage from './components/admin/login-page.tsx'
import AdminLayout from './components/admin/admin-layout.tsx'
import DashboardPage from './components/admin/dashboard-page.tsx'
import { InventoryPage } from './components/admin/inventory-page.tsx'
import { PrintOrdersPage } from './components/admin/print-orders-page.tsx'
import { ShowroomOrdersPage } from './components/admin/showroom-orders-page.tsx'
import { TerminalBookingsPage } from './components/admin/terminal-bookings-page.tsx'
import SettingsPage from './components/admin/settings-page.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Customer Website */}
        <Route path="/" element={<App />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin Dashboard (Protected) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="print-orders" element={<PrintOrdersPage />} />
          <Route path="showroom" element={<ShowroomOrdersPage />} />
          <Route path="showroom-orders" element={<Navigate to="/admin/showroom" replace />} />
          <Route path="terminals" element={<TerminalBookingsPage />} />
          <Route path="terminal-bookings" element={<Navigate to="/admin/terminals" replace />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
