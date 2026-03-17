import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
    ArrowLeft, Building2, Phone, Mail, MapPin, Star, Award,
    TrendingUp, FileText, Plus, Trash2, DollarSign, Clock,
    ChevronDown, ChevronUp, BarChart3, Package
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, BarChart, Bar, Cell
} from 'recharts';
import { toastSuccess, toastError } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const SupplierDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [supplier, setSupplier] = useState<any>(null);
    const [contracts, setContracts] = useState<any[]>([]);
    const [performance, setPerformance] = useState<any[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [priceComparison, setPriceComparison] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'performance' | 'prices'>('overview');
    const [showContractModal, setShowContractModal] = useState(false);
    const [showPerfModal, setShowPerfModal] = useState(false);
    const [deleteContractConfirm, setDeleteContractConfirm] = useState<string | null>(null);
    const [contractForm, setContractForm] = useState<{
        effective_date: string;
        expiry_date: string;
        discount_percentage: number | undefined;
        return_policy: string;
        notes: string;
    }>({
        effective_date: '', expiry_date: '', discount_percentage: 0, return_policy: '', notes: ''
    });
    const [perfForm, setPerfForm] = useState<{
        period: string;
        on_time_deliveries: number | undefined;
        total_deliveries: number | undefined;
        price_variance: number | undefined;
        returned_items: number | undefined;
        total_items: number | undefined;
        quality_rating: number | undefined;
    }>({
        period: new Date().toISOString().substring(0, 7), on_time_deliveries: 0, total_deliveries: 1,
        price_variance: 0, returned_items: 0, total_items: 1, quality_rating: 3.5
    });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [supplierRes, contractsRes, perfRes, allSuppRes, medRes] = await Promise.all([
                    client.get(`/suppliers/${id}`),
                    client.get(`/suppliers/${id}/contracts`),
                    client.get(`/suppliers/${id}/performance`),
                    client.get('/suppliers'),
                    client.get('/medicines'),
                ]);
                setSupplier(supplierRes.data);
                setContracts(contractsRes.data);
                setPerformance(perfRes.data);
                setAllSuppliers(allSuppRes.data);
                setMedicines(medRes.data);
            } catch (err) {
                console.error('Failed to fetch supplier details', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAll();
    }, [id]);

    useEffect(() => {
        if (!selectedMedicine) return;
        const fetchPriceComparison = async () => {
            const histories = await Promise.all(
                allSuppliers.map(s =>
                    client.get(`/suppliers/price-history/${selectedMedicine}?supplierId=${s.id}`)
                        .then(r => ({
                            supplier: s.name,
                            prices: r.data
                        }))
                        .catch(() => ({ supplier: s.name, prices: [] }))
                )
            );
            const filtered = histories.filter(h => h.prices.length > 0);
            setPriceComparison(filtered);
        };
        fetchPriceComparison();
    }, [selectedMedicine, allSuppliers]);

    const submitContract = async () => {
        try {
            const payload = { ...contractForm, discount_percentage: contractForm.discount_percentage ?? 0 };
            await client.post(`/suppliers/${id}/contracts`, payload);
            const res = await client.get(`/suppliers/${id}/contracts`);
            setContracts(res.data);
            setShowContractModal(false);
        } catch (err) { console.error(err); }
    };

    const submitPerformance = async () => {
        try {
            const payload = {
                ...perfForm,
                on_time_deliveries: perfForm.on_time_deliveries ?? 0,
                total_deliveries: perfForm.total_deliveries ?? 1,
                price_variance: perfForm.price_variance ?? 0,
                returned_items: perfForm.returned_items ?? 0,
                total_items: perfForm.total_items ?? 1,
                quality_rating: perfForm.quality_rating ?? 3.5
            };
            await client.post(`/suppliers/${id}/performance`, payload);
            const res = await client.get(`/suppliers/${id}/performance`);
            setPerformance(res.data);
            setShowPerfModal(false);
        } catch (err) { console.error(err); }
    };

    const deleteContract = async (contractId: string) => {
        await client.delete(`/suppliers/contracts/${contractId}`);
        const res = await client.get(`/suppliers/${id}/contracts`);
        setContracts(res.data);
    };

    const getScoreBadge = (score: number) => {
        if (score >= 0.8) return { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Excellent' };
        if (score >= 0.6) return { class: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Good' };
        return { class: 'bg-rose-100 text-rose-700 border-rose-200', label: 'At Risk' };
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center text-gray-400 italic">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
    );
    if (!supplier) return <div className="text-center text-gray-400 p-10">Supplier not found.</div>;

    const latestPerf = performance[0];
    const badge = latestPerf ? getScoreBadge(latestPerf.computed_score || 0) : null;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/suppliers')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{supplier.name}</h1>
                    <p className="text-gray-500 text-sm">Supplier Profile & Analytics</p>
                </div>
                {badge && (
                    <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase border ${badge.class}`}>
                        {badge.label} — {((latestPerf?.computed_score || 0) * 100).toFixed(0)}%
                    </span>
                )}
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Phone, label: 'Phone', value: supplier.phone || '—' },
                    { icon: Mail, label: 'Email', value: supplier.email || '—' },
                    { icon: DollarSign, label: 'Credit Limit', value: `ETB ${Number(supplier.credit_limit || 0).toLocaleString()}` },
                    { icon: Clock, label: 'Lead Time', value: `${supplier.average_lead_time || 0} days` },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <card.icon className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{card.label}</span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm truncate">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                {(['overview', 'contracts', 'performance', 'prices'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {latestPerf ? (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" /> Latest Performance Score
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Delivery Reliability', value: latestPerf.total_deliveries > 0 ? (latestPerf.on_time_deliveries / latestPerf.total_deliveries) * 100 : 0, weight: '35%' },
                                    { label: 'Return Cooperation', value: latestPerf.total_items > 0 ? (1 - latestPerf.returned_items / latestPerf.total_items) * 100 : 100, weight: '15%' },
                                    { label: 'Quality Rating', value: ((latestPerf.quality_rating || 0) / 5) * 100, weight: '10%' },
                                ].map(m => (
                                    <div key={m.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-gray-700">{m.label}</span>
                                            <span className="font-bold text-gray-500">Weight: {m.weight}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, m.value)}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Composite Score</span>
                                    <span className={`text-2xl font-black ${badge?.class?.includes('emerald') ? 'text-emerald-600' : badge?.class?.includes('amber') ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {((latestPerf.computed_score || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-3xl p-6 text-center text-gray-400">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No performance data yet. Record a performance entry.</p>
                        </div>
                    )}

                    {performance.length > 1 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-500" /> Score Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={[...performance].reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                                    <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                    <Tooltip formatter={(v: any) => `${(Number(v) * 100).toFixed(1)}%`} />
                                    <Line type="monotone" dataKey="computed_score" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Contracts Tab */}
            {activeTab === 'contracts' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Contracts</h3>
                        <button onClick={() => setShowContractModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                            <Plus className="w-3.5 h-3.5" /> New Contract
                        </button>
                    </div>
                    {contracts.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No contracts found.</p>
                        </div>
                    ) : contracts.map(c => {
                        const isActive = new Date(c.expiry_date) > new Date();
                        return (
                            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {isActive ? 'ACTIVE' : 'EXPIRED'}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-600">{c.discount_percentage}% discount</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold">Period:</span> {new Date(c.effective_date).toLocaleDateString()} → {new Date(c.expiry_date).toLocaleDateString()}
                                    </p>
                                    {c.return_policy && <p className="text-xs text-gray-500 mt-1">Return Policy: {c.return_policy}</p>}
                                    {c.notes && <p className="text-xs text-gray-400 mt-1 italic">{c.notes}</p>}
                                </div>
                                <button onClick={() => setDeleteContractConfirm(c.id)} className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Performance History Tab */}
            {activeTab === 'performance' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Performance History</h3>
                        <button onClick={() => setShowPerfModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                            <Plus className="w-3.5 h-3.5" /> Record Period
                        </button>
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 font-bold">
                                <tr>
                                    <th className="px-5 py-3">Period</th>
                                    <th className="px-5 py-3">Deliveries</th>
                                    <th className="px-5 py-3">Quality</th>
                                    <th className="px-5 py-3">Returns</th>
                                    <th className="px-5 py-3 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {performance.map(p => {
                                    const b = getScoreBadge(p.computed_score || 0);
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3 font-bold text-gray-800 font-mono">{p.period}</td>
                                            <td className="px-5 py-3 text-gray-600">{p.on_time_deliveries}/{p.total_deliveries} on-time</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                    <span className="font-bold text-gray-800">{p.quality_rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{p.returned_items}/{p.total_items}</td>
                                            <td className="px-5 py-3 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${b.class}`}>
                                                    {((p.computed_score || 0) * 100).toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {performance.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 italic">No performance data recorded.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Price Comparison Tab */}
            {activeTab === 'prices' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Package className="w-4 h-4 text-indigo-500" /> Multi-Supplier Price Comparison</h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Medicine</label>
                        <select value={selectedMedicine} onChange={e => setSelectedMedicine(e.target.value)}
                            className="w-full max-w-sm px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 outline-none text-sm">
                            <option value="">— Choose Medicine —</option>
                            {medicines.map((m: any) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    {selectedMedicine && priceComparison.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={priceComparison.map(s => ({
                                    supplier: s.supplier,
                                    latest_price: s.prices[0]?.unit_price || 0,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="supplier" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="latest_price" name="Latest Price (ETB)" radius={[6, 6, 0, 0]}>
                                        {priceComparison.map((_, i) => (
                                            <Cell key={i} fill={i === priceComparison.findIndex(s => s.supplier === supplier.name) ? '#4F46E5' : '#E0E7FF'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="text-center text-xs text-gray-400 mt-2">
                                <span className="inline-block w-3 h-3 bg-indigo-600 rounded mr-1" /> = Current Supplier
                            </div>
                        </div>
                    )}
                    {selectedMedicine && priceComparison.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            No price history found for this medicine.
                        </div>
                    )}
                </div>
            )}

            {/* Contract Modal */}
            {showContractModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">New Contract</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Effective Date', key: 'effective_date', type: 'date' },
                                { label: 'Expiry Date', key: 'expiry_date', type: 'date' },
                                { label: 'Discount %', key: 'discount_percentage', type: 'number' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{f.label}</label>
                                    <input type={f.type} value={(contractForm as any)[f.key] ?? ''}
                                        onChange={e => setContractForm({ 
                                            ...contractForm, 
                                            [f.key]: f.type === 'number' 
                                                ? (e.target.value === '' ? undefined : Number(e.target.value))
                                                : e.target.value 
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Return Policy</label>
                                <textarea value={contractForm.return_policy} rows={2}
                                    onChange={e => setContractForm({ ...contractForm, return_policy: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm resize-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notes</label>
                                <textarea value={contractForm.notes} rows={2}
                                    onChange={e => setContractForm({ ...contractForm, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm resize-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setShowContractModal(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={submitContract} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save Contract</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Modal */}
            {showPerfModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Record Performance</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Period (YYYY-MM)', key: 'period', type: 'text' },
                                { label: 'On-Time Deliveries', key: 'on_time_deliveries', type: 'number' },
                                { label: 'Total Deliveries', key: 'total_deliveries', type: 'number' },
                                { label: 'Price Variance (0=stable)', key: 'price_variance', type: 'number' },
                                { label: 'Returned Items', key: 'returned_items', type: 'number' },
                                { label: 'Total Items Delivered', key: 'total_items', type: 'number' },
                                { label: 'Quality Rating (1.0–5.0)', key: 'quality_rating', type: 'number' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{f.label}</label>
                                    <input type={f.type} value={(perfForm as any)[f.key] ?? ''}
                                        onChange={e => setPerfForm({ ...perfForm, [f.key]: e.target.value === '' ? undefined : (f.type === 'number' ? Number(e.target.value) : e.target.value) })}
                                        step={f.key === 'quality_rating' || f.key === 'price_variance' ? '0.1' : '1'}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setShowPerfModal(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={submitPerformance} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save Performance</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteContractConfirm}
                onClose={() => setDeleteContractConfirm(null)}
                onConfirm={() => deleteContractConfirm && deleteContract(deleteContractConfirm)}
                title="Delete Contract"
                message="Are you sure you want to delete this contract? This action cannot be undone."
            />
        </div>
    );
};

export default SupplierDetail;
