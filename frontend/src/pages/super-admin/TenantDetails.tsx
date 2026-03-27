import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  UsersIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  getTenant, 
  updateTenant, 
  getTenantUsers,
  createTenantUser,
  updateTenantUser,
  deleteTenantUser 
} from '../../api/superAdminService';
import { CheckIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { toastSuccess, toastError } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import Modal from '../../components/Modal';

export default function TenantDetails() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'PHARMACIST',
    manager_pin: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  const fetchTenant = () => {
    if (id) {
      setLoading(true);
      Promise.all([
        getTenant(id),
        getTenantUsers(id)
      ]).then(([tenantRes, usersRes]) => {
        setTenant(tenantRes);
        setUsers(usersRes);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handlePlanUpdate = async (newPlan: 'BASIC' | 'SILVER' | 'GOLD') => {
    if (!id || newPlan === tenant.subscription_plan) return;
    setUpdating(true);
    try {
      await updateTenant(id, { subscription_plan: newPlan });
      toastSuccess('Tier Upgraded', `Pharmacy node has been transitioned to the ${newPlan} plan.`);
      setIsSubModalOpen(false);
      fetchTenant();
    } catch (err) {
      console.error('Failed to update subscription', err);
      toastError('Upgrade Failed', 'Could not transition organization to the new service tier.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionLoading(true);
    
    try {
      const payload: any = { 
        ...userFormData, 
        organization_id: id
      };
      
      if (!payload.manager_pin) delete payload.manager_pin;
      
      if (editingUser) {
        if (!payload.password) delete (payload as any).password;
        await updateTenantUser(editingUser.id, payload);
        toastSuccess('Staff Updated', 'Account details have been modified successfully.');
      } else {
        await createTenantUser(payload);
        toastSuccess('Staff Provisioned', `Account for ${payload.username} has been created.`);
      }
      
      setIsUserModalOpen(false);
      setUserFormData({ username: '', password: '', role: 'PHARMACIST', manager_pin: '' });
      fetchTenant();
    } catch (err: any) {
      console.error('Failed to save user', err);
      const errorMsg = err?.response?.data?.message || 'Could not save staff changes.';
      toastError('Operational Error', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUserToDeleteId(userId);
  };

  const confirmDeleteUser = async () => {
    if (!userToDeleteId) return;
    try {
      await deleteTenantUser(userToDeleteId);
      toastSuccess('Staff Revoked', 'The account has been successfully deactivated.');
      fetchTenant();
    } catch (err) {
      console.error('Failed to delete user', err);
      toastError('Error', 'Failed to deactivate staff account.');
    } finally {
      setUserToDeleteId(null);
    }
  };

  const PLANS = [
    { 
      id: 'BASIC', 
      name: 'Basic Node', 
      price: '1,500', 
      features: ['Standard Inventory', 'Single Branch', 'Basic Reporting'],
      color: 'indigo'
    },
    { 
      id: 'SILVER', 
      name: 'Silver Growth', 
      price: '3,500', 
      features: ['Pro Inventory', 'Up to 3 Branches', 'Advanced Analytics', 'SMS Notifications'],
      color: 'purple'
    },
    { 
      id: 'GOLD', 
      name: 'Gold Enterprise', 
      price: '7,500', 
      features: ['Unlimited Branches', 'Full API Access', '24/7 Priority Support', 'Dedicated Account Manager'],
      color: 'amber'
    }
  ];

  if (loading) return <div className="p-8 text-center">Loading pharmacy profile...</div>;
  if (!tenant) return <div className="p-8 text-center text-red-500 font-bold">Pharmacy not found.</div>;

  return (
    <div>
      <div className="mb-8">
        <Link to="/super-admin/tenants" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Tenants
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <BuildingOfficeIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{tenant.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tenant.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {tenant.is_active ? 'Active' : 'Suspended'}
                </span>
                <span className="text-xs text-gray-400 font-mono tracking-tighter">ID: {tenant.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <UsersIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Total Staff</span>
              </div>
              <div className="text-2xl font-black text-gray-900">12 Users</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ChartBarIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Daily Rx Avg</span>
              </div>
              <div className="text-2xl font-black text-gray-900">85 Trans</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ShieldCheckIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Uptime</span>
              </div>
              <div className="text-2xl font-black text-emerald-600">99.9%</div>
            </div>
          </div>

          {/* Activity Over Time */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-100 mx-auto mb-2" />
              <p className="text-gray-400 font-medium">Activity graph for {tenant.name} will appear here.</p>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Subscription Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Current Plan</span>
                <span className="font-bold text-indigo-600">{tenant.subscription_plan}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Billing Cycle</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Next Renewal</span>
                <span className="font-medium">April 15, 2026</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSubModalOpen(true)}
              className="w-full mt-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Manage Subscription
            </button>
          </div>

          <Modal
            isOpen={isSubModalOpen}
            onClose={() => setIsSubModalOpen(false)}
            title="Update Pharmacy Subscription"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanUpdate(plan.id as any)}
                    disabled={updating || tenant.subscription_plan === plan.id}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${
                      tenant.subscription_plan === plan.id 
                        ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' 
                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                    }`}
                  >
                    {tenant.subscription_plan === plan.id && (
                      <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      plan.id === 'GOLD' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-xl font-black text-gray-900">ETB {plan.price}</span>
                      <span className="text-[10px] text-gray-400 font-medium">/mo</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-[10px] text-gray-600 font-medium">
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-all ${
                      tenant.subscription_plan === plan.id
                        ? 'bg-transparent text-indigo-600'
                        : 'bg-gray-900 text-white group-hover:bg-indigo-600 shadow-md'
                    }`}>
                      {tenant.subscription_plan === plan.id ? 'Current Plan' : `Switch to ${plan.id}`}
                    </div>
                  </button>
                ))}
              </div>

              {updating && (
                <div className="flex items-center justify-center gap-3 text-indigo-600 font-bold text-sm animate-pulse">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Provisioning new tier capabilities...
                </div>
              )}
            </div>
          </Modal>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <h3 className="font-bold text-amber-900 mb-2">Internal Note</h3>
            <p className="text-sm text-amber-700 leading-relaxed italic">
              "This pharmacy requested a feature for custom compounding labels earlier this month. Follow up on status."
            </p>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Pharmacy Staff Management</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active users registered under this node</p>
          </div>
          <button 
            onClick={() => {
              setEditingUser(null);
              setUserFormData({ username: '', password: '', role: 'PHARMACIST', manager_pin: '' });
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            Provision New User
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.username}</div>
                        <div className="text-[9px] text-gray-400 font-mono tracking-tighter">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                      user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' :
                      user.role === 'PHARMACIST' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-bold text-gray-600">{user.is_active ? 'Active' : 'Disabled'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-[10px] font-medium text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingUser(user);
                          setUserFormData({
                            username: user.username,
                            password: '',
                            role: user.role,
                            manager_pin: user.manager_pin || ''
                          });
                          setIsUserModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    No users registered under this organization yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Update Staff Member' : 'Provision Staff Account'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4 pt-4">
          <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-4 mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-indigo-900">Node Authentication</p>
              <p className="text-xs text-indigo-700">Account will be restricted to the {tenant?.name || 'current'} organizational node.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Username / Email</label>
              <input
                type="text"
                required
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                {editingUser ? 'New Password (Optional)' : 'Initial Password'}
              </label>
              <input
                type="password"
                required={!editingUser}
                minLength={6}
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Operational Role</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              >
                <option value="ADMIN">ADMINISTRATOR</option>
                <option value="PHARMACIST">PHARMACIST</option>
                <option value="CASHIER">CASHIER</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Manager Authorization PIN</label>
              <input
                type="text"
                maxLength={6}
                value={userFormData.manager_pin}
                onChange={(e) => setUserFormData({ ...userFormData, manager_pin: e.target.value })}
                className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                placeholder="000000"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button 
              type="button" 
              onClick={() => setIsUserModalOpen(false)} 
              className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={actionLoading}
              className="flex-[2] px-4 py-4 text-sm font-bold text-white bg-gray-900 rounded-2xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : editingUser ? 'Update Account' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!userToDeleteId}
        onClose={() => setUserToDeleteId(null)}
        onConfirm={confirmDeleteUser}
        title="Revoke Staff Access"
        message="Are you sure you want to deactivate this staff account? They will lose all access to the pharmacy node instantly."
      />
    </div>
  );
}
