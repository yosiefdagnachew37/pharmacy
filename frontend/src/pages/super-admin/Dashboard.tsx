import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { superAdminService, type Tenant, getPlatformStats } from '../../api/superAdminService';
import { formatDate } from '../../utils/dateUtils';
import { 
  BuildingOffice2Icon, 
  CheckCircleIcon, 
  XCircleIcon, 
  BanknotesIcon,
  BoltIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await getPlatformStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { totalTenants, totalMRR, totalUsers, growth, health, recentTenants } = stats;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Command Center</h1>
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Global Infrastructure Health</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex -space-x-2">
            {recentTenants.slice(0, 3).map((t: any, i: number) => (
              <div key={t.id} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                {t.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">{totalTenants} Active Nodes</span>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={BuildingOffice2Icon} 
          label="Total Pharmacies" 
          value={totalTenants} 
          trend={`+${growth[growth.length-1]?.count || 0} this month`}
          color="indigo" 
        />
        <StatCard 
          icon={BanknotesIcon} 
          label="Est. Monthly Revenue" 
          value={`ETB ${Math.round(totalMRR).toLocaleString()}`} 
          trend="Real-time MRR"
          color="emerald" 
        />
        <StatCard 
          icon={UserGroupIcon} 
          label="Total System Users" 
          value={totalUsers.toLocaleString()} 
          trend="Across all branches"
          color="amber" 
        />
        <StatCard 
          icon={BoltIcon} 
          label="System Status" 
          value={health.database === 'Healthy' ? 'Online' : 'Warning'} 
          trend="99.9% Peak Uptime"
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-500" />
              Onboarding Analytics
            </h3>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last 6 Months</div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {growth.map((g: any, i: number) => {
              const maxHeight = Math.max(...growth.map((item: any) => item.count), 1);
              const heightPercent = (g.count / maxHeight) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div 
                    style={{ height: `${Math.max(heightPercent, 5)}%` }} 
                    className="w-full bg-indigo-500/10 rounded-t-xl group-hover:bg-indigo-500 transition-all cursor-pointer relative"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {g.count} New Nodes
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 mt-4 uppercase">
                    {g.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health Section */}
        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ServerIcon className="h-6 w-6 text-indigo-300" />
            System Health
          </h3>
          <div className="space-y-6">
            <HealthItem label="Database Engine" value={health.database} color={health.database === 'Healthy' ? 'emerald' : 'rose'} />
            <HealthItem label="File Storage (S3)" value={health.storage} color="emerald" />
            <HealthItem label="Auth Services" value={health.auth} color="emerald" />
            <HealthItem label="Background Jobs" value={health.backgroundJobs} color="indigo" />
            
            <div className="pt-6 border-t border-white/10 mt-6">
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Infrastructure Hub</div>
                <div className="text-sm font-medium">East-Africa (Addis Ababa)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Organizations Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900">Recently Onboarded Pharmacies</h3>
          <Link to="/super-admin/tenants" className="text-indigo-600 text-[10px] font-bold hover:underline">View All Tenants</Link>
        </div>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                <th className="px-6 py-4 text-left">Pharmacy Name</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Onboarding Date</th>
                <th className="px-6 py-4 text-left">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTenants.map((tenant: any) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="font-bold text-gray-900 text-xs">{tenant.name}</div>
                    <div className="text-[9px] text-gray-600 font-medium uppercase">{tenant.id.split('-')[0]}</div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                      tenant.subscription_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {tenant.subscription_plan_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${tenant.is_active ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                      <span className="text-[10px] font-semibold text-gray-700">{tenant.is_active ? 'Online' : 'Suspended'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-[10px] text-gray-500 font-medium">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    {formatDate(tenant.expiry_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTenants.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">No pharmacies onboarded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  const trendColorMap: any = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-[10px] font-semibold mt-2 ${trendColorMap[color]}`}>{trend}</div>
    </div>
  );
}

function HealthItem({ label, value, color }: { label: string, value: string, color: string }) {
  const colorClasses: any = {
    emerald: 'bg-emerald-400',
    indigo: 'bg-indigo-400',
    amber: 'bg-amber-400',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-white/70">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{value}</span>
        <div className={`w-2 h-2 rounded-full ${colorClasses[color]}`} />
      </div>
    </div>
  );
}
