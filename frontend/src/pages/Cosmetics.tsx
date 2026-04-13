import { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Sparkles, Edit3, Trash2, X, Package,
    ShoppingBag, TrendingUp, AlertCircle, ChevronRight, Save, Loader2
} from 'lucide-react';
import client from '../api/client';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';
import Modal from '../components/Modal';

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
    const [categoryFilter, setCategoryFilter] = useState('');

    // Form state
    const [form, setForm] = useState({
        name: '',
        category: 'Skin Care',
        preferred_supplier_id: '',
        unit: 'PCS',
        minimum_stock_level: 5,
    });

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
        setForm({ name: '', category: 'Skin Care', preferred_supplier_id: '', unit: 'PCS', minimum_stock_level: 5 });
        setShowModal(true);
    };

    const openEdit = (item: any) => {
        setEditItem(item);
        setForm({
            name: item.name || '',
            category: item.category || 'Skin Care',
            preferred_supplier_id: item.preferred_supplier_id || '',
            unit: item.unit || 'PCS',
            minimum_stock_level: item.minimum_stock_level || 5,
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) { toastError('Validation', 'Product name is required.'); return; }
        setSubmitting(true);
        try {
            const payload = { ...form, product_type: 'COSMETIC' };
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

    const uniqueCategories = useMemo(() => [...new Set(cosmetics.map(c => c.category).filter(Boolean))].sort(), [cosmetics]);

    const filtered = useMemo(() => {
        return cosmetics.filter(c => {
            const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.category?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !categoryFilter || c.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [cosmetics, search, categoryFilter]);

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
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Register Cosmetic
                </button>
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
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    >
                        <option value="">All Categories</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-pink-50/60 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Product Name</th>
                                <th className="px-5 py-3.5">Category</th>
                                <th className="px-5 py-3.5 text-center">In Stock</th>
                                <th className="px-5 py-3.5 text-center">Min Level</th>
                                <th className="px-5 py-3.5 text-right">Selling Price</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="py-16 text-center">
                                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Loading cosmetics...</p>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center">
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
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                                                        <ShoppingBag className="w-4 h-4 text-pink-500" />
                                                    </div>
                                                    <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                                </div>
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
                                            <td className="px-5 py-3.5 text-right font-bold text-sm text-indigo-700">
                                                {item.selling_price > 0 ? `ETB ${Number(item.selling_price).toFixed(2)}` : '—'}
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

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Product Name *</label>
                        <input
                            type="text"
                            placeholder="e.g., Nivea Body Lotion"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Supplier</label>
                            <select
                                value={form.preferred_supplier_id}
                                onChange={e => setForm(p => ({ ...p, preferred_supplier_id: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            >
                                <option value="">— Select Supplier —</option>
                                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
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
        </div>
    );
};

export default Cosmetics;
