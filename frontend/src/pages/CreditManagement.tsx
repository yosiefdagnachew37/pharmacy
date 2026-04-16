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
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Customer Credit Management</h1>
                    <p className="text-gray-500 mt-1">Track outstanding balances, handle payments, and monitor overdue accounts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <TrendingDown className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Outstanding Credit</p>
                        <p className="text-3xl font-bold text-gray-800">ETB {Number(summary?.total_outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className={`rounded-3xl p-6 shadow-sm border flex items-center gap-4 ${summary?.overdue_count > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-gray-50'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${summary?.overdue_count > 0 ? 'bg-white text-rose-600' : 'bg-green-50 text-green-600'}`}>
                        {summary?.overdue_count > 0 ? <ShieldAlert className="w-7 h-7" /> : <CheckCircle className="w-7 h-7" />}
                    </div>
                    <div>
                        <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${summary?.overdue_count > 0 ? 'text-rose-500' : 'text-gray-400'}`}>Overdue Accounts</p>
                        <p className={`text-3xl font-bold ${summary?.overdue_count > 0 ? 'text-rose-700' : 'text-gray-800'}`}>{summary?.overdue_count || 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex space-x-2 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('CUSTOMERS')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CUSTOMERS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Users className="w-4 h-4" /> Customer Debtors ({customers.length})
                </button>
                <button
                    onClick={() => setActiveTab('RECORDS')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'RECORDS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Clock className="w-4 h-4" /> Credit History ({creditRecords.length})
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'CUSTOMERS' ? 'customers' : 'receipts or customers'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                    />
                </div>
                {activeTab === 'CUSTOMERS' && activeCustomerFilterCount > 0 && (
                    <button
                        onClick={() => setCustomerFilters({ name: [], phone: [], lastActivity: [], status: [] })}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                        Clear All Filters ({activeCustomerFilterCount})
                    </button>
                )}
                {activeTab === 'RECORDS' && activeRecordFilterCount > 0 && (
                    <button
                        onClick={() => setRecordFilters({ date: [], receipt: [], customer: [], dueDate: [], status: [] })}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                        Clear All Filters ({activeRecordFilterCount})
                    </button>
                )}
            </div>

            {activeTab === 'CUSTOMERS' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-visible">
                    <div className="hidden md:block overflow-x-auto min-h-[400px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold tracking-wider sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <ColumnFilter
                                        label="Customer Name"
                                        options={uniqueCustomerNames}
                                        selectedValues={customerFilters.name}
                                        onFilterChange={(v) => updateCustomerFilter('name', v)}
                                    />
                                    <ColumnFilter
                                        label="Phone"
                                        options={uniqueCustomerPhones}
                                        selectedValues={customerFilters.phone}
                                        onFilterChange={(v) => updateCustomerFilter('phone', v)}
                                    />
                                    <ColumnFilter
                                        label="Last Activity"
                                        options={uniqueCustomerLastActivities}
                                        selectedValues={customerFilters.lastActivity}
                                        onFilterChange={(v) => updateCustomerFilter('lastActivity', v)}
                                    />
                                    <th className="px-6 py-4">Total Outstanding Balance</th>
                                    <ColumnFilter
                                        label="Status"
                                        options={uniqueCustomerStatuses}
                                        selectedValues={customerFilters.status}
                                        onFilterChange={(v) => updateCustomerFilter('status', v)}
                                    />
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCustomers.map((c) => {
                                    const hasDebt = Number(c.total_credit) > 0;
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* 1. Name */}
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" /> {c.name}
                                                </div>
                                            </td>
                                            
                                            {/* 2. Phone */}
                                            <td className="px-6 py-4 text-gray-600 font-medium">{c.phone || '-'}</td>
                                            
                                            {/* 3. Activity */}
                                            <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                                {formatDate(c.updated_at)}
                                            </td>
                                            
                                            {/* 4. Balance */}
                                            <td className="px-6 py-4">
                                                {hasDebt ? (
                                                    <span className="font-bold text-rose-600">ETB {Number(c.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span className="font-bold text-gray-400">0.00</span>
                                                )}
                                            </td>
                                            
                                            {/* 5. Status */}
                                            <td className="px-6 py-4">
                                                {hasDebt ? (
                                                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-lg border border-rose-100 uppercase tracking-widest">
                                                        Due Debt
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">
                                                        Cleared
                                                    </span>
                                                )}
                                            </td>
                                            
                                            {/* 6. Actions */}
                                            <td className="px-6 py-4 text-right">
                                                {hasDebt && (role === 'ADMIN' || role === 'PHARMACIST' || role === 'CASHIER') && (
                                                    <button
                                                        onClick={() => openPaymentModal(c)}
                                                        className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 shadow-sm whitespace-nowrap"
                                                    >
                                                        Process Repayment
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                            <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                            No customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mobile Card View for CUSTOMERS */}
                    <div className="md:hidden p-4 space-y-3 bg-gray-50/50">
                        {filteredCustomers.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic">
                                <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                No customers found.
                            </div>
                        ) : (
                            filteredCustomers.map((c) => {
                                const hasDebt = Number(c.total_credit) > 0;
                                return (
                                    <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{c.phone || 'No phone'}</p>
                                                </div>
                                            </div>
                                            {hasDebt ? (
                                                <span className="px-2 py-1 bg-rose-50 text-rose-700 text-[9px] font-black rounded border border-rose-100 uppercase tracking-widest">
                                                    Due Debt
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded border border-emerald-100 uppercase tracking-widest">
                                                    Cleared
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Balance Due</p>
                                                {hasDebt ? (
                                                    <p className="font-black text-rose-600 text-base">ETB {Number(c.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                ) : (
                                                    <p className="font-bold text-gray-400 text-base">ETB 0.00</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Activity</p>
                                                <p className="font-bold text-gray-700 text-sm">{formatDate(c.updated_at)}</p>
                                            </div>
                                        </div>
                                        {hasDebt && (role === 'ADMIN' || role === 'PHARMACIST' || role === 'CASHIER') && (
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => openPaymentModal(c)}
                                                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors active:scale-95"
                                                >
                                                    <Wallet className="w-4 h-4" /> Process Repayment
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
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-visible">
                    <div className="hidden md:block overflow-x-auto min-h-[400px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold tracking-wider sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <ColumnFilter
                                        label="Date"
                                        options={uniqueRecordDates}
                                        selectedValues={recordFilters.date}
                                        onFilterChange={(v) => updateRecordFilter('date', v)}
                                    />
                                    <ColumnFilter
                                        label="Receipt #"
                                        options={uniqueRecordReceipts}
                                        selectedValues={recordFilters.receipt}
                                        onFilterChange={(v) => updateRecordFilter('receipt', v)}
                                    />
                                    <ColumnFilter
                                        label="Customer"
                                        options={uniqueRecordCustomers}
                                        selectedValues={recordFilters.customer}
                                        onFilterChange={(v) => updateRecordFilter('customer', v)}
                                    />
                                    <th className="px-6 py-4">Original Amount</th>
                                    <th className="px-6 py-4">Balance Due</th>
                                    <ColumnFilter
                                        label="Due Date"
                                        options={uniqueRecordDueDates}
                                        selectedValues={recordFilters.dueDate}
                                        onFilterChange={(v) => updateRecordFilter('dueDate', v)}
                                    />
                                    <ColumnFilter
                                        label="Status"
                                        options={uniqueRecordStatuses}
                                        selectedValues={recordFilters.status}
                                        onFilterChange={(v) => updateRecordFilter('status', v)}
                                        align="right"
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecordsMemo.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                            {formatDate(r.created_at)}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                                            {r.sale?.receipt_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {r.customer?.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            ETB {Number(r.original_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900">
                                            ETB {(Number(r.original_amount) - Number(r.paid_amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {new Date(r.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${r.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    r.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecordsMemo.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                                            <Clock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                            No credit sales found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mobile Card View for RECORDS */}
                    <div className="md:hidden p-4 space-y-3 bg-gray-50/50">
                        {filteredRecordsMemo.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic">
                                <Clock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                No credit sales found.
                            </div>
                        ) : (
                            filteredRecordsMemo.map((r) => (
                                <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                        <div>
                                            <p className="font-mono text-xs font-black text-indigo-600 tracking-wider font-mono">{r.sale?.receipt_number || 'N/A'}</p>
                                            <p className="font-bold text-gray-800 text-sm mt-0.5">{r.customer?.name}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-[9px] font-black uppercase rounded border tracking-widest ${r.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                r.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Original</span>
                                            <span className="font-semibold text-gray-600">ETB {Number(r.original_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Balance Due</span>
                                            <span className="font-black text-rose-600">ETB {(Number(r.original_amount) - Number(r.paid_amount)).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Date</span>
                                            <span className="font-medium text-gray-700">{new Date(r.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Due Date</span>
                                            <span className="font-bold text-gray-800">{new Date(r.due_date).toLocaleDateString()}</span>
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600" /> Process Credit Repayment
                            </h2>
                            <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-gray-500">Customer</span>
                                <span className="text-sm font-bold text-gray-800">{selectedCustomer.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Total Outstanding Balance</span>
                                <span className="text-lg font-bold text-rose-600">
                                    ETB {Number(selectedCustomer.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Amount (ETB) *</label>
                                <input
                                    type="number" step="0.01" min="0.01" max={selectedCustomer.total_credit} required
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium text-indigo-700"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">Leave as full amount to clear all debts, or enter partial amount. Multi-record payments are automatically cascaded to oldest debts first.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Method *</label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="MOBILE_PAYMENT">Mobile Payment</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Deposit Into Account *</label>
                                <select
                                    value={selectedPaymentAccount}
                                    onChange={e => setSelectedPaymentAccount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium border-l-4 border-l-indigo-500"
                                >
                                    <option value="">-- Select Destination Ledger --</option>
                                    {paymentAccounts.filter(p => p.is_active).map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (Bal: ETB {Number(acc.balance).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>

                            {(paymentMethod === 'CHEQUE' || paymentMethod === 'BANK_TRANSFER') && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reference / Cheque Number</label>
                                    <input
                                        type="text" required
                                        value={referenceNumber}
                                        onChange={e => setReferenceNumber(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button onClick={() => setShowPayModal(false)}
                                className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleProcessPayment}
                                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > selectedCustomer.total_credit}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50">
                                Confirm & Apply Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditManagement;
