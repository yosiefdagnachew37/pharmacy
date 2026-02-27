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
  LogOut
} from 'lucide-react';

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-800">
          <div className="text-xl font-bold">Pharmacy ERP</div>
          {user && (
            <div className="mt-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                {user.username.charAt(0)}
              </div>
              <div className="ml-2">
                <div className="text-sm font-semibold text-indigo-100">{user.username}</div>
                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${roleBadgeColors[role!] || 'bg-gray-500'} text-white`}>
                  {role}
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center px-6 py-3 transition-colors ${isActive
                  ? 'bg-indigo-800 text-white border-r-4 border-indigo-300'
                  : 'text-indigo-100 hover:bg-indigo-800'
                  }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-4 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors border-t border-indigo-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">Pharmacy Management System</h2>
          {role && role !== 'ADMIN' && (
            <span className="text-xs text-gray-400 font-medium">
              Some features may be restricted based on your role
            </span>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
