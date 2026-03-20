import { useEffect, useState, useMemo, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Package, Plus, Calendar, AlertTriangle, Clock, Trash2, Search, Upload, CheckCircle2, Loader2, AlertCircle, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import ColumnFilter from '../components/ColumnFilter';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';

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

interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

const Batches = () => {
  const { canCreate, canDelete } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    medicine_id: string;
    batch_number: string;
    expiry_date: string;
    purchase_price: number | undefined;
    selling_price: number | undefined;
    initial_quantity: number | undefined;
  }>({
    medicine_id: '',
    batch_number: '',
    expiry_date: '',
    purchase_price: undefined,
    selling_price: undefined,
    initial_quantity: undefined,
  });

  // Excel Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [filterMedicine, setFilterMedicine] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

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

  const handleEdit = (batch: Batch) => {
    setEditingBatchId(batch.id);
    setFormData({
      medicine_id: batch.medicine_id,
      batch_number: batch.batch_number,
      expiry_date: batch.expiry_date.split('T')[0], // Extract date part for input
      purchase_price: batch.purchase_price,
      selling_price: batch.selling_price,
      initial_quantity: batch.initial_quantity,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a clean payload object, ensuring numeric fields are numbers and optional fields are undefined if empty
    const payload = {
      medicine_id: formData.medicine_id,
      batch_number: formData.batch_number,
      expiry_date: formData.expiry_date,
      purchase_price: formData.purchase_price !== undefined && formData.purchase_price !== null ? Number(formData.purchase_price) : undefined,
      selling_price: formData.selling_price !== undefined && formData.selling_price !== null ? Number(formData.selling_price) : undefined,
      initial_quantity: Number(formData.initial_quantity),
    };

    try {
      if (editingBatchId) {
        await client.patch(`/batches/${editingBatchId}`, payload);
        toastSuccess('Batch updated successfully.');
      } else {
        await client.post('/batches', payload);
        toastSuccess('Batch created successfully.');
      }
      setIsModalOpen(false);
      setEditingBatchId(null);
      setFormData({
        medicine_id: '',
        batch_number: '',
        expiry_date: '',
        purchase_price: undefined,
        selling_price: undefined,
        initial_quantity: undefined,
      });
      fetchBatches();
    } catch (error: any) {
      console.error('Batch Save Error payload:', payload);
      console.error('Batch Save Error response:', error.response?.data);
      const msg = extractErrorMessage(error, 'Error saving batch. Please check all fields.');
      toastError(editingBatchId ? 'Update failed' : 'Failed to create batch', msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/batches/${id}`);
      fetchBatches();
      toastSuccess('Batch deleted.');
    } catch (error: any) {
      toastError('Delete failed', 'This batch may be linked to sales records.');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      const response = await client.post('/batches/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(response.data);
      setIsImportModalOpen(true);
      fetchBatches();
    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('Failed to import Excel file. Please ensure it follows the correct format and medicine names match existing records.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
  const getStatus = (date: string) => isExpired(date) ? 'Expired' : isExpiringSoon(date) ? 'Expiring Soon' : 'Good';

  // ─── Unique Options ──────────────────────────────────────────
  const uniqueMedicineNames = useMemo(() => [...new Set(batches.map(b => b.medicine?.name).filter(Boolean))].sort(), [batches]);
  const statusOptions = ['Good', 'Expiring Soon', 'Expired'];

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesSearch =
        b.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMedicine = filterMedicine.length === 0 || filterMedicine.includes(b.medicine?.name);
      const matchesStatus = filterStatus.length === 0 || filterStatus.includes(getStatus(b.expiry_date));

      return matchesSearch && matchesMedicine && matchesStatus;
    });
  }, [batches, searchTerm, filterMedicine, filterStatus]);





  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Batches</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Track and manage medicine batches, expiry, and inventory levels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {canCreate('batches') && (
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
                className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 text-sm font-bold"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-500" />
                ) : (
                  <Upload className="w-4 h-4 mr-2 text-indigo-500" />
                )}
                {importing ? 'Importing...' : 'Import Excel'}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Issue New Batch
              </button>
            </>
          )}
        </div>
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
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 px-2 lg:ml-auto">
            <Package className="w-3.5 h-3.5" />
            <span>{filteredBatches.length} Batches Found</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-30 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Details</th>
                <ColumnFilter
                  label="Medicine"
                  options={uniqueMedicineNames}
                  selectedValues={filterMedicine}
                  onFilterChange={setFilterMedicine}
                />
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Prices</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Expiry</th>
                <ColumnFilter
                  label="Status"
                  options={statusOptions}
                  selectedValues={filterStatus}
                  onFilterChange={setFilterStatus}
                />
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 italic">Loading batches...</td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 italic">No batches found.</td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${isExpired(batch.expiry_date) ? 'bg-red-50 text-red-500' : isExpiringSoon(batch.expiry_date) ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Batch #</p>
                          <p className="text-xs font-mono font-bold text-gray-700">{batch.batch_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{batch.medicine?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{batch.quantity_remaining}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Buy: ETB {Number(batch.purchase_price).toFixed(2)}</span>
                        <span className="text-sm font-bold text-indigo-600">Sell: ETB {Number(batch.selling_price).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                        <span className="font-bold text-sm">{new Date(batch.expiry_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isExpired(batch.expiry_date) ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 uppercase tracking-wide">
                          <AlertTriangle className="w-3 h-3 mr-1.5" /> Expired
                        </div>
                      ) : isExpiringSoon(batch.expiry_date) ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 uppercase tracking-wide">
                          <Clock className="w-3 h-3 mr-1.5" /> Expiring Soon
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">
                          Good
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(batch)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Batch"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete('batches') && (
                          <button
                            onClick={() => setDeleteConfirm(batch.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBatchId(null);
          setFormData({
            medicine_id: '',
            batch_number: '',
            expiry_date: '',
            purchase_price: undefined,
            selling_price: undefined,
            initial_quantity: undefined,
          });
        }}
        title={editingBatchId ? "Edit Batch" : "Add New Batch"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.initial_quantity ?? ''}
                onChange={(e) => setFormData({ ...formData, initial_quantity: e.target.value === '' ? undefined : parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.purchase_price ?? ''}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.selling_price ?? ''}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
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
              {editingBatchId ? 'Update Batch' : 'Create Batch'}
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
              <p className="text-sm font-bold text-gray-800">{importResult?.created} Batches Created</p>
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

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Batch"
        message="Are you sure you want to delete this batch? This action cannot be undone."
      />
    </div>
  );
};

export default Batches;
