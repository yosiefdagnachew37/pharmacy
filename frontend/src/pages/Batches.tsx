import { useEffect, useState } from 'react';
import client from '../api/client';
import { Package, Plus, Calendar, AlertTriangle, Clock, Trash2, Search } from 'lucide-react';
import Modal from '../components/Modal';

interface Medicine {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  batch_number: string;
  medicine: {
    id: string;
    name: string;
  };
  medicine_id: string;
  expiry_date: string;
  purchase_price: number;
  selling_price: number;
  initial_quantity: number;
  quantity_remaining: number;
}

const Batches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicine_id: '',
    batch_number: '',
    expiry_date: '',
    purchase_price: 0,
    selling_price: 0,
    initial_quantity: 0,
  });

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await client.get('/batches');
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await client.get('/medicines');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchMedicines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/batches', formData);
      setIsModalOpen(false);
      setFormData({
        medicine_id: '',
        batch_number: '',
        expiry_date: '',
        purchase_price: 0,
        selling_price: 0,
        initial_quantity: 0,
      });
      fetchBatches();
    } catch (error: any) {
      console.error('Error creating batch:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error creating batch. Please check all fields.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      await client.delete(`/batches/${id}`);
      fetchBatches();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete batch. It might be linked to other records.');
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return d > today && d < thirtyDaysFromNow;
  };

  const filteredBatches = batches.filter(b =>
    b.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Batch Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Batch
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by medicine name or batch number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">Loading batches...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">No batches found.</div>
        ) : (
          filteredBatches.map((batch) => (
            <div key={batch.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:border-indigo-300 transition-colors">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${isExpired(batch.expiry_date) ? 'bg-red-100 text-red-600' : isExpiringSoon(batch.expiry_date) ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{batch.medicine?.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500">Batch: <span className="font-mono">{batch.batch_number}</span></p>
                </div>
              </div>

              <div className="flex space-x-12 items-center">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Qty</p>
                  <p className="text-lg font-bold text-gray-800">{batch.quantity_remaining}</p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Buy / Sell</p>
                  <p className="text-sm font-medium text-gray-800">
                    ${Number(batch.purchase_price || 0).toFixed(2)} / ${Number(batch.selling_price || 0).toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Expiry</p>
                  <div className="flex items-center text-gray-800">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="font-medium text-sm">{new Date(batch.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  {isExpired(batch.expiry_date) ? (
                    <div className="flex items-center text-red-600 font-medium text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      EXPIRED
                    </div>
                  ) : isExpiringSoon(batch.expiry_date) ? (
                    <div className="flex items-center text-orange-600 font-medium text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      EXPIRING SOON
                    </div>
                  ) : (
                    <div className="text-green-600 font-medium text-sm">GOOD</div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(batch.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Batch"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={formData.medicine_id}
              onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
            >
              <option value="">Select a medicine...</option>
              {medicines.map(med => (
                <option key={med.id} value={med.id}>{med.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input
                required
                type="text"
                placeholder="e.g. BN-2026-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.initial_quantity}
                onChange={(e) => setFormData({ ...formData, initial_quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 shadow-sm"
            >
              Create Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Batches;
