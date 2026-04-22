import { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, ShoppingBag, Eye, PackageCheck,
    Building2, FileText, X, CheckCircle, Clock, AlertCircle, DollarSign, History, Calendar,
    CheckSquare, AlertTriangle, Banknote
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
        if (paymentMethod === 'SYSTEM_ACCOUNT' && !selectedPaymentAccount) {
            toastWarning('Payment Account Required', 'Please select a payment account.');
            return;
        }

        try {
            await client.post(`/purchase-orders/${selectedPO.id}/pay`, {
                payment_method: paymentMethod === 'CASH' ? 'CASH' : (paymentMethod === 'CHEQUE' ? 'CHEQUE' : 'BANK_TRANSFER'),
                payment_account_id: paymentMethod === 'SYSTEM_ACCOUNT' ? selectedPaymentAccount : undefined,
                amount: paymentAmount,
                cheque_bank_name: paymentMethod === 'CHEQUE' ? chequeBank : undefined,
                cheque_number: paymentMethod === 'CHEQUE' ? chequeNumber : undefined,
                cheque_due_date: paymentMethod === 'CHEQUE' ? chequeDueDate : undefined,
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
            case 'CHEQUE_ISSUED': return 'bg-orange-100 text-orange-700 border border-orange-200';
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

    const handleConfirmChequeClearance = async (po: any) => {
        if (!window.confirm(`Confirm that the cheque for PO ${po.po_number} has been successfully cleared by the bank?`)) return;
        try {
            await client.post(`/purchase-orders/${po.id}/cheque-clear`);
            fetchData();
            toastSuccess('Cheque Cleared', `PO ${po.po_number} is now fully settled.`);
        } catch (err: any) {
            toastError('Error', extractErrorMessage(err, 'Failed to confirm cheque clearance.'));
        }
    };

    const handleBounceCheque = async (po: any) => {
        if (!window.confirm(`Mark the cheque for PO ${po.po_number} as BOUNCED? This will reset the payment status to UNPAID.`)) return;
        try {
            await client.post(`/purchase-orders/${po.id}/cheque-bounce`);
            fetchData();
            toastWarning('Cheque Bounced', `PO ${po.po_number} payment has been reset to UNPAID.`);
        } catch (err: any) {
            toastError('Error', extractErrorMessage(err, 'Failed to record cheque bounce.'));
        }
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
        <div className="space-y-6 pb-8 animate-in fade-in duration-500 text-gray-900">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5">
                <div className="w-full lg:w-auto">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900">Purchases & Procurements</h1>
                    <p className="text-gray-500 mt-0.5 font-medium text-xs sm:text-sm">Manage stock orders and record supply receipts</p>
                </div>
                {role === 'ADMIN' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 border-b-4 border-indigo-800"
                    >
                        <Plus className="w-4 h-4" /> Register Purchase
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-2.5">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full lg:w-auto shadow-inner border border-gray-200/60 overflow-x-auto hide-scrollbar">
                    <div className="whitespace-nowrap px-4 py-2 bg-white text-indigo-700 rounded-lg text-xs font-black shadow-sm border border-gray-100 flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        Purchase History
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search PO number or supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none text-xs transition-all"
                        />
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setColumnFilters({ poNumber: [], supplier: [], status: [], paymentStatus: [], date: [] })}
                            className="w-full sm:w-auto text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap active:scale-95 text-center uppercase"
                        >
                            Clear ({activeFilterCount})
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-300 uppercase text-[9px] font-black tracking-widest sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Invoice #</th>
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
                                <th className="px-4 py-3">Total Value</th>
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
                                <th className="px-4 py-3">Pymt Method</th>
                                <ColumnFilter
                                    label="Date Issued"
                                    options={uniqueDates}
                                    selectedValues={columnFilters.date}
                                    onFilterChange={(v) => updateFilter('date', v)}
                                />
                                <th className="px-4 py-3 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPO.map((po) => (
                                <tr key={po.id} className="hover:bg-indigo-50/20 transition-colors group">
                                    <td className="px-4 py-2.5 font-black text-indigo-600 font-mono tracking-tight text-[11px]">
                                        {po.supplier_invoice_number || '---'}
                                    </td>
                                    <td className="px-4 py-2.5 font-bold text-gray-700 text-[9px] bg-gray-50/30 group-hover:bg-transparent">
                                        {po.po_number}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><Building2 className="w-3 h-3" /></div>
                                            <span className="font-bold text-gray-700">{po.supplier?.name || 'Unknown Vendor'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-800 text-[13px]">ETB {Number(po.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${getPaymentStatusBadge(po.payment_status)}`}>
                                                {po.payment_status === 'CHEQUE_ISSUED' ? '🏦 CHEQUE ISSUED' : (po.payment_status || 'UNPAID')}
                                            </span>
                                            {po.payment_status === 'CHEQUE_ISSUED' && po.cheque_due_date && (() => {
                                                const diff = new Date(po.cheque_due_date).getTime() - new Date().setHours(0, 0, 0, 0);
                                                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                return (
                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${days <= 0 ? 'bg-rose-100 text-rose-700' : days <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                                                        {days === 0 ? 'Due Today' : days < 0 ? `${Math.abs(days)}d Overdue` : `Due in ${days}d`}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md shadow-sm border border-black/5 ${getStatusBadge(po.status)}`}>
                                            {po.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{po.payment_method}</span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className="text-xs text-gray-700">{formatDate(po.purchase_date)}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right space-x-1.5 pr-4">
                                        {po.id && (
                                            <button
                                                onClick={() => openReceivedHistoryModal(po)}
                                                className="px-2.5 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-bold text-[9px] uppercase flex items-center gap-1 ml-auto"
                                                title="View Details"
                                            >
                                                <Eye className="w-3 h-3" /> Details
                                            </button>
                                        )}
                                        {/* Post-dated cheque actions */}
                                        {po.payment_status === 'CHEQUE_ISSUED' && po.cheque_status === 'PENDING' && role === 'ADMIN' && (
                                            <div className="mt-1.5 flex flex-col gap-1">
                                                <button
                                                    onClick={() => handleConfirmChequeClearance(po)}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-all font-bold text-[10px] uppercase shadow-md active:scale-95 w-full flex items-center justify-center gap-1"
                                                >
                                                    <CheckSquare className="w-2.5 h-2.5" /> Confirm Clearance
                                                </button>
                                                <button
                                                    onClick={() => handleBounceCheque(po)}
                                                    className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-all font-bold text-[10px] uppercase shadow-md active:scale-95 w-full flex items-center justify-center gap-1"
                                                >
                                                    <AlertTriangle className="w-2.5 h-2.5" /> Bounce
                                                </button>
                                            </div>
                                        )}
                                        {/* Standard deferred payment */}
                                        {po.payment_status !== 'PAID' && po.payment_status !== 'CHEQUE_ISSUED' && role === 'ADMIN' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPO(po);
                                                    setPaymentAmount(Number(po.total_amount) - Number(po.total_paid || 0));
                                                    setPaymentMethod('CASH');
                                                    setSelectedPaymentAccount('');
                                                    setShowPaymentModal(true);
                                                }}
                                                className="mt-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-all font-bold text-[10px] uppercase shadow-md active:scale-95 w-full flex items-center justify-center gap-1"
                                            >
                                                <DollarSign className="w-2.5 h-2.5" /> Process
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
                        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                            <button onClick={() => openReceivedHistoryModal(po)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            {po.payment_status === 'CHEQUE_ISSUED' && po.cheque_status === 'PENDING' && role === 'ADMIN' ? (
                                <>
                                    <button onClick={() => handleConfirmChequeClearance(po)}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
                                        <CheckSquare className="w-3.5 h-3.5" /> Cleared
                                    </button>
                                    <button onClick={() => handleBounceCheque(po)}
                                        className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Bounce Cheque
                                    </button>
                                </>
                            ) : po.payment_status !== 'PAID' && po.payment_status !== 'CHEQUE_ISSUED' && role === 'ADMIN' ? (
                                <button onClick={() => {
                                    setSelectedPO(po);
                                    setPaymentAmount(Number(po.total_amount) - Number(po.total_paid || 0));
                                    setPaymentMethod('CASH');
                                    setSelectedPaymentAccount('');
                                    setShowPaymentModal(true);
                                }}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                    <DollarSign className="w-3.5 h-3.5" /> Process Payment
                                </button>
                            ) : null}
                            {(po.status === 'DRAFT' || po.status === 'SENT') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                <button onClick={() => handleUpdateStatus(po.id, 'PENDING_PAYMENT')}
                                    className="col-span-2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">
                                    Send for Payment
                                </button>
                            )}
                            {/* Hidden for now as per user request
                            {(po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED') && (role === 'ADMIN' || role === 'PHARMACIST') && (
                                <button onClick={() => openReceiveModal(po)}
                                    className="col-span-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all">
                                    Receive Goods
                                </button>
                            )}
                            */}
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE PO MODAL */}

            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 w-full max-w-[95vw] lg:max-w-7xl h-[94vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><ShoppingBag className="w-4.5 h-4.5" /></div>
                                New Purchase Order
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors active:scale-95">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Type Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4 shadow-inner">
                            <button
                                onClick={() => { setPoModalTab('MEDICINE'); setOrderItems([{ medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: ProductType.MEDICINE }]); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${poModalTab === 'MEDICINE'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                💊 Medicines
                            </button>
                            <button
                                onClick={() => { setPoModalTab('COSMETIC'); setOrderItems([{ medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: ProductType.COSMETIC }]); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${poModalTab === 'COSMETIC'
                                    ? 'bg-white text-pink-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                ✨ Cosmetics
                            </button>
                        </div>

                        <div className="flex flex-col flex-1 min-h-0">
                            {/* Supplier & Header Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-shrink-0">
                                <div className="sm:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5 ml-1">Supplier *</label>
                                    <select
                                        value={supplierId}
                                        onChange={e => setSupplierId(e.target.value)}
                                        className="w-full px-3 py-2 bg-white rounded-xl border border-transparent shadow-sm focus:border-indigo-300 outline-none text-xs font-bold text-gray-800"
                                    >
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5 ml-1">Physical Invoice # *</label>
                                    <input
                                        type="text"
                                        id="supplier_inv_number"
                                        placeholder="Serial / INV-..."
                                        className="w-full px-3 py-2 bg-white rounded-xl border border-transparent shadow-sm focus:border-indigo-300 outline-none text-xs font-bold text-indigo-700"
                                    />
                                </div>
                                <div className="sm:col-span-2 flex flex-col justify-end">
                                    <div className="flex flex-wrap items-center gap-4 mb-2 ml-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="vat-toggle"
                                                checked={isVatInclusive}
                                                onChange={e => setIsVatInclusive(e.target.checked)}
                                                className="w-4.5 h-4.5 text-indigo-600 rounded cursor-pointer"
                                            />
                                            <label htmlFor="vat-toggle" className="text-xs font-bold text-gray-700 cursor-pointer">Add VAT</label>
                                        </div>
                                        {isVatInclusive && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-700">Rate:</span>
                                                <input
                                                    type="number"
                                                    value={vatRate}
                                                    onChange={e => setVatRate(Number(e.target.value))}
                                                    className="w-16 px-2 py-1.5 bg-white border rounded-lg text-xs font-black"
                                                />
                                                <span className="text-xs font-bold text-gray-700">%</span>
                                            </div>
                                        )}
                                    </div>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Internal notes or invoice remarks..."
                                        rows={1}
                                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-transparent shadow-sm focus:border-indigo-300 outline-none text-[11px] font-medium resize-none leading-tight"
                                    />
                                </div>
                            </div>

                            {/* Line Items Table with Scrollable Area */}
                            <div className="mt-2 flex-1 min-h-0 overflow-hidden flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm relative">
                                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-gray-50/80 text-gray-700 font-black uppercase tracking-widest text-[8px] border-b sticky top-0 z-10 backdrop-blur-sm">
                                            <tr>
                                                <th className="px-2 py-1.5 w-64">Product *</th>
                                                <th className="px-2 py-1.5 w-24">Batch #</th>
                                                <th className="px-2 py-1.5 w-32">Expiry</th>
                                                <th className="px-2 py-1.5 w-20 text-center">Qty</th>
                                                <th className="px-2 py-1.5 w-28 text-center">Cost</th>
                                                <th className="px-2 py-1.5 w-28 text-center">Retail</th>
                                                <th className="px-2 py-1.5 w-32 text-right">Ext. Total</th>
                                                <th className="px-2 py-1.5 w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 group">
                                            {orderItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-indigo-50/20 transition-colors">
                                                    <td className="px-3 py-2.5 relative">
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search..."
                                                                value={item.sku || ""}
                                                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-xs"
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
                                                                                className="w-full text-left p-2 hover:bg-indigo-50 rounded-lg transition-colors flex flex-col gap-0.5"
                                                                            >
                                                                                <span className="font-black text-gray-900 text-[11px] uppercase truncate">{prod.name}</span>
                                                                                <span className="text-[9px] text-gray-400 font-mono font-bold tracking-tight">{prod.sku} • {prod.category || 'Standard'}</span>
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
                                                            <div className="mt-1 pl-2 border-l-2 border-indigo-400">
                                                                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-tight leading-none">{item.name}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="text"
                                                            value={item.batch_number}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].batch_number = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            placeholder="Batch#"
                                                            className="w-full px-2 py-1.5 bg-gray-50 rounded-lg outline-none font-black uppercase text-xs border border-transparent focus:border-indigo-200"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="date"
                                                            value={item.expiry_date}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].expiry_date = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-2 py-1.5 bg-gray-50 rounded-lg outline-none font-bold text-[11px] border border-transparent focus:border-indigo-200"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.quantity || ''}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].quantity = Number(e.target.value);
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-2 py-1.5 bg-gray-50 rounded-lg outline-none font-black text-center text-sm border border-transparent focus:border-indigo-200"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.unit_price || ''}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].unit_price = Number(e.target.value);
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-2 py-1.5 bg-indigo-50/50 rounded-lg outline-none font-black text-center text-xs border border-indigo-100 focus:border-indigo-300"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.selling_price || ''}
                                                            onChange={e => {
                                                                const newItems = [...orderItems];
                                                                newItems[index].selling_price = Number(e.target.value);
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="w-full px-2 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg outline-none font-black text-center text-xs border border-emerald-100 focus:border-emerald-300"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right">
                                                        <span className="font-black text-gray-900 text-[13px]">ETB {(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        {index > 0 && (
                                                            <button onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))} className="p-1 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    onClick={() => setOrderItems([...orderItems, { medicine_id: '', sku: '', name: '', quantity: 1, unit_price: 0, selling_price: 0, batch_number: '', expiry_date: '', item_found: false, product_type: (poModalTab as any) }])}
                                    className="w-full py-2.5 text-[9px] font-black text-indigo-600 hover:bg-indigo-50/50 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-t border-dashed border-gray-100"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Next Item
                                </button>
                            </div>

                            {/* Summary & Payment Logic - Sticky Footer */}
                            <div className="mt-1 pt-1 border-t border-gray-100 bg-white z-20 sticky bottom-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                                    <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="checkbox"
                                                    id="pay-now"
                                                    checked={payNow}
                                                    onChange={e => {
                                                        setPayNow(e.target.checked);
                                                        if (e.target.checked) setAmountPaidNow(orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0) * (isVatInclusive ? (1 + vatRate / 100) : 1));
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                                />
                                                <label htmlFor="pay-now" className="text-[10px] font-black text-gray-900 cursor-pointer uppercase tracking-tight">Process Payment Now</label>
                                            </div>

                                            {!payNow && (
                                                <div className="bg-white p-1.5 rounded-lg border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-200 flex flex-col gap-1">
                                                    <label className="block text-[8px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                                        <Calendar className="w-2.5 h-2.5" /> SET DUE DATE *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={paymentDueDate}
                                                        onChange={e => setPaymentDueDate(e.target.value)}
                                                        className="w-full px-2 py-1 bg-indigo-50/30 rounded border border-transparent focus:border-indigo-200 outline-none text-[10px] font-bold text-indigo-700"
                                                        required
                                                    />
                                                    <p className="text-[8px] text-gray-400 flex items-center gap-1 px-1 font-bold">
                                                        <AlertCircle className="w-2.5 h-2.5" /> Notification on this date.
                                                    </p>
                                                </div>
                                            )}

                                            {payNow && (
                                                <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-300">
                                                    <div className="flex bg-white/50 p-0.5 rounded-lg border border-gray-200/50 gap-0.5">
                                                        {(['CASH', 'SYSTEM_ACCOUNT', 'CHEQUE'] as const).map((method) => (
                                                            <button
                                                                key={method}
                                                                onClick={() => setPaymentMethod(method)}
                                                                className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase tracking-tight transition-all ${paymentMethod === method ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-800'}`}
                                                            >
                                                                {method.replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {paymentMethod === 'CASH' && (
                                                        <p className="text-[8px] bg-amber-50 text-amber-700 p-1.5 rounded border border-amber-100 font-bold leading-tight">
                                                            Note: Cash payment recorded outside system accounts.
                                                        </p>
                                                    )}
                                                    {paymentMethod === 'CHEQUE' && (
                                                        <p className="text-[8px] bg-orange-50 text-orange-700 p-1.5 rounded border border-orange-100 font-bold flex items-start gap-1 leading-tight">
                                                            <AlertTriangle className="w-3 h-3 shrink-0" />
                                                            <span>Future due date = Post-dated (pending). Blank/Today = Immediate settlement.</span>
                                                        </p>
                                                    )}

                                                    {paymentMethod === 'SYSTEM_ACCOUNT' && (
                                                        <select
                                                            value={selectedPaymentAccount}
                                                            onChange={e => setSelectedPaymentAccount(e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm outline-none text-[10px] font-bold text-gray-800 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                        >
                                                            <option value="">-- Choose Account --</option>
                                                            {paymentAccounts.filter(p => p.is_active).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: ETB {Number(acc.balance).toLocaleString()})</option>)}
                                                        </select>
                                                    )}

                                                    {paymentMethod === 'CHEQUE' && (
                                                        <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-300">
                                                            <input
                                                                type="text"
                                                                placeholder="Bank Name"
                                                                value={chequeBank}
                                                                onChange={e => setChequeBank(e.target.value)}
                                                                className="px-2 py-1.5 bg-white rounded-lg border border-gray-100 outline-none text-[10px] font-bold"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Cheque Number"
                                                                value={chequeNumber}
                                                                onChange={e => setChequeNumber(e.target.value)}
                                                                className="px-2 py-1.5 bg-white rounded-lg border border-gray-100 outline-none text-[10px] font-bold"
                                                            />
                                                            <div className="col-span-2 flex items-center gap-1.5">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase w-16 shrink-0 leading-tight">Due Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={chequeDueDate}
                                                                    onChange={e => setChequeDueDate(e.target.value)}
                                                                    className="w-full px-2 py-1 bg-white rounded-lg border border-gray-100 outline-none text-[10px] font-bold"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="relative flex items-center">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase w-16 shrink-0 leading-tight">Amount</label>
                                                        <div className="relative flex items-center flex-1">
                                                            <span className="absolute left-2 font-black text-gray-400 text-[10px]">ETB</span>
                                                            <input
                                                                type="number"
                                                                value={amountPaidNow}
                                                                onChange={e => setAmountPaidNow(Number(e.target.value))}
                                                                className="w-full pl-8 pr-2 py-1 bg-white rounded-lg border border-transparent focus:border-indigo-400 outline-none text-xs font-black text-indigo-700 shadow-sm transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-2 rounded-lg border border-indigo-50 shadow-md flex flex-col justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span>Subtotal</span>
                                                <span className="text-gray-900 border-b border-indigo-50">ETB {orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {isVatInclusive && (
                                                <div className="flex justify-between items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                    <span>VAT ({vatRate}%)</span>
                                                    <span className="border-b border-indigo-50">ETB {(orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0) * (vatRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-col sm:flex-row justify-between items-stretch sm:items-end border-t border-gray-50 pt-1.5 gap-2">
                                            <div className="flex flex-col">
                                                <p className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em]">Final Payable</p>
                                                <p className="text-sm sm:text-base font-black text-gray-900 tracking-tighter">
                                                    ETB {(orderItems.reduce((s, i) => s + (i.quantity * i.unit_price), 0) * (isVatInclusive ? (1 + vatRate / 100) : 1)).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleRegisterPurchase}
                                                disabled={!supplierId || orderItems.some(i => !i.medicine_id)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-white shadow-sm transition-all active:scale-95 active:shadow-none disabled:opacity-20 disabled:grayscale border-b-2 flex items-center justify-center gap-1.5 ${poModalTab === 'COSMETIC'
                                                    ? 'bg-pink-600 hover:bg-pink-700 border-pink-900'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-950'
                                                    }`}
                                            >
                                                <PackageCheck className="w-3.5 h-3.5" /> REGISTER TO STOCK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReceiveModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in">
                    <div className="bg-white rounded-[1.5rem] p-4 sm:p-6 w-full max-w-5xl max-h-[94vh] overflow-y-auto shadow-2xl border border-white/20">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                                    <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600"><PackageCheck className="w-4.5 h-4.5 sm:w-5 h-5" /></div>
                                    Receive Delivery
                                </h2>
                                <p className="text-[9px] sm:text-xs font-bold text-gray-500 mt-1 tracking-wide">Ref. PO: <span className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-lg">{selectedPO.po_number}</span></p>
                            </div>
                            <button onClick={() => setShowReceiveModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors active:scale-95 ml-auto sm:ml-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-400 rounded-xl p-4 flex gap-3 mb-6 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                Confirming this delivery will <strong className="font-black text-amber-900">automatically</strong> instantiate new stock batches globally within your inventory platform and transition the PO status contextually. Accurate transcription of Batch Number and Expiry Date from the manufacturer is mandatory.
                            </p>
                        </div>

                        <div className="overflow-x-auto border border-gray-100 bg-gray-50/10 rounded-2xl p-1 hide-scrollbar">
                            <table className="w-full text-xs text-left">
                                <thead className="text-[9px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">Item Catalog</th>
                                        <th className="px-4 py-3 w-28 text-center text-amber-600">Pending</th>
                                        <th className="px-4 py-3 w-32">Now Receiving</th>
                                        <th className="px-4 py-3 min-w-[140px]">Batch # *</th>
                                        <th className="px-4 py-3 min-w-[140px]">Expiry *</th>
                                        <th className="px-4 py-3 w-32">Ret. Prc (ETB)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receiveData.map((item, index) => (
                                        <tr key={item.po_item_id} className={`transition-colors ${item.quantity_received > item.quantity_remaining ? "bg-rose-50/50" : "hover:bg-white"}`}>
                                            <td className="px-4 py-2.5 font-bold text-gray-800">{item.medicine_name}</td>
                                            <td className="px-4 py-2.5 font-black text-amber-600 text-center text-base">{item.quantity_remaining}</td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="number" min="0" max={item.quantity_remaining}
                                                    value={item.quantity_received}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].quantity_received = parseInt(e.target.value) || 0;
                                                        setReceiveData(data);
                                                    }}
                                                    className={`w-full px-3 py-1.5 outline-none font-black text-center transition-all bg-white rounded-lg shadow-sm border ${item.quantity_received > item.quantity_remaining ? 'border-rose-400 ring-2 ring-rose-50 text-rose-700' : 'border-transparent focus:ring-2 focus:ring-emerald-50 text-emerald-700'}`}
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="text" placeholder="BCH-..."
                                                    value={item.batch_number}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].batch_number = e.target.value;
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-3 py-1.5 outline-none font-bold placeholder-gray-300 transition-all bg-white border border-transparent focus:ring-2 focus:ring-emerald-50 rounded-lg shadow-sm text-gray-700 uppercase"
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="date"
                                                    value={item.expiry_date}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].expiry_date = e.target.value;
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-3 py-1.5 outline-none font-bold text-gray-700 transition-all bg-white border border-transparent focus:ring-2 focus:ring-emerald-50 rounded-lg shadow-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="number" step="0.01" min="0"
                                                    value={item.selling_price}
                                                    onChange={e => {
                                                        const data = [...receiveData];
                                                        data[index].selling_price = parseFloat(e.target.value);
                                                        setReceiveData(data);
                                                    }}
                                                    className="w-full px-3 py-1.5 outline-none font-black text-gray-800 text-right transition-all bg-white border border-transparent focus:ring-2 focus:ring-emerald-50 rounded-lg shadow-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowReceiveModal(false)}
                                className="px-5 py-2 bg-gray-100 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-200 transition-all active:scale-95">
                                Cancel
                            </button>
                            <button onClick={submitReceiveGoods}
                                className="px-7 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95 border-b-4 border-emerald-700 flex items-center gap-1.5">
                                Commit to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPaymentModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in">
                    <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                                <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600"><DollarSign className="w-4 h-4" /></div>
                                Finance Disbursement
                            </h2>
                            <button onClick={() => setShowPaymentModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors active:scale-95">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 pt-1">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 sm:p-5 rounded-2xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 opacity-10"><DollarSign className="w-32 h-32" /></div>
                                <p className="text-[9px] text-indigo-200 font-black uppercase tracking-widest mb-1 relative z-10">Payables Balance</p>
                                <p className="text-2xl font-black relative z-10 tracking-tight">ETB {(Number(selectedPO.total_amount) - Number(selectedPO.total_paid || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-bold text-indigo-100 relative z-10">
                                    <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">PO: {selectedPO.po_number}</span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 truncate max-w-[150px]">{selectedPO.supplier?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1 overflow-x-auto hide-scrollbar">
                                    {(['CASH', 'SYSTEM_ACCOUNT', 'CHEQUE'] as const).map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`flex-1 whitespace-nowrap px-2.5 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-tight transition-all ${paymentMethod === method ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-white hover:text-gray-800'}`}
                                        >
                                            {method.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'SYSTEM_ACCOUNT' && (
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Deduct From Account *</label>
                                        <select
                                            value={selectedPaymentAccount}
                                            onChange={e => setSelectedPaymentAccount(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold text-gray-800 transition-all cursor-pointer"
                                        >
                                            <option value="">-- Select Source Ledger --</option>
                                            {paymentAccounts.filter(p => p.is_active).map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.name} (Bal: ETB {Number(acc.balance).toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {paymentMethod === 'CHEQUE' && (
                                    <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                                        <input
                                            type="text"
                                            placeholder="Bank Name"
                                            value={chequeBank}
                                            onChange={e => setChequeBank(e.target.value)}
                                            className="px-3 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-300 outline-none text-xs font-bold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Cheque Number"
                                            value={chequeNumber}
                                            onChange={e => setChequeNumber(e.target.value)}
                                            className="px-3 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-300 outline-none text-xs font-bold"
                                        />
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Due Date</label>
                                            <input
                                                type="date"
                                                value={chequeDueDate}
                                                onChange={e => setChequeDueDate(e.target.value)}
                                                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-300 outline-none text-xs font-bold text-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'CASH' && (
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold flex items-start gap-3">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <p>Cash payments will be recorded as a manual reference note on this Purchase Order for accounting records.</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Disbursement Amount *</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">ETB</span>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={e => setPaymentAmount(Number(e.target.value))}
                                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none text-lg font-black text-gray-900 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={handleRecordPayment}
                                disabled={paymentAmount <= 0 || (paymentMethod === 'SYSTEM_ACCOUNT' && !selectedPaymentAccount)}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50 disabled:shadow-none border-b-4 border-red-800">
                                {paymentMethod === 'SYSTEM_ACCOUNT' ? 'Authorize Deduction' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReceivedHistoryModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in">
                    <div className="bg-white rounded-[1.5rem] p-4 sm:p-6 w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 text-gray-900">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                                    <div className="p-1.5 rounded-xl bg-gray-100 text-gray-600"><Eye className="w-4 h-4" /></div>
                                    Receipt Manifest
                                </h2>
                                <p className="text-[10px] font-bold text-gray-500 mt-1 tracking-wide">REF. PO: <span className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-lg">{selectedPO.po_number}</span></p>
                            </div>
                            <button onClick={() => setShowReceivedHistoryModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors active:scale-95 ml-auto sm:ml-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cheque Tracking Card (shown for post-dated cheques) */}
                        {selectedPO.payment_method === 'CHEQUE' && selectedPO.cheque_status && (
                            <div className={`mb-3.5 p-3 rounded-xl border animate-in slide-in-from-top-4 duration-300 ${selectedPO.cheque_status === 'CLEARED' ? 'bg-emerald-50 border-emerald-200'
                                    : selectedPO.cheque_status === 'BOUNCED' ? 'bg-rose-50 border-rose-200'
                                        : 'bg-orange-50 border-orange-200'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Banknote className={`w-4 h-4 ${selectedPO.cheque_status === 'CLEARED' ? 'text-emerald-600'
                                                : selectedPO.cheque_status === 'BOUNCED' ? 'text-rose-600'
                                                    : 'text-orange-600'
                                            }`} />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-700">Post-Dated Cheque</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${selectedPO.cheque_status === 'CLEARED' ? 'bg-emerald-600 text-white'
                                            : selectedPO.cheque_status === 'BOUNCED' ? 'bg-rose-600 text-white'
                                                : 'bg-orange-500 text-white'
                                        }`}>
                                        {selectedPO.cheque_status === 'CLEARED' ? '✅ CLEARED' : selectedPO.cheque_status === 'BOUNCED' ? '🚨 BOUNCED' : '🕐 PENDING'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                                    <div><p className="text-gray-400 font-black uppercase">Bank</p><p className="font-bold text-gray-800">{selectedPO.cheque_bank_name || '—'}</p></div>
                                    <div><p className="text-gray-400 font-black uppercase">Cheque #</p><p className="font-bold text-gray-800 font-mono">{selectedPO.cheque_number || '—'}</p></div>
                                    <div><p className="text-gray-400 font-black uppercase">Amount</p><p className="font-bold text-gray-800">ETB {Number(selectedPO.cheque_amount || selectedPO.total_amount).toLocaleString()}</p></div>
                                    <div>
                                        <p className="text-gray-400 font-black uppercase">Due Date</p>
                                        <p className="font-bold text-gray-800">{selectedPO.cheque_due_date ? formatDate(selectedPO.cheque_due_date) : '—'}</p>
                                        {selectedPO.cheque_due_date && selectedPO.cheque_status === 'PENDING' && (() => {
                                            const diff = new Date(selectedPO.cheque_due_date).getTime() - new Date().setHours(0, 0, 0, 0);
                                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                            return <p className={`text-[9px] font-black mt-0.5 ${days <= 0 ? 'text-rose-600' : days <= 3 ? 'text-orange-600' : 'text-blue-600'}`}>
                                                {days === 0 ? 'Due Today' : days < 0 ? `${Math.abs(days)}d Overdue` : `${days}d remaining`}
                                            </p>;
                                        })()}
                                    </div>
                                </div>
                                {selectedPO.cheque_status === 'PENDING' && role === 'ADMIN' && (
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => { handleConfirmChequeClearance(selectedPO); setShowReceivedHistoryModal(false); }}
                                            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5">
                                            <CheckSquare className="w-3.5 h-3.5" /> Confirm Clearance
                                        </button>
                                        <button onClick={() => { handleBounceCheque(selectedPO); setShowReceivedHistoryModal(false); }}
                                            className="flex-1 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black uppercase hover:bg-rose-100 border border-rose-200 transition-all flex items-center justify-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Bounce Cheque
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedPO.payment_status !== 'PAID' && selectedPO.payment_status !== 'CHEQUE_ISSUED' && selectedPO.payment_due_date && (
                            <div className={`mb-3.5 p-2 rounded-xl flex items-center justify-between border animate-in slide-in-from-top-4 duration-300 ${new Date(selectedPO.payment_due_date) < new Date(new Date().setHours(0, 0, 0, 0))
                                ? 'bg-rose-50 border-rose-100 text-rose-700'
                                : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                                }`}>
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg ${new Date(selectedPO.payment_due_date) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'bg-rose-100' : 'bg-indigo-100'}`}>
                                        <Clock className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                            {new Date(selectedPO.payment_due_date) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'Overdue' : 'Upcoming'}
                                        </p>
                                        <p className="text-xs font-black">
                                            Due: {formatDate(selectedPO.payment_due_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {(() => {
                                        const diff = new Date(selectedPO.payment_due_date).getTime() - new Date().setHours(0, 0, 0, 0);
                                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                        return (
                                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${days < 0 ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-indigo-600 text-white'
                                                }`}>
                                                {days === 0 ? 'Due Today' : (days < 0 ? `${Math.abs(days)}d Overdue` : `${days}d Left`)}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto border border-gray-100 bg-gray-50 rounded-2xl flex-1 hide-scrollbar shadow-inner mt-1">
                            <table className="w-full text-xs text-left">
                                <thead className="text-[9px] uppercase font-black text-gray-900 tracking-widest border-b border-gray-100 sticky top-0 bg-white z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="px-4 py-3">Item Manifest</th>
                                        <th className="px-3 py-3 font-black">Quantity</th>
                                        <th className="px-3 py-3 font-black">Price</th>
                                        <th className="px-3 py-3 font-black text-center">Batch#</th>
                                        <th className="px-3 py-3 font-black text-center">Expiry</th>
                                        <th className="px-4 py-3 text-right font-black">Ext. Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receiveData.map((item, index) => (
                                        <tr key={index} className="hover:bg-indigo-50/10 transition-colors bg-white/40">
                                            <td className="px-3 py-2">
                                                <p className="font-black text-gray-700 text-[11px] uppercase tracking-tight">{item.medicine?.name || 'Unknown Item'}</p>
                                                <p className="text-[9px] text-indigo-500 font-black tracking-widest uppercase">{item.medicine?.sku}</p>
                                            </td>
                                            <td className="px-3 py-2 font-black text-gray-700 text-[11px]">{item.quantity_ordered} <span className="text-[8px] text-gray-400 font-black uppercase">{item.medicine?.unit}</span></td>
                                            <td className="px-3 py-2 font-black text-gray-700 text-[10px]">ETB {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-3 py-2 text-center"><span className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-black">{item.batch_number || '---'}</span></td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="text-[9px] font-black text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">
                                                    {item.expiry_date ? formatDate(item.expiry_date) : 'NON-EXPIRABLE'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right font-black text-indigo-700 text-[12px] tracking-tight">
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

                        <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Invoice Value</span>
                                <span className="text-xl font-black text-gray-900">ETB {Number(selectedPO.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <button onClick={() => setShowReceivedHistoryModal(false)}
                                className="px-8 py-2.5 bg-gray-900 border border-transparent text-white rounded-xl text-xs font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/20">
                                Close Manifest
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
