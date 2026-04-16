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
  deleteTenantUser,
  getSubscriptionPlans,
  updateTenantSubscription
} from '../../api/superAdminService';
import { CheckIcon, PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { formatDate } from '../../utils/dateUtils';
import { toastSuccess, toastError } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import Modal from '../../components/Modal';

export default function TenantDetails() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    license_number: ''
  });
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
        getTenantUsers(id),
        getSubscriptionPlans()
      ]).then(([tenantRes, usersRes, plansRes]) => {
        setTenant(tenantRes);
        setUsers(usersRes);
        setPlans(plansRes.filter((p: any) => p.is_active));
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handlePlanUpdate = async (plan: any) => {
    if (!id || plan.name === (tenant?.subscription_plan_name || tenant?.subscription_plan)) return;
    setUpdating(true);
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await updateTenantSubscription(id, { 
        subscription_plan_name: plan.name,
        subscription_status: 'ACTIVE',
        subscription_expiry_date: nextMonth.toISOString()
      });
      // Legacy explicit fallback array routing around postgres enum
      await updateTenant(id, { 
        subscription_plan: 'BASIC',
        subscription_plan_name: plan.name
      });
      
      toastSuccess('Tier Upgraded', `Pharmacy node has been transitioned to the ${plan.name} plan.`);
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
        await updateTenantUser(editingUser.id, payload, id);
        toastSuccess('Staff Updated', 'Account details have been modified successfully.');
      } else {
        await createTenantUser(payload, id);
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
    if (!userToDeleteId || !id) return;
    try {
      await deleteTenantUser(userToDeleteId, id);
      toastSuccess('Staff Revoked', 'The account has been successfully deactivated.');
      fetchTenant();
    } catch (err) {
      console.error('Failed to delete user', err);
      toastError('Error', 'Failed to deactivate staff account.');
    } finally {
      setUserToDeleteId(null);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    if (!id) return;
    try {
      await updateTenantUser(userId, { is_active: true }, id);
      toastSuccess('Staff Restored', 'Account access has been successfully restored.');
      fetchTenant();
    } catch (err) {
      console.error('Failed to reactivate user', err);
      toastError('Error', 'Failed to reactivate staff account.');
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionLoading(true);
    try {
      await updateTenant(id, editFormData);
      toastSuccess('Profile Updated', 'Pharmacy contact information has been refreshed.');
      setIsEditDetailsModalOpen(false);
      fetchTenant();
    } catch (err) {
      console.error('Failed to update details', err);
      toastError('Update Failed', 'Could not save the new profile information.');
    } finally {
      setActionLoading(false);
    }
  };

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
              <div className="text-2xl font-black text-gray-900">{tenant.staff_count || 0} Users</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ChartBarIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Daily Rx Avg</span>
              </div>
              <div className="text-2xl font-black text-gray-900">{tenant.daily_rx_avg || 0} Trans</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ShieldCheckIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Uptime</span>
              </div>
              <div className="text-2xl font-black text-emerald-600">{tenant.uptime || '99.9%'}</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Contact Information</h3>
                <button 
                    onClick={() => {
                        setEditFormData({
                            name: tenant.name,
                            contact_person: tenant.contact_person || '',
                            phone: tenant.phone || '',
                            email: tenant.email || '',
                            city: tenant.city || '',
                            address: tenant.address || '',
                            license_number: tenant.license_number || ''
                        });
                        setIsEditDetailsModalOpen(true);
                    }}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                >
                    <PencilSquareIcon className="h-3 w-3" />
                    Edit Profile
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Contact Person</span>
                <div className="font-medium text-gray-800">{tenant.contact_person || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</span>
                <div className="font-medium text-gray-800">{tenant.phone || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</span>
                <div className="font-medium text-gray-800">{tenant.email || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">City</span>
                <div className="font-medium text-gray-800">{tenant.city || 'Not provided'}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Detailed Address</span>
                <div className="font-medium text-gray-800">{tenant.address || 'Not provided'}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">License Number</span>
                <div className="font-medium text-gray-800">{tenant.license_number || 'Not provided'}</div>
              </div>
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
                <span className="font-bold text-indigo-600">{tenant.subscription_plan_name || tenant.subscription_plan}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Billing Cycle</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Next Renewal</span>
                <span className="font-medium">{tenant.subscription_expiry_date ? formatDate(tenant.subscription_expiry_date) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium">{tenant.created_at ? formatDate(tenant.created_at) : 'N/A'}</span>
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
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanUpdate(plan)}
                    disabled={updating || tenant.subscription_plan === plan.name}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${
                      tenant.subscription_plan === plan.name 
                        ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' 
                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                    }`}
                  >
                    {tenant.subscription_plan === plan.name && (
                      <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500`}>
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-xl font-black text-gray-900">ETB {plan.costs}</span>
                      <span className="text-[10px] text-gray-400 font-medium">/ {plan.duration_months === 12 ? 'year' : plan.duration_months === 1 ? 'month' : `${plan.duration_months}mo`}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {(plan.features || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] text-gray-600 font-medium">
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-all ${
                      tenant.subscription_plan === plan.name
                        ? 'bg-transparent text-indigo-600'
                        : 'bg-gray-900 text-white group-hover:bg-indigo-600 shadow-md'
                    }`}>
                      {tenant.subscription_plan === plan.name ? 'Current Plan' : `Switch Plan`}
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

          <Modal
            isOpen={isEditDetailsModalOpen}
            onClose={() => setIsEditDetailsModalOpen(false)}
            title="Edit Pharmacy Profile"
          >
            <form onSubmit={handleUpdateDetails} className="space-y-4 pt-4">
              <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-4 mb-4">
                <BuildingOfficeIcon className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-indigo-900">Pharmacy Profile</p>
                  <p className="text-xs text-indigo-700">Update the core organizational and contact information for this pharmacy node.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Pharmacy Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Contact Person</label>
                    <input
                      type="text"
                      value={editFormData.contact_person}
                      onChange={(e) => setEditFormData({ ...editFormData, contact_person: e.target.value })}
                      className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Official Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">City</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">License Number</label>
                  <input
                    type="text"
                    value={editFormData.license_number}
                    onChange={(e) => setEditFormData({ ...editFormData, license_number: e.target.value })}
                    className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Detailed Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="block w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    placeholder="Sub-city, Woreda, Specific location..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsEditDetailsModalOpen(false)}
                  className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-[2] px-4 py-4 text-sm font-bold text-white bg-gray-900 rounded-2xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </Modal>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 group relative">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-amber-900">Internal Note</h3>
                <button 
                    onClick={() => {
                        const note = prompt('Update Internal Notes:', tenant.internal_notes || '');
                        if (note !== null) {
                            updateTenant(id!, { internal_notes: note }).then(() => {
                                toastSuccess('Note Saved', 'Administrative reference updated.');
                                fetchTenant();
                            });
                        }
                    }}
                    className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                    Edit Note
                </button>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed italic">
              {tenant.internal_notes || "No internal administrative notes have been added for this pharmacy node yet."}
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
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      {user.is_active ? (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Deactivate"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivateUser(user.id)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                          title="Reactivate"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
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
