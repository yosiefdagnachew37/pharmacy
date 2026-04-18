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

const ProductType = {
    MEDICINE: 'MEDICINE' as const,
    COSMETIC: 'COSMETIC' as const,
};
type ProductType = typeof ProductType[keyof typeof ProductType];

const PurchaseManager = () => {
    const { role } = useAuth();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [cosmetics, setCosmetics] = useState<any[]>([]);
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
    const [activeTab, setActiveTab] = useState<'ALL'>('ALL');

    // Form states
    const [supplierId, setSupplierId] = useState('');
    const [orderItems, setOrderItems] = useState<Array<{
        medicine_id: string; sku: string; name: string; quantity: number; unit_price: number;
        selling_price: number; batch_number: string; expiry_date: string; item_found: boolean; product_type: ProductType;
        showDropdown?: boolean;
    }>>([
        { medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: ProductType.MEDICINE, showDropdown: false }
    ],);
    const [notes, setNotes] = useState('');
    const [isVatInclusive, setIsVatInclusive] = useState(false);
    const [vatRate, setVatRate] = useState(15);
    const [poModalTab, setPoModalTab] = useState<'MEDICINE' | 'COSMETIC'>('MEDICINE');

    // Receipt/History states
    const [receiveData, setReceiveData] = useState<any[]>([]);

    // Payment during registration
    const [payNow, setPayNow] = useState(false);
    const [paymentDueDate, setPaymentDueDate] = useState('');
    const [amountPaidNow, setAmountPaidNow] = useState(0);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'SYSTEM_ACCOUNT' | 'CHEQUE'>('CASH');
    const [chequeBank, setChequeBank] = useState('');
    const [chequeNumber, setChequeNumber] = useState('');
    const [chequeDueDate, setChequeDueDate] = useState('');

    const fetchData = async () => {
        try {
            const [poRes, suppRes, medRes, cosRes, actRes] = await Promise.all([
                client.get('/purchase-orders').catch(e => ({ data: [] })),
                client.get('/suppliers').catch(e => ({ data: [] })),
                client.get('/medicines?product_type=MEDICINE').catch(e => ({ data: [] })),
                client.get('/medicines?product_type=COSMETIC').catch(e => ({ data: [] })),
                client.get('/payment-accounts').catch(e => ({ data: [] }))
            ]);
            setPurchases(poRes.data || []);
            setSuppliers(suppRes.data || []);
            setMedicines(medRes.data || []);
            setCosmetics(cosRes.data || []);
            setPaymentAccounts(actRes.data || []);
        } catch (err) {
            console.error('Unexpected failure in Purchases.fetchData', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRegisterPurchase = async () => {
        if (!supplierId || orderItems.some(i => !i.medicine_id || !i.batch_number)) {
            toastWarning('Missing Information', 'Please select a supplier and fill all required item details (including Batch #).');
            return;
        }

        try {
            const payload = {
                supplier_id: supplierId,
                supplier_invoice_number: (document.getElementById('supplier_inv_number') as HTMLInputElement)?.value,
                items: orderItems,
                notes,
                is_vat_inclusive: isVatInclusive,
                vat_rate: isVatInclusive ? vatRate : 0,
                payment_method: paymentMethod === 'CASH' ? 'CASH' : (paymentMethod === 'CHEQUE' ? 'CHEQUE' : 'BANK_TRANSFER'),
                amount_paid_now: payNow ? amountPaidNow : 0,
                payment_account_id: (payNow && paymentMethod === 'SYSTEM_ACCOUNT') ? selectedPaymentAccount : undefined,
                cheque_bank_name: paymentMethod === 'CHEQUE' ? chequeBank : undefined,
                cheque_number: paymentMethod === 'CHEQUE' ? chequeNumber : undefined,
                cheque_due_date: paymentMethod === 'CHEQUE' ? chequeDueDate : undefined,
                payment_due_date: !payNow ? paymentDueDate : undefined,
            };

            await client.post('/purchase-orders/register', payload);

            setShowCreateModal(false);
            resetForm();
            fetchData();
            toastSuccess('Purchase Registered', 'Inventory stock has been updated successfully.');
        } catch (err: any) {
            console.error('Registration failed', err);
            const msg = extractErrorMessage(err, 'Error registering purchase.');
            toastError('Registration Failed', msg);
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
        setOrderItems([{
            medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0,
            batch_number: '', expiry_date: '', item_found: false, product_type: ProductType.MEDICINE,
            showDropdown: false
        }]);
        setPoModalTab('MEDICINE');
        setPayNow(false);
        setAmountPaidNow(0);
        setPaymentMethod('CASH');
        setSelectedPaymentAccount('');
        setChequeBank('');
        setChequeNumber('');
        setChequeDueDate('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'REGISTERED': return 'bg-indigo-100 text-indigo-700';
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
            // Simplified: All registered/completed orders shown together
            matchesTab = po.status !== 'DRAFT';

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
                {role === 'ADMIN' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 border-b-4 border-indigo-800"
                    >
                        <Plus className="w-5 h-5" /> Register Purchase
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full sm:w-auto shadow-inner border border-gray-200/60">
                    <div className="px-6 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-black shadow-sm border border-gray-100 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Purchase History
                    </div>
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
                                <th className="px-6 py-4">Invoice #</th>
                                <ColumnFilter
                                    label="System ID"
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
                                    <td className="px-6 py-4 font-black text-indigo-600 font-mono tracking-tight text-xs">
                                        {po.supplier_invoice_number || '---'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-400 text-[10px] bg-gray-50/30 group-hover:bg-transparent">
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
                                            <span className="font-black text-gray-800 text-sm">ETB {Number(po.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                                        {(po.status === 'REGISTERED' || po.status === 'COMPLETED' || po.status === 'PARTIALLY_RECEIVED') && (
                                            <button
                                                onClick={() => openReceivedHistoryModal(po)}
                                                className="px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-[10px] uppercase flex items-center gap-1 ml-auto"
                                                title="View Details"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Details
                                            </button>
                                        )}
                                        {po.payment_status !== 'PAID' && role === 'ADMIN' && (
                                            <button
                                                onClick={() => { setSelectedPO(po); setAmountPaidNow(Number(po.total_amount) - Number(po.total_paid || 0)); setShowPaymentModal(true); }}
                                                className="mt-2 px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors font-bold text-[11px] uppercase shadow-md active:scale-95 w-full flex items-center justify-center gap-1"
                                            >
                                                <DollarSign className="w-3 h-3" /> Process Payment
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
                            <span className="font-black text-gray-900">ETB {Number(po.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-[95vw] lg:max-w-7xl h-[96vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col">
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
                                onClick={() => { setPoModalTab('MEDICINE'); setOrderItems([{ medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: ProductType.MEDICINE }]); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${poModalTab === 'MEDICINE'
                                    ? 'bg-white text-indigo-700 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                💊 Medicine Invoice
                            </button>
                            <button
                                onClick={() => { setPoModalTab('COSMETIC'); setOrderItems([{ medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: ProductType.COSMETIC }]); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${poModalTab === 'COSMETIC'
                                    ? 'bg-white text-pink-700 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                ✨ Cosmetics Invoice
                            </button>
                        </div>

                        <div className="flex flex-col flex-1 min-h-0">
                            {/* Supplier & Header Info */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 flex-shrink-0">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Supplier *</label>
                                    <select
                                        value={supplierId}
                                        onChange={e => setSupplierId(e.target.value)}
                                        className="w-full px-4 py-2 bg-white rounded-xl border border-transparent shadow-sm focus:border-indigo-300 outline-none text-sm font-bold text-gray-800"
                                    >
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Physical Invoice # *</label>
                                    <input
                                        type="text"
                                        id="supplier_inv_number"
                                        placeholder="Serial / INV-..."
                                        className="w-full px-4 py-2 bg-white rounded-xl border border-transparent shadow-sm focus:border-indigo-300 outline-none text-sm font-bold text-indigo-700"
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col justify-end">
                                    <div className="flex items-center gap-6 mb-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="vat-toggle"
                                                checked={isVatInclusive}
                                                onChange={e => setIsVatInclusive(e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                                            />
                                            <label htmlFor="vat-toggle" className="text-base font-bold text-gray-700 cursor-pointer">Add VAT</label>
                                        </div>
                                        {isVatInclusive && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-500">Rate:</span>
                                                <input
                                                    type="number"
                                                    value={vatRate}
                                                    onChange={e => setVatRate(Number(e.target.value))}
                                                    className="w-20 px-2 py-2 bg-white border rounded-lg text-sm font-black"
                                                />
                                                <span className="text-sm font-bold text-gray-500">%</span>
                                            </div>
                                        )}
                                    </div>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Internal notes or invoice remarks..."
                                        rows={1}
                                        className="w-full mt-2 px-4 py-2 bg-white rounded-xl border border-transparent shadow-sm focus:border-indigo-300 outline-none text-sm font-medium resize-none overflow-hidden"
                                    />
                                </div>
                            </div>

                            {/* Line Items Table with Scrollable Area */}
                            <div className="mt-2 flex-1 min-h-0 overflow-hidden flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm relative">
                                <div className="overflow-x-auto overflow-y-auto flex-1">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-gray-50/80 text-gray-500 font-black uppercase tracking-widest text-[10px] border-b sticky top-0 z-10 backdrop-blur-sm">
                                            <tr>
                                                <th className="px-5 py-3 w-80">Product Selection *</th>
                                                <th className="px-5 py-3 w-32">Batch #</th>
                                                <th className="px-5 py-3 w-40">Expiry</th>
                                                <th className="px-5 py-3 w-24">Quantity</th>
                                                <th className="px-5 py-3 w-32">Unit Price {isVatInclusive ? '(Excl)' : ''}</th>
                                                <th className="px-5 py-3 w-32">Retail Price</th>
                                                <th className="px-5 py-3 w-32 text-right">Ext. Total</th>
                                                <th className="px-5 py-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 group">
                                            {orderItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-indigo-50/20 transition-colors">
                                                    <td className="px-4 py-4 relative">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search name or SKU..."
                                                                value={item.sku || ""}
                                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm"
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const newItems = [...orderItems];
                                                                    newItems[index].sku = val;
                                                                    newItems[index].name = val;
                                                                    newItems[index].showDropdown = true;
                                                                    setOrderItems(newItems);
                                                                }}
                                                            />
                                                            {item.showDropdown && (
                                                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto p-1.5 animate-in slide-in-from-top-2 duration-200">
                                                                    {(() => {
                                                                        const dataset = poModalTab === 'MEDICINE' ? medicines : cosmetics;
                                                                        const results = dataset
                                                                            .filter(m => {
                                                                                const searchStr = (m.name + m.sku).toLowerCase();
                                                                                const query = (item.sku || '').toLowerCase();
                                                                                return searchStr.includes(query);
                                                                            })
                                                                            .slice(0, 10);

                                                                        return results.map((prod) => (
                                                                            <button
                                                                                key={prod.id}
                                                                                onClick={() => {
                                                                                    const newItems = [...orderItems];
                                                                                    newItems[index] = {
                                                                                        ...newItems[index],
                                                                                        medicine_id: prod.id,
                                                                                        sku: prod.sku,
                                                                                        name: prod.name,
                                                                                        item_found: true,
                                                                                        showDropdown: false,
                                                                                        unit_price: Number(prod.purchase_price) || 0,
                                                                                        selling_price: Number(prod.selling_price) || 0,
                                                                                        batch_number: prod.batch_number || '',
                                                                                        expiry_date: prod.expiry_date ? formatDate(prod.expiry_date) : ''
                                                                                    };
                                                                                    setOrderItems(newItems);
                                                                                }}
                                                                                className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl transition-colors flex flex-col gap-0.5"
                                                                            >
                                                                                <span className="font-bold text-gray-900 text-sm">{prod.name}</span>
                                                                                <span className="text-[10px] text-gray-500 font-mono font-bold">{prod.sku} • {prod.category || 'Standard'}</span>
                                                                            </button>
                                                                        ));
                                                                    })()}
                                                                    <button
                                                                        onClick={() => {
                                                                            const newItems = [...orderItems];
                                                                            newItems[index].showDropdown = false;
                                                                            setOrderItems(newItems);
                                                                        }}
                                                                        className="w-full p-2 text-rose-500 font-black text-[10px] uppercase hover:bg-rose-50 rounded-lg mt-1"
                                                                    >
                                                                        Close Search
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {item.medicine_id && (
                                                            <div className="mt-2 pl-2 border-l-2 border-indigo-400">
                                                                <p className="text-xs font-black text-indigo-700 uppercase tracking-tight">{item.name}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="text"
                                                            value={item.batch_number}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].batch_number = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            placeholder="BCH..."
                                                            className="w-full px-3 py-2 bg-gray-50 rounded-xl outline-none font-black uppercase text-sm border border-transparent focus:border-indigo-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="date"
                                                            value={item.expiry_date}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].expiry_date = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-3 py-2 bg-gray-50 rounded-xl outline-none font-bold text-sm border border-transparent focus:border-indigo-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.quantity || ''}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].quantity = Number(e.target.value);
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-3 py-2 bg-gray-50 rounded-xl outline-none font-black text-center text-lg border border-transparent focus:border-indigo-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.unit_price || ''}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].unit_price = Number(e.target.value);
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-3 py-2 bg-indigo-50/50 rounded-xl outline-none font-black text-center text-sm border border-indigo-100 focus:border-indigo-300"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.selling_price || ''}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].selling_price = Number(e.target.value);
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl outline-none font-black text-center text-sm border border-emerald-100 focus:border-emerald-300"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="font-black text-gray-900 text-base">ETB {(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {index > 0 && (
                                                            <button onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><X className="w-5 h-5" /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    onClick={() => setOrderItems([...orderItems, { medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: (poModalTab as any) }])}
                                    className="w-full py-4 text-[10px] font-black text-indigo-600 hover:bg-indigo-50/50 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-t-2 border-dashed border-gray-100"
                                >
                                    <Plus className="w-4 h-4" /> Add Next Invoice Item
                                </button>
                            </div>

                            {/* Summary & Payment Logic - Sticky Footer */}
                            <div className="mt-2 pt-2 border-t-2 border-gray-100 bg-white z-20 sticky bottom-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="pay-now"
                                                    checked={payNow}
                                                    onChange={e => {
                                                        setPayNow(e.target.checked);
                                                        if (e.target.checked) setAmountPaidNow(orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0) * (isVatInclusive ? (1 + vatRate / 100) : 1));
                                                    }}
                                                    className="w-6 h-6 text-indigo-600 rounded-lg cursor-pointer"
                                                />
                                                <label htmlFor="pay-now" className="text-sm font-black text-gray-900 cursor-pointer uppercase tracking-tight">Process Payment Now</label>
                                            </div>

                                            {!payNow && (
                                                <div className="bg-white p-2.5 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-200">
                                                    <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> SET PAYMENT DUE DATE *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={paymentDueDate}
                                                        onChange={e => setPaymentDueDate(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-indigo-50/30 rounded-xl border border-transparent focus:border-indigo-200 outline-none text-sm font-bold text-indigo-700"
                                                        required
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1.5 px-1 font-bold">
                                                        <AlertCircle className="w-3 h-3" /> You will be notified when this payment is due.
                                                    </p>
                                                </div>
                                            )}

                                            {payNow && (
                                                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                                    <div className="flex bg-white/50 p-1.5 rounded-2xl border border-gray-200/50 gap-1">
                                                        {(['CASH', 'SYSTEM_ACCOUNT', 'CHEQUE'] as const).map((method) => (
                                                            <button
                                                                key={method}
                                                                onClick={() => setPaymentMethod(method)}
                                                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${paymentMethod === method ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-white hover:text-gray-800'}`}
                                                            >
                                                                {method.replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    
                                                    {paymentMethod !== 'SYSTEM_ACCOUNT' && (
                                                        <p className="text-[10px] bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100 font-bold">
                                                            Note: {paymentMethod === 'CASH' ? 'Cash' : 'Cheque'} payment will be recorded as a manual reference note.
                                                        </p>
                                                    )}

                                                    {paymentMethod === 'SYSTEM_ACCOUNT' && (
                                                        <select
                                                            value={selectedPaymentAccount}
                                                            onChange={e => setSelectedPaymentAccount(e.target.value)}
                                                            className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none text-base font-bold text-gray-800 focus:ring-4 focus:ring-indigo-100 transition-all"
                                                        >
                                                            <option value="">-- Choose Account --</option>
                                                            {paymentAccounts.filter(p => p.is_active).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: ETB {Number(acc.balance).toLocaleString()})</option>)}
                                                        </select>
                                                    )}

                                                    {paymentMethod === 'CHEQUE' && (
                                                        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                                                            <input
                                                                type="text"
                                                                placeholder="Bank Name"
                                                                value={chequeBank}
                                                                onChange={e => setChequeBank(e.target.value)}
                                                                className="px-5 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-bold"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Cheque Number"
                                                                value={chequeNumber}
                                                                onChange={e => setChequeNumber(e.target.value)}
                                                                className="px-5 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-bold"
                                                            />
                                                            <div className="col-span-2">
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Due Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={chequeDueDate}
                                                                    onChange={e => setChequeDueDate(e.target.value)}
                                                                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-bold"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="relative">
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Settlement Amount (ETB)</label>
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-5 font-black text-gray-500 text-lg">ETB</span>
                                                            <input
                                                                type="number"
                                                                value={amountPaidNow}
                                                                onChange={e => setAmountPaidNow(Number(e.target.value))}
                                                                className="w-full pl-16 pr-5 py-3.5 bg-white rounded-2xl border-2 border-transparent focus:border-indigo-400 outline-none text-xl font-black text-indigo-700 shadow-xl shadow-indigo-100/20 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border-2 border-indigo-50 shadow-2xl shadow-indigo-100 flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span className="text-gray-900 border-b-2 border-indigo-50 pb-1">ETB {orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        {isVatInclusive && (
                                            <div className="flex justify-between items-center text-sm font-black text-indigo-400 uppercase tracking-widest">
                                                <span>VAT ({vatRate}%)</span>
                                                <span className="border-b-2 border-indigo-50 pb-1">ETB {(orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0) * (vatRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 flex justify-between items-end border-t-2 border-gray-50 pt-4">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Final Payable</p>
                                                <p className="text-3xl font-black text-gray-900 tracking-tighter">
                                                    ETB {(orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0) * (isVatInclusive ? (1 + vatRate / 100) : 1)).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleRegisterPurchase}
                                                disabled={!supplierId || orderItems.some(i => !i.medicine_id)}
                                                className={`px-8 py-4.5 rounded-2xl text-sm font-black text-white shadow-2xl transition-all active:scale-95 active:shadow-none disabled:opacity-20 disabled:grayscale border-b-4 flex items-center gap-3 ${poModalTab === 'COSMETIC'
                                                    ? 'bg-pink-600 hover:bg-pink-700 border-pink-900 shadow-pink-100'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-950 shadow-indigo-100'
                                                    }`}
                                            >
                                                <PackageCheck className="w-5 h-5" /> REGISTER TO STOCK
                                            </button>
                                        </div>
                                    </div>
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
                                <p className="text-4xl font-black relative z-10">ETB {(Number(selectedPO.total_amount) - Number(selectedPO.total_paid || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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

                        {selectedPO.payment_status !== 'PAID' && selectedPO.payment_due_date && (
                            <div className={`mb-4 p-3 rounded-2xl flex items-center justify-between border animate-in slide-in-from-top-4 duration-300 ${
                                new Date(selectedPO.payment_due_date) < new Date(new Date().setHours(0,0,0,0))
                                    ? 'bg-rose-50 border-rose-100 text-rose-700' 
                                    : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${new Date(selectedPO.payment_due_date) < new Date(new Date().setHours(0,0,0,0)) ? 'bg-rose-100' : 'bg-indigo-100'}`}>
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            {new Date(selectedPO.payment_due_date) < new Date(new Date().setHours(0,0,0,0)) ? 'Overdue Payment' : 'Upcoming Payment'}
                                        </p>
                                        <p className="text-sm font-black">
                                            Due Date: {formatDate(selectedPO.payment_due_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {(() => {
                                        const diff = new Date(selectedPO.payment_due_date).getTime() - new Date().setHours(0,0,0,0);
                                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                        return (
                                            <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight ${
                                                days < 0 ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-indigo-600 text-white'
                                            }`}>
                                                {days === 0 ? 'Due Today' : (days < 0 ? `${Math.abs(days)} Days Overdue` : `${days} Days Remaining`)}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto border border-gray-100 bg-gray-50 rounded-3xl flex-1 hide-scrollbar shadow-inner mt-2">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b-2 border-gray-100 sticky top-0 bg-white z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-5">Item Manifest</th>
                                        <th className="px-4 py-5 font-black">Quantity</th>
                                        <th className="px-4 py-5 font-black">Price</th>
                                        <th className="px-4 py-5 font-black text-center">Batch Number</th>
                                        <th className="px-4 py-5 font-black text-center">Expiry</th>
                                        <th className="px-4 py-5 text-right font-black">Ext. Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receiveData.map((item, index) => (
                                        <tr key={index} className="hover:bg-indigo-50/10 transition-colors bg-white/40">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-800">{item.medicine?.name || 'Unknown Item'}</p>
                                                <p className="text-[10px] text-indigo-500 mt-0.5 font-bold tracking-tight uppercase">{item.medicine?.sku}</p>
                                            </td>
                                            <td className="px-4 py-5 font-black text-gray-700">{item.quantity_ordered} <span className="text-[10px] text-gray-400 font-bold uppercase">{item.medicine?.unit}</span></td>
                                            <td className="px-4 py-5 font-bold text-gray-500 text-xs">ETB {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-5 text-center"><span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg font-mono text-[10px] font-black">{item.batch_number || '---'}</span></td>
                                            <td className="px-4 py-5 text-center">
                                                <span className="text-[10px] font-black text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                                                    {item.expiry_date ? formatDate(item.expiry_date) : 'NON-EXPIRABLE'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-right font-black text-indigo-700">
                                                ETB {Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {receiveData.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic font-medium">No goods receipt records located for this order.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Invoice Value</span>
                                <span className="text-2xl font-black text-gray-900">ETB {Number(selectedPO.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <button onClick={() => setShowReceivedHistoryModal(false)}
                                className="px-10 py-3.5 bg-gray-900 border border-transparent text-white rounded-2xl text-sm font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/20">
                                Close Invoice
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
    if (role === 'CASHIER') {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <X className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Access Restricted</h2>
                <p className="text-gray-500 mt-1 max-w-sm">The Purchase module is reserved for administrators and pharmacy owners only. Cashiers are not authorized to view or manage procurement data.</p>
            </div>
        );
    }
    return <PurchaseManager />;
};

export default Purchases;
