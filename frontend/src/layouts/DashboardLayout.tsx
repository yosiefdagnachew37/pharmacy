import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  CheckCircle,
  AlertTriangle,
  Settings,
  Sparkles
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import Modal from '../components/Modal';
import SubscriptionModal from '../components/SubscriptionModal';
import client from '../api/client';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  roles: UserRole[]; // which roles can see this item
  requiredFeature?: string; // which subscription plan feature is required
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'AUDITOR', 'SUPER_ADMIN'] },
  { icon: Pill, label: 'Medicines', path: '/medicines', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN'] },
  { icon: Sparkles, label: 'Cosmetics', path: '/cosmetics', roles: ['ADMIN', 'PHARMACIST', 'SUPER_ADMIN'] },
  { icon: Package, label: 'Batches', path: '/batches', roles: ['ADMIN', 'PHARMACIST', 'SUPER_ADMIN'] },
  { icon: ShoppingCart, label: 'POS / Sales', path: '/pos', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN'] },
  { icon: History, label: 'Sales', path: '/sales', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'AUDITOR', 'SUPER_ADMIN'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['ADMIN', 'PHARMACIST', 'AUDITOR', 'SUPER_ADMIN'] },
  { icon: Users, label: 'Patients', path: '/patients', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN'] },
  { icon: AlertCircle, label: 'Alerts', path: '/alerts', roles: ['ADMIN', 'PHARMACIST', 'SUPER_ADMIN'] },
  { icon: History, label: 'Audit Logs', path: '/audit', roles: ['ADMIN', 'AUDITOR', 'SUPER_ADMIN'] },
  { icon: Building2, label: 'Suppliers', path: '/suppliers', roles: ['ADMIN', 'SUPER_ADMIN'], requiredFeature: 'Suppliers' },
  { icon: ShoppingBag, label: 'Purchases', path: '/purchases', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'SUPER_ADMIN'], requiredFeature: 'Purchases' },
  { icon: BarChart2, label: 'Forecasting', path: '/forecasting', roles: ['ADMIN', 'PHARMACIST', 'SUPER_ADMIN'], requiredFeature: 'Intelligent Forecasting' },
  { icon: CheckCircle, label: 'Stock Audit', path: '/stock-audit', roles: ['ADMIN', 'PHARMACIST', 'SUPER_ADMIN'] },
  { icon: Wallet2, label: 'Expenses', path: '/expenses', roles: ['ADMIN', 'SUPER_ADMIN'], requiredFeature: 'Expenses' },
  { icon: CreditCard, label: 'Credit Mgmt', path: '/credit', roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'AUDITOR', 'SUPER_ADMIN'], requiredFeature: 'Credit' },
  { icon: Wallet2, label: 'Payment Accounts', path: '/payment-accounts', roles: ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] },
  { icon: Shield, label: 'System', path: '/system', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { icon: Shield, label: 'Super Admin Panel', path: '/super-admin', roles: ['SUPER_ADMIN'] },
];

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: 'bg-red-500',
  PHARMACIST: 'bg-emerald-500',
  CASHIER: 'bg-amber-500',
  AUDITOR: 'bg-sky-500',
  SUPER_ADMIN: 'bg-indigo-600',
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, selectedOrganization, hasFeature } = useAuth();
  const { pharmacyLogo } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

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

  // Filter menu items based on user role and plan features
  const visibleMenuItems = allMenuItems.filter(item => {
    if (!role || !item.roles.includes(role)) return false;
    if (item.requiredFeature && !hasFeature(item.requiredFeature)) return false;
    return true;
  });

  // Subscription expiry warning (7-day countdown)
  const expiryWarning = (() => {
    if (!user || role === 'SUPER_ADMIN') return null;
    const expiryStr = user.subscription_expiry_date;
    if (!expiryStr) return null;
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0 || diffDays > 7) return null;
    return diffDays;
  })();

  if (user && role !== 'SUPER_ADMIN' && ['EXPIRED', 'SUSPENDED'].includes(user.subscription_status || '')) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full rounded-3xl shadow-xl border border-rose-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Access Blocked</h2>
          <p className="text-gray-500 mb-8 font-medium">
            {user.subscription_status === 'SUSPENDED'
              ? 'Your organization has been suspended. Please contact the platform administration to restore service.'
              : 'Your pharmacy subscription has expired. Please contact the platform administration to renew your plan.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition"
              onClick={() => window.open('mailto:support@pharmacy-erp.com')}
            >
              Contact Support Support
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-indigo-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {pharmacyLogo ? (
              <img src={pharmacyLogo} alt="Pharmacy Logo" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-700/60 flex items-center justify-center text-indigo-200">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <div className="text-base font-bold text-white leading-tight">Pharmacy ERP</div>
          </div>
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
                  ETB {Number(scannedMed.current_selling_price || scannedMed.selling_price || 0).toFixed(2)}
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
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-12 border-b border-gray-100/50">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-3 -ml-2 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-95"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">
                {visibleMenuItems.find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Pharmacy ERP'}
              </h2>
              <p className="hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {role && (
              <>
                <div className="hidden sm:flex flex-col items-end mr-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${roleBadgeColors[role] || 'bg-gray-400'} mr-2 animate-pulse`} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                      {role === 'SUPER_ADMIN' ? 'Platform Admin' : role}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-tight mt-0.5">
                    {role === 'SUPER_ADMIN' && selectedOrganization
                      ? `Viewing: ${selectedOrganization.name}`
                      : user?.organizationName || 'Pharmacy'}
                  </div>
                </div>

                <NotificationBell />

                {role === 'ADMIN' && (
                  <button
                    onClick={() => setIsSubscriptionOpen(true)}
                    className="p-2 lg:p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all active:scale-95 group relative flex items-center justify-center shrink-0"
                    title="Subscription Overview"
                  >
                    <CreditCard className="w-5 h-5" />
                    {expiryWarning !== null && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-bounce"></span>
                    )}
                  </button>
                )}

                <Link
                  to="/settings"
                  className="p-2 lg:p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 group relative flex items-center justify-center shrink-0"
                  title="Pharmacy Settings"
                >
                  <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </Link>

                {/* <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-white shrink-0">
                  <span className="text-sm lg:text-base font-black uppercase tracking-widest">{user?.username.charAt(0)}</span>
                </div> */}
              </>
            )}
          </div>
        </header>

        {/* Subscription Expiry Warning Banner */}
        {expiryWarning !== null && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 lg:px-12 py-3 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">
                ⚠️ Your subscription expires in <span className="underline decoration-2">{expiryWarning} day{expiryWarning !== 1 ? 's' : ''}</span>.
                Please contact your system administrator to renew your plan.
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
