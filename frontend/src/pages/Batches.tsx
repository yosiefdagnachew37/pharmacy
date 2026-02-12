import { useEffect, useState } from 'react';
import client from '../api/client';
import { Package, Plus, Calendar, AlertTriangle, Clock } from 'lucide-react';

interface Batch {
  id: string;
  batch_number: string;
  medicine: {
    name: string;
  };
  expiry_date: string;
  quantity_remaining: number;
}

const Batches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await client.get('/batches');
        setBatches(response.data);
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return d > today && d < thirtyDaysFromNow;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Batch Management</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">No batches recorded.</div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:border-indigo-300 transition-colors">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${isExpired(batch.expiry_date) ? 'bg-red-100 text-red-600' : isExpiringSoon(batch.expiry_date) ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{batch.medicine.name}</h3>
                  <p className="text-sm text-gray-500">Batch: <span className="font-mono">{batch.batch_number}</span></p>
                </div>
              </div>

              <div className="flex space-x-12 items-center">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Quantity</p>
                  <p className="text-lg font-bold text-gray-800">{batch.quantity_remaining}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Expiry Date</p>
                  <div className="flex items-center text-gray-800">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{new Date(batch.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  {isExpired(batch.expiry_date) ? (
                    <div className="flex items-center text-red-600 font-medium">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      EXPIRED
                    </div>
                  ) : isExpiringSoon(batch.expiry_date) ? (
                    <div className="flex items-center text-orange-600 font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      EXPIRING SOON
                    </div>
                  ) : (
                    <div className="text-green-600 font-medium">GOOD</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Batches;
