import { useEffect, useState, useMemo, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Save, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import ColumnFilter from '../components/ColumnFilter';

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

interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
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

  // Excel Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // ─── Column Filter State ────────────────────────────────────────
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    name: [],
    category: [],
    stock: [],
    minLevel: [],
    status: [],
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
    const payload = {
      name: formData.name,
      generic_name: formData.generic_name,
      category: formData.category,
      unit: formData.unit,
      minimum_stock_level: Number(formData.minimum_stock_level),
      is_controlled: formData.is_controlled
    };

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

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      const response = await client.post('/medicines/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(response.data);
      setIsImportModalOpen(true);
      fetchMedicines();
    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('Failed to import Excel file. Please ensure it follows the correct format.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Unique Options for Column Filters ──────────────────────────
  const uniqueNames = useMemo(() => [...new Set(medicines.map(m => m.name).filter(Boolean))].sort(), [medicines]);
  const uniqueCategories = useMemo(() => [...new Set(medicines.map(m => m.category).filter(Boolean))].sort(), [medicines]);
  const uniqueStockLevels = useMemo(() => [...new Set(medicines.map(m => String(m.total_stock)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)), [medicines]);
  const uniqueMinLevels = useMemo(() => [...new Set(medicines.map(m => String(m.minimum_stock_level)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)), [medicines]);
  const statusOptions = ['In Stock', 'Low Stock'];

  const getStatus = (m: Medicine) => m.total_stock <= m.minimum_stock_level ? 'Low Stock' : 'In Stock';

  // ─── Filtering ──────────────────────────────────────────────────
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      // Text search
      const matchesSearch =
        (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (m.generic_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // Column filters (AND logic)
      const matchesName = columnFilters.name.length === 0 || columnFilters.name.includes(m.name);
      const matchesCategory = columnFilters.category.length === 0 || columnFilters.category.includes(m.category);
      const matchesStock = columnFilters.stock.length === 0 || columnFilters.stock.includes(String(m.total_stock));
      const matchesMinLevel = columnFilters.minLevel.length === 0 || columnFilters.minLevel.includes(String(m.minimum_stock_level));
      const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(getStatus(m));

      return matchesSearch && matchesName && matchesCategory && matchesStock && matchesMinLevel && matchesStatus;
    });
  }, [medicines, searchTerm, columnFilters]);

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Medicines Inventory</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {canCreate('medicines') && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-500" />
                ) : (
                  <Upload className="w-4 h-4 mr-2 text-indigo-500" />
                )}
                {importing ? 'Importing...' : 'Import Excel'}
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setColumnFilters({ name: [], category: [], stock: [], minLevel: [], status: [] })}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear All Filters ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <ColumnFilter
                  label="Medicine Name"
                  options={uniqueNames}
                  selectedValues={columnFilters.name}
                  onFilterChange={(v) => updateFilter('name', v)}
                />
                <ColumnFilter
                  label="Category"
                  options={uniqueCategories}
                  selectedValues={columnFilters.category}
                  onFilterChange={(v) => updateFilter('category', v)}
                />
                <ColumnFilter
                  label="Stock Level"
                  options={uniqueStockLevels}
                  selectedValues={columnFilters.stock}
                  onFilterChange={(v) => updateFilter('stock', v)}
                />
                <ColumnFilter
                  label="Min. Level"
                  options={uniqueMinLevels}
                  selectedValues={columnFilters.minLevel}
                  onFilterChange={(v) => updateFilter('minLevel', v)}
                />
                <ColumnFilter
                  label="Status"
                  options={statusOptions}
                  selectedValues={columnFilters.status}
                  onFilterChange={(v) => updateFilter('status', v)}
                />
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

      {/* Import Result Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Results"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{importResult?.created} Medicines Created</p>
              <p className="text-xs text-gray-500">Successfully imported from Excel file.</p>
            </div>
          </div>

          {importResult && importResult.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Import Warnings ({importResult.errors.length})</p>
              </div>
              <div className="max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                {importResult.errors.map((err, i) => (
                  <div key={i} className="px-3 py-2 flex items-start gap-3">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-0.5">
                      Row {err.row}
                    </span>
                    <p className="text-xs text-gray-600">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="w-full py-2.5 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Medicines;
