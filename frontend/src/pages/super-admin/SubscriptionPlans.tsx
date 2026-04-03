import React, { useEffect, useState } from 'react';
import { 
  TicketIcon, 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '../../api/superAdminService';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { toastSuccess, toastError } from '../../components/Toast';

const DURATION_OPTIONS = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '1 Year' },
];

const getDurationLabel = (months: number) => {
  const opt = DURATION_OPTIONS.find(o => o.value === months);
  if (opt) return opt.label;
  return `${months} Month${months > 1 ? 's' : ''}`;
};

const getDurationShortLabel = (months: number) => {
  if (months === 1) return '/ month';
  if (months === 3) return '/ quarter';
  if (months === 6) return '/ 6 months';
  if (months === 12) return '/ year';
  return `/ ${months}mo`;
};

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const systemFeatures = [
    'Suppliers',
    'Purchases',
    'Intelligent Forecasting',
    'Inventory',
    'Expenses',
    'Credit'
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costs: '',
    duration_months: 1,
    features: [] as string[],
    is_active: true
  });

  const fetchPlans = async () => {
    try {
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      toastError('Error', 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData({ name: '', description: '', costs: '', duration_months: 1, features: [], is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      costs: plan.costs,
      duration_months: plan.duration_months || 1,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : (plan.features || []),
      is_active: plan.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        costs: Number(formData.costs),
        duration_months: Number(formData.duration_months),
        features: formData.features
      };

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, payload);
        toastSuccess('Plan Updated', `Successfully updated ${payload.name} plan.`);
      } else {
        await createSubscriptionPlan(payload);
        toastSuccess('Plan Created', `Successfully created ${payload.name} plan.`);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toastError('Error', 'Failed to save subscription plan. Name might already exist.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubscriptionPlan(deleteId);
      toastSuccess('Plan Deleted', 'Plan successfully removed.');
      fetchPlans();
    } catch (err) {
      toastError('Error', 'Failed to delete plan. It might be in use.');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading plans...</div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Manage billing tiers, durations, and features</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5" /> 
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
            {!plan.is_active && (
               <div className="absolute top-4 right-[-30px] bg-red-500 text-white text-[10px] font-bold px-8 py-1 rotate-45">INACTIVE</div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <TicketIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  ETB {Number(plan.costs).toLocaleString()} {getDurationShortLabel(plan.duration_months || 1)}
                </p>
              </div>
            </div>
            {plan.description && <p className="text-sm text-gray-500 mb-4 italic">{plan.description}</p>}
            
            <div className="flex items-center gap-2 mb-4 bg-indigo-50/50 rounded-xl px-3 py-2">
              <ClockIcon className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-700">
                Duration: {getDurationLabel(plan.duration_months || 1)}
              </span>
            </div>

            <div className="flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Included Features</span>
              <ul className="space-y-2 mb-6">
                {(typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : (plan.features || [])).map((feat: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckBadgeIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 mt-auto border-t border-gray-100 pt-4">
              <button 
                onClick={() => openEditModal(plan)}
                className="flex-1 py-2 bg-gray-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition"
              >
                Edit
              </button>
              <button 
                onClick={() => setDeleteId(plan.id)}
                className="py-2 px-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="p-12 text-center text-gray-400">
          <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No subscription plans have been defined yet.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan ? 'Update Plan' : 'Create New Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Pro Plus"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Plan Cost (ETB)</label>
               <input
                 type="number"
                 step="0.01"
                 required
                 value={formData.costs}
                 onChange={e => setFormData({ ...formData, costs: e.target.value })}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Plan Duration</label>
               <select 
                 value={formData.duration_months}
                 onChange={e => setFormData({ ...formData, duration_months: Number(e.target.value) })}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                 {DURATION_OPTIONS.map(opt => (
                   <option key={opt.value} value={opt.value}>{opt.label}</option>
                 ))}
               </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Description</label>
               <input
                 type="text"
                 value={formData.description}
                 onChange={e => setFormData({ ...formData, description: e.target.value })}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Optional description"
               />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Status</label>
               <select 
                 value={formData.is_active ? 'active' : 'inactive'}
                 onChange={e => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
               </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Included Modules & Features</label>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
              {systemFeatures.map(feat => (
                <label key={feat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, features: [...formData.features, feat] });
                      } else {
                        setFormData({ ...formData, features: formData.features.filter(f => f !== feat) });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">{feat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Plan"
        message="Are you sure you want to permanently delete this subscription plan? Existing tenants on this plan will keep their status, but it will no longer be available for assignment."
      />
    </div>
  );
}
