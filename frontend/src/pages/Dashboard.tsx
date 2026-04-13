import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Package,
  ShoppingCart,
  User,
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  DollarSign,
  Building2,
  Award,
  Star
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    lowStockMedicines: 0,
    expiringSoonBatches: 0,
    expiredBatchesCount: 0,
    activeAlertsCount: 0,
    recentSales: [] as any[],
    inventorySummary: [] as any[],
    totalMedicines: 0
  });
  const [trending, setTrending] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [expiryData, setExpiryData] = useState<any>(null);
  const [workingCapital, setWorkingCapital] = useState<any>(null);
  const [dailyExpense, setDailyExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSales, setExpandedSales] = useState(false);
  const [expandedStock, setExpandedStock] = useState(false);
  const [supplierRanking, setSupplierRanking] = useState<any[]>([]);
  const [turnover, setTurnover] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendRes, revRes, expiryRes, wcRes, expRes, rankRes, turnRes] = await Promise.all([
          client.get('/reporting/dashboard'),
          client.get('/reporting/trending-medicines?limit=10'),
          client.get('/reporting/revenue-comparison'),
          client.get('/stock/expiry-dashboard').catch(() => ({ data: null })),
          client.get('/reporting/working-capital').catch(() => ({ data: null })),
          client.get('/reporting/expected-daily-expense').catch(() => ({ data: null })),
          client.get('/suppliers/ranking?limit=5').catch(() => ({ data: [] })),
          client.get('/reporting/inventory-turnover').catch(() => ({ data: null })),
        ]);
        setStats(statsRes.data);
        setTrending(trendRes.data);
        setRevenue(revRes.data);
        setExpiryData(expiryRes.data);
        setWorkingCapital(wcRes.data || { net_working_capital: 0, inventory_valuation: 0, outstanding_receivables: 0, outstanding_payables: 0 });
        setDailyExpense(expRes.data || { total_expected_daily: 0, expenses: [] });
        setSupplierRanking((rankRes as any).data || []);
        setTurnover(turnRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Today's Sales",
      value: `ETB ${stats.todaySalesAmount.toFixed(2)}`,
      desc: `${stats.todaySalesCount} transactions`,
      icon: TrendingUp,
      color: "bg-emerald-500",
      secondaryColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      path: "/sales"
    },
    {
      label: "Low Stock",
      value: stats.lowStockMedicines,
      desc: "items need reorder",
      icon: Package,
      color: "bg-rose-500",
      secondaryColor: "bg-rose-50",
      textColor: "text-rose-600",
      path: "/medicines"
    },
    {
      label: "Expiring Soon",
      value: stats.expiringSoonBatches,
      desc: "expiry < 30 days",
      icon: Clock,
      color: "bg-amber-500",
      secondaryColor: "bg-amber-50",
      textColor: "text-amber-600",
      path: "/batches"
    },
    {
      label: "Expired Items",
      value: stats.expiredBatchesCount || 0,
      desc: "immediate disposal needed",
      icon: AlertCircle,
      color: "bg-red-600",
      secondaryColor: "bg-red-50",
      textColor: "text-red-600",
      path: "/batches"
    },
    {
      label: "Active Alerts",
      value: stats.activeAlertsCount || 0,
      desc: "system health alerts",
      icon: AlertTriangle,
      color: "bg-indigo-500",
      secondaryColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      path: "/alerts"
    }
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 italic">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="text-lg">Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Real-time system performance and inventory status</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-3xl shadow-sm p-6 flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-transparent hover:border-indigo-100 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.secondaryColor} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500`} />

            <div className={`${card.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg shadow-${card.color.split('-')[1]}-200 z-10`}>
              <card.icon className="w-6 h-6" />
            </div>

            <div className="z-10">
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-500 font-medium">{card.desc}</p>
                <div className={`w-6 h-6 rounded-full ${card.secondaryColor} flex items-center justify-center ${card.textColor} group-hover:translate-x-1 transition-transform`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Top Selling Medicines</h3>
            </div>
            <button onClick={() => navigate('/reports')} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-200">Full Analysis</button>
          </div>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trending}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total_quantity" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={32}>
                  {trending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />

          <h3 className="text-xl font-extrabold flex items-center gap-2 mb-8 relative z-10">
            <Calendar className="w-5 h-5 text-indigo-300" />
            Revenue Overview
          </h3>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-1">Today</p>
              <h4 className="text-3xl font-black">ETB {revenue?.today?.toFixed(2) || '0.00'}</h4>
              <div className="flex items-center gap-1.5 text-emerald-400 mt-2 font-bold text-xs uppercase">
                <ArrowUpRight className="w-4 h-4" /> Live Tracking
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-800">
              <div>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Yesterday</p>
                <p className="text-lg font-black">ETB {revenue?.yesterday?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">This Week</p>
                <p className="text-lg font-black">ETB {revenue?.thisWeek?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/reports')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/10 mt-6"
            >
              Detailed Financial Report
            </button>
          </div>
        </div>
      </div>

      {/* Financial Intelligence: Working Capital & Expected Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Working Capital Detailed Widget */}
        {workingCapital && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Working Capital</h3>
                </div>
                <button onClick={() => navigate('/reports')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider">
                  Full Report <ExternalLink className="w-3 h-3 ml-1.5" />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Net Position Estimate</p>
                <h4 className={`text-4xl font-black ${workingCapital.net_working_capital >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ETB {workingCapital.net_working_capital?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-sm font-bold text-gray-600">Total Inventory Value</span>
                  <span className="text-lg font-black text-gray-900">ETB {workingCapital.inventory_valuation?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl">
                  <span className="text-sm font-bold text-emerald-700">Outstanding Receivables</span>
                  <span className="text-lg font-black text-emerald-700">+ETB {workingCapital.outstanding_receivables?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl">
                  <span className="text-sm font-bold text-rose-700">Outstanding Payables</span>
                  <span className="text-lg font-black text-rose-700">-ETB {workingCapital.outstanding_payables?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {turnover && (
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory Turnover (30d)</p>
                  <p className="text-xl font-black text-indigo-600">{turnover.turnover_ratio}x</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COGS (30d)</p>
                  <p className="text-xl font-black text-gray-800">ETB {turnover.cogs?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expected Daily Expenses Widget */}
        {dailyExpense && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col max-h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Operational Expenses</h3>
              </div>
              <button onClick={() => navigate('/expenses')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider">
                Manage <ExternalLink className="w-3 h-3 ml-1.5" />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl border border-violet-200">
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Amortized Daily Cost</p>
                <h4 className="text-2xl font-black text-violet-700">
                  ETB {dailyExpense.total_expected_daily?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">True Profit Today</p>
                <h4 className="text-2xl font-black text-emerald-700">
                  ETB {((revenue?.today || 0) - (revenue?.costToday || 0) - dailyExpense.total_expected_daily).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>
                <p className="text-[9px] text-emerald-600/80 mt-1 uppercase font-bold text-right">(Rev - COGS - Exp)</p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cost Breakdown</h4>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
              {dailyExpense.details && dailyExpense.details.length > 0 ? (
                dailyExpense.details.map((exp: any) => (
                  <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-violet-200 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{exp.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                        {exp.category} • {exp.frequency} (ETB {exp.original_amount})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-600">ETB {exp.daily_amortized?.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">/ day</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-sm">
                  No recurring expenses configured.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider"
            >
              View All <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>

          <div className={`space-y-4 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ${expandedSales ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
            {stats.recentSales.length > 0 ? (
              stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full shadow-sm border flex items-center justify-center transition-colors ${
                      sale.is_refunded 
                        ? 'bg-red-50 border-red-100 text-red-500' 
                        : 'bg-white border-gray-100 text-gray-400 group-hover:text-emerald-500'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{sale.patient?.name || 'Walk-in'}</p>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center">
                        {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className={`text-md font-bold transition-all ${
                      sale.is_refunded ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}>
                      ETB {Number(sale.total_amount).toFixed(2)}
                    </p>
                    {sale.is_refunded && (
                      <span className="mt-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-bold border border-red-100 uppercase tracking-tighter">
                        Refunded
                      </span>
                    )}
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Receipt: {sale.receipt_number || 'N/A'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p>No transaction logs recorded yet.</p>
              </div>
            )}
          </div>
          {stats.recentSales.length > 5 && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setExpandedSales(!expandedSales)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2 bg-indigo-50 rounded-xl transition-all flex items-center shadow-sm hover:shadow-md active:scale-95"
              >
                {expandedSales ? 'Show Less' : 'Show More Transactions'}
                <ChevronRight className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${expandedSales ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </div>
          )}
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Critical Stock Status</h3>
            </div>
            <button
              onClick={() => navigate('/medicines')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider"
            >
              Inventory <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>

          <div className={`space-y-4 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ${expandedStock ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
            {stats.inventorySummary.length > 0 ? (
              stats.inventorySummary.map((med: any) => (
                <div key={med.id} className="p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-sm font-bold text-gray-800">{med.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${med.total_stock <= med.minimum_stock_level ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {med.total_stock <= med.minimum_stock_level ? 'Critically Low' : 'Low Stock'}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ${med.total_stock <= med.minimum_stock_level ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      style={{ width: `${Math.min(100, (med.total_stock / (med.minimum_stock_level * 2)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Current: <span className="text-gray-900">{med.total_stock}</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Min Goal: <span className="text-gray-900">{med.minimum_stock_level}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p>All system inventory levels are currently stable.</p>
              </div>
            )}
          </div>
          {stats.inventorySummary.length > 5 && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setExpandedStock(!expandedStock)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 px-4 py-2 bg-rose-50 rounded-xl transition-all flex items-center shadow-sm hover:shadow-md active:scale-95"
              >
                {expandedStock ? 'Show Less' : 'Show More Items'}
                <ChevronRight className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${expandedStock ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Supplier Ranking Widget */}
      {supplierRanking.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Top Suppliers</h3>
            </div>
            <button onClick={() => navigate('/suppliers')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider">
              All Suppliers <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {supplierRanking.map((r: any, i: number) => {
              const scoreClass = r.score >= 0.8
                ? 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700'
                : r.score >= 0.6
                  ? 'from-amber-50 to-amber-100 border-amber-200 text-amber-700'
                  : 'from-rose-50 to-rose-100 border-rose-200 text-rose-700';
              return (
                <div key={r.id} onClick={() => navigate(`/suppliers/${r.id}`)}
                  className={`bg-gradient-to-br ${scoreClass} border p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : 'bg-amber-700 text-white'}`}>
                      {i + 1}
                    </span>
                    <Building2 className="w-4 h-4 opacity-60" />
                  </div>
                  <p className="font-bold text-sm truncate mb-1">{r.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black">{(r.score * 100).toFixed(0)}%</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-current opacity-70" />
                      <span className="text-xs font-bold">{r.quality_rating || '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expiry Intelligence Section */}
      {expiryData && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Expiry Intelligence (FEFO)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-2xl border border-rose-200">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Inventory at Risk</p>
              <p className="text-2xl font-black text-rose-700">{expiryData.total_at_risk_value?.toFixed(2)} ETB</p>
              <p className="text-xs text-rose-500 mt-1">{expiryData.critical_count} critical, {expiryData.high_risk_count} high risk</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Near Expiry %</p>
              <p className="text-2xl font-black text-amber-700">{expiryData.percent_near_expiry}%</p>
              <p className="text-xs text-amber-500 mt-1">of total inventory value</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Predicted Loss (30d)</p>
              <p className="text-2xl font-black text-purple-700">{expiryData.predicted_loss_30_days?.toFixed(2)} ETB</p>
              <p className="text-xs text-purple-500 mt-1">estimated expiry loss</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Batches Analyzed</p>
              <p className="text-2xl font-black text-emerald-700">{expiryData.total_batches_analyzed}</p>
              <p className="text-xs text-emerald-500 mt-1">active non-expired batches</p>
            </div>
          </div>

          {/* Top 10 Expiry Risk Medicines */}
          {expiryData.top_10_risks?.length > 0 && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
              <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Top Expiry Risks</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="text-left py-3 px-2">Medicine</th>
                      <th className="text-left py-3 px-2">Batch</th>
                      <th className="text-right py-3 px-2">Stock</th>
                      <th className="text-right py-3 px-2">Days Left</th>
                      <th className="text-right py-3 px-2">Risk Score</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiryData.top_10_risks.map((risk: any) => (
                      <tr key={risk.batch_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2 font-medium text-gray-800">{risk.medicine_name}</td>
                        <td className="py-3 px-2 text-gray-500 font-mono text-xs">{risk.batch_number}</td>
                        <td className="py-3 px-2 text-right text-gray-700">{risk.current_stock}</td>
                        <td className="py-3 px-2 text-right text-gray-700">{risk.days_until_expiry}d</td>
                        <td className="py-3 px-2 text-right font-bold text-gray-800">{risk.risk_score}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${risk.risk_status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            risk.risk_status === 'HIGH_RISK' ? 'bg-orange-100 text-orange-700' :
                              risk.risk_status === 'MONITOR' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            {risk.risk_status.replace('_', ' ')}
                          </span>
                          <p className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-tighter">
                            {risk.suggested_action?.replace(/_/g, ' ')}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
