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
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    lowStockMedicines: 0,
    expiringSoonBatches: 0,
    activeAlertsCount: 0,
    recentSales: [] as any[],
    inventorySummary: [] as any[],
    totalMedicines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('/reporting/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Today's Sales",
      value: `$${stats.todaySalesAmount.toFixed(2)}`,
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time system performance and inventory status</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-gray-800 tracking-tight">{card.value}</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-gray-800">Recent Transactions</h3>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider"
            >
              View All <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>

          <div className="space-y-4">
            {stats.recentSales.length > 0 ? (
              stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{sale.patient?.name || 'Walk-in'}</p>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center">
                        {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-md font-black text-gray-900">${Number(sale.total_amount).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Receipt: {sale.receipt_number || 'N/A'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p>No transaction logs recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-gray-800">Critical Stock Status</h3>
            </div>
            <button
              onClick={() => navigate('/medicines')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center uppercase tracking-wider"
            >
              Inventory <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>

          <div className="space-y-4">
            {stats.inventorySummary.length > 0 ? (
              stats.inventorySummary.map((med: any) => (
                <div key={med.id} className="p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-sm font-bold text-gray-800">{med.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight ${med.total_stock <= med.minimum_stock_level ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
