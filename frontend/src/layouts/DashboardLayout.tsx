import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Pill,
  Package,
  Users,
  FileText,
  AlertCircle,
  History,
  ShoppingCart,
  Shield,
  LogOut,
  Menu,
  X,
  BarChart2,
  BarChart3,
  Building2,
  ShoppingBag,
  Wallet2,
  CreditCard,
  Barcode,
  Search as SearchIcon,
  Pill as MedicineIcon,
  CheckCircle
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import Modal from '../components/Modal';
import client from '../api/client';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  roles: UserRole[]; // which roles can see this item
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'AUDITOR'] },
  { icon: Pill, label: 'Medicines', path: '/medicines', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { icon: Package, label: 'Batches', path: '/batches', roles: ['ADMIN', 'PHARMACIST'] },
  { icon: ShoppingCart, label: 'POS / Sales', path: '/pos', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { icon: FileText, label: 'Sales Log', path: '/sales', roles: ['ADMIN', 'PHARMACIST', 'AUDITOR'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['ADMIN', 'PHARMACIST', 'AUDITOR'] },
  { icon: Users, label: 'Patients', path: '/patients', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { icon: FileText, label: 'Prescriptions', path: '/prescriptions', roles: ['ADMIN', 'PHARMACIST'] },
  { icon: AlertCircle, label: 'Alerts', path: '/alerts', roles: ['ADMIN', 'PHARMACIST'] },
  { icon: History, label: 'Audit Logs', path: '/audit', roles: ['ADMIN', 'AUDITOR'] },
  { icon: Building2, label: 'Suppliers', path: '/suppliers', roles: ['ADMIN'] },
  { icon: ShoppingBag, label: 'Purchases', path: '/purchases', roles: ['ADMIN', 'PHARMACIST'] },
  { icon: BarChart2, label: 'Forecasting', path: '/forecasting', roles: ['ADMIN', 'PHARMACIST'] },
  { icon: History, label: 'Sales History', path: '/sales-history', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { icon: CheckCircle, label: 'Stock Audit', path: '/stock-audit', roles: ['ADMIN', 'PHARMACIST'] },
  { icon: Wallet2, label: 'Expenses', path: '/expenses', roles: ['ADMIN'] },
  { icon: CreditCard, label: 'Credit Mgmt', path: '/credit', roles: ['ADMIN', 'PHARMACIST', 'AUDITOR'] },
  { icon: Shield, label: 'System', path: '/system', roles: ['ADMIN'] },
];

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: 'bg-red-500',
  PHARMACIST: 'bg-emerald-500',
  CASHIER: 'bg-amber-500',
  AUDITOR: 'bg-sky-500',
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Barcode Lookup State
  const [scannedMed, setScannedMed] = useState<any>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleGlobalScan = async (barcode: string) => {
    // Only search if we're not currently in a lookup
    if (isLookupOpen) return;

    setIsLookupOpen(true);
    setLookupLoading(true);
    try {
      const res = await client.get(`/medicines/search?q=${barcode}`);
      if (res.data && res.data.length > 0) {
        setScannedMed(res.data[0]);
      } else {
        setScannedMed(null);
      }
    } catch (err) {
      console.error('Lookup failed', err);
      setScannedMed(null);
    } finally {
      setLookupLoading(false);
    }
  };

  useBarcodeScanner(handleGlobalScan);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter menu items based on user role
  const visibleMenuItems = allMenuItems.filter(item =>
    role ? item.roles.includes(role) : false
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-indigo-800 flex items-center justify-between">
          <div className="text-xl font-bold">Pharmacy ERP</div>
          <button
            className="lg:hidden text-indigo-200 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {user && (
          <div className="px-6 py-4 border-b border-indigo-800 bg-indigo-950/30">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold uppercase ring-2 ring-indigo-500/50">
                {user.username.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="text-sm font-semibold text-indigo-100">{user.username}</div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${roleBadgeColors[role!] || 'bg-gray-500'} text-white mt-1 shadow-sm`}>
                  {role}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 mt-6 overflow-y-auto custom-scrollbar">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center px-6 py-3.5 transition-all ${isActive
                  ? 'bg-indigo-800 text-white border-r-4 border-indigo-300 shadow-inner'
                  : 'text-indigo-100 hover:bg-indigo-800/50 hover:pl-7'
                  }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-5 text-indigo-300 hover:bg-red-900/20 hover:text-red-300 transition-colors border-t border-indigo-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Quick Lookup Modal */}
      <Modal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        title="Inventory Quick Lookup"
      >
        {lookupLoading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Identifying product...</p>
          </div>
        ) : scannedMed ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <MedicineIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{scannedMed.name}</h3>
                <p className="text-sm text-gray-500">{scannedMed.generic_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Stock</span>
                <span className={`text-lg font-black ${scannedMed.total_stock <= 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {scannedMed.total_stock} {scannedMed.unit}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Selling Price</span>
                <span className="text-lg font-black text-indigo-700">
                  ${Number(scannedMed.current_selling_price || scannedMed.selling_price || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <Barcode className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Barcode / SKU</span>
                <span className="text-sm font-mono font-bold text-gray-700">{scannedMed.barcode || scannedMed.sku || 'N/A'}</span>
              </div>
            </div>

            <button
              onClick={() => setIsLookupOpen(false)}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Close Lookup
            </button>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Product Not Found</h3>
            <p className="text-gray-500 mt-1">The scanned code does not match any items in the database.</p>
            <button
              onClick={() => setIsLookupOpen(false)}
              className="mt-6 px-8 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-all"
            >
              Dismiss
            </button>
          </div>
        )}
      </Modal>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 border-b border-gray-100">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 mr-3 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 truncate">
              Pharmacy System
            </h2>
          </div>
          {role && (
            <div className="flex items-center">
              <span className="hidden md:block text-xs text-gray-400 font-bold uppercase tracking-tight mr-4">
                Session: <span className="text-indigo-600">{role}</span>
              </span>
              <NotificationBell />
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100 ml-2">
                <Users className="w-4 h-4" />
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
