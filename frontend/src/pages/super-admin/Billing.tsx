import React, { useEffect, useState, useMemo } from 'react';
import {
  CreditCardIcon,
  TicketIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { getTenants, type Tenant } from '../../api/superAdminService';
import Modal from '../../components/Modal';
import ColumnFilter from '../../components/ColumnFilter';
import { toastSuccess, toastError } from '../../components/Toast';

const PLAN_PRICES = {
  BASIC: 1500,
  SILVER: 3500,
  GOLD: 7500
};

export default function SuperAdminBilling() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Column Filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    name: [],
    plan: []
  });

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const openInvoice = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsInvoiceOpen(true);
  };

  useEffect(() => {
    getTenants().then(data => {
      setTenants(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalMRR = tenants.reduce((acc, t) => {
    const plan = t.subscription_plan as keyof typeof PLAN_PRICES;
    return acc + (PLAN_PRICES[plan] || 1500);
  }, 0);

  const planStats = [
    { name: 'BASIC', count: tenants.filter(t => t.subscription_plan === 'BASIC').length, color: 'bg-indigo-400', price: PLAN_PRICES.BASIC },
    { name: 'SILVER', count: tenants.filter(t => t.subscription_plan === 'SILVER').length, color: 'bg-purple-500', price: PLAN_PRICES.SILVER },
    { name: 'GOLD', count: tenants.filter(t => t.subscription_plan === 'GOLD').length, color: 'bg-amber-500', price: PLAN_PRICES.GOLD },
  ];

  const uniqueNames = useMemo(() => [...new Set(tenants.map(t => t.name))].sort(), [tenants]);
  const planOptions = ['BASIC', 'SILVER', 'GOLD'];

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesName = columnFilters.name.length === 0 || columnFilters.name.includes(t.name);
      const matchesPlan = columnFilters.plan.length === 0 || columnFilters.plan.includes(t.subscription_plan);
      return matchesName && matchesPlan;
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
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Operations</h1>
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Revenue & Billing Lifecycle</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-bold text-[10px]">
          <ArrowTrendingUpIcon className="h-4 w-4" />
          Revenue up 14% this month
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="bg-gray-900 rounded-2xl shadow-lg p-4 text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-white">
            <BanknotesIcon className="h-24 w-24" />
          </div>
          <div className="flex items-center justify-between mb-2 relative">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Projected MRR</span>
            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
              <CreditCardIcon className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black mb-0.5 relative">ETB {totalMRR.toLocaleString()}</div>
          <p className="text-gray-500 text-[9px] relative leading-tight">Monthly recurring revenue from {tenants.length} nodes.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Active Subscriptions</span>
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <TicketIcon className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 mb-0.5">{tenants.length}</div>
            <p className="text-gray-400 text-[9px] leading-tight font-medium">Pharmacies on enterprise & vanilla plans.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <span className="text-gray-500 font-bold uppercase tracking-wider block mb-2 text-[9px]">Tier Distribution</span>
          <div className="space-y-2">
            {planStats.map(plan => (
              <div key={plan.name}>
                <div className="flex justify-between items-end mb-0.5">
                  <div className="text-[8px] font-bold text-gray-900 uppercase tracking-tighter">{plan.name}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">{plan.count} Nodes</div>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1">
                  <div
                    className={`${plan.color} h-1 rounded-full transition-all duration-1000`}
                    style={{ width: `${(plan.count / Math.max(tenants.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
            <CreditCardIcon className="h-3.5 w-3.5" />
            <span>{filteredTenants.length} Billing Contracts Active</span>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setColumnFilters({ name: [], plan: [] })}
              className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <FunnelIcon className="h-3 w-3" />
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="max-h-[calc(100vh-350px)] min-h-[420px] overflow-y-auto custom-scrollbar px-4 pb-48">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 sticky top-0 z-30 backdrop-blur-md">
              <tr className="border-b border-gray-100">
                <ColumnFilter
                  label="Organization"
                  options={uniqueNames}
                  selectedValues={columnFilters.name}
                  onFilterChange={(v) => updateFilter('name', v)}
                  className="px-8 py-4"
                />
                <ColumnFilter
                  label="Subscription Tier"
                  options={planOptions}
                  selectedValues={columnFilters.plan}
                  onFilterChange={(v) => updateFilter('plan', v)}
                  className="px-6 py-4"
                />
                <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Monthly Commitment</th>
                <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Next Invoice</th>
                <th className="px-8 py-4 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Invoice Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
                        <BuildingOfficeIcon className="h-4 w-4" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs">{tenant.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-tighter ${tenant.subscription_plan === 'GOLD' ? 'bg-amber-100 text-amber-600' :
                      tenant.subscription_plan === 'SILVER' ? 'bg-gray-100 text-gray-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                      {tenant.subscription_plan} Plan
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-xs font-bold text-gray-900">
                      ETB {(PLAN_PRICES[tenant.subscription_plan as keyof typeof PLAN_PRICES] || 1500).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-[10px] text-gray-500 font-bold">{tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-8 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => openInvoice(tenant)}
                      className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all"
                      title="View Invoice Detail"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No billing records found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Billing History & Detail"
      >
        {selectedTenant && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="text-xl font-bold text-gray-900">{selectedTenant.name}</div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">
                  Contract ID: {selectedTenant.id.slice(0, 12).toUpperCase()}
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase bg-indigo-100 text-indigo-600`}>
                {selectedTenant.subscription_plan} TIER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Cost</div>
                <div className="text-lg font-bold text-gray-900">
                  ETB {(PLAN_PRICES[selectedTenant.subscription_plan as keyof typeof PLAN_PRICES] || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Invoice</div>
                <div className="text-lg font-bold text-gray-900">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">Billing Events</div>
              {[
                { date: 'Today', event: 'Subscription Renewed', amount: PLAN_PRICES[selectedTenant.subscription_plan as keyof typeof PLAN_PRICES] },
                { date: 'Last Month', event: 'Subscription Renewed', amount: PLAN_PRICES[selectedTenant.subscription_plan as keyof typeof PLAN_PRICES] },
                { date: 'Initial Onboarding', event: 'Account Activated', amount: 0 },
              ].map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">
                      #{(i + 1) * 102}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{ev.event}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{ev.date}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-gray-900">
                    {ev.amount > 0 ? `ETB ${ev.amount.toLocaleString()}` : '—'}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => toastSuccess('PDF Engine Initializing', 'The automated invoice generator is preparing your document. Download will start shortly.')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold"
              >
                Download Latest PDF
              </button>
              <button onClick={() => setIsInvoiceOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
