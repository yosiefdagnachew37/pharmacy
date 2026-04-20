import { useState, useEffect, useMemo } from 'react';
import {
    Search, Users, TrendingDown, Clock, ShieldAlert, FileText, CheckCircle, Wallet, X
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';
import { formatDate } from '../utils/dateUtils';
import ColumnFilter from '../components/ColumnFilter';

const CreditManagement = () => {
    const { role } = useAuth();
    const [customers, setCustomers] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [creditRecords, setCreditRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'RECORDS'>('CUSTOMERS');

    // Repayment form
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');

    // Accounts
    const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);

    // ─── Column Filters ──────────────────────────────────────────
    const [customerFilters, setCustomerFilters] = useState<Record<string, string[]>>({
        name: [],
        phone: [],
        lastActivity: [],
        status: [],
    });

    const [recordFilters, setRecordFilters] = useState<Record<string, string[]>>({
        date: [],
        receipt: [],
        customer: [],
        dueDate: [],
        status: [],
    });

    const fetchData = async () => {
        try {
            const [custRes, sumRes, recordRes, accRes] = await Promise.all([
                client.get('/credit/customers'),
                client.get('/credit/summary'),
                client.get('/credit/records'),
                client.get('/payment-accounts')
            ]);
            setCustomers(custRes.data);
            setSummary(sumRes.data);
            setCreditRecords(recordRes.data);
            setPaymentAccounts(accRes.data || []);
        } catch (err) {
            console.error('Failed to load credit data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleProcessPayment = async () => {
        if (!selectedPaymentAccount) {
            toastError('Validation', 'Please select a destination payment account.');
            return;
        }

        try {
            await client.post('/credit/payments', {
                customerId: selectedCustomer.id,
                amount: parseFloat(paymentAmount),
                paymentMethod,
                referenceNumber,
                payment_account_id: selectedPaymentAccount
            });
            setShowPayModal(false);
            resetForm();
            fetchData();
            toastSuccess('Repayment processed successfully.');
        } catch (err: any) {
            console.error('Failed to process payment', err);
            const msg = extractErrorMessage(err, 'Error processing payment.');
            toastError('Payment failed', msg);
        }
    };

    const openPaymentModal = async (c: any) => {
        try {
            const { data } = await client.get(`/credit/customers/${c.id}`);
            setSelectedCustomer(data);
            setPaymentAmount(String(data.total_credit)); // default to full payment
            setShowPayModal(true);
        } catch (error) {
            console.error('Failed to load customer details', error);
        }
    };

    const resetForm = () => {
        setPaymentAmount('');
        setPaymentMethod('CASH');
        setSelectedPaymentAccount('');
        setReferenceNumber('');
    };

    // ─── Unique Options & Filtering ──────────────────────────────
    const uniqueCustomerNames = useMemo(() => [...new Set(customers.map(c => c.name))].sort(), [customers]);
    const uniqueCustomerPhones = useMemo(() => [...new Set(customers.map(c => c.phone || 'N/A'))].sort(), [customers]);
    const uniqueCustomerLastActivities = useMemo(() => [...new Set(customers.map(c => formatDate(c.updated_at)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [customers]);
    const uniqueCustomerStatuses = useMemo(() => ['DEBT', 'CLEARED'], []);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search));
            const cStatus = Number(c.total_credit) > 0 ? 'DEBT' : 'CLEARED';
            const cPhone = c.phone || 'N/A';
            const cDate = formatDate(c.updated_at);

            const matchesName = customerFilters.name.length === 0 || customerFilters.name.includes(c.name);
            const matchesPhone = customerFilters.phone.length === 0 || customerFilters.phone.includes(cPhone);
            const matchesLastActivity = customerFilters.lastActivity.length === 0 || customerFilters.lastActivity.includes(cDate);
            const matchesStatus = customerFilters.status.length === 0 || customerFilters.status.includes(cStatus);

            return matchesSearch && matchesName && matchesPhone && matchesLastActivity && matchesStatus;
        });
    }, [customers, search, customerFilters]);

    const uniqueRecordDates = useMemo(() => [...new Set(creditRecords.map(r => formatDate(r.created_at)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [creditRecords]);
    const uniqueRecordReceipts = useMemo(() => [...new Set(creditRecords.map(r => r.sale?.receipt_number || 'N/A'))].sort(), [creditRecords]);
    const uniqueRecordCustomers = useMemo(() => [...new Set(creditRecords.map(r => r.customer?.name))].sort(), [creditRecords]);
    const uniqueRecordDueDates = useMemo(() => [...new Set(creditRecords.map(r => formatDate(r.due_date)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [creditRecords]);
    const uniqueRecordStatuses = useMemo(() => [...new Set(creditRecords.map(r => r.status))].sort(), [creditRecords]);

    const filteredRecordsMemo = useMemo(() => {
        return creditRecords.filter(r => {
            const matchesSearch = r.customer?.name.toLowerCase().includes(search.toLowerCase()) || (r.sale?.receipt_number && r.sale.receipt_number.toLowerCase().includes(search.toLowerCase()));
            const rDate = formatDate(r.created_at);
            const rReceipt = r.sale?.receipt_number || 'N/A';
            const rCustomer = r.customer?.name;
            const rDueDate = formatDate(r.due_date);

            const matchesDate = recordFilters.date.length === 0 || recordFilters.date.includes(rDate);
            const matchesReceipt = recordFilters.receipt.length === 0 || recordFilters.receipt.includes(rReceipt);
            const matchesCustomer = recordFilters.customer.length === 0 || recordFilters.customer.includes(rCustomer);
            const matchesDueDate = recordFilters.dueDate.length === 0 || recordFilters.dueDate.includes(rDueDate);
            const matchesStatus = recordFilters.status.length === 0 || recordFilters.status.includes(r.status);

            return matchesSearch && matchesDate && matchesReceipt && matchesCustomer && matchesDueDate && matchesStatus;
        });
    }, [creditRecords, search, recordFilters]);

    const updateCustomerFilter = (column: string, values: string[]) => {
        setCustomerFilters(prev => ({ ...prev, [column]: values }));
    };

    const updateRecordFilter = (column: string, values: string[]) => {
        setRecordFilters(prev => ({ ...prev, [column]: values }));
    };

    const activeCustomerFilterCount = Object.values(customerFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);
    const activeRecordFilterCount = Object.values(recordFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                <div>
                    <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Credit Management</h1>
                    <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">Receivables & Debt Monitoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-500 shrink-0">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.1em] mb-0.5">Total Outstanding Credit</p>
                        <p className="text-xl font-black text-gray-900 tracking-tight">ETB {Number(summary?.total_outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className={`rounded-2xl p-4 shadow-sm border flex items-center gap-3 transition-colors ${summary?.overdue_count > 0 ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-gray-50'}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${summary?.overdue_count > 0 ? 'bg-white text-rose-500 shadow-sm' : 'bg-emerald-50 text-emerald-500'}`}>
                        {summary?.overdue_count > 0 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className={`text-[9px] font-black uppercase tracking-[0.1em] mb-0.5 ${summary?.overdue_count > 0 ? 'text-rose-400' : 'text-gray-600'}`}>Overdue Accounts</p>
                        <p className={`text-xl font-black tracking-tight ${summary?.overdue_count > 0 ? 'text-rose-700' : 'text-gray-900'}`}>{summary?.overdue_count || 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex space-x-1 border-b border-gray-50">
                <button
                    onClick={() => setActiveTab('CUSTOMERS')}
                    className={`px-4 py-2 text-[10px] font-black border-b-2 transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'CUSTOMERS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Users className="w-3.5 h-3.5" /> Customer Debtors ({customers.length})
                </button>
                <button
                    onClick={() => setActiveTab('RECORDS')}
                    className={`px-4 py-2 text-[10px] font-black border-b-2 transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'RECORDS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Clock className="w-3.5 h-3.5" /> Credit History ({creditRecords.length})
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'CUSTOMERS' ? 'customers' : 'receipts or names'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-white rounded-xl border border-gray-100 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none text-[11px] font-medium"
                    />
                </div>
                {activeTab === 'CUSTOMERS' && activeCustomerFilterCount > 0 && (
                    <button
                        onClick={() => setCustomerFilters({ name: [], phone: [], lastActivity: [], status: [] })}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap uppercase tracking-widest"
                    >
                        Reset ({activeCustomerFilterCount})
                    </button>
                )}
                {activeTab === 'RECORDS' && activeRecordFilterCount > 0 && (
                    <button
                        onClick={() => setRecordFilters({ date: [], receipt: [], customer: [], dueDate: [], status: [] })}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap uppercase tracking-widest"
                    >
                        Reset ({activeRecordFilterCount})
                    </button>
                )}
            </div>

            {activeTab === 'CUSTOMERS' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-visible">
                    <div className="hidden md:block overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[9px] font-black tracking-widest sticky top-0 z-30 border-b border-gray-50/50">
                                <tr>
                                    <ColumnFilter
                                        label="Customer Name"
                                        options={uniqueCustomerNames}
                                        selectedValues={customerFilters.name}
                                        onFilterChange={(v) => updateCustomerFilter('name', v)}
                                        className="px-2 py-2"
                                    />
                                    <ColumnFilter
                                        label="Phone"
                                        options={uniqueCustomerPhones}
                                        selectedValues={customerFilters.phone}
                                        onFilterChange={(v) => updateCustomerFilter('phone', v)}
                                        className="px-2 py-2"
                                    />
                                    <ColumnFilter
                                        label="Last Activity"
                                        options={uniqueCustomerLastActivities}
                                        selectedValues={customerFilters.lastActivity}
                                        onFilterChange={(v) => updateCustomerFilter('lastActivity', v)}
                                        className="px-2 py-2"
                                    />
                                    <th className="px-2 py-2">Total Outstanding Balance</th>
                                    <ColumnFilter
                                        label="Status"
                                        options={uniqueCustomerStatuses}
                                        selectedValues={customerFilters.status}
                                        onFilterChange={(v) => updateCustomerFilter('status', v)}
                                        className="px-2 py-2"
                                    />
                                    <th className="px-2 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCustomers.map((c) => {
                                    const hasDebt = Number(c.total_credit) > 0;
                                    return (
                                        <tr key={c.id} className="hover:bg-indigo-50/20 transition-colors group">
                                            <td className="px-2 py-1.5 font-black text-gray-900 text-[11px] tracking-tight">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors" /> {c.name}
                                                </div>
                                            </td>

                                            <td className="px-2 py-1.5 text-gray-500 font-medium text-[10px] uppercase tracking-tighter">{c.phone || '-'}</td>

                                            <td className="px-2 py-1.5 text-gray-400 text-[9px] font-black uppercase tracking-widest">
                                                {formatDate(c.updated_at)}
                                            </td>

                                            <td className="px-2 py-1.5 text-[11px] tracking-tight">
                                                {hasDebt ? (
                                                    <span className="font-black text-rose-600">ETB {Number(c.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span className="font-bold text-gray-300">0.00</span>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                {hasDebt ? (
                                                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black rounded border border-rose-100/50 uppercase tracking-widest">
                                                        Arrears
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded border border-emerald-100/50 uppercase tracking-widest">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5 text-right">
                                                {hasDebt && (role === 'ADMIN' || role === 'PHARMACIST' || role === 'CASHIER') && (
                                                    <button
                                                        onClick={() => openPaymentModal(c)}
                                                        className="px-2.5 py-1 text-[9px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-100 uppercase tracking-widest active:scale-95"
                                                    >
                                                        Repay
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest text-[10px] font-black">
                                            No debtors found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View for CUSTOMERS */}
                    <div className="md:hidden p-3 space-y-2.5 bg-gray-50/10">
                        {filteredCustomers.length === 0 ? (
                            <div className="py-12 text-center text-[10px] uppercase font-black text-gray-400 tracking-widest">
                                Empty Registry
                            </div>
                        ) : (
                            filteredCustomers.map((c) => {
                                const hasDebt = Number(c.total_credit) > 0;
                                return (
                                    <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-50 p-3 flex flex-col gap-2.5">
                                        <div className="flex justify-between items-start border-b border-gray-50 pb-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8.5 h-8.5 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-[13px] tracking-tight">{c.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{c.phone || 'NO RECORDED MOBILE'}</p>
                                                </div>
                                            </div>
                                            {hasDebt ? (
                                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[7px] font-black rounded border border-rose-100/50 uppercase tracking-widest">
                                                    Arrears
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-black rounded border border-emerald-100/50 uppercase tracking-widest">
                                                    Cleared
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-50">
                                            <div>
                                                <p className="text-[8px] uppercase font-black text-gray-400 tracking-[0.05em] mb-0.5">Outstanding</p>
                                                {hasDebt ? (
                                                    <p className="font-black text-rose-600 text-sm tracking-tight">ETB {Number(c.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                ) : (
                                                    <p className="font-black text-gray-300 text-sm tracking-tight">ETB 0.00</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] uppercase font-black text-gray-400 tracking-[0.05em] mb-0.5">Updated</p>
                                                <p className="font-black text-gray-700 text-[10px] opacity-60">{formatDate(c.updated_at)}</p>
                                            </div>
                                        </div>
                                        {hasDebt && (role === 'ADMIN' || role === 'PHARMACIST' || role === 'CASHIER') && (
                                            <div className="pt-0.5">
                                                <button
                                                    onClick={() => openPaymentModal(c)}
                                                    className="w-full py-2 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-[0.98]"
                                                >
                                                    <Wallet className="w-3.5 h-3.5" /> Process Repayment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'RECORDS' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-visible">
                    <div className="hidden md:block overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[9px] font-black tracking-widest sticky top-0 z-30 border-b border-gray-50/50">
                                <tr>
                                    <ColumnFilter
                                        label="Date"
                                        options={uniqueRecordDates}
                                        selectedValues={recordFilters.date}
                                        onFilterChange={(v) => updateRecordFilter('date', v)}
                                        className="px-2 py-2"
                                    />
                                    <ColumnFilter
                                        label="Receipt #"
                                        options={uniqueRecordReceipts}
                                        selectedValues={recordFilters.receipt}
                                        onFilterChange={(v) => updateRecordFilter('receipt', v)}
                                        className="px-2 py-2"
                                    />
                                    <ColumnFilter
                                        label="Customer"
                                        options={uniqueRecordCustomers}
                                        selectedValues={recordFilters.customer}
                                        onFilterChange={(v) => updateRecordFilter('customer', v)}
                                        className="px-2 py-2"
                                    />
                                    <th className="px-2 py-2">Original Amount</th>
                                    <th className="px-2 py-2">Balance Due</th>
                                    <ColumnFilter
                                        label="Due Date"
                                        options={uniqueRecordDueDates}
                                        selectedValues={recordFilters.dueDate}
                                        onFilterChange={(v) => updateRecordFilter('dueDate', v)}
                                        className="px-2 py-2"
                                    />
                                    <ColumnFilter
                                        label="Status"
                                        options={uniqueRecordStatuses}
                                        selectedValues={recordFilters.status}
                                        onFilterChange={(v) => updateRecordFilter('status', v)}
                                        align="right"
                                        className="px-2 py-2"
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRecordsMemo.map((r) => (
                                    <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors group">
                                        <td className="px-2 py-1.5 text-gray-400 text-[9px] font-black uppercase tracking-tighter opacity-60">
                                            {formatDate(r.created_at)}
                                        </td>
                                        <td className="px-2 py-1.5 font-mono font-black text-indigo-500 text-[10px] tracking-widest">
                                            {r.sale?.receipt_number || 'N/A'}
                                        </td>
                                        <td className="px-2 py-1.5 font-black text-gray-900 text-[11px] tracking-tight truncate max-w-[120px]">
                                            {r.customer?.name}
                                        </td>
                                        <td className="px-2 py-1.5 text-gray-500 font-medium text-[10px] uppercase tracking-tighter">
                                            {Number(r.original_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2 py-1.5 font-black text-gray-900 text-[11px] tracking-tight">
                                            ETB {(Number(r.original_amount) - Number(r.paid_amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2 py-1.5 text-gray-400 text-[9px] font-black uppercase tracking-tighter">
                                            {new Date(r.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1.5 text-right">
                                            <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${r.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                r.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                    'bg-rose-50 text-rose-600 border-rose-100/50'
                                                } tracking-widest`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecordsMemo.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Operation history empty
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View for RECORDS */}
                    <div className="md:hidden p-3 space-y-2.5 bg-gray-50/10">
                        {filteredRecordsMemo.length === 0 ? (
                            <div className="py-12 text-center text-[10px] uppercase font-black text-gray-400 tracking-widest">
                                Registry Clear
                            </div>
                        ) : (
                            filteredRecordsMemo.map((r) => (
                                <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-50 p-3 flex flex-col gap-2.5">
                                    <div className="flex justify-between items-start border-b border-gray-50 pb-2.5">
                                        <div>
                                            <p className="font-mono text-[10px] font-black text-indigo-500 tracking-widest uppercase">{r.sale?.receipt_number || 'N/A'}</p>
                                            <p className="font-black text-gray-900 text-[13px] mt-0.5 tracking-tight">{r.customer?.name}</p>
                                        </div>
                                        <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase rounded border tracking-widest ${r.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                            r.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                'bg-rose-50 text-rose-600 border-rose-100/50'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-gray-50/50 p-2.5 rounded-lg border border-gray-50">
                                        <div>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 opacity-60">Base exposure</span>
                                            <span className="font-black text-gray-600 text-[10px] tracking-tight">ETB {Number(r.original_amount).toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest block mb-0.5">Due focus</span>
                                            <span className="font-black text-rose-600 text-[10px] tracking-tight">ETB {(Number(r.original_amount) - Number(r.paid_amount)).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 opacity-60">Created</span>
                                            <span className="font-black text-gray-700 text-[9px] uppercase tracking-tighter opacity-70">{new Date(r.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">Maturity</span>
                                            <span className="font-black text-amber-600 text-[9px] tracking-tighter uppercase">{new Date(r.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* PROCESS REPAYMENT MODAL */}
            {showPayModal && selectedCustomer && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                        <div className="flex justify-between items-center p-4 border-b border-gray-50">
                            <div>
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-indigo-500" /> Credit Settlement
                                </h2>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Applying repayment for {selectedCustomer.name}</p>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-300 hover:text-rose-500" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer Entity</span>
                                    <span className="text-[11px] font-black text-indigo-900 uppercase tracking-tight">{selectedCustomer.name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-indigo-100/50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Outstanding balance</span>
                                    <span className="text-sm font-black text-rose-600 tracking-tight">
                                        ETB {Number(selectedCustomer.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Repayment Sum (ETB)</label>
                                    <input
                                        type="number" step="0.01" min="0.01" max={selectedCustomer.total_credit} required
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none text-xs font-black text-indigo-600 placeholder:text-gray-200"
                                    />
                                    <p className="text-[8px] text-gray-400 mt-1.5 px-1 font-bold uppercase tracking-tighter opacity-60 italic">Repayment cascades from oldest due items automatically.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3.5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none text-[11px] font-black uppercase tracking-widest appearance-none bg-white"
                                        >
                                            <option value="CASH">Liquid Cash</option>
                                            <option value="CHEQUE">Bank Cheque</option>
                                            <option value="BANK_TRANSFER">Direct Transfer</option>
                                            <option value="MOBILE_PAYMENT">Digital Wallet</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Internal Ledger (Deposit)</label>
                                        <select
                                            value={selectedPaymentAccount}
                                            onChange={e => setSelectedPaymentAccount(e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/20 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none text-[11px] font-black uppercase tracking-widest appearance-none"
                                        >
                                            <option value="">-- Choose Account --</option>
                                            {paymentAccounts.filter(p => p.is_active).map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.name} · ETB {Number(acc.balance).toLocaleString()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {(paymentMethod === 'CHEQUE' || paymentMethod === 'BANK_TRANSFER') && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ref / Serial #</label>
                                        <input
                                            type="text" required
                                            value={referenceNumber}
                                            onChange={e => setReferenceNumber(e.target.value)}
                                            placeholder="Alpha-numeric reference"
                                            className="w-full px-3.5 py-2 rounded-xl border border-gray-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none text-xs font-black placeholder:text-gray-200"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 mt-2 flex gap-2.5">
                            <button onClick={() => setShowPayModal(false)}
                                className="flex-1 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-[0.98]">
                                Discard
                            </button>
                            <button onClick={handleProcessPayment}
                                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > selectedCustomer.total_credit}
                                className="flex-[2] py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-30">
                                Apply Repayment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditManagement;
