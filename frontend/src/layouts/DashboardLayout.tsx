import { Link, Outlet, useNavigate } from 'react-router-dom';
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

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Pill, label: 'Medicines', path: '/medicines' },
    { icon: Package, label: 'Batches', path: '/batches' },
    { icon: ShoppingCart, label: 'POS / Sales', path: '/pos' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: FileText, label: 'Prescriptions', path: '/prescriptions' },
    { icon: AlertCircle, label: 'Alerts', path: '/alerts' },
    { icon: History, label: 'Audit Logs', path: '/audit' },
    { icon: Shield, label: 'System', path: '/system' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-indigo-800">
          Pharmacy ERP
        </div>
        
        <nav className="flex-1 mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-800 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
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
        <header className="h-16 bg-white shadow-sm flex items-center px-8">
          <h2 className="text-xl font-semibold text-gray-800">Pharmacy Management System</h2>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
