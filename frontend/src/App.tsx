import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Batches from './pages/Batches';
import POS from './pages/POS';
import Patients from './pages/Patients';
import Alerts from './pages/Alerts';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import System from './pages/System';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import SupplierDetail from './pages/SupplierDetail';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import CreditManagement from './pages/CreditManagement';
import IntelligentForecasting from './pages/IntelligentForecasting';
import SalesHistory from './pages/SalesHistory';
import StockAudit from './pages/StockAudit';
import PaymentAccounts from './pages/PaymentAccounts';
import Cosmetics from './pages/Cosmetics';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from './components/Toast';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import TenantList from './pages/super-admin/TenantList';
import SuperAdminBilling from './pages/super-admin/Billing';
import SuperAdminAudit from './pages/super-admin/AuditLogs';
import SubscriptionPlans from './pages/super-admin/SubscriptionPlans';
import TenantDetails from './pages/super-admin/TenantDetails';
import MasterInventory from './pages/super-admin/MasterInventory';
import LicenseGenerator from './pages/super-admin/LicenseGenerator';
import LicenseLock from './pages/LicenseLock';
import Settings from './pages/Settings';
// System page is shared between Admin (read-only backup) and SuperAdmin (full access)
// System is already imported above

import { useState, useEffect } from 'react';
import client from './api/client';

const isElectron = 
  (typeof window !== 'undefined' && window.location.protocol === 'file:') ||
  (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron'));

const Router = isElectron ? HashRouter : BrowserRouter;

/**
 * LicenseGate — blocks the entire app until the hardware license is verified.
 *
 * Strategy:
 *  1. Show an inline loading splash (nothing else renders).
 *  2. Poll /license/status (with retries for slow backend startup).
 *  3. If valid  → set state to 'ok', render children (normal app).
 *  4. If invalid → set window.location.hash = '#/license-lock' BEFORE
 *     rendering children, so HashRouter mounts reading the correct route.
 *     No redirect, no race: the router simply starts at the right page.
 *
 * In non-Electron (web) mode the check is bypassed immediately.
 * The Electron main process ALSO pre-sets the hash before the window loads,
 * giving us double protection; this gate handles refreshes and edge cases.
 */
const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  // Web mode: no license gate needed
  const [gateState, setGateState] = useState<'checking' | 'ok' | 'locked'>(
    isElectron ? 'checking' : 'ok'
  );

  useEffect(() => {
    if (!isElectron) return;

    let cancelled = false;

    const check = async (attempt = 0) => {
      try {
        const res = await client.get('/license/status');
        if (cancelled) return;

        if (res.data.isValid) {
          setGateState('ok');
        } else {
          // Set hash BEFORE state update so HashRouter reads it on mount
          window.location.hash = '#/license-lock';
          setGateState('locked');
        }
      } catch (err: any) {
        if (cancelled) return;

        if (err.response?.status === 402) {
          window.location.hash = '#/license-lock';
          setGateState('locked');
        } else if (attempt < 12) {
          // Backend may still be starting — retry every 1.5 s (max ~18 s total)
          setTimeout(() => { if (!cancelled) check(attempt + 1); }, 1500);
        } else {
          // Exhausted retries — assume unlicensed to be safe
          console.warn('[LicenseGate] Backend unreachable after retries — showing lock screen');
          window.location.hash = '#/license-lock';
          setGateState('locked');
        }
      }
    };

    check();
    return () => { cancelled = true; };
  }, []);

  // Show a lightweight loading screen while we wait.
  // This renders NOTHING from the actual app, so there is zero flash.
  if (gateState === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2238 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Segoe UI, sans-serif',
        gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>💊</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Pharmacy Management System</h1>
        <p style={{ color: '#90b8d8', margin: 0, fontSize: 13 }}>Verifying hardware license…</p>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(255,255,255,0.2)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginTop: 8,
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // For both 'ok' and 'locked':
  // - 'ok'     → children render at whatever hash is current (root / saved route)
  // - 'locked' → window.location.hash is already '#/license-lock'; HashRouter
  //              will mount reading that hash → LicenseLock renders immediately
  return <>{children}</>;
};



function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <LicenseGate>
          <ToastContainer />
          <OfflineBanner />
        <Routes>
          <Route path="/license-lock" element={<LicenseLock />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="medicines"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN']}>
                  <Medicines />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
                  <Batches />
                </ProtectedRoute>
              }
            />
            <Route
              path="cosmetics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN']}>
                  <Cosmetics />
                </ProtectedRoute>
              }
            />
            <Route
              path="pos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN']}>
                  <POS />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR', 'CASHIER', 'SUPER_ADMIN']}>
                  <SalesHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR', 'SUPER_ADMIN']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN']}>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="alerts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR', 'SUPER_ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="system"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <System />
                </ProtectedRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="suppliers/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <SupplierDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="purchases"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
                  <Purchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="expenses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="credit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR', 'CASHIER', 'SUPER_ADMIN']}>
                  <CreditManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="forecasting"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
                  <IntelligentForecasting />
                </ProtectedRoute>
              }
            />
            <Route
              path="stock-audit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
                  <StockAudit />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment-accounts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'CASHIER']}>
                  <PaymentAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>
          
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<TenantList />} />
            <Route path="tenants/:id" element={<TenantDetails />} />
            <Route path="billing" element={<SuperAdminBilling />} />
            <Route path="subscription-plans" element={<SubscriptionPlans />} />
            <Route path="audit-logs" element={<SuperAdminAudit />} />
            <Route path="system" element={<System />} />
            <Route path="inventory" element={<MasterInventory />} />
            <Route path="license-generator" element={<LicenseGenerator />} />
          </Route>

          <Route path="/login" element={<Login />} />
        </Routes>
        </LicenseGate>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
