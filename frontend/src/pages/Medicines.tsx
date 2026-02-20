import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Save } from 'lucide-react';
import Modal from '../components/Modal';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  total_stock: number;
  minimum_stock_level: number;
  unit: string;
  is_controlled: boolean;
}

const Medicines = () => {
  const { canCreate, canUpdate, canDelete } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    generic_name: '',
    category: '',
    unit: '',
    minimum_stock_level: 10,
    is_controlled: false
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await client.get('/medicines');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await client.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (error) {
      alert('Failed to delete medicine. It might be linked to other records.');
    }
  };

  const handleOpenModal = (med?: Medicine) => {
    if (med) {
      setEditingMed(med);
      setFormData(med);
    } else {
      setEditingMed(null);
      setFormData({
        name: '',
        generic_name: '',
        category: '',
        unit: 'TAB',
        minimum_stock_level: 10,
        is_controlled: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare payload by stripping calculated/extra fields
    const { total_stock, id, ...payload } = formData as any;
    
    try {
      if (editingMed) {
        await client.patch(`/medicines/${editingMed.id}`, payload);
      } else {
        await client.post('/medicines', payload);
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error: any) {
      console.error('Error saving medicine:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error saving medicine. Please check all fields.');
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Medicines Inventory</h1>
        {canCreate('medicines') && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Medicine Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock Level</th>
                <th className="px-6 py-3">Min. Level</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading inventory...</td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No medicines found.</td>
                </tr>
              ) : (
                filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{med.name}</div>
                      <div className="text-xs text-gray-500">{med.generic_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{med.category}</td>
                    <td className="px-6 py-4">
                       <span className={`font-semibold ${med.total_stock <= med.minimum_stock_level ? 'text-red-600' : 'text-green-600'}`}>
                        {med.total_stock} {med.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{med.minimum_stock_level}</td>
                    <td className="px-6 py-4">
                      {med.total_stock <= med.minimum_stock_level ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       {canUpdate('medicines') && (
                         <button 
                          onClick={() => handleOpenModal(med)}
                          className="text-gray-400 hover:text-indigo-600"
                         >
                          <Edit2 className="w-4 h-4" />
                         </button>
                       )}
                       {canDelete('medicines') && (
                         <button 
                          onClick={() => handleDelete(med.id)}
                          className="text-gray-400 hover:text-red-600"
                         >
                          <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMed ? 'Edit Medicine' : 'Add New Medicine'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Antibiotic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="e.g. TAB, ML"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stock Level</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.minimum_stock_level}
                  onChange={(e) => setFormData({ ...formData, minimum_stock_level: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="controlled"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={formData.is_controlled}
                  onChange={(e) => setFormData({ ...formData, is_controlled: e.target.checked })}
                />
                <label htmlFor="controlled" className="ml-2 block text-sm text-gray-900 font-medium">
                  Controlled Substance
                </label>
              </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingMed ? 'Update' : 'Create'} Medicine
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medicines;
