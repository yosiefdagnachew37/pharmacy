import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
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
  const { canCreate, canDelete } = useAuth();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Batches</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Track and manage medicine batches, expiry, and inventory levels.</p>
        </div>
        {canCreate('batches') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Issue New Batch
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
          <input
            type="text"
            placeholder="Search batches by medicine or number..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm placeholder:text-gray-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 px-2">
          <Package className="w-3.5 h-3.5" />
          <span>{filteredBatches.length} Batches Found</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">Loading batches...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-500">No batches found.</div>
        ) : (
          filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[1.5fr_100px_140px_120px_140px_40px] items-center gap-6">
                {/* 1. Medicine & Batch Info */}
                <div className="flex items-center min-w-0 col-span-2 md:col-span-1 xl:col-span-1">
                  <div className={`p-3 rounded-xl mr-4 flex-shrink-0 ${isExpired(batch.expiry_date)
                    ? 'bg-red-50 text-red-500'
                    : isExpiringSoon(batch.expiry_date)
                      ? 'bg-amber-50 text-amber-500'
                      : 'bg-indigo-50 text-indigo-500'
                    }`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{batch.medicine?.name || 'Unknown'}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      Batch: <span className="text-gray-600 font-mono tracking-tighter">{batch.batch_number}</span>
                    </p>
                  </div>
                </div>

                {/* 2. Quantity */}
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Quantity</p>
                  <p className="text-lg font-bold text-gray-800 leading-none">
                    {batch.quantity_remaining}
                  </p>
                </div>

                {/* 3. Pricing */}
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Buy / Sell</p>
                  <div className="flex items-baseline space-x-1 justify-start">
                    <span className="text-sm font-bold text-gray-700">${Number(batch.purchase_price || 0).toFixed(2)}</span>
                    <span className="text-xs text-gray-300">/</span>
                    <span className="text-sm font-bold text-indigo-600">${Number(batch.selling_price || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* 4. Expiry */}
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Expiry</p>
                  <div className="flex items-center justify-start text-gray-700">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                    <span className="font-bold text-sm">{new Date(batch.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 5. Status Badge */}
                <div className="flex justify-center md:justify-start">
                  {isExpired(batch.expiry_date) ? (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 uppercase tracking-wide">
                      <AlertTriangle className="w-3 h-3 mr-1.5" />
                      Expired
                    </div>
                  ) : isExpiringSoon(batch.expiry_date) ? (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 uppercase tracking-wide">
                      <Clock className="w-3 h-3 mr-1.5" />
                      Expiring Soon
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">
                      Good
                    </div>
                  )}
                </div>

                {/* 6. Actions */}
                <div className="flex justify-end col-span-2 md:col-span-1 xl:col-span-1">
                  {canDelete('batches') && (
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-md"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
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
