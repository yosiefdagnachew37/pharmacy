import { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, ShoppingBag, Eye, PackageCheck,
    Building2, FileText, X, CheckCircle, Clock, AlertCircle, DollarSign
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { toastSuccess, toastError, toastWarning } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';
import ColumnFilter from '../components/ColumnFilter';

const Purchases = () => {
    const { role } = useAuth();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // ─── Column Filters ──────────────────────────────────────────
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        poNumber: [],
        supplier: [],
        status: [],
        paymentStatus: [],
        date: [],
    });
    const [activeTab, setActiveTab] = useState<'ALL' | 'PLANNED'>('ALL');

    // Form states
    const [supplierId, setSupplierId] = useState('');
    const [orderItems, setOrderItems] = useState([{ medicine_id: '', quantity_ordered: 1, unit_price: 0 }]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    
    // Cheque specific states
    const [chequeBankName, setChequeBankName] = useState('');
    const [chequeNumber, setChequeNumber] = useState('');
    const [chequeIssueDate, setChequeIssueDate] = useState('');
    const [chequeDueDate, setChequeDueDate] = useState('');

    // Receive items state
    const [receiveData, setReceiveData] = useState<any[]>([]);

    // Payment state
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [payMethod, setPayMethod] = useState('CASH');
    const [transRef, setTransRef] = useState('');

    const fetchData = async () => {
        try {
            const [poRes, suppRes, medRes] = await Promise.all([
                client.get('/purchase-orders'),
                client.get('/suppliers'),
                client.get('/medicines')
            ]);
            setPurchases(poRes.data);
            setSuppliers(suppRes.data);
            setMedicines(medRes.data);
        } catch (err) {
            console.error('Failed to load purchases data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreatePO = async () => {
        try {
            await client.post('/purchase-orders', {
                supplier_id: supplierId,
                payment_method: paymentMethod,
                notes,
                items: orderItems,
                ...(paymentMethod === 'CHEQUE' && {
                    cheque_bank_name: chequeBankName,
                    cheque_number: chequeNumber,
                    cheque_issue_date: chequeIssueDate,
                    cheque_due_date: chequeDueDate,
                })
            });
            setShowCreateModal(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            console.error('Failed to create purchase order', err);
            const msg = extractErrorMessage(err, 'Error creating purchase order.');
            toastError('Failed to create PO', msg);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await client.put(`/purchase-orders/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const openReceiveModal = async (po: any) => {
        setSelectedPO(po);
        try {
            const poItems = await client.get(`/purchase-orders/${po.id}/items`);
            const initialReceiveData = poItems.data
                .filter((item: any) => item.quantity_received < item.quantity_ordered)
                .map((item: any) => ({
                    po_item_id: item.id,
                    medicine_name: item.medicine.name,
                    quantity_ordered: item.quantity_ordered,
                    quantity_remaining: item.quantity_ordered - item.quantity_received,
                    quantity_received: item.quantity_ordered - item.quantity_received,
                    batch_number: '',
                    expiry_date: '',
                    selling_price: item.medicine.current_selling_price || item.unit_price * 1.5,
                }));
            setReceiveData(initialReceiveData);
            setShowReceiveModal(true);
        } catch (error) {
            console.error('Failed to load PO items', error);
        }
    };

    const submitReceiveGoods = async () => {
        try {
            // Validate
            for (const item of receiveData) {
                if (!item.batch_number || !item.expiry_date) {
                    toastWarning('Incomplete items', 'Please fill batch number and expiry date for all items being received.');
                    return;
                }
            }

            await client.post(`/purchase-orders/${selectedPO.id}/receive`, {
                notes: 'Received via Dashboard',
                items: receiveData.filter(i => i.quantity_received > 0),
            });

            setShowReceiveModal(false);
            setSelectedPO(null);
            fetchData();
            toastSuccess('Goods received and stock updated. Batches auto-created.');
        } catch (error: any) {
            console.error('Failed to receive goods', error);
            const msg = extractErrorMessage(error, 'Error receiving goods.');
            toastError('Receive failed', msg);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedPO || paymentAmount <= 0) return;
        try {
            await client.post('/suppliers/payments', {
                purchase_order_id: selectedPO.id,
                supplier_id: selectedPO.supplier_id,
                amount: paymentAmount,
                payment_method: payMethod,
                transaction_reference: transRef,
                payment_date: new Date().toISOString(),
                notes: `Payment for PO ${selectedPO.po_number}`
            });
            setShowPaymentModal(false);
            fetchData();
            toastSuccess('Payment recorded successfully.');
        } catch (err: any) {
            console.error('Failed to record payment', err);
            const msg = extractErrorMessage(err, 'Error recording payment.');
            toastError('Payment failed', msg);
        }
    };

    const resetForm = () => {
        setSupplierId('');
        setPaymentMethod('CASH');
        setNotes('');
        setOrderItems([{ medicine_id: '', quantity_ordered: 1, unit_price: 0 }]);
        setChequeBankName('');
        setChequeNumber('');
        setChequeIssueDate('');
        setChequeDueDate('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'APPROVED': case 'SENT': case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700';
            case 'PARTIALLY_RECEIVED': return 'bg-amber-100 text-amber-700';
            case 'CANCELLED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-100 text-emerald-700';
            case 'PARTIALLY_PAID': return 'bg-amber-100 text-amber-700';
            case 'UNPAID': return 'bg-rose-100 text-rose-700 shadow-sm';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const purchaseOrders = purchases; // Assuming 'purchases' is the source data for filtering

    // ─── Unique Options & Filtering ──────────────────────────────
    const uniquePONumbers = useMemo(() => [...new Set(purchaseOrders.map(po => po.po_number))].sort(), [purchaseOrders]);
    const uniqueSuppliers = useMemo(() => [...new Set(purchaseOrders.map(po => po.supplier?.name))].sort(), [purchaseOrders]);
    const uniqueStatuses = useMemo(() => [...new Set(purchaseOrders.map(po => po.status))].sort(), [purchaseOrders]);
    const uniquePaymentStatuses = useMemo(() => [...new Set(purchaseOrders.map(po => po.payment_status))].sort(), [purchaseOrders]);
    const uniqueDates = useMemo(() => [...new Set(purchaseOrders.map(po => new Date(po.created_at).toLocaleDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [purchaseOrders]);

    const filteredPO = useMemo(() => {
        return purchaseOrders.filter(po => {
            const matchesTab = activeTab === 'ALL' ? po.status !== 'DRAFT' : (po.status === 'DRAFT' || po.status === 'APPROVED');
            const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || po.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const poDate = new Date(po.created_at).toLocaleDateString();

            const matchesPONumber = columnFilters.poNumber.length === 0 || columnFilters.poNumber.includes(po.po_number);
            const matchesSupplier = columnFilters.supplier.length === 0 || columnFilters.supplier.includes(po.supplier?.name);
            const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(po.status);
            const matchesPaymentStatus = columnFilters.paymentStatus.length === 0 || columnFilters.paymentStatus.includes(po.payment_status);
            const matchesDate = columnFilters.date.length === 0 || columnFilters.date.includes(poDate);

            return matchesTab && matchesSearch && matchesPONumber && matchesSupplier && matchesStatus && matchesPaymentStatus && matchesDate;
        });
    }, [purchaseOrders, activeTab, searchTerm, columnFilters]);

    const updateFilter = (column: string, values: string[]) => {
        setColumnFilters(prev => ({ ...prev, [column]: values }));
    };

    const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Purchases & Procurements</h1>
                    <p className="text-gray-500 mt-1">Manage purchase orders and receive stock</p>
                </div>
                {(role === 'ADMIN' || role === 'PHARMACIST') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Create Purchase Order
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'ALL' ? 'bg-white text-indigo-700 shadow border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Active Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('PLANNED')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'PLANNED' ? 'bg-white text-indigo-700 shadow border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Planned Purchases
                    </button>
                </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search PO number or supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                            />
                        </div>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={() => setColumnFilters({ poNumber: [], supplier: [], status: [], paymentStatus: [], date: [] })}
                                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Clear All Filters ({activeFilterCount})
                            </button>
                        )}
                    </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-visible">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest sticky top-0 z-30 shadow-sm">
                                    <tr>
                                        <ColumnFilter
                                            label="PO Number"
                                            options={uniquePONumbers}
                                            selectedValues={columnFilters.poNumber}
                                            onFilterChange={(v) => updateFilter('poNumber', v)}
                                        />
                                        <ColumnFilter
                                            label="Supplier"
                                            options={uniqueSuppliers}
                                            selectedValues={columnFilters.supplier}
                                            onFilterChange={(v) => updateFilter('supplier', v)}
                                        />
                                        <th className="px-6 py-4">Amount</th>
                                        <ColumnFilter
                                            label="PO Status"
                                            options={uniqueStatuses}
                                            selectedValues={columnFilters.status}
                                            onFilterChange={(v) => updateFilter('status', v)}
                                        />
                                        <ColumnFilter
                                            label="Payment"
                                            options={uniquePaymentStatuses}
                                            selectedValues={columnFilters.paymentStatus}
                                            onFilterChange={(v) => updateFilter('paymentStatus', v)}
                                        />
                                        <ColumnFilter
                                            label="Date"
                                            options={uniqueDates}
                                            selectedValues={columnFilters.date}
                                            onFilterChange={(v) => updateFilter('date', v)}
                                        />
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredPO.map((po) => (
                                        <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800 font-mono tracking-tight text-xs">
                                        {po.po_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="font-semibold text-gray-700">{po.supplier?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">ETB {Number(po.total_amount).toFixed(2)}</span>
                                            <span className="text-[10px] text-gray-400">Total</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-emerald-600">ETB {Number(po.total_paid || 0).toFixed(2)}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPaymentStatusBadge(po.payment_status)}`}>
                                                {po.payment_status || 'UNPAID'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md ${getStatusBadge(po.status)}`}>
                                            {po.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-gray-500">{po.payment_method}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                        {new Date(po.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {(po.status === 'DRAFT' || po.status === 'SENT') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                            <button
                                                onClick={() => handleUpdateStatus(po.id, 'CONFIRMED')}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                title="Confirm Order"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'COMPLETED') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                            <button
                                                onClick={() => openReceiveModal(po)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100 font-bold text-xs"
                                            >
                                                Receive
                                            </button>
                                        )}
                                        {po.payment_status !== 'PAID' && (role === 'ADMIN') && (
                                            <button
                                                onClick={() => { setSelectedPO(po); setPaymentAmount(Number(po.total_amount) - Number(po.total_paid || 0)); setShowPaymentModal(true); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 font-bold text-xs"
                                            >
                                                Pay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPO.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">No purchase orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE PO MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-indigo-600" /> Record Purchase / Create PO
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Order Items</h3>
                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Medicine *</label>
                                                    <select
                                                        value={item.medicine_id}
                                                        onChange={e => {
                                                            const newItems = [...orderItems];
                                                            newItems[index].medicine_id = e.target.value;
                                                            setOrderItems(newItems);
                                                        }}
                                                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm"
                                                    >
                                                        <option value="">Select Medicine</option>
                                                        {medicines.map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Qty *</label>
                                                    <input
                                                        type="number" min="1"
                                                        value={item.quantity_ordered}
                                                        onChange={e => {
                                                            const newItems = [...orderItems];
                                                            newItems[index].quantity_ordered = parseInt(e.target.value);
                                                            setOrderItems(newItems);
                                                        }}
                                                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Unit Prc(ETB) *</label>
                                                    <input
                                                        type="number" min="0" step="0.01"
                                                        value={item.unit_price}
                                                        onChange={e => {
                                                            const newItems = [...orderItems];
                                                            newItems[index].unit_price = parseFloat(e.target.value);
                                                            setOrderItems(newItems);
                                                        }}
                                                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm"
                                                    />
                                                </div>
                                                <div className="w-10 flex items-end justify-center pb-2">
                                                    {index > 0 && (
                                                        <button
                                                            onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))}
                                                            className="text-rose-500 hover:text-rose-700 p-1"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setOrderItems([...orderItems, { medicine_id: '', quantity_ordered: 1, unit_price: 0 }])}
                                        className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Line Item
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Order Details</h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Supplier *</label>
                                    <select
                                        value={supplierId}
                                        onChange={e => setSupplierId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} - score: {Math.round((s.computed_score || 0) * 100)}%</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="CREDIT">Credit Purchase</option>
                                        <option value="CHEQUE">Cheque</option>
                                    </select>
                                </div>
                                {paymentMethod === 'CHEQUE' && (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                                        <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5 mb-2">
                                            <FileText className="w-3.5 h-3.5" /> Cheque Details
                                        </h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Bank Name *</label>
                                            <input type="text" value={chequeBankName} onChange={e => setChequeBankName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400 text-xs" placeholder="e.g. Commercial Bank of Ethiopia" required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Cheque Number *</label>
                                            <input type="text" value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400 text-xs" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Issue Date *</label>
                                                <input type="date" value={chequeIssueDate} onChange={e => setChequeIssueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400 text-xs" required />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Due Date *</label>
                                                <input type="date" value={chequeDueDate} onChange={e => setChequeDueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400 text-xs" required />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
                                        placeholder="PO notes..."
                                    />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 mb-2">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-600">Total Order Val:</span>
                                        <span className={`text-xl ${orderItems.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_price || 0), 0) > 10000 ? 'text-rose-600' : 'text-indigo-700'}`}>
                                            ETB {orderItems.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_price || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {orderItems.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_price || 0), 0) > 10000 && (
                                    <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-xs font-bold border border-rose-100">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <p>Budget Cap Warning: This purchase order exceeds the ETB 10,000 standard order limit. Ensure you have management approval before confirming.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button onClick={() => setShowCreateModal(false)}
                                className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreatePO}
                                disabled={!supplierId || orderItems.some(i => !i.medicine_id)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50">
                                Submit Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIVE GOODS MODAL */}
            {showReceiveModal && selectedPO && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <PackageCheck className="w-6 h-6 text-emerald-600" />
                                    Receive Goods
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">PO Number: <span className="font-mono text-gray-800 font-bold">{selectedPO.po_number}</span></p>
                            </div>
                            <button onClick={() => setShowReceiveModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-amber-700 font-medium">
                                Receiving these goods will <b>automatically</b> create new batches in the inventory, log the inward stock transactions, and update the purchase order status. Make sure batch numbers and expiry dates are meticulously checked.
                            </p>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Medicine</th>
                                        <th className="px-4 py-3">Pending Qty</th>
                                        <th className="px-4 py-3 w-32">Receive Qty</th>
                                        <th className="px-4 py-3 min-w-[150px]">Batch Number *</th>
                                        <th className="px-4 py-3 min-w-[150px]">Expiry Date *</th>
                                        <th className="px-4 py-3 w-32">Sale Price (ETB)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receiveData.map((item, index) => (
                                        <tr key={item.po_item_id} className={item.quantity_received > item.quantity_remaining ? "bg-rose-50" : ""}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.medicine_name}</td>
                                            <td className="px-4 py-3 font-bold text-gray-500">{item.quantity_remaining}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number" min="0" max={item.quantity_remaining}
                                                    value={item.quantity_received}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].quantity_received = parseInt(e.target.value) || 0;
                                                        setReceiveData(data);
                                                    }}
                                                    className={`w-full px-2 py-1.5 border rounded-lg text-sm ${item.quantity_received > item.quantity_remaining ? 'border-rose-500 bg-rose-50' : ''}`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text" placeholder="BATCH-00x"
                                                    value={item.batch_number}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].batch_number = e.target.value;
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-2 py-1.5 border rounded-lg text-sm bg-gray-50"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="date"
                                                    value={item.expiry_date}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].expiry_date = e.target.value;
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-2 py-1.5 border rounded-lg text-sm bg-gray-50"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number" step="0.01" min="0"
                                                    value={item.selling_price}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].selling_price = parseFloat(e.target.value);
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-2 py-1.5 border rounded-lg text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setShowReceiveModal(false)}
                                className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={submitReceiveGoods}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 active:scale-95">
                                Confirm Receipt & Create Batches
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECORD PAYMENT MODAL */}
            {showPaymentModal && selectedPO && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600" /> Record Supplier Payment
                            </h2>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">PO Balance Due</p>
                                <p className="text-2xl font-black text-indigo-900">ETB {(Number(selectedPO.total_amount) - Number(selectedPO.total_paid || 0)).toFixed(2)}</p>
                                <p className="text-[10px] text-indigo-400 mt-1">PO: {selectedPO.po_number} • Supplier: {selectedPO.supplier?.name}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Payment Amount (ETB) *</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Method</label>
                                    <select
                                        value={payMethod}
                                        onChange={e => setPayMethod(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CHEQUE">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Reference #</label>
                                    <input
                                        type="text"
                                        placeholder="TXN-XXXX"
                                        value={transRef}
                                        onChange={e => setTransRef(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleRecordPayment}
                                disabled={paymentAmount <= 0}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50">
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Purchases;
