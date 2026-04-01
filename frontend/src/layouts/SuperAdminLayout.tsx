import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { getTenants, type Tenant } from '../api/superAdminService';
import { 
  Squares2X2Icon, 
  BuildingOffice2Icon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  InboxStackIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/super-admin', icon: Squares2X2Icon },
  { name: 'Tenants', href: '/super-admin/tenants', icon: BuildingOffice2Icon },
  { name: 'Master Inventory', href: '/super-admin/inventory', icon: InboxStackIcon },
  { name: 'Billing', href: '/super-admin/billing', icon: CreditCardIcon },
  { name: 'Plans', href: '/super-admin/subscription-plans', icon: TicketIcon },
  { name: 'Audit Logs', href: '/super-admin/audit', icon: ClipboardDocumentListIcon },
  { name: 'System', href: '/super-admin/system', icon: CogIcon },
  { name: 'Pharmacy View', href: '/', icon: ShieldCheckIcon },
];

export default function SuperAdminLayout() {
  const { user, logout, selectedOrganization, setSelectedOrganization } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    getTenants().then(data => {
      setTenants(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePharmacyViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOrgModalOpen(true);
  };

  const handleSelectOrg = (orgId: string) => {
    const org = tenants.find(t => t.id === orgId);
    if (org) {
      setSelectedOrganization({ id: org.id, name: org.name });
      setIsOrgModalOpen(false);
      navigate('/');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 shrink-0 px-4 bg-indigo-950">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-400 mr-2" />
            <span className="text-xl font-bold tracking-tight">Super Admin</span>
          </div>
          <button
            className="md:hidden text-indigo-200 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const isPharmacyView = item.name === 'Pharmacy View';
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={isPharmacyView ? handlePharmacyViewClick : undefined}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                  {isPharmacyView && (
                    <span className="ml-auto bg-indigo-500 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-tighter uppercase text-white">
                      Switch
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      <Modal 
        isOpen={isOrgModalOpen} 
        onClose={() => setIsOrgModalOpen(false)} 
        title="Select Pharmacy to View"
      >
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Available Organizations</p>
          
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-xs">Loading tenants...</p>
              </div>
            ) : filteredTenants.length > 0 ? (
              filteredTenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectOrg(t.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left group"
                >
                  <div>
                    <div className="font-bold text-gray-900 group-hover:text-indigo-700">{t.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-medium">{t.id.slice(0, 8)}...</div>
                  </div>
                  {selectedOrganization?.id === t.id && (
                    <ShieldCheckIcon className="h-5 w-5 text-indigo-500" />
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">No organizations found.</div>
            )}
          </div>
        </div>
      </Modal>

        <div className="shrink-0 flex border-t border-indigo-800 p-4 shrink-0 mt-auto">
          <div className="flex items-center w-full">
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs font-medium text-indigo-300 truncate">Platform Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hamburger) */}
        <div className="md:hidden flex items-center h-16 shrink-0 px-4 bg-white border-b border-gray-200 sticky top-0 z-30 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-gray-900">Admin Portal</span>
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto outline-none">
          <div className="py-6 min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
