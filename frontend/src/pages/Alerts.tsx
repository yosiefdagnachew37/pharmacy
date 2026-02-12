import { useEffect, useState } from 'react';
import client from '../api/client';
import { CheckCircle2, Clock, Package, Filter } from 'lucide-react';

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">System Alerts</h1>
        <div className="flex space-x-2">
           <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
           </button>
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
          alerts.map((alert) => (
            <div key={alert.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${alert.type === 'LOW_STOCK' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                  {alert.type === 'LOW_STOCK' ? <Package className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{alert.type.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">
                    Detected {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => resolveAlert(alert.id)}
                className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
              >
                Mark as Resolved
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
