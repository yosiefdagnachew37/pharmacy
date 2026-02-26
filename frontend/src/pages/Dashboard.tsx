import { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Package 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    lowStockMedicines: 0,
    expiringSoonBatches: 0,
    activeAlertsCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('/reporting/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
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
      color: "bg-green-500"
    },
    { 
      label: "Low Stock", 
      value: stats.lowStockMedicines, 
      desc: "medicines to reorder",
      icon: Package,
      color: "bg-red-500"
    },
    { 
      label: "Expiring Soon", 
      value: stats.expiringSoonBatches, 
      desc: "within 30 days",
      icon: Clock,
      color: "bg-orange-500"
    },
    { 
      label: "Critical Alerts", 
      value: stats.activeAlertsCount || 0, 
      desc: "requires attention",
      icon: AlertTriangle,
      color: "bg-indigo-500"
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm p-6 flex items-center">
            <div className={`${card.color} p-3 rounded-lg text-white mr-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <p className="text-gray-500 text-sm">No recent sales data available.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
          <p className="text-gray-500 text-sm">System inventory is currently being synchronized.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
