import { useState, useEffect } from 'react';
import {
    Plus, Search, DollarSign, Wallet2, FileText, Pencil, Trash2, X, RefreshCw, Calendar, ArrowRight
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const frequencies = [
    { value: 'ONE_TIME', label: 'One Time' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
];

const categories = [
    'RENT', 'SALARY', 'ELECTRICITY', 'WATER', 'INTERNET', 'MAINTENANCE', 'MISC'
];

const Expenses = () => {
    const { role } = useAuth();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [dailyExpected, setDailyExpected] = useState<any>(null);
    const [monthlySummary, setMonthlySummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [search, setSearch] = useState('');

    // Form states
    const [form, setForm] = useState({
        name: '',
        category: 'MISC',
        amount: '',
        frequency: 'ONE_TIME',
        expense_date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        description: '',
        receipt_reference: ''
    });

    const fetchData = async () => {
        try {
            const [expRes, dailyRes, monthlyRes] = await Promise.all([
                client.get('/expenses'),
                client.get('/expenses/daily-expected'),
                client.get('/expenses/monthly-summary')
            ]);
            setExpenses(expRes.data);
            setDailyExpected(dailyRes.data);
            setMonthlySummary(monthlyRes.data);
        } catch (err) {
            console.error('Failed to load expenses data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        try {
            const data = {
                ...form,
                amount: parseFloat(form.amount)
            };

            if (editing) {
                await client.put(`/expenses/${editing.id}`, data);
            } else {
                await client.post('/expenses', data);
            }
            setShowModal(false);
            setEditing(null);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Failed to save expense', err);
            alert('Error saving expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            await client.delete(`/expenses/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete expense', err);
        }
    };

    const openEdit = (e: any) => {
        setEditing(e);
        setForm({
            name: e.name,
            category: e.category,
            amount: String(e.amount),
            frequency: e.frequency,
            expense_date: new Date(e.expense_date).toISOString().split('T')[0],
            is_recurring: e.is_recurring,
            description: e.description || '',
            receipt_reference: e.receipt_reference || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({
            name: '',
            category: 'MISC',
            amount: '',
            frequency: 'ONE_TIME',
            expense_date: new Date().toISOString().split('T')[0],
            is_recurring: false,
            description: '',
            receipt_reference: ''
        });
    };

    const filtered = expenses.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-gray-800">Financial Intelligence</h1>
                    <p className="text-gray-500 mt-1">Manage and amortize expenses</p>
                </div>
                {role === 'ADMIN' && (
                    <button
                        onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Expense
                    </button>
                )}
            </div>

            {/* DASHBOARD WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <DollarSign className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Total</p>
                        <p className="text-2xl font-bold text-gray-800">${monthlySummary?.grand_total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <RefreshCw className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Expected</p>
                        <p className="text-2xl font-bold text-gray-800">${dailyExpected?.total_daily_expense?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium bg-indigo-50 px-2 py-0.5 rounded-md inline-block">Amortized from recurring</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Wallet2 className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">One-Time Spends</p>
                        <p className="text-2xl font-bold text-gray-800">${monthlySummary?.total_one_time?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                    </div>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
            </div>

            {/* EXPENSE LIST */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Frequency</th>
                                <th className="px-6 py-4">Recurring</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((e) => (
                                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-gray-800">{e.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                            {e.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{e.frequency.replace('_', ' ')}</td>
                                    <td className="px-6 py-4">
                                        {e.is_recurring ? (
                                            <span className="bg-emerald-100 text-emerald-700 p-1 rounded-md text-xs font-bold w-12 text-center block">YES</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 p-1 rounded-md text-xs font-bold w-12 text-center block">NO</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                        {new Date(e.expense_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {role === 'ADMIN' && (
                                            <>
                                                <button
                                                    onClick={() => openEdit(e)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(e.id)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                                        <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                        No expenses logged.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                {editing ? 'Edit Expense' : 'Log New Expense'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expense Name *</label>
                                <input
                                    type="text" required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. November Rent, Shop Maintenance"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category *</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount ($) *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number" step="0.01" min="0" required
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Frequency *</label>
                                <select
                                    value={form.frequency}
                                    onChange={e => setForm({ ...form, frequency: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                >
                                    {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date Paid *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date" required
                                        value={form.expense_date}
                                        onChange={e => setForm({ ...form, expense_date: e.target.value })}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_recurring}
                                        onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                                        className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-gray-800 block">Amortize this expense</span>
                                        <span className="text-xs text-gray-500">Checking this box means the expense cost is divided by its frequency to calculate daily profit metrics in the dashboard.</span>
                                    </div>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description (Optional)</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium resize-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Receipt Reference (Optional)</label>
                                <input
                                    type="text"
                                    value={form.receipt_reference}
                                    onChange={e => setForm({ ...form, receipt_reference: e.target.value })}
                                    placeholder="Invoice or Receipt #"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                                />
                            </div>

                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button onClick={() => setShowModal(false)}
                                className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit}
                                disabled={!form.name || !form.amount}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                {editing ? 'Update Expense' : 'Save Expense'} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
