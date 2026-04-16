import { useEffect, useState, useMemo, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Save, Upload, AlertCircle, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import ColumnFilter from '../components/ColumnFilter';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Suspension', 'Powder', 'Patch', 'Other'];

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  dosage_form: string;
  sku: string;
  total_stock: number;
  minimum_stock_level: number;
  unit: string;
  is_controlled: boolean;
  is_expirable: boolean;
  selling_price: number;
}

interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

const defaultForm = {
  sku: '',
  name: '',
  generic_name: '',
  dosage_form: '',
  batch_number: '',
  is_expirable: true,
  unit: 'TAB',
  initial_quantity: undefined as number | undefined,
  minimum_stock_level: 10,
  selling_price: undefined as number | undefined,
  purchase_price: undefined as number | undefined,
  expiry_date: '',
  is_controlled: false,
};

const Medicines = () => {
  const { canCreate, canUpdate, canDelete } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });

  // Excel Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    sku: [], name: [], dosage_form: [], stock: [], status: [],
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await client.get('/medicines?product_type=MEDICINE');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/medicines/${id}`);
      fetchMedicines();
      toastSuccess('Medicine deleted successfully.');
    } catch (error: any) {
      toastError('Delete failed', 'This medicine may be linked to batches or sales records.');
    }
  };

  const handleOpenModal = (med?: Medicine) => {
    if (med) {
      setEditingMed(med);
      setFormData({
        ...defaultForm,
        sku: med.sku || '',
        name: med.name || '',
        generic_name: med.generic_name || '',
        dosage_form: med.dosage_form || '',
        unit: med.unit || 'TAB',
        is_expirable: med.is_expirable !== false,
        minimum_stock_level: med.minimum_stock_level ?? 10,
        is_controlled: med.is_controlled || false,
        selling_price: med.selling_price || undefined,
        batch_number: '',
        initial_quantity: undefined,
        purchase_price: undefined,
        expiry_date: '',
      });
    } else {
      setEditingMed(null);
      setFormData({ ...defaultForm });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: if expirable + batch number provided, expiry date is required
    if (!editingMed && formData.batch_number && formData.is_expirable && !formData.expiry_date) {
      toastError('Validation Error', 'Expiry Date is required for expirable items with a batch.');
      return;
    }

    const payload: any = {
      sku: formData.sku || undefined,
      name: formData.name,
      generic_name: formData.generic_name || undefined,
      dosage_form: formData.dosage_form || undefined,
      unit: formData.unit || undefined,
      is_expirable: formData.is_expirable,
      is_controlled: formData.is_controlled,
      minimum_stock_level: formData.minimum_stock_level !== undefined ? Number(formData.minimum_stock_level) : undefined,
    };

    // Add batch fields on create if any are provided
    if (!editingMed && (formData.batch_number || formData.initial_quantity !== undefined || formData.selling_price !== undefined || formData.purchase_price !== undefined)) {
      payload.batch_number = formData.batch_number || undefined;
      payload.initial_quantity = formData.initial_quantity !== undefined ? Number(formData.initial_quantity) : undefined;
      payload.selling_price = formData.selling_price !== undefined ? Number(formData.selling_price) : 0;
      payload.purchase_price = formData.purchase_price !== undefined ? Number(formData.purchase_price) : 0;
      payload.expiry_date = formData.is_expirable && formData.expiry_date ? formData.expiry_date : undefined;
    }

    try {
      if (editingMed) {
        await client.patch(`/medicines/${editingMed.id}`, payload);
        toastSuccess('Medicine updated successfully.');
      } else {
        await client.post('/medicines', payload);
        toastSuccess('Medicine registered successfully.');
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error: any) {
      const msg = extractErrorMessage(error, 'Error saving medicine. Please check all fields.');
      toastError('Failed to save medicine', msg);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setImporting(true);
    try {
      const response = await client.post('/medicines/import', fd, {
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

  const uniqueSkus = useMemo(() => [...new Set(medicines.map(m => m.sku).filter(Boolean))].sort(), [medicines]);
  const uniqueNames = useMemo(() => [...new Set(medicines.map(m => m.name).filter(Boolean))].sort(), [medicines]);
  const uniqueDosageForms = useMemo(() => [...new Set(medicines.map(m => m.dosage_form).filter(Boolean))].sort(), [medicines]);
  const uniqueStockLevels = useMemo(() => [...new Set(medicines.map(m => String(m.total_stock)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)), [medicines]);
  const statusOptions = ['In Stock', 'Low Stock'];

  const getStatus = (m: Medicine) => m.total_stock <= m.minimum_stock_level ? 'Low Stock' : 'In Stock';

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchesSearch =
        (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (m.generic_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (m.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesSku = columnFilters.sku.length === 0 || columnFilters.sku.includes(m.sku);
      const matchesName = columnFilters.name.length === 0 || columnFilters.name.includes(m.name);
      const matchesDosage = columnFilters.dosage_form.length === 0 || columnFilters.dosage_form.includes(m.dosage_form);
      const matchesStock = columnFilters.stock.length === 0 || columnFilters.stock.includes(String(m.total_stock));
      const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(getStatus(m));

      return matchesSearch && matchesSku && matchesName && matchesDosage && matchesStock && matchesStatus;
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
                {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-500" /> : <Upload className="w-4 h-4 mr-2 text-indigo-500" />}
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
              placeholder="Search by name, generic name or Item ID..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setColumnFilters({ sku: [], name: [], dosage_form: [], stock: [], status: [] })}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear All Filters ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold sticky top-0 z-30 shadow-sm">
              <tr>
                <ColumnFilter label="Item ID" options={uniqueSkus} selectedValues={columnFilters.sku} onFilterChange={(v) => updateFilter('sku', v)} />
                <ColumnFilter label="Product Name" options={uniqueNames} selectedValues={columnFilters.name} onFilterChange={(v) => updateFilter('name', v)} />
                <ColumnFilter label="Dosage Form" options={uniqueDosageForms} selectedValues={columnFilters.dosage_form} onFilterChange={(v) => updateFilter('dosage_form', v)} className="hidden sm:table-cell" />
                <ColumnFilter label="Stock Level" options={uniqueStockLevels} selectedValues={columnFilters.stock} onFilterChange={(v) => updateFilter('stock', v)} />
                <th className="px-6 py-3 whitespace-nowrap hidden md:table-cell">Min. Level</th>
                <ColumnFilter label="Status" options={statusOptions} selectedValues={columnFilters.status} onFilterChange={(v) => updateFilter('status', v)} />
                <th className="px-6 py-3 font-bold">Selling Price</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading inventory...</td></tr>
              ) : filteredMedicines.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No medicines found.</td></tr>
              ) : (
                filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{med.sku || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{med.name}</div>
                      <div className="text-xs text-gray-500">{med.generic_name}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">{med.dosage_form || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${med.total_stock <= med.minimum_stock_level ? 'text-red-600' : 'text-green-600'}`}>
                        {med.total_stock} {med.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">{med.minimum_stock_level}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {med.total_stock <= med.minimum_stock_level ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Low Stock</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                        )}
                        {!med.is_expirable && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[9px] font-bold uppercase">Non-Exp</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-indigo-700">ETB {Number(med.selling_price || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canUpdate('medicines') && (
                        <button onClick={() => handleOpenModal(med)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Edit Medicine">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete('medicines') && (
                        <button onClick={() => setDeleteConfirm(med.id)} className="text-gray-400 hover:text-red-600">
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

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No medicines found.</div>
        ) : (
          filteredMedicines.map((med) => (
            <div key={med.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{med.name}</h3>
                  <p className="text-xs text-gray-500">{med.generic_name}</p>
                  {med.sku && <p className="text-[10px] font-mono text-indigo-500 mt-0.5">{med.sku}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${med.total_stock <= med.minimum_stock_level ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {med.total_stock <= med.minimum_stock_level ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400 text-xs">Dosage Form:</span>
                  <p className="font-medium text-gray-800">{med.dosage_form || '—'}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-xs">Stock:</span>
                  <p className={`font-semibold ${med.total_stock <= med.minimum_stock_level ? 'text-red-600' : 'text-green-600'}`}>
                    {med.total_stock} {med.unit}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Min Level:</span>
                  <p className="font-medium text-gray-800">{med.minimum_stock_level}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-xs">Price:</span>
                  <p className="font-black text-indigo-700">ETB {Number(med.selling_price || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-1 flex justify-end gap-3">
                {canUpdate('medicines') && (
                  <button onClick={() => handleOpenModal(med)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                )}
                {canDelete('medicines') && (
                  <button onClick={() => setDeleteConfirm(med.id)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMed ? 'Edit Medicine' : 'Register New Medicine'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Item ID + Product Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item ID <span className="text-red-500">*</span></label>
              <input
                required
                type="text" placeholder="e.g. MED-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input
                required type="text" placeholder="Brand / Product Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Generic Name + Dosage Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
              <input
                type="text" placeholder="e.g. Amoxicillin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
              <input
                type="text" list="dosage_forms" placeholder="e.g. Tablet, Syrup..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.dosage_form}
                onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
              />
              <datalist id="dosage_forms">
                {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
              </datalist>
            </div>
          </div>

          {/* Row 3: Batch Number + Is Expirable */}
          {!editingMed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input
                  type="text" placeholder="e.g. BN-2026-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox" id="is_expirable"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={formData.is_expirable}
                  onChange={(e) => setFormData({ ...formData, is_expirable: e.target.checked, expiry_date: '' })}
                />
                <label htmlFor="is_expirable" className="ml-2 block text-sm text-gray-900 font-semibold">
                  Is Expirable
                  <span className="block text-xs text-gray-400 font-normal">Uncheck for equipment, machines, etc.</span>
                </label>
              </div>
            </div>
          )}

          {/* Expiry Date (only when is_expirable = true on create) */}
          {!editingMed && formData.is_expirable && formData.batch_number && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                required={formData.is_expirable && !!formData.batch_number}
                type="date"
                className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 text-sm"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          )}

          {/* Row 4: UoM + Stock Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement (UoM)</label>
              <input
                type="text" list="medicine_units" placeholder="e.g. TAB, ML, PCS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
              <datalist id="medicine_units">
                {['TAB', 'CAP', 'BTL', 'AMP', 'VIAL', 'TUBE', 'SACHET', 'PCS', 'ML', 'GM'].map(u => <option key={u} value={u}>{u}</option>)}
              </datalist>
            </div>
            {!editingMed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level (Initial Qty)</label>
                <input
                  type="number" min="0" placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.initial_quantity ?? ''}
                  onChange={(e) => setFormData({ ...formData, initial_quantity: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>

          {/* Row 5: Min Stock Level + Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stock Level</label>
              <input
                type="number" min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.minimum_stock_level ?? ''}
                onChange={(e) => setFormData({ ...formData, minimum_stock_level: e.target.value === '' ? undefined as any : parseInt(e.target.value) })}
              />
            </div>
            {!editingMed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Selling Price)</label>
                <input
                  type="number" min="0" step="0.01" placeholder="e.g. 25.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.selling_price ?? ''}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                />
              </div>
            )}
          </div>

          {/* Hidden fields */}
          <input type="hidden" name="is_controlled" value={String(formData.is_controlled)} />

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              {editingMed ? 'Update Medicine' : 'Register Medicine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Result Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Results">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="p-2 bg-indigo-600 text-white rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
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
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-0.5">Row {err.row}</span>
                    <p className="text-xs text-gray-600">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2">
            <button onClick={() => setIsImportModalOpen(false)} className="w-full py-2.5 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200">Close</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
      />
    </div>
  );
};

export default Medicines;
