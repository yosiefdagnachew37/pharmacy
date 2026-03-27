import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import ColumnFilter from '../../components/ColumnFilter';
import { getTenants, suspendTenant, activateTenant, createTenant, type Tenant } from '../../api/superAdminService';
import { 
  BuildingOffice2Icon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from '../../components/ConfirmModal';
import { toastSuccess, toastError } from '../../components/Toast';

export default function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ 
    name: '', 
    subscription_plan: 'BASIC' as const,
    admin_username: '',
    admin_password: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendConfirmId, setSuspendConfirmId] = useState<string | null>(null);
  
  // Advanced Column Filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    name: [],
    id: [],
    plan: [],
    status: []
  });

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

  const fetchTenants = async () => {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createTenant(newTenant);
      toastSuccess('Organization Deployed', `${newTenant.name} is now live on the platform.`);
      setIsModalOpen(false);
      setNewTenant({ 
        name: '', 
        subscription_plan: 'BASIC',
        admin_username: '',
        admin_password: ''
      });
      fetchTenants();
    } catch (err: any) {
      console.error('Failed to create tenant', err);
      toastError('Deployment Failed', err?.response?.data?.message || 'Could not provision new tenant.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    if (current) {
      setSuspendConfirmId(id);
      return;
    }
    
    try {
      await activateTenant(id);
      toastSuccess('Node Activated', 'The pharmacy node is now healthy and operational.');
      fetchTenants();
    } catch (err) {
      toastError('Activation Error', 'Could not reactivate the pharmacy node.');
    }
  };

  const confirmSuspend = async () => {
    if (!suspendConfirmId) return;
    try {
      await suspendTenant(suspendConfirmId);
      toastSuccess('Node Suspended', 'Access has been revoked for this organizational node.');
      fetchTenants();
    } catch (err) {
      toastError('Suspension Error', 'Failed to suspend the node.');
    } finally {
      setSuspendConfirmId(null);
    }
  };

  const uniqueNames = useMemo(() => [...new Set(tenants.map(t => t.name))].sort(), [tenants]);
  const planOptions = ['BASIC', 'SILVER', 'GOLD'];
  const statusOptions = ['Healthy', 'Suspended'];

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesName = columnFilters.name.length === 0 || columnFilters.name.includes(t.name);
      const matchesPlan = columnFilters.plan.length === 0 || columnFilters.plan.includes(t.subscription_plan);
      const status = t.is_active ? 'Healthy' : 'Suspended';
      const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(status);
      return matchesName && matchesPlan && matchesStatus;
    });
  }, [tenants, columnFilters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sm:flex sm:items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="mt-0.5 text-[10px] text-gray-500 font-medium uppercase tracking-tight">Provision and manage active pharmacy nodes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Onboard New Tenant
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BuildingOffice2Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Total Nodes</div>
            <div className="text-xl font-bold text-gray-900">{tenants.length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active</div>
            <div className="text-xl font-black text-gray-900">{tenants.filter(t => t.is_active).length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <NoSymbolIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Suspended</div>
            <div className="text-xl font-black text-gray-900">{tenants.filter(t => !t.is_active).length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Results Header with Reset */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
            <BuildingOffice2Icon className="h-3.5 w-3.5" />
            <span>{filteredTenants.length} Nodes Found</span>
          </div>
          {activeFilterCount > 0 && (
            <button 
              onClick={() => setColumnFilters({ name: [], id: [], plan: [], status: [] })}
              className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <FunnelIcon className="h-3 w-3" />
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="max-h-[calc(100vh-320px)] min-h-[400px] overflow-y-auto custom-scrollbar pb-48">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 sticky top-0 z-30 backdrop-blur-md">
              <tr className="border-b border-gray-100">
                <ColumnFilter
                  label="Pharmacy Name"
                  options={uniqueNames}
                  selectedValues={columnFilters.name}
                  onFilterChange={(v) => updateFilter('name', v)}
                  className="px-8 py-4"
                />
                <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Internal ID</th>
                <ColumnFilter
                  label="Subscription Plan"
                  options={planOptions}
                  selectedValues={columnFilters.plan}
                  onFilterChange={(v) => updateFilter('plan', v)}
                  className="px-6 py-4"
                />
                <ColumnFilter
                  label="Health Status"
                  options={statusOptions}
                  selectedValues={columnFilters.status}
                  onFilterChange={(v) => updateFilter('status', v)}
                  className="px-6 py-4"
                />
                <th className="px-8 py-4 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="px-8 py-1.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
                        <BuildingOffice2Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-xs group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{tenant.name}</div>
                        <div className="text-[9px] text-gray-400 font-medium">Platform Node {tenant.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <code className="text-[10px] bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-gray-600 font-mono">
                      {tenant.id.slice(0, 12)}
                    </code>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-tighter ${
                      tenant.subscription_plan === 'GOLD' ? 'bg-amber-100 text-amber-600' :
                      tenant.subscription_plan === 'SILVER' ? 'bg-gray-100 text-gray-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {tenant.subscription_plan}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${tenant.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                       <span className={`text-[9px] font-bold uppercase ${tenant.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {tenant.is_active ? 'Healthy' : 'Suspended'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 transition-all">
                      <button
                        onClick={() => toggleStatus(tenant.id, tenant.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all ${
                          tenant.is_active 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {tenant.is_active ? 'Suspend' : 'Activate'}
                      </button>
                      <Link 
                         to={`/super-admin/tenants/${tenant.id}`}
                         className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                         <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No organizations found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tenant Modal stays the same... */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New Node">
        <form onSubmit={handleCreate} className="space-y-6 pt-2">
          {/* ... existing modal content ... */}
          <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-4">
            <BuildingOffice2Icon className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-indigo-900">New Deployment</p>
              <p className="text-xs text-indigo-700">Enter the pharmacy details to create a new isolated database tenant.</p>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Pharmacy Name</label>
            <input
              type="text"
              required
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              placeholder="e.g. HealthFirst Pharmacy"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Service Tier</label>
            <select
              value={newTenant.subscription_plan}
              onChange={(e) => setNewTenant({ ...newTenant, subscription_plan: e.target.value as any })}
              className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
            >
              <option value="BASIC">BASIC TIER</option>
              <option value="SILVER">SILVER TIER</option>
              <option value="GOLD">GOLD TIER</option>
            </select>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Initial Administrator Account</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Admin Username/Email</label>
                <input
                  type="text"
                  required
                  value={newTenant.admin_username}
                  onChange={(e) => setNewTenant({ ...newTenant, admin_username: e.target.value })}
                  className="block w-full bg-white border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. admin@pharmacy.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newTenant.admin_password}
                  onChange={(e) => setNewTenant({ ...newTenant, admin_password: e.target.value })}
                  className="block w-full bg-white border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <p className="text-[9px] text-gray-400 italic">User will be assigned the 'ADMIN' role automatically upon deployment.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={actionLoading}
              className="flex-[2] px-4 py-4 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-black text-sm tracking-widest uppercase"
            >
              {actionLoading ? 'Deploying...' : 'Deploy Organization'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!suspendConfirmId}
        onClose={() => setSuspendConfirmId(null)}
        onConfirm={confirmSuspend}
        title="Suspend Organization"
        message="Are you sure you want to suspend this node? All staff access will be immediately revoked across the pharmaceutical network."
      />
    </div>
  );
}
