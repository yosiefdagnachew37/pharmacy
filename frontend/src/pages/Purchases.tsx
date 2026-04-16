import { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, ShoppingBag, Eye, PackageCheck,
    Building2, FileText, X, CheckCircle, Clock, AlertCircle, DollarSign, History, Calendar
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { toastSuccess, toastError, toastWarning } from '../components/Toast';
import { formatDate } from '../utils/dateUtils';
import { extractErrorMessage } from '../utils/errorUtils';
import ColumnFilter from '../components/ColumnFilter';

const PharmacistPurchases = () => {
    const { role } = useAuth();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showReceivedHistoryModal, setShowReceivedHistoryModal] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Column Filters
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        poNumber: [],
        supplier: [],
        status: [],
        paymentStatus: [],
        date: [],
    });
    const [activeTab, setActiveTab] = useState<'ALL' | 'PLANNED' | 'PENDING_PAYMENT'>('ALL');

    // Form states
    const [supplierId, setSupplierId] = useState('');
    const [orderItems, setOrderItems] = useState([{ medicine_id: '', quantity_ordered: 1, unit_price: 0 }]);
    const [notes, setNotes] = useState('');
    const [isVatInclusive, setIsVatInclusive] = useState(false);
    const [vatRate, setVatRate] = useState(15);
    const [poModalTab, setPoModalTab] = useState<'MEDICINE' | 'COSMETIC'>('MEDICINE');

    // Receive items state
    const [receiveData, setReceiveData] = useState<any[]>([]);

    // Payment state
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
    const [transRef, setTransRef] = useState('');

    const fetchData = async () => {
        try {
            const [poRes, suppRes, medRes, actRes] = await Promise.all([
                client.get('/purchase-orders').catch(e => { console.error('PO load failed', e); return { data: [] }; }),
                client.get('/suppliers').catch(e => { console.error('Suppliers load failed', e); return { data: [] }; }),
                client.get('/medicines').catch(e => { console.error('Medicines load failed', e); return { data: [] }; }),
                client.get('/payment-accounts').catch(e => { console.error('Accounts load failed', e); return { data: [] }; })
            ]);
            setPurchases(poRes.data || []);
            setSuppliers(suppRes.data || []);
            setMedicines(medRes.data || []);
            setPaymentAccounts(actRes.data || []);
        } catch (err) {
            console.error('Unexpected failure in Purchases.fetchData', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreatePO = async () => {
        try {
            await client.post('/purchase-orders', {
                supplier_id: supplierId,
                payment_method: 'CASH',
                is_vat_inclusive: isVatInclusive,
                vat_rate: isVatInclusive ? vatRate : 0,
                notes,
                items: orderItems,
                po_type: poModalTab,
            });
            setShowCreateModal(false);
            resetForm();
            fetchData();
            toastSuccess('Purchase Order Created', 'The purchase order has been successfully generated.');
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
                    selling_price: item.unit_price * 1.5,
                }));
            setReceiveData(initialReceiveData);
            setShowReceiveModal(true);
        } catch (error) {
            console.error('Failed to load PO items', error);
        }
    };

    const openReceivedHistoryModal = async (po: any) => {
        setSelectedPO(po);
        try {
            const poItems = await client.get(`/purchase-orders/${po.id}/items`);
            setReceiveData(poItems.data);
            setShowReceivedHistoryModal(true);
        } catch (error) {
            console.error('Failed to load PO items', error);
        }
    };

    const submitReceiveGoods = async () => {
        try {
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
        if (!selectedPaymentAccount && selectedPO.payment_method !== 'CREDIT') {
            toastWarning('Payment Account Required', 'Please select a payment account.');
            return;
        }

        try {
            await client.post(`/purchase-orders/${selectedPO.id}/pay`, {
                payment_account_id: selectedPaymentAccount,
                amount: paymentAmount,
            });
            setShowPaymentModal(false);
            setSelectedPaymentAccount('');
            fetchData();
            toastSuccess('Payment successful', `Payment logic triggered successfully.`);
        } catch (err: any) {
            console.error('Failed to record payment', err);
            const msg = extractErrorMessage(err, 'Error recording payment.');
            toastError('Payment failed', msg);
        }
    };

    const resetForm = () => {
        setSupplierId('');
        setNotes('');
        setIsVatInclusive(false);
        setVatRate(15);
        setOrderItems([{ medicine_id: '', quantity_ordered: 1, unit_price: 0 }]);
        setPoModalTab('MEDICINE');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'APPROVED': case 'SENT': case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700';
            case 'PARTIALLY_RECEIVED': return 'bg-amber-100 text-amber-700';
            case 'CANCELLED': return 'bg-rose-100 text-rose-700';
            case 'PENDING_PAYMENT': return 'bg-amber-100 text-amber-800 border border-amber-200';
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

    // Derived Data & Filtering
    const uniquePONumbers = useMemo(() => [...new Set(purchases.map(po => po.po_number))].sort(), [purchases]);
    const uniqueSuppliers = useMemo(() => [...new Set(purchases.map(po => po.supplier?.name))].sort(), [purchases]);
    const uniqueStatuses = useMemo(() => [...new Set(purchases.map(po => po.status))].sort(), [purchases]);
    const uniquePaymentStatuses = useMemo(() => [...new Set(purchases.map(po => po.payment_status))].sort(), [purchases]);
    const uniqueDates = useMemo(() => [...new Set(purchases.map(po => formatDate(po.purchase_date)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [purchases]);

    const filteredPO = useMemo(() => {
        return purchases.filter(po => {
            let matchesTab = true;
            if (activeTab === 'ALL') matchesTab = po.status !== 'DRAFT';
            if (activeTab === 'PLANNED') matchesTab = po.status === 'DRAFT' || po.status === 'APPROVED';
            if (activeTab === 'PENDING_PAYMENT') matchesTab = po.status === 'PENDING_PAYMENT';
            
            const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || (po.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const poDate = formatDate(po.purchase_date);

            const matchesPONumber = columnFilters.poNumber.length === 0 || columnFilters.poNumber.includes(po.po_number);
            const matchesSupplier = columnFilters.supplier.length === 0 || columnFilters.supplier.includes(po.supplier?.name);
            const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(po.status);
            const matchesPaymentStatus = columnFilters.paymentStatus.length === 0 || columnFilters.paymentStatus.includes(po.payment_status);
            const matchesDate = columnFilters.date.length === 0 || columnFilters.date.includes(poDate);

            return matchesTab && matchesSearch && matchesPONumber && matchesSupplier && matchesStatus && matchesPaymentStatus && matchesDate;
        });
    }, [purchases, activeTab, searchTerm, columnFilters]);

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
        <div className="space-y-8 pb-12 animate-in fade-in duration-500 text-gray-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Purchases & Procurements</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage stock orders and record supply receipts</p>
                </div>
                {(role === 'ADMIN' || role === 'PHARMACIST') && activeTab === 'PLANNED' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 border-b-4 border-indigo-800"
                    >
                        <Plus className="w-5 h-5" /> New Purchase Order
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full sm:w-auto shadow-inner border border-gray-200/60">
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'ALL' ? 'bg-white text-indigo-700 shadow-md transform scale-100' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'} border ${activeTab === 'ALL' ? 'border-gray-100' : 'border-transparent'}`}
                    >
                        Active Orders
                    </button>
                    {(role === 'ADMIN' || role === 'CASHIER') && (
                        <button
                            onClick={() => setActiveTab('PENDING_PAYMENT')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'PENDING_PAYMENT' ? 'bg-white text-indigo-700 shadow-md transform scale-100' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'} border ${activeTab === 'PENDING_PAYMENT' ? 'border-gray-100' : 'border-transparent'} relative`}
                        >
                            Payment Queue
                            {purchases.filter(po => po.status === 'PENDING_PAYMENT').length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('PLANNED')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'PLANNED' ? 'bg-white text-indigo-700 shadow-md transform scale-100' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'} border ${activeTab === 'PLANNED' ? 'border-gray-100' : 'border-transparent'}`}
                    >
                        Planned Drafts
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
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none text-sm transition-all"
                        />
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setColumnFilters({ poNumber: [], supplier: [], status: [], paymentStatus: [], date: [] })}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-2 rounded-xl transition-colors whitespace-nowrap active:scale-95"
                        >
                            Clear All Filters ({activeFilterCount})
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-300 uppercase text-[10px] font-black tracking-widest sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-slate-700">
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
                                <th className="px-6 py-4">Total Value</th>
                                <ColumnFilter
                                    label="Payment"
                                    options={uniquePaymentStatuses}
                                    selectedValues={columnFilters.paymentStatus}
                                    onFilterChange={(v) => updateFilter('paymentStatus', v)}
                                />
                                <ColumnFilter
                                    label="PO Status"
                                    options={uniqueStatuses}
                                    selectedValues={columnFilters.status}
                                    onFilterChange={(v) => updateFilter('status', v)}
                                />
                                <th className="px-6 py-4">Pymt Method</th>
                                <ColumnFilter
                                    label="Date Issued"
                                    options={uniqueDates}
                                    selectedValues={columnFilters.date}
                                    onFilterChange={(v) => updateFilter('date', v)}
                                />
                                <th className="px-6 py-4 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPO.map((po) => (
                                <tr key={po.id} className="hover:bg-indigo-50/20 transition-colors group">
                                    <td className="px-6 py-4 font-black text-gray-800 font-mono tracking-tight text-xs bg-gray-50/30 group-hover:bg-transparent">
                                        {po.po_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><Building2 className="w-3.5 h-3.5" /></div>
                                            <span className="font-bold text-gray-700">{po.supplier?.name || 'Unknown Vendor'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-800 text-sm">ETB {Number(po.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getPaymentStatusBadge(po.payment_status)}`}>
                                                {po.payment_status || 'UNPAID'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md shadow-sm border border-black/5 ${getStatusBadge(po.status)}`}>
                                            {po.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{po.payment_method}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-gray-500">{formatDate(po.purchase_date)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1.5 pr-6">
                                        {(po.status === 'DRAFT' || po.status === 'SENT') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                            <button
                                                onClick={() => handleUpdateStatus(po.id, 'PENDING_PAYMENT')}
                                                className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-[10px] uppercase shadow-md shadow-indigo-200 active:scale-95 transition-all"
                                                title="Send to Cashier for Payment"
                                            >
                                                Send for Payment
                                            </button>
                                        )}
                                        {(po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                            <button
                                                onClick={() => openReceiveModal(po)}
                                                className="px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold text-xs uppercase transition-colors active:scale-95 border-b-2 border-transparent hover:border-emerald-200"
                                            >
                                                Receive
                                            </button>
                                        )}
                                        {(po.status === 'COMPLETED' || po.status === 'PARTIALLY_RECEIVED') && (
                                            <button
                                                onClick={() => openReceivedHistoryModal(po)}
                                                className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors active:scale-95"
                                                title="Received Items History"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        {po.status === 'PENDING_PAYMENT' && (role === 'ADMIN' || role === 'CASHIER') && (
                                            <button
                                                onClick={() => { setSelectedPO(po); setPaymentAmount(Number(po.total_amount) - Number(po.total_paid || 0)); setShowPaymentModal(true); }}
                                                className="px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors font-bold text-[11px] uppercase shadow-md shadow-indigo-200 active:scale-95 border-b-[3px] border-indigo-800"
                                            >
                                                Process Payment
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPO.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400 italic">No purchase orders found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredPO.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-gray-400 italic border border-gray-100 shadow-sm">
                        No purchase orders found matching your criteria.
                    </div>
                ) : filteredPO.map((po) => (
                    <div key={po.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-mono text-xs font-black text-indigo-600">{po.po_number}</p>
                                <p className="font-bold text-gray-800 text-sm mt-0.5">{po.supplier?.name || 'Unknown Vendor'}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md shadow-sm border border-black/5 ${getStatusBadge(po.status)}`}>
                                {po.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-500">Total</span>
                            <span className="font-black text-gray-900">ETB {Number(po.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-500">Payment</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getPaymentStatusBadge(po.payment_status)}`}>{po.payment_status || 'UNPAID'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-500">Date</span>
                            <span className="text-gray-700 font-medium">{formatDate(po.purchase_date)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                            <button onClick={() => { setSelectedPO(po); setShowHistoryModal(true); }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-colors">
                                <History className="w-3.5 h-3.5" /> History
                            </button>
                            <button onClick={() => { setSelectedPO(po); setShowPaymentModal(true); }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            {(po.status === 'DRAFT' || po.status === 'SENT') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                <button onClick={() => handleUpdateStatus(po.id, 'PENDING_PAYMENT')}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">
                                    Send for Payment
                                </button>
                            )}
                            {(po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                <button onClick={() => openReceiveModal(po)}
                                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all">
                                    Receive Goods
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE PO MODAL */}

            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-white/20">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600"><ShoppingBag className="w-5 h-5" /></div>
                                New Purchase Order
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors active:scale-95">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Type Tabs */}
                        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6 shadow-inner">
                            <button
                                onClick={() => { setPoModalTab('MEDICINE'); setOrderItems([{ medicine_id: '', quantity_ordered: 1, unit_price: 0 }]); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    poModalTab === 'MEDICINE'
                                        ? 'bg-white text-indigo-700 shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                💊 Medicine Order
                            </button>
                            <button
                                onClick={() => { setPoModalTab('COSMETIC'); setOrderItems([{ medicine_id: '', quantity_ordered: 1, unit_price: 0 }]); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    poModalTab === 'COSMETIC'
                                        ? 'bg-white text-pink-700 shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                ✨ Cosmetics Order
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-gray-900">
                            {/* Line Items */}
                            <div className="xl:col-span-2 space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Items</h3>
                                <div className="space-y-3">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="flex flex-wrap sm:flex-nowrap items-start gap-3 p-4 rounded-2xl border-2 border-gray-50 focus-within:border-indigo-100 focus-within:bg-indigo-50/10 transition-colors shadow-sm">
                                            <div className="flex-1 min-w-[160px]">
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                                    {poModalTab === 'MEDICINE' ? 'Medicine' : 'Cosmetic'} *
                                                </label>
                                                <select
                                                    value={item.medicine_id}
                                                    onChange={e => {
                                                        const newItems = [...orderItems];
                                                        newItems[index].medicine_id = e.target.value;
                                                        setOrderItems(newItems);
                                                    }}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-transparent rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white text-sm font-semibold transition-all text-gray-800"
                                                >
                                                    <option value="">Select Item</option>
                                                    {medicines
                                                        .filter(m => poModalTab === 'COSMETIC' ? m.product_type === 'COSMETIC' : m.product_type !== 'COSMETIC')
                                                        .map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}{m.generic_name ? ` — ${m.generic_name}` : ''}</option>
                                                        ))}
                                                </select>
                                            </div>
                                            <div className="w-[90px]">
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Qty *</label>
                                                <input
                                                    type="number" min="1"
                                                    value={item.quantity_ordered || ''}
                                                    onChange={e => {
                                                        const newItems = [...orderItems];
                                                        newItems[index].quantity_ordered = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                        setOrderItems(newItems);
                                                    }}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-transparent rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white text-sm font-black text-center transition-all text-gray-800"
                                                />
                                            </div>
                                            <div className="w-[130px]">
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Unit Price (ETB) *</label>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={item.unit_price || ''}
                                                    onChange={e => {
                                                        const newItems = [...orderItems];
                                                        newItems[index].unit_price = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                        setOrderItems(newItems);
                                                    }}
                                                    className="w-full px-3 py-2.5 bg-gray-50 border-transparent rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white text-sm font-black transition-all text-gray-800"
                                                />
                                            </div>
                                            <div className="flex items-end pb-1">
                                                {index > 0 && (
                                                    <button
                                                        onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))}
                                                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
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
                                    className="text-[11px] font-black text-indigo-700 hover:text-white uppercase tracking-wider flex items-center bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all active:scale-95"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Item
                                </button>
                            </div>

                            {/* Procurement Details */}
                            <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Procurement Details</h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Supplier *</label>
                                    <select
                                        value={supplierId}
                                        onChange={e => setSupplierId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white rounded-xl border-transparent shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-bold text-gray-800 transition-all"
                                    >
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isVatInclusive}
                                            onChange={e => setIsVatInclusive(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            id="vat-check"
                                        />
                                        <label htmlFor="vat-check" className="text-sm font-bold text-gray-700 cursor-pointer">Includes VAT</label>
                                    </div>
                                    {isVatInclusive && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Rate (%)</label>
                                            <input
                                                type="number" min="0" max="100"
                                                value={vatRate || ''}
                                                onChange={e => setVatRate(e.target.value === '' ? 0 : Number(e.target.value))}
                                                className="w-20 px-3 py-1.5 text-sm bg-gray-50 font-bold border-transparent rounded-xl outline-none focus:ring-4 focus:ring-indigo-100"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Remarks</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-white rounded-xl border-transparent shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-medium resize-none text-gray-800 transition-all"
                                        placeholder="Internal notes..."
                                    />
                                </div>

                                <div className="pt-3 border-t-2 border-dashed border-gray-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Subtotal</span>
                                        <span className="font-bold text-gray-800 text-sm">ETB {orderItems.reduce((s, i) => s + (i.quantity_ordered * i.unit_price), 0).toFixed(2)}</span>
                                    </div>
                                    {isVatInclusive && (
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">VAT ({vatRate}%)</span>
                                            <span className="font-bold text-indigo-600 text-sm">ETB {(orderItems.reduce((s, i) => s + (i.quantity_ordered * i.unit_price), 0) * (vatRate / 100)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                        <span className="text-gray-900 text-xs font-black uppercase tracking-wider">Grand Total</span>
                                        <span className={`text-xl font-black ${
                                            orderItems.reduce((s, i) => s + (i.quantity_ordered * i.unit_price), 0) * (isVatInclusive ? (1 + vatRate/100) : 1) > 50000
                                                ? 'text-rose-600' : 'text-indigo-600'
                                        }`}>
                                            ETB {(orderItems.reduce((s, i) => s + (i.quantity_ordered * i.unit_price), 0) * (isVatInclusive ? (1 + vatRate/100) : 1)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all active:scale-95">
                                        Cancel
                                    </button>
                                    <button onClick={handleCreatePO}
                                        disabled={!supplierId || orderItems.some(i => !i.medicine_id)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 ${
                                            poModalTab === 'COSMETIC'
                                                ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-200 border-pink-700'
                                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 border-indigo-800'
                                        }`}>
                                        Create Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIVE GOODS MODAL */}
            {showReceiveModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><PackageCheck className="w-6 h-6" /></div>
                                    Receive Delivery
                                </h2>
                                <p className="text-sm font-bold text-gray-500 mt-2 tracking-wide">Ref. PO: <span className="text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">{selectedPO.po_number}</span></p>
                            </div>
                            <button onClick={() => setShowReceiveModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors active:scale-95">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-400 rounded-2xl p-5 flex gap-4 mb-8 shadow-sm">
                            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                Confirming this delivery will <strong className="font-black text-amber-900">automatically</strong> instantiate new stock batches globally within your inventory platform and transition the PO status contextually. Accurate transcription of Batch Number and Expiry Date from the manufacturer is mandatory.
                            </p>
                        </div>

                        <div className="overflow-x-auto border-2 border-gray-50 bg-gray-50/30 rounded-3xl p-2 hide-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b-2 border-gray-100">
                                    <tr>
                                        <th className="px-5 py-4">Item Catalog</th>
                                        <th className="px-5 py-4 w-28 text-center text-amber-600">Pending</th>
                                        <th className="px-5 py-4 w-36">Now Receiving</th>
                                        <th className="px-5 py-4 min-w-[160px]">Batch # *</th>
                                        <th className="px-5 py-4 min-w-[160px]">Expiry *</th>
                                        <th className="px-5 py-4 w-36">Ret. Prc (ETB)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receiveData.map((item, index) => (
                                        <tr key={item.po_item_id} className={`transition-colors ${item.quantity_received > item.quantity_remaining ? "bg-rose-50/50" : "hover:bg-white"}`}>
                                            <td className="px-5 py-5 font-bold text-gray-800">{item.medicine_name}</td>
                                            <td className="px-5 py-5 font-black text-amber-600 text-center text-lg">{item.quantity_remaining}</td>
                                            <td className="px-5 py-5">
                                                <input
                                                    type="number" min="0" max={item.quantity_remaining}
                                                    value={item.quantity_received}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].quantity_received = parseInt(e.target.value) || 0;
                                                        setReceiveData(data);
                                                    }}
                                                    className={`w-full px-4 py-2.5 outline-none font-black text-center transition-all bg-white rounded-xl shadow-sm border ${item.quantity_received > item.quantity_remaining ? 'border-rose-400 ring-4 ring-rose-100 text-rose-700' : 'border-transparent focus:ring-4 focus:ring-emerald-100 text-emerald-700'}`}
                                                />
                                            </td>
                                            <td className="px-5 py-5">
                                                <input
                                                    type="text" placeholder="BCH-..."
                                                    value={item.batch_number}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].batch_number = e.target.value;
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-4 py-2.5 outline-none font-bold placeholder-gray-300 transition-all bg-white border border-transparent focus:ring-4 focus:ring-emerald-100 rounded-xl shadow-sm text-gray-700 uppercase"
                                                />
                                            </td>
                                            <td className="px-5 py-5">
                                                <input
                                                    type="date"
                                                    value={item.expiry_date}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].expiry_date = e.target.value;
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-4 py-2.5 outline-none font-bold text-gray-700 transition-all bg-white border border-transparent focus:ring-4 focus:ring-emerald-100 rounded-xl shadow-sm"
                                                />
                                            </td>
                                            <td className="px-5 py-5">
                                                <input
                                                    type="number" step="0.01" min="0"
                                                    value={item.selling_price}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].selling_price = parseFloat(e.target.value);
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-4 py-2.5 outline-none font-black text-gray-800 text-right transition-all bg-white border border-transparent focus:ring-4 focus:ring-emerald-100 rounded-xl shadow-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-10 flex justify-end gap-4">
                            <button onClick={() => setShowReceiveModal(false)}
                                className="px-8 py-3.5 bg-gray-100 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-200 transition-all active:scale-95">
                                Abort
                            </button>
                            <button onClick={submitReceiveGoods}
                                className="px-10 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 active:scale-95 border-b-4 border-emerald-700 flex items-center gap-2">
                                Commit to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECORD PAYMENT MODAL (CASHIER TARGET) */}
            {showPaymentModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><DollarSign className="w-6 h-6" /></div>
                                Finance Disbursement
                            </h2>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors active:scale-95">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-3xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 opacity-10"><DollarSign className="w-40 h-40" /></div>
                                <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1 relative z-10">Authorized Payables Amount</p>
                                <p className="text-4xl font-black relative z-10">ETB {(Number(selectedPO.total_amount) - Number(selectedPO.total_paid || 0)).toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                                <div className="mt-4 flex gap-4 text-xs font-bold text-indigo-100 relative z-10">
                                    <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">PO: {selectedPO.po_number}</span>
                                    <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 line-clamp-1">{selectedPO.supplier?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-5 px-1 pt-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Deduct From Account *</label>
                                    <select
                                        value={selectedPaymentAccount}
                                        onChange={e => setSelectedPaymentAccount(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-bold text-gray-800 transition-all cursor-pointer"
                                    >
                                        <option value="">-- Select Source Ledger --</option>
                                        {paymentAccounts.filter(p => p.is_active).map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} (Bal: ETB {Number(acc.balance).toLocaleString()})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Disbursement Amount *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">ETB</span>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={e => setPaymentAmount(Number(e.target.value))}
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none text-xl font-black text-gray-900 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button onClick={handleRecordPayment}
                                disabled={paymentAmount <= 0 || !selectedPaymentAccount}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:shadow-none border-b-4 border-indigo-800">
                                Authorize Ledger Deduction
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIVED GOODS HISTORY MODAL */}
            {showReceivedHistoryModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-gray-100 text-gray-600"><Eye className="w-6 h-6" /></div>
                                    Receipt Manifest
                                </h2>
                                <p className="text-sm font-bold text-gray-500 mt-2 tracking-wide">Ref. PO: <span className="text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">{selectedPO.po_number}</span></p>
                            </div>
                            <button onClick={() => setShowReceivedHistoryModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors active:scale-95">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-gray-100 bg-gray-50 rounded-3xl flex-1 hide-scrollbar shadow-inner mt-2">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b-2 border-gray-100 sticky top-0 bg-gray-50 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-5">Product Name</th>
                                        <th className="px-6 py-5">Manifest Qty</th>
                                        <th className="px-6 py-5">Logged Inward</th>
                                        <th className="px-6 py-5">Allocated Batch #</th>
                                        <th className="px-6 py-5">Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receiveData.map((item, index) => (
                                        <tr key={index} className="hover:bg-white transition-colors bg-white/40">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-800">{item.medicine?.name || item.medicine_name}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{item.medicine?.generic_name}</p>
                                            </td>
                                            <td className="px-6 py-5"><span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">{item.quantity_ordered}</span></td>
                                            <td className="px-6 py-5"><span className="text-sm font-black text-emerald-600 bg-emerald-100 px-4 py-2 rounded-xl">{item.quantity_received}</span></td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold font-mono rounded-lg border border-indigo-100 uppercase tracking-wider">
                                                    {item.batch?.batch_number || 'Multiple'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-gray-600">
                                                {item.batch?.expiry_date ? formatDate(item.batch.expiry_date) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    {receiveData.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic font-medium">No goods receipt records located for this order.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setShowReceivedHistoryModal(false)}
                                className="px-10 py-3.5 bg-gray-900 border border-transparent text-white rounded-2xl text-sm font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/20">
                                Close Manifest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CashierPurchases = () => {
    const [pendingPOs, setPendingPOs] = useState<any[]>([]);
    const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');

    const fetchData = async () => {
        try {
            const [poRes, actRes] = await Promise.all([
                client.get('/purchase-orders'),
                client.get('/payment-accounts')
            ]);
            const filteredPOs = (poRes.data || []).filter((po: any) => po.status === 'PENDING_PAYMENT');
            setPendingPOs(filteredPOs);
            setPaymentAccounts(actRes.data || []);
        } catch (err) {
            console.error('Failed fetching queue data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleRecordPayment = async () => {
        if (!selectedPO || paymentAmount <= 0) return;
        if (!selectedPaymentAccount) {
            toastWarning('Payment Account Required', 'Please select a payment account.');
            return;
        }

        try {
            await client.post(`/purchase-orders/${selectedPO.id}/pay`, {
                payment_account_id: selectedPaymentAccount,
                amount: paymentAmount,
            });
            setShowPaymentModal(false);
            setSelectedPaymentAccount('');
            setSelectedPO(null);
            fetchData();
            toastSuccess('Payment Confirmed', 'The purchase order has been successfully paid.');
        } catch (err: any) {
            console.error('Failed to record payment', err);
            const msg = extractErrorMessage(err, 'Error recording payment.');
            toastError('Payment failed', msg);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between flex-none">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">PO Payment Queue</h1>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Auto-refreshing every 6 seconds
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-sm border ${pendingPOs.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    {pendingPOs.length} Pending {pendingPOs.length === 1 ? 'Order' : 'Orders'}
                </div>
            </div>

            {pendingPOs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-emerald-400 opacity-60" />
                    </div>
                    <p className="font-semibold text-gray-500 text-lg">Queue is Clear</p>
                    <p className="text-sm mt-1">No purchase orders awaiting payment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {pendingPOs.map(po => (
                        <div key={po.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">Pending Payment</p>
                                    <p className="font-black text-gray-900 text-base">{po.po_number || 'PO-??'}</p>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(po.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold">{po.supplier?.name || 'Unknown Supplier'}</span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-3 mb-4 flex justify-between items-center mt-auto">
                                <span className="text-sm font-bold text-gray-500">Total Due</span>
                                <span className="text-xl font-black text-indigo-700">ETB {Number(po.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>

                            <button
                                onClick={() => { setSelectedPO(po); setPaymentAmount(Number(po.total_amount) - Number(po.total_paid || 0)); setShowPaymentModal(true); }}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                            >
                                <CheckCircle className="w-4 h-4" /> Accept Payment
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* PAYMENT MODAL */}
            {showPaymentModal && selectedPO && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 border border-gray-100 right-4 p-2 bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100"><DollarSign className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Process Bank/Cash Payment</h2>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">Clearing funds for {selectedPO.po_number}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-center">
                                <span className="font-bold text-amber-900 text-sm">Total Required:</span>
                                <span className="font-black text-amber-600 text-xl">ETB {Number(selectedPO.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Deduct From Account</label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {paymentAccounts.filter(act => act.is_active).map(act => (
                                        <button key={act.id} onClick={() => setSelectedPaymentAccount(act.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedPaymentAccount === act.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl border ${selectedPaymentAccount === act.id ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-bold text-sm ${selectedPaymentAccount === act.id ? 'text-indigo-900' : 'text-gray-900'}`}>{act.name}</p>
                                                    <p className="text-xs font-medium text-gray-500">Balance: ETB {Number(act.balance).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            {selectedPaymentAccount === act.id && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                                        </button>
                                    ))}
                                    {paymentAccounts.length === 0 && (
                                        <div className="p-6 text-center text-sm font-medium text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
                                            No active payment accounts configured for the organization.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-colors border border-gray-200">Cancel</button>
                            <button onClick={handleRecordPayment} disabled={!selectedPaymentAccount} className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg active:scale-[0.98] tracking-wide border-b-[4px] border-indigo-800 flex justify-center items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Confirm & Pay ETB {Number(selectedPO.total_amount).toLocaleString()}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Purchases = () => {
    const { role } = useAuth();
    if (role === 'CASHIER') return <CashierPurchases />;
    return <PharmacistPurchases />;
};

export default Purchases;
