import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Batches from './pages/Batches';
import POS from './pages/POS';
import Patients from './pages/Patients';
import Alerts from './pages/Alerts';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import System from './pages/System';
import SalesLog from './pages/SalesLog';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import CreditManagement from './pages/CreditManagement';
import IntelligentForecasting from './pages/IntelligentForecasting';
import SalesHistory from './pages/SalesHistory';
import StockAudit from './pages/StockAudit';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineBanner />
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="medicines"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER']}>
                  <Medicines />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
                  <Batches />
                </ProtectedRoute>
              }
            />
            <Route
              path="pos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER']}>
                  <POS />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR']}>
                  <SalesLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER']}>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="alerts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'AUDITOR']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="system"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <System />
                </ProtectedRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="purchases"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
                  <Purchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="expenses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="credit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'AUDITOR']}>
                  <CreditManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="forecasting"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
                  <IntelligentForecasting />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales-history"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'CASHIER']}>
                  <SalesHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="stock-audit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
                  <StockAudit />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
