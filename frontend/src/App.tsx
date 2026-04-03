import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import LicenseLock from './pages/LicenseLock';
// System page is shared between Admin (read-only backup) and SuperAdmin (full access)
// System is already imported above

const isElectron = 
  (typeof window !== 'undefined' && window.location.protocol === 'file:') ||
  (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron'));

const Router = isElectron ? HashRouter : BrowserRouter;

function App() {
  return (
    <AuthProvider>
      <Router>
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
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR', 'SUPER_ADMIN']}>
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
          </Route>
          
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<TenantList />} />
            <Route path="tenants/:id" element={<TenantDetails />} />
            <Route path="inventory" element={<MasterInventory />} />
            <Route path="billing" element={<SuperAdminBilling />} />
            <Route path="audit" element={<SuperAdminAudit />} />
            <Route path="system" element={<System />} />
            <Route path="subscription-plans" element={<SubscriptionPlans />} />
          </Route>

          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
