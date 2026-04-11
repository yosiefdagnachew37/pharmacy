import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Pencil, Banknote, Clock, ArrowDownRight, ArrowUpRight, ArrowUpCircle } from 'lucide-react';
import client from '../api/client';
import { toastSuccess, toastError } from '../components/Toast';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentAccounts() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'CASH',
    account_number: '',
    description: '',
    initial_balance: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  // Transaction pane state
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  // Withdraw state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAcc, setWithdrawAcc] = useState<any>(null);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });
  const [withdrawSaving, setWithdrawSaving] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await client.get('/payment-accounts');
      setAccounts(res.data || []);
    } catch {
      toastError('Error', 'Failed to fetch payment accounts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId?: string, date?: string) => {
    setTxLoading(true);
    try {
      let url = accountId ? `/payment-accounts/${accountId}/transactions` : `/payment-accounts/transactions`;
      if (date) url += `?date=${date}`;
      const res = await client.get(url);
      setTransactions(res.data || []);
    } catch {
      toastError('Error', 'Failed to fetch transaction history.');
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.id, dateFilter);
    } else {
      setTransactions([]);
    }
  }, [selectedAccount, dateFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAcc) {
        await client.put(`/payment-accounts/${editingAcc.id}`, {
          name: form.name,
          type: form.type,
          account_number: form.account_number,
          description: form.description,
          is_active: form.is_active
        });
        toastSuccess('Updated', `"${form.name}" updated successfully.`);
      } else {
        await client.post('/payment-accounts', form);
        toastSuccess('Created', `"${form.name}" added successfully.`);
      }
      setShowForm(false);
      fetchAccounts();
    } catch {
      toastError('Error', 'Failed to save payment account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/payment-accounts/${id}`);
      toastSuccess('Deleted', `"${name}" removed from platform.`);
      if (selectedAccount?.id === id) setSelectedAccount(null);
      fetchAccounts();
    } catch {
      toastError('Error', 'Could not delete. It may be linked to existing transactions.');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAcc) return;
    const amount = Number(withdrawForm.amount);
    if (amount <= 0) return toastError('Error', 'Withdrawal amount must be > 0');
    if (amount > Number(withdrawAcc.balance || 0)) return toastError('Error', 'Insufficient float in the account');

    setWithdrawSaving(true);
    try {
      await client.post(`/payment-accounts/${withdrawAcc.id}/withdraw`, {
        amount,
        reason: withdrawForm.reason
      });
      toastSuccess('Success', `Withdrew ETB ${amount} from ${withdrawAcc.name}`);
      setShowWithdraw(false);
      fetchAccounts();
      if (selectedAccount?.id === withdrawAcc.id) {
        fetchTransactions(selectedAccount.id, dateFilter);
      }
    } catch {
      toastError('Error', 'Failed to process withdrawal.');
    } finally {
      setWithdrawSaving(false);
    }
  };

  const totalPlatformBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Payment Accounts</h1> */}
          <p className="text-gray-500 font-medium mt-1">Manage cash drawers, bank accounts, and platform wallets</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingAcc(null);
              setForm({ name: '', type: 'CASH', account_number: '', description: '', initial_balance: 0, is_active: true });
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" /> New Account
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-16 h-16" /></div>
          <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-1">Total Platform Float</p>
          <h3 className="text-3xl font-black truncate">ETB {totalPlatformBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[8px] uppercase text-indigo-100">Float</p>
          <h3 className="text-sm font-semibold">
            ETB {totalPlatformBalance.toLocaleString()}
          </h3>
        </div>
        <Wallet className="w-5 h-5 opacity-30" />
      </div> */}


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Configured Accounts */}
        <div className="lg:col-span-4 space-y-3 relative">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Configured Accounts</h3>

          {loading ? (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Banknote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No accounts defined.</p>
            </div>
          ) : (
            accounts.map(acc => {
              const isSelected = selectedAccount?.id === acc.id;
              const typeColors: Record<string, string> = { CASH: 'text-emerald-700 bg-emerald-50', BANK: 'text-indigo-700 bg-indigo-50', MOBILE_MONEY: 'text-blue-700 bg-blue-50', OTHER: 'text-gray-700 bg-gray-50' };
              const typeIcons: Record<string, string> = { CASH: '💵', BANK: '🏦', MOBILE_MONEY: '📱', OTHER: '💳' };

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(isSelected ? null : acc)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected ? 'border-indigo-500 shadow-md bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-gray-300'} ${!acc.is_active && 'opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${typeColors[acc.type] || typeColors.OTHER}`}>
                        {typeIcons[acc.type] || '💳'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition">{acc.name}</h4>
                        <p className="text-[10px] font-black uppercase text-gray-400">{acc.type.replace('_', ' ')} • {acc.is_active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400">Current Balance</p>
                      <p className={`font-black tracking-tight ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>ETB {Number(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setWithdrawAcc(acc); setWithdrawForm({ amount: '', reason: '' }); setShowWithdraw(true); }} className="px-3 py-1.5 flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-black uppercase tracking-wide border border-transparent hover:border-rose-200 transition-all mr-1"><ArrowUpCircle className="w-3.5 h-3.5" /> Withdraw</button>

                      {isAdmin && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setEditingAcc(acc); setForm({ name: acc.name, type: acc.type, account_number: acc.account_number || '', description: acc.description || '', initial_balance: 0, is_active: acc.is_active }); setShowForm(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(acc.id, acc.name); }} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Transaction History */}
        <div className="lg:col-span-8">
          <div className="bg-white border text-gray-900 border-gray-100 shadow-sm rounded-2xl h-[calc(100vh-14rem)] flex flex-col overflow-hidden relative">
            {!selectedAccount ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Select an account from the left to view timeline</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="font-black text-gray-900">{selectedAccount.name} • Ledger</h3>
                    <p className="text-[10px] font-black uppercase text-gray-400 mt-0.5">Account Activity Logs</p>
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-white border text-sm text-gray-700 border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 outline-none font-medium"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/20">
                  {txLoading ? (
                    <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : transactions.length === 0 ? (
                    <p className="text-center text-sm font-medium text-gray-400 p-8 pt-12">No transactions recorded {dateFilter ? `for ${dateFilter}` : 'yet'}.</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map(tx => (
                        <div key={tx.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition">
                          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {tx.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-gray-800">{tx.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{tx.reference_type.replace('_', ' ')}</span>
                              <span className="text-xs font-medium text-gray-400">{new Date(tx.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={`text-right font-black tracking-tight ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'} ETB {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingAcc ? "Edit Payment Account" : "New Payment Account"}>
        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cash Register 1" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                <option value="CASH">💵 Cash</option>
                <option value="BANK">🏦 Bank</option>
                <option value="MOBILE_MONEY">📱 Mobile Money</option>
                <option value="OTHER">💳 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reference No.</label>
              <input type="text" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="Optional" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>

            {!editingAcc && (
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Initial Starting Float (ETB)</label>
                <input type="number" step="0.01" min="0" value={form.initial_balance} onChange={e => setForm({ ...form, initial_balance: Number(e.target.value) })} className="w-full font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                <p className="text-[10px] text-indigo-500 font-medium mt-1 pl-1">Starting amount currently in the register/account.</p>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional note" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-[2] py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {saving ? 'Processing...' : (editingAcc ? 'Save Changes' : 'Create Account')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Cash">
        <form onSubmit={handleWithdrawSubmit} className="pt-4 space-y-4">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black text-rose-500 tracking-widest">Withdraw From</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{withdrawAcc?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-rose-500 tracking-widest">Current Balance</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">ETB {Number(withdrawAcc?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount to Withdraw (ETB) *</label>
              <input type="number" step="0.01" min="0" required value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="w-full text-lg font-black text-gray-900 bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 transition-all outline-none" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reason / Note</label>
              <input type="text" value={withdrawForm.reason} onChange={e => setWithdrawForm({ ...withdrawForm, reason: e.target.value })} className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 transition-all outline-none" placeholder="e.g. Bank deposit, drawer drop..." />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" disabled={withdrawSaving || !withdrawForm.amount} className="flex-[2] py-3 text-sm font-bold text-white bg-rose-600 rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50">
              {withdrawSaving ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
