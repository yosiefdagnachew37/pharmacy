import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Pencil, Trash2, X, Building2, Phone, Mail, MapPin,
    Star, Award, ChevronDown, ChevronUp, Search, Info
} from 'lucide-react';
import client from '../api/client';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Hash } from 'lucide-react';
import { toastSuccess, toastError } from '../components/Toast';

interface Supplier {
    id: string;
    name: string;
    tin?: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    credit_limit: number;
    payment_terms: string;
    average_lead_time: number;
    is_active: boolean;
}

const Suppliers = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [form, setForm] = useState<{
        name: string;
        tin: string;
        contact_person: string;
        phone: string;
        email: string;
        address: string;
        credit_limit: number | undefined;
        payment_terms: string;
        average_lead_time: number | undefined;
        is_active: boolean;
    }>({
        name: '', tin: '', contact_person: '', phone: '', email: '', address: '',
        credit_limit: 0, payment_terms: 'COD', average_lead_time: 7, is_active: true,
    });

    const fetchData = async () => {
        try {
            const [suppRes, rankRes] = await Promise.all([
                client.get('/suppliers'),
                client.get('/suppliers/ranking?limit=5'),
            ]);
            setSuppliers(suppRes.data);
            setRanking(rankRes.data);
        } catch (err) {
            console.error('Failed to fetch suppliers', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        try {
            const payload = {
                ...form,
                credit_limit: form.credit_limit ?? 0,
                average_lead_time: form.average_lead_time ?? 0
            };
            if (editing) {
                await client.put(`/suppliers/${editing.id}`, payload);
                toastSuccess('Supplier Updated', 'Supplier has been successfully modified.');
            } else {
                await client.post('/suppliers', payload);
                toastSuccess('Supplier Created', 'New supplier has been added to the registry.');
            }
            setShowModal(false);
            setEditing(null);
            resetForm();
            fetchData();
        } catch (err: any) {
            console.error('Failed to save supplier', err);
            const errorMsg = err?.response?.data?.message || 'Could not save supplier information.';
            toastError('Save Failed', errorMsg);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await client.delete(`/suppliers/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete supplier', err);
        }
    };

    const openEdit = (s: Supplier) => {
        setEditing(s);
        setForm({
            name: s.name, tin: s.tin || '', contact_person: s.contact_person || '', phone: s.phone || '',
            email: s.email || '', address: s.address || '', credit_limit: s.credit_limit || 0,
            payment_terms: s.payment_terms || 'COD', average_lead_time: s.average_lead_time || 7,
            is_active: s.is_active,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({
            name: '', tin: '', contact_person: '', phone: '', email: '', address: '',
            credit_limit: 0, payment_terms: 'COD', average_lead_time: 7, is_active: true
        });
    };

    const getScoreBadge = (score: number) => {
        if (score >= 0.8) return 'bg-emerald-100 text-emerald-700';
        if (score >= 0.6) return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.tin?.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_person?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center text-gray-400 italic">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    {/* <h1 className="text-xl font-bold text-gray-800">Supplier Management</h1> */}
                    <p className="text-gray-500 mt-1 text-xs sm:text-sm">Manage vendors, contracts, and performance</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Supplier
                </button>
            </div>

            {/* Top Ranked Suppliers */}
            {ranking.length > 0 && (
                <div>
                    <div className="flex items-center gap-1.5 mb-3">
                        <Award className="w-4 h-4 text-amber-500" />
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Ranked</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {ranking.map((r, i) => (
                            <div key={r.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : 'bg-amber-700 text-white'
                                        }`}>{i + 1}</span>
                                    <p className="font-bold text-gray-800 text-[11px] truncate">{r.name}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getScoreBadge(r.score)}`}>
                                        {(r.score * 100).toFixed(0)}%
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        <span className="text-[9px] text-gray-500">{r.quality_rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-xs"
                />
            </div>

            {/* Supplier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((s) => (
                    <div key={s.id} onClick={() => navigate(`/suppliers/${s.id}`)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 pr-8">
                                    <h3 className="font-bold text-gray-800 text-sm truncate">{s.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-[10px] text-gray-400 truncate">{s.contact_person || 'No contact'}</p>
                                        {s.tin && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-1 py-0.5 rounded uppercase tracking-wider">TIN: {s.tin}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s.id); }} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600">
                            {s.phone && (
                                <div className="flex items-center gap-2 text-[11px]"><Phone className="w-3 h-3 text-gray-400" />{s.phone}</div>
                            )}
                            {s.email && (
                                <div className="flex items-center gap-2 text-[11px]"><Mail className="w-3 h-3 text-gray-400" />{s.email}</div>
                            )}
                            {s.address && (
                                <div className="flex items-center gap-2 text-[11px] leading-tight"><MapPin className="w-3 h-3 text-gray-400" /><span className="truncate">{s.address}</span></div>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px]">
                            <span className="font-bold text-gray-400 uppercase tracking-tight">Terms: <span className="text-gray-700">{s.payment_terms?.replace('_', ' ')}</span></span>
                            <span className="font-bold text-gray-400 uppercase tracking-tight">Lead: <span className="text-gray-700">{s.average_lead_time}d</span></span>
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {s.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400 italic bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No suppliers found</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-5 w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-gray-800">{editing ? 'Edit Supplier' : 'New Supplier'}</h2>
                            <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">Company Name *</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">TIN Number *</label>
                                    <input type="text" value={form.tin} onChange={e => setForm({ ...form, tin: e.target.value })}
                                        placeholder="e.g. 0012345678"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">Contact Person</label>
                                    <input type="text" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">Phone</label>
                                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">Address</label>
                                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs resize-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-3.5">
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1 group">
                                        Limit (ETB)
                                        <div className="relative">
                                            <Info className="w-3 h-3 text-gray-300 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-[9px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10 leading-tight">
                                                Maximum credit allowed by this supplier.
                                            </div>
                                        </div>
                                    </label>
                                    <input type="number" value={form.credit_limit ?? ''} onChange={e => setForm({ ...form, credit_limit: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1">
                                        Terms
                                    </label>
                                    <select value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold">
                                        <option value="COD">COD</option>
                                        <option value="NET_15">Net 15</option>
                                        <option value="NET_30">Net 30</option>
                                        <option value="NET_60">Net 60</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1 ml-1 group">
                                        Lead (Days)
                                        <div className="relative">
                                            <Info className="w-3 h-3 text-gray-300 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-[9px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10 leading-tight">
                                                Average business days to receive stock.
                                            </div>
                                        </div>
                                    </label>
                                    <input type="number" value={form.average_lead_time ?? ''} onChange={e => setForm({ ...form, average_lead_time: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2.5 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors max-w-fit pr-4">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                <span className="text-[11px] text-gray-700 font-black uppercase tracking-tight">Supplier is Active</span>
                            </label>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button onClick={() => { setShowModal(false); setEditing(null); }}
                                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit}
                                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                {editing ? 'Save Changes' : 'Create Supplier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier? This action cannot be undone."
            />
        </div>
    );
};

export default Suppliers;
