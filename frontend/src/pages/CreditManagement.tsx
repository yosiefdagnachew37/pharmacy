import { useState, useEffect } from 'react';
import {
    Search, Users, TrendingDown, Clock, ShieldAlert, FileText, CheckCircle, Wallet, X
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';

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
    const [referenceNumber, setReferenceNumber] = useState('');

    const fetchData = async () => {
        try {
            const [custRes, sumRes, recordRes] = await Promise.all([
                client.get('/credit/customers'),
                client.get('/credit/summary'),
                client.get('/credit/records'),
            ]);
            setCustomers(custRes.data);
            setSummary(sumRes.data);
            setCreditRecords(recordRes.data);
        } catch (err) {
            console.error('Failed to load credit data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleProcessPayment = async () => {
        try {
            await client.post('/credit/payments', {
                customerId: selectedCustomer.id,
                amount: parseFloat(paymentAmount),
                paymentMethod,
                referenceNumber
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
        setReferenceNumber('');
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    );

    const filteredRecords = creditRecords.filter(r =>
        r.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.sale?.receipt_number && r.sale.receipt_number.toLowerCase().includes(search.toLowerCase()))
    );

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

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'CUSTOMERS' ? 'customers' : 'receipts or customers'}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
            </div>

            {activeTab === 'CUSTOMERS' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Customer Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Last Activity</th>
                                    <th className="px-6 py-4">Total Outstanding Balance</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((c) => {
                                    const isDept = Number(c.total_credit) > 0;
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" /> {c.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{c.phone || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                                {new Date(c.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isDept ? (
                                                    <span className="font-bold text-rose-600">ETB {Number(c.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded-md">CLEARED</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {isDept && (role === 'ADMIN' || role === 'PHARMACIST' || role === 'CASHIER') && (
                                                    <button
                                                        onClick={() => openPaymentModal(c)}
                                                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-transparent"
                                                    >
                                                        Process Repayment
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                            <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                            No customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'RECORDS' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Receipt #</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Original Amount</th>
                                    <th className="px-6 py-4">Balance Due</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                            {new Date(r.created_at).toLocaleDateString()}
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
                                {filteredRecords.length === 0 && (
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
