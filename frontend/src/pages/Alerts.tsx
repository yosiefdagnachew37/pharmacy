import { useEffect, useState } from 'react';
import client from '../api/client';
import { CheckCircle2, Clock, Package, HeartPulse } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await client.get('/alerts/active');
        setAlerts(response.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await client.patch(`/alerts/${id}/resolve`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">System Alerts</h1>
        <div className="flex w-full sm:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Alerts</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="EXPIRY">Expiring / Expired</option>
            <option value="PATIENT_FOLLOW_UP">Patient Follow-ups</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Monitoring system status...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-20" />
            <p className="text-gray-500 font-medium">No active alerts. Everything is running smoothly!</p>
          </div>
        ) : (
          alerts
            .filter(a => filterType === 'ALL' || (filterType === 'EXPIRY' && (a.type === 'EXPIRY' || a.type === 'EXPIRED')) || a.type === filterType)
            .map((alert) => (
            <div key={alert.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-indigo-100 transition-all">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl flex-shrink-0 ${
                    alert.type === 'LOW_STOCK' ? 'bg-rose-50 text-rose-600' :
                    alert.type === 'PATIENT_FOLLOW_UP' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {alert.type === 'LOW_STOCK' ? <Package className="w-6 h-6" /> : 
                   alert.type === 'PATIENT_FOLLOW_UP' ? <HeartPulse className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none mb-1">{alert.type.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-500 leading-tight">{alert.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tight bg-gray-50 inline-block px-1.5 py-0.5 rounded">
                    Detected: {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => resolveAlert(alert.id)}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100"
              >
                Resolve Alert
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
