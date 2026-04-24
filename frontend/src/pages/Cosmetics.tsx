import { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Sparkles, Edit3, Trash2, X, Package,
    ShoppingBag, TrendingUp, AlertCircle, ChevronRight, Save, Loader2, Upload, CheckCircle2
} from 'lucide-react';
import { useRef } from 'react';
import client from '../api/client';
import { toastSuccess, toastError } from '../components/Toast';
import { formatDate } from '../utils/dateUtils';
import { extractErrorMessage } from '../utils/errorUtils';
import Modal from '../components/Modal';
import ColumnFilter from '../components/ColumnFilter';

const COSMETIC_CATEGORIES = [
    'Skin Care',
    'Hair Care',
    'Dental & Oral',
    'Fragrances',
    'Baby Care',
    'Sun Care',
    'Personal Hygiene',
    'Makeup',
    'Other',
];

const Cosmetics = () => {
    const [cosmetics, setCosmetics] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        sku: [], name: [], category: [], unit: [], status: [],
    });

    // Form state
    const [form, setForm] = useState<{
        name: string; category: string; unit: string; minimum_stock_level: number;
        sku: string; batch_number: string; purchase_price?: string; selling_price?: string;
        initial_quantity?: string; expiry_date: string;
    }>({
        name: '', category: 'Skin Care', unit: 'PCS', minimum_stock_level: 5,
        sku: '', batch_number: '', expiry_date: '', purchase_price: '', selling_price: '', initial_quantity: ''
    });

    // Excel Import States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cosRes, suppRes] = await Promise.all([
                client.get('/medicines?product_type=COSMETIC'),
                client.get('/suppliers').catch(() => ({ data: [] })),
            ]);
            setCosmetics(cosRes.data || []);
            setSuppliers(suppRes.data || []);
        } catch (err) {
            console.error('Failed to load cosmetics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditItem(null);
        setForm({ name: '', category: 'Skin Care', unit: 'PCS', minimum_stock_level: 5, sku: '', batch_number: '', expiry_date: '', purchase_price: '', selling_price: '', initial_quantity: '' });
        setShowModal(true);
    };

    const openEdit = (item: any) => {
        setEditItem(item);
        setForm({
            name: item.name || '',
            category: item.category || 'Skin Care',
            unit: item.unit || 'PCS',
            minimum_stock_level: item.minimum_stock_level || 5,
            sku: item.sku || '',
            batch_number: '',
            expiry_date: '',
            purchase_price: '',
            selling_price: '',
            initial_quantity: '',
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.sku?.trim()) { toastError('Validation', 'Item ID (SKU) is required.'); return; }
        if (!form.name?.trim()) { toastError('Validation', 'Product name is required.'); return; }

        setSubmitting(true);
        try {
            const payload: any = { ...form, product_type: 'COSMETIC' };

            // Convert numeric fields if present
            if (payload.initial_quantity !== undefined && payload.initial_quantity !== '') payload.initial_quantity = Number(payload.initial_quantity);
            if (payload.purchase_price !== undefined && payload.purchase_price !== '') payload.purchase_price = Number(payload.purchase_price);
            if (payload.selling_price !== undefined && payload.selling_price !== '') payload.selling_price = Number(payload.selling_price);

            // If it's a new item but no batch/stock info provided at all, clean up
            if (!editItem && !payload.batch_number && !payload.initial_quantity && !payload.selling_price) {
                delete payload.batch_number;
                delete payload.expiry_date;
                delete payload.purchase_price;
                delete payload.selling_price;
                delete payload.initial_quantity;
            } else if (!payload.expiry_date || payload.expiry_date === "") {
                delete payload.expiry_date;
            }

            if (editItem) {
                await client.patch(`/medicines/${editItem.id}`, payload);
                toastSuccess('Cosmetic product updated successfully.');
            } else {
                await client.post('/medicines', payload);
                toastSuccess('Cosmetic product registered successfully.');
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            toastError('Failed to save', extractErrorMessage(err, 'An error occurred.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setImporting(true);
        try {
            const response = await client.post('/medicines/import?product_type=COSMETIC', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportResult(response.data);
            setIsImportModalOpen(true);
            fetchData();
        } catch (err: any) {
            toastError('Import Failed', extractErrorMessage(err, 'Failed to import.'));
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await client.delete(`/medicines/${deleteTarget.id}`);
            toastSuccess('Cosmetic product removed.');
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchData();
        } catch (err: any) {
            toastError('Delete failed', extractErrorMessage(err, 'An error occurred.'));
        }
    };

    const uniqueSkus = useMemo(() => [...new Set(cosmetics.map(c => c.sku).filter(Boolean))].sort(), [cosmetics]);
    const uniqueNames = useMemo(() => [...new Set(cosmetics.map(c => c.name).filter(Boolean))].sort(), [cosmetics]);
    const uniqueCategories = useMemo(() => [...new Set(cosmetics.map(c => c.category).filter(Boolean))].sort(), [cosmetics]);
    const uniqueUnits = useMemo(() => [...new Set(cosmetics.map(c => c.unit).filter(Boolean))].sort(), [cosmetics]);
    const statusOptions = ['In Stock', 'Low Stock', 'Out of Stock'];

    const getStatus = (c: any) => {
        if ((c.total_stock || 0) <= 0) return 'Out of Stock';
        if ((c.total_stock || 0) <= (c.minimum_stock_level || 5)) return 'Low Stock';
        return 'In Stock';
    };

    const filtered = useMemo(() => {
        return cosmetics.filter(c => {
            const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.category?.toLowerCase().includes(search.toLowerCase()) ||
                c.sku?.toLowerCase().includes(search.toLowerCase());

            const matchesSku = columnFilters.sku.length === 0 || columnFilters.sku.includes(c.sku);
            const matchesName = columnFilters.name.length === 0 || columnFilters.name.includes(c.name);
            const matchesCategory = columnFilters.category.length === 0 || columnFilters.category.includes(c.category);
            const matchesUnit = columnFilters.unit.length === 0 || columnFilters.unit.includes(c.unit);
            const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(getStatus(c));

            return matchesSearch && matchesSku && matchesName && matchesCategory && matchesUnit && matchesStatus;
        });
    }, [cosmetics, search, columnFilters]);

    const updateFilter = (column: string, values: string[]) => {
        setColumnFilters(prev => ({ ...prev, [column]: values }));
    };

    const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

    // Summary stats
    const totalItems = cosmetics.length;
    const totalStock = cosmetics.reduce((acc, c) => acc + (c.total_stock || 0), 0);
    const lowStock = cosmetics.filter(c => c.total_stock <= (c.minimum_stock_level || 5)).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Cosmetics</h1>
                        <p className="text-sm text-gray-500">Register and manage cosmetic products</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-sm"
                    >
                        {importing ? <Loader2 className="w-4 h-4 animate-spin text-pink-500" /> : <Upload className="w-4 h-4 text-pink-500" />}
                        Import Excel
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Register Cosmetic
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Products</p>
                        <p className="text-2xl font-black text-gray-900">{totalItems}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Stock</p>
                        <p className="text-2xl font-black text-gray-900">{totalStock.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Low Stock</p>
                        <p className={`text-2xl font-black ${lowStock > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{lowStock}</p>
                    </div>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setColumnFilters({ sku: [], name: [], category: [], unit: [], status: [] })}
                            className="px-3 py-2 bg-pink-50 text-pink-600 text-[11px] font-bold rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors"
                        >
                            Clear {activeFilterCount} Filters
                        </button>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-pink-50/60 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                            <tr>
                                <ColumnFilter label="Item ID" options={uniqueSkus} selectedValues={columnFilters.sku} onFilterChange={vals => updateFilter('sku', vals)} className="px-5 py-3 text-left text-[10px]" />
                                <ColumnFilter label="Product" options={uniqueNames} selectedValues={columnFilters.name} onFilterChange={vals => updateFilter('name', vals)} className="px-5 py-3 text-left text-[10px]" />
                                <ColumnFilter label="UoM" options={uniqueUnits} selectedValues={columnFilters.unit} onFilterChange={vals => updateFilter('unit', vals)} align="center" className="px-5 py-3 text-center text-[10px]" />
                                <ColumnFilter label="Category" options={uniqueCategories} selectedValues={columnFilters.category} onFilterChange={vals => updateFilter('category', vals)} className="px-5 py-3 text-left text-[10px]" />
                                <th className="px-5 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Stock</th>
                                <th className="px-5 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Min</th>
                                <th className="px-5 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                <ColumnFilter label="Status" options={statusOptions} selectedValues={columnFilters.status} onFilterChange={vals => updateFilter('status', vals)} align="center" className="px-5 py-3 text-center text-[10px]" />
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={10} className="py-16 text-center">
                                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Loading cosmetics...</p>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={10} className="py-16 text-center">
                                    <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-gray-400">No cosmetic products found</p>
                                    <p className="text-xs text-gray-300 mt-1">Register your first cosmetic product to get started</p>
                                </td></tr>
                            ) : (
                                filtered.map(item => {
                                    const isLow = item.total_stock <= (item.minimum_stock_level || 5);
                                    const isOut = item.total_stock <= 0;
                                    return (
                                        <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-100">{item.sku || '—'}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                                                        <ShoppingBag className="w-4 h-4 text-pink-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Batch: {item.batch_number || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-xs font-bold text-gray-600">{item.unit || '—'}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-[11px] font-bold border border-pink-100">
                                                    {item.category || '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`text-sm font-black ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                    {item.total_stock || 0} {item.unit}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-sm text-gray-500 font-semibold">{item.minimum_stock_level}</td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                <span className="text-xs font-bold text-gray-600 block">{item.expiry_date ? formatDate(item.expiry_date) : '—'}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-xs text-indigo-700 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-[10px]">Buy: ETB {Number(item.purchase_price || 0).toFixed(2)}</span>
                                                    <span className="text-indigo-600">Sell: ETB {Number(item.selling_price || 0).toFixed(2)}</span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">{item.expiry_date ? formatDate(item.expiry_date) : ''}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {isOut ? (
                                                    <span className="inline-flex px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100">Out of Stock</span>
                                                ) : isLow ? (
                                                    <span className="inline-flex px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">Low Stock</span>
                                                ) : (
                                                    <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">In Stock</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                    {loading ? (
                        <div className="py-12 text-center border border-gray-100 rounded-2xl">
                            <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Loading cosmetics...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center border border-gray-100 rounded-2xl">
                            <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-400">No cosmetic products found</p>
                        </div>
                    ) : (
                        filtered.map(item => {
                            const isLow = item.total_stock <= (item.minimum_stock_level || 5);
                            const isOut = item.total_stock <= 0;
                            return (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                                                <ShoppingBag className="w-4 h-4 text-pink-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                                                <p className="text-[10px] text-gray-500 font-mono">Batch: {item.batch_number || '—'}</p>
                                                <span className="inline-block px-2.5 py-0.5 mt-1 bg-pink-50 text-pink-700 rounded-full text-[10px] font-bold border border-pink-100">
                                                    {item.category || '—'}
                                                </span>
                                            </div>
                                        </div>
                                        {isOut ? (
                                            <span className="inline-flex px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100">Out of Stock</span>
                                        ) : isLow ? (
                                            <span className="inline-flex px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">Low Stock</span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">In Stock</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                                        <div>
                                            <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Stock</span>
                                            <p className={`font-black ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                {item.total_stock || 0} {item.unit}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Price</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-gray-400 text-[9px]">Buy: ETB {Number(item.purchase_price || 0).toFixed(2)}</span>
                                                <p className="font-black text-indigo-700">
                                                    Sell: ETB {Number(item.selling_price || 0).toFixed(2)}
                                                </p>
                                                <span className="text-[9px] text-gray-400">{item.expiry_date ? formatDate(item.expiry_date) : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-50 pt-3 mt-1 flex justify-end gap-2">
                                        <button onClick={() => openEdit(item)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 rounded-lg text-[11px] font-bold transition-colors">
                                            <Edit3 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-[11px] font-bold transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span>Showing {filtered.length} of {cosmetics.length} products</span>
                        <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Cosmetics Registry</span>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editItem ? 'Edit Cosmetic Product' : 'Register Cosmetic Product'}
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100 mb-2">
                        <Sparkles className="w-5 h-5 text-pink-500 shrink-0" />
                        <p className="text-xs text-pink-700 font-medium">
                            Cosmetics are managed separately from medicines and do not require prescriptions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Item ID (SKU) *</label>
                            <input
                                type="text"
                                placeholder="e.g. COS-001"
                                value={form.sku}
                                onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Product Name *</label>
                            <input
                                type="text"
                                placeholder="e.g., Nivea Body Lotion"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
                            <input
                                list="cosmetic_categories"
                                placeholder="Select or type..."
                                value={form.category}
                                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                            <datalist id="cosmetic_categories">
                                {COSMETIC_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Unit</label>
                            <input
                                list="cosmetic_units"
                                placeholder="Select or type..."
                                value={form.unit}
                                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                            <datalist id="cosmetic_units">
                                {['PCS', 'BOTTLE', 'PACKET', 'BOX', 'TUBE', 'JAR', 'SACHET'].map(u => <option key={u} value={u}>{u}</option>)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Min Stock Level</label>
                            <input
                                type="number"
                                min={0}
                                value={form.minimum_stock_level || ''}
                                onChange={e => setForm(p => ({ ...p, minimum_stock_level: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                        </div>
                    </div>

                    {!editItem && (
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4 text-pink-500" /> Optional: Add Initial Stock Batch
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Batch Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BATCH-X"
                                        value={form.batch_number}
                                        onChange={e => setForm(p => ({ ...p, batch_number: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Initial Quantity</label>
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="0"
                                        value={form.initial_quantity}
                                        onChange={e => setForm(p => ({ ...p, initial_quantity: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Purchase Price</label>
                                    <input
                                        type="number" step="0.01" min={0}
                                        value={form.purchase_price}
                                        onChange={e => setForm(p => ({ ...p, purchase_price: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Selling Price</label>
                                    <input
                                        type="number" step="0.01" min={0}
                                        value={form.selling_price}
                                        onChange={e => setForm(p => ({ ...p, selling_price: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={form.expiry_date}
                                        onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
                        💡 Purchase price, selling price, expiry date, and batch info are set when you receive stock via <strong>Purchase Orders</strong>.
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 py-2.5 bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editItem ? 'Save Changes' : 'Register Product'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete confirmation */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Remove Product">
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700">
                        Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                        <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all">Remove</button>
                    </div>
                </div>
            </Modal>

            {/* Import Result Modal */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Results">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-100">
                        <div className="p-2 bg-pink-600 text-white rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-pink-900">Import Complete</h3>
                            <p className="text-sm text-pink-700">Successfully imported {importResult?.created || 0} cosmetics.</p>
                        </div>
                    </div>
                    {importResult?.errors && importResult.errors.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Errors during import:</h4>
                            <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm">
                                <ul className="list-disc pl-5 text-red-600 space-y-1 text-xs">
                                    {importResult.errors.map((err: any, i: number) => (
                                        <li key={i}>Row {err.row}: {err.message}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setIsImportModalOpen(false)} className="w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl mt-4 hover:bg-gray-200">Close</button>
                </div>
            </Modal>
        </div>
    );
};

export default Cosmetics;
