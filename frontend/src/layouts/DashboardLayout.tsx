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
  BarChart3
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

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
