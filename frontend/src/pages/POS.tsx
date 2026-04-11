import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, User, CheckCircle,
  Wallet, Building2, Printer, AlertTriangle, Lock, Percent,
  Banknote, Barcode, Package, Send, Clock, RefreshCw, X,
  ChevronDown, Calendar, Layers, CreditCard, ArrowLeft
} from 'lucide-react';
import Modal from '../components/Modal';
import PrescriptionAttachment from '../components/PrescriptionAttachment';
import { toastError, toastWarning, toastSuccess } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  total_stock: number;
  selling_price: number;
  barcode: string;
  sku: string;
  is_controlled: boolean;
}

interface Batch {
  id: string;
  batch_number: string;
  expiry_date: string;
  quantity_remaining: number;
  selling_price: number;
}

interface CartItem {
  medicine_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  batch_id?: string;
  batch_number?: string;
  expiry_date?: string;
  is_fefo_default?: boolean;
}

interface PaymentAccount {
  id: string;
  name: string;
  type: string;
  account_number?: string;
  is_active: boolean;
}

interface SaleOrder {
  id: string;
  order_number: string;
  items: CartItem[];
  total_amount: number;
  discount: number;
  is_controlled_transaction: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  patient_id?: string;
  patient?: { name: string };
  creator?: { username: string };
  created_at: string;
  payment_account_name?: string;
  sale_id?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatExpiry = (date: string) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

const expiryColor = (date: string) => {
  const days = Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 30) return 'text-rose-600 bg-rose-50 border-rose-200';
  if (days < 90) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
};

// ─── PHARMACIST VIEW ──────────────────────────────────────────────────────────

const PharmacistPOS = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [patientId, setPatientId] = useState('');
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);

  // Batch picker state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [pendingMedForBatch, setPendingMedForBatch] = useState<Medicine | null>(null);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Controlled substance auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingMed, setPendingMed] = useState<Medicine | null>(null);
  const [managerPin, setManagerPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Quick add patient
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', address: '' });
  const [addPatientLoading, setAddPatientLoading] = useState(false);

  // After sending to cashier
  const [sentOrder, setSentOrder] = useState<SaleOrder | null>(null);
  const [pollingOrder, setPollingOrder] = useState<SaleOrder | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [medRes, patientRes, custRes, orgRes] = await Promise.all([
        client.get('/medicines'),
        client.get('/patients').catch(() => ({ data: [] })),
        client.get('/credit/customers').catch(() => ({ data: [] })),
        client.get('/organizations/my-org').catch(() => ({ data: null })),
      ]);
      if (orgRes?.data) setOrgInfo(orgRes.data);
      if (medRes?.data) {
        setMedicines(medRes.data.map((m: any) => ({ ...m, selling_price: Number(m.selling_price || 0) })));
      }
      const patientList = (patientRes?.data || []).map((p: any) => ({ id: p.id, name: p.name, phone: p.phone || '' }));
      const creditList = (custRes?.data || []).map((c: any) => ({ id: c.id, name: c.name, phone: c.phone || '' }));
      const mergedMap = new Map();
      patientList.forEach((p: any) => mergedMap.set(p.name.toLowerCase(), p));
      creditList.forEach((c: any) => { if (!mergedMap.has(c.name.toLowerCase())) mergedMap.set(c.name.toLowerCase(), c); });
      setCustomers(Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) { console.error('Error fetching POS data:', err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll for order confirmation after sending to cashier
  useEffect(() => {
    if (!sentOrder) return;
    const interval = setInterval(async () => {
      try {
        const res = await client.get('/sales/orders/mine');
        const updated = res.data.find((o: SaleOrder) => o.id === sentOrder.id);
        if (updated) setPollingOrder(updated);
        if (updated?.status === 'CONFIRMED' || updated?.status === 'CANCELLED') {
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 6000);
    return () => clearInterval(interval);
  }, [sentOrder]);

  // Barcode scanner
  useEffect(() => {
    let buf = '';
    let timer: any;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'Enter' && buf.length > 3) {
        const med = medicines.find(m => m.barcode === buf || m.sku === buf);
        if (med) openBatchPicker(med);
        buf = '';
      } else if (e.key.length === 1) {
        buf += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => { buf = ''; }, 50);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timer); };
  }, [medicines]);

  const openBatchPicker = async (med: Medicine) => {
    if (med.total_stock <= 0) return;
    setBatchLoading(true);
    setPendingMedForBatch(med);
    setShowBatchModal(true);
    try {
      const res = await client.get(`/batches/pos-preview/${med.id}`);
      setAvailableBatches(res.data || []);
    } catch { setAvailableBatches([]); }
    finally { setBatchLoading(false); }
  };

  const addToCartWithBatch = (med: Medicine, batch: Batch | null, isFefo: boolean) => {
    if (med.is_controlled && !showAuthModal) {
      setPendingMed(med);
      setShowAuthModal(true);
      setShowBatchModal(false);
      return;
    }
    const existing = cart.find(i => i.medicine_id === med.id && i.batch_id === (batch?.id ?? undefined));
    if (existing) {
      const max = batch ? batch.quantity_remaining : med.total_stock;
      if (existing.quantity >= max) { toastWarning('Max stock reached', ''); return; }
      setCart(cart.map(i => i.medicine_id === med.id && i.batch_id === existing.batch_id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, {
        medicine_id: med.id,
        name: med.name,
        quantity: 1,
        unit_price: batch?.selling_price ? Number(batch.selling_price) : med.selling_price,
        batch_id: batch?.id,
        batch_number: batch?.batch_number,
        expiry_date: batch?.expiry_date,
        is_fefo_default: isFefo,
      }]);
    }
    setShowBatchModal(false);
    setPendingMedForBatch(null);
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await client.post('/users/verify-pin', { pin: managerPin });
      if (res.data.valid) {
        if (pendingMed) openBatchPicker(pendingMed);
        setShowAuthModal(false);
        setPendingMed(null);
        setManagerPin('');
      } else { setAuthError('Invalid Authorization PIN'); }
    } catch { setAuthError('Authorization service error'); }
    finally { setAuthLoading(false); }
  };

  const removeFromCart = (medicine_id: string, batch_id?: string) => {
    setCart(cart.filter(i => !(i.medicine_id === medicine_id && i.batch_id === batch_id)));
  };

  const updateQuantity = (medicine_id: string, batch_id: string | undefined, delta: number) => {
    setCart(cart.map(item => {
      if (item.medicine_id === medicine_id && item.batch_id === batch_id) {
        const med = medicines.find(m => m.id === medicine_id);
        const newQty = item.quantity + delta;
        if (newQty > 0 && med && newQty <= med.total_stock) return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updatePrice = (medicine_id: string, batch_id: string | undefined, newPrice: number) => {
    setCart(cart.map(i => i.medicine_id === medicine_id && i.batch_id === batch_id ? { ...i, unit_price: newPrice >= 0 ? newPrice : 0 } : i));
  };

  const handleQuickAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name) return;
    setAddPatientLoading(true);
    try {
      const res = await client.post('/patients', newPatient);
      toastSuccess('Success', 'Customer registered.');
      setShowAddPatientModal(false);
      setNewPatient({ name: '', phone: '', address: '' });
      await fetchData();
      setPatientId(res.data.id);
    } catch { toastError('Error', 'Failed to register customer.'); }
    finally { setAddPatientLoading(false); }
  };

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discountAmount = subtotal * (cartDiscount / 100);
  const total = subtotal - discountAmount;
  const hasControlledItems = cart.some(i => medicines.find(m => m.id === i.medicine_id)?.is_controlled);
  const filteredMedicines = medicines.filter(m =>
    (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (m.generic_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSendToCashier = async () => {
    if (cart.length === 0) return;
    if (hasControlledItems && !prescriptionUrl) {
      toastWarning('Prescription required', 'Please attach a prescription for controlled substances.');
      return;
    }
    setLoading(true);
    try {
      const res = await client.post('/sales/orders', {
        items: cart.map(i => ({
          medicine_id: i.medicine_id,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          batch_id: i.batch_id,
          batch_number: i.batch_number,
          expiry_date: i.expiry_date,
        })),
        total_amount: total,
        discount: discountAmount,
        patient_id: patientId || undefined,
        prescription_image_url: prescriptionUrl || undefined,
        is_controlled_transaction: hasControlledItems,
      });
      setSentOrder(res.data);
      setPollingOrder(res.data);
      toastSuccess('Sent to cashier', `Order ${res.data.order_number} is waiting for cashier confirmation.`);
    } catch (err: any) {
      toastError('Failed', extractErrorMessage(err, 'Could not send order to cashier.'));
    } finally { setLoading(false); }
  };

  // ── "Waiting for cashier" screen ──────────────────────────────────────────
  if (sentOrder) {
    const current = pollingOrder ?? sentOrder;
    const isConfirmed = current.status === 'CONFIRMED';
    const isCancelled = current.status === 'CANCELLED';

    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        {isConfirmed ? (
          <>
            <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Payment Confirmed!</h2>
            <p className="text-gray-500 mt-2">The cashier has received payment via <strong>{current.payment_account_name}</strong>.</p>
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-sm text-emerald-800 font-semibold">
              ✅ You may now dispense the medicine to the customer.
            </div>
          </>
        ) : isCancelled ? (
          <>
            <X className="w-20 h-20 text-rose-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Order Cancelled</h2>
            <p className="text-gray-500 mt-2">This order was cancelled.</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4 animate-pulse">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Waiting for Cashier…</h2>
            <p className="text-gray-500 mt-1 text-sm">Order <strong>{current.order_number}</strong> is in the cashier queue.</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Auto-refreshing every 6 seconds</p>
            <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 w-full max-w-sm text-left space-y-2">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    {item.batch_number && <span className="ml-2 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Batch: {item.batch_number}</span>}
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </div>
                  <span className="text-gray-700 font-bold">ETB {(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between font-black text-indigo-700">
                <span>Total</span><span>ETB {total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
        <button
          onClick={() => { setSentOrder(null); setPollingOrder(null); setCart([]); setPatientId(''); setCartDiscount(0); setPrescriptionUrl(null); fetchData(); }}
          className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {isConfirmed || isCancelled ? 'New Transaction' : 'Cancel Order & Start New'}
        </button>
      </div>
    );
  }

  // ── Main POS UI ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 gap-6 relative">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex mb-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex-none">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Package className="w-4 h-4" /> Products
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 relative ${activeTab === 'cart' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
          <ShoppingCart className="w-4 h-4" /> Cart
          {cart.length > 0 && <span className={`absolute top-2 right-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${activeTab === 'cart' ? 'bg-white text-indigo-600 border-indigo-600' : 'bg-rose-500 text-white border-white'}`}>{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
        </button>
      </div>

      {/* Product Grid */}
      <div className={`flex-1 flex flex-col min-h-0 ${activeTab !== 'products' && 'hidden lg:flex'}`}>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search medicine (Name or Generic)..." className="w-full pl-12 pr-36 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg" title="USB barcode scanner supported">
            <Barcode className="w-3.5 h-3.5" /><span className="text-[10px] font-bold">Scanner Ready</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredMedicines.map(med => (
            <button key={med.id} onClick={() => openBatchPicker(med)} disabled={med.total_stock <= 0}
              className={`p-5 bg-white border rounded-2xl text-left hover:border-indigo-400 hover:shadow-lg transition-all group ${med.total_stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed border-gray-100' : 'border-gray-50 shadow-sm'}`}>
              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{med.name}</h3>
              <p className="text-xs text-gray-500 mb-4 line-clamp-1 h-4">{med.generic_name}</p>
              <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                <div>
                  <span className="text-xs text-gray-400 font-bold block mb-0.5">Price</span>
                  <span className="text-base font-black text-indigo-700">ETB {Number(med.selling_price || 0).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase">In Stock</span>
                  <span className={`text-xs font-black px-2 py-1 rounded-md ${med.total_stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{med.total_stock}</span>
                </div>
              </div>
              {med.is_controlled && <div className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1"><Lock className="w-3 h-3" /> Controlled</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className={`w-full lg:w-[420px] bg-white border border-gray-100 rounded-[2rem] shadow-xl flex flex-col h-full min-h-0 flex-shrink-0 ${activeTab !== 'cart' && 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-gray-50 flex items-center justify-between flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><ShoppingCart className="w-5 h-5" /></div>
            <h2 className="font-bold text-gray-800 text-lg">Current Sale</h2>
          </div>
          <button onClick={() => setCart([])} className="text-[10px] font-black uppercase text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-all">Clear</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-10" /><p className="font-medium">Click a medicine to add</p><p className="text-xs mt-1">FEFO batch selected automatically</p></div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.medicine_id}-${item.batch_id}-${idx}`} className="group relative bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="pr-7">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h4>
                    {item.batch_number ? (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${item.is_fefo_default ? expiryColor(item.expiry_date!) : 'text-purple-600 bg-purple-50 border-purple-200'}`}>
                          <Layers className="w-2.5 h-2.5" /> {item.batch_number}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${expiryColor(item.expiry_date!)}`}>
                          <Calendar className="w-2.5 h-2.5" /> Exp: {formatExpiry(item.expiry_date!)}
                        </span>
                        {!item.is_fefo_default && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">Override</span>}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 mt-0.5 inline-block">Auto FEFO at checkout</span>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(item.medicine_id, item.batch_id)} className="absolute top-3 right-3 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.medicine_id, item.batch_id, -1)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-bold text-gray-800 w-7 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine_id, item.batch_id, 1)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Price</span>
                      <input type="number" className="w-14 text-right text-xs font-bold text-indigo-600 bg-white border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-indigo-500 hide-arrows" value={item.unit_price ?? ''} onChange={e => updatePrice(item.medicine_id, item.batch_id, parseFloat(e.target.value) || 0)} step="0.01" />
                    </div>
                    <p className="text-[11px] font-black text-gray-900">ETB {(item.quantity * item.unit_price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-3 bg-gray-50/50 rounded-b-[2rem] border-t border-gray-100 flex flex-col gap-2 flex-none">
          {/* Customer */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Customer / Patient</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={patientId} onChange={e => e.target.value === 'NEW_CUSTOMER' ? setShowAddPatientModal(true) : setPatientId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-xs font-medium appearance-none">
                <option value="">Walk-in Customer</option>
                <option value="NEW_CUSTOMER" className="text-indigo-600 font-bold">+ New Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
              </select>
            </div>
          </div>

          {/* Prescription */}
          {hasControlledItems && (
            <div className="pt-1 border-t border-dashed border-gray-200">
              <PrescriptionAttachment onAttachment={setPrescriptionUrl} attachedUrl={prescriptionUrl} />
            </div>
          )}

          {/* Discount + Totals */}
          <div className="pt-2 border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-[10px] font-bold uppercase flex items-center gap-1"><Percent className="w-3 h-3" /> Discount</span>
              <div className="relative w-16">
                <input type="number" min="0" max="100" className="w-full text-right bg-white border border-gray-200 rounded-md px-1 py-0.5 text-xs font-bold focus:outline-none focus:border-indigo-400" value={cartDiscount} onChange={e => setCartDiscount(parseFloat(e.target.value) || 0)} />
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">%</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-gray-400 mb-1">
              <span className="text-[10px] font-bold uppercase">Subtotal</span>
              <span className="text-xs font-bold">ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end text-gray-900 mt-1">
              <div className="flex flex-col">
                {discountAmount > 0 && <span className="text-[10px] font-bold text-rose-500 uppercase">-ETB {discountAmount.toFixed(2)}</span>}
                <span className="text-[10px] font-black uppercase leading-none text-gray-400">Total Due</span>
              </div>
              <span className="text-xl font-black leading-none text-indigo-700">ETB {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || loading || (hasControlledItems && !prescriptionUrl)}
            onClick={handleSendToCashier}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none transition-all mt-1 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending…' : `Send to Cashier — ETB ${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Batch Picker Modal */}
      <Modal isOpen={showBatchModal} onClose={() => { setShowBatchModal(false); setPendingMedForBatch(null); }} title={`Select Batch — ${pendingMedForBatch?.name}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700 font-semibold">
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span>Batches are sorted by FEFO (First Expired, First Out). The first batch is recommended.</span>
          </div>
          {batchLoading ? (
            <div className="text-center py-8 text-gray-400"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" /><p className="text-sm">Loading batches…</p></div>
          ) : availableBatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-medium">No valid batches available</p></div>
          ) : (
            <>
              {availableBatches.map((batch, idx) => (
                <button key={batch.id} onClick={() => addToCartWithBatch(pendingMedForBatch!, batch, idx === 0)}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${idx === 0 ? 'border-indigo-300 bg-indigo-50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-indigo-300'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-sm">Batch #{batch.batch_number}</span>
                        {idx === 0 && <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">FEFO ✓</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className={`font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${expiryColor(batch.expiry_date)}`}>
                          <Calendar className="w-3 h-3" /> Exp: {formatExpiry(batch.expiry_date)}
                        </span>
                        <span className="font-semibold">Qty: <strong className="text-gray-800">{batch.quantity_remaining}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-700">ETB {Number(batch.selling_price || pendingMedForBatch?.selling_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </button>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <button onClick={() => addToCartWithBatch(pendingMedForBatch!, availableBatches[0], true)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  Use FEFO Recommended Batch
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Manager PIN Modal */}
      <Modal isOpen={showAuthModal} onClose={() => { setShowAuthModal(false); setPendingMed(null); setManagerPin(''); setAuthError(''); }} title="Authorization Required">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="p-2 bg-amber-500 text-white rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
            <div><p className="text-sm font-bold text-gray-800">Controlled Substance</p><p className="text-xs text-gray-500">"{pendingMed?.name}" requires manager authorization.</p></div>
          </div>
          <form onSubmit={handleAuthorize} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input autoFocus type="password" placeholder="Enter Manager PIN" className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold tracking-widest ${authError ? 'border-rose-300' : 'border-gray-200'}`} value={managerPin} onChange={e => setManagerPin(e.target.value)} />
              {authError && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{authError}</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowAuthModal(false); setPendingMed(null); setManagerPin(''); setAuthError(''); }} className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">{authLoading ? 'Checking…' : 'Authorize'}</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Quick Add Patient Modal */}
      <Modal isOpen={showAddPatientModal} onClose={() => setShowAddPatientModal(false)} title="Quick Register Customer">
        <form onSubmit={handleQuickAddPatient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" value={newPatient.name} onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
            <input type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm" value={newPatient.phone} onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddPatientModal(false)} className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">Cancel</button>
            <button type="submit" disabled={addPatientLoading} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">{addPatientLoading ? 'Saving…' : 'Register'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ─── CASHIER VIEW ─────────────────────────────────────────────────────────────

const CashierPOS = () => {
  const [pendingOrders, setPendingOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmedSale, setConfirmedSale] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, accountsRes] = await Promise.all([
        client.get('/sales/orders/pending'),
        client.get('/payment-accounts/active'),
      ]);
      setPendingOrders(ordersRes.data || []);
      setPaymentAccounts(accountsRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const openPayment = (order: SaleOrder) => {
    setSelectedOrder(order);
    setSelectedAccount(null);
    setShowPaymentModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedOrder || !selectedAccount) return;
    setConfirmLoading(true);
    try {
      const res = await client.post(`/sales/orders/${selectedOrder.id}/confirm`, {
        payment_account_id: selectedAccount.id,
        payment_account_name: selectedAccount.name,
      });
      setConfirmedSale(res.data);
      toastSuccess('Payment Confirmed', `ETB ${Number(selectedOrder.total_amount).toFixed(2)} received via ${selectedAccount.name}.`);
      setShowPaymentModal(false);
      fetchOrders();
    } catch (err: any) {
      toastError('Confirmation Failed', extractErrorMessage(err, 'Could not confirm payment.'));
    } finally { setConfirmLoading(false); }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await client.post(`/sales/orders/${orderId}/cancel`);
      toastSuccess('Cancelled', 'Order has been cancelled.');
      fetchOrders();
    } catch (err: any) {
      toastError('Error', extractErrorMessage(err, 'Could not cancel order.'));
    }
  };

  const accountTypeIcon = (type: string) => {
    if (type === 'CASH') return <Wallet className="w-5 h-5" />;
    if (type === 'MOBILE_MONEY') return <Banknote className="w-5 h-5" />;
    if (type === 'BANK') return <Building2 className="w-5 h-5" />;
    return <CreditCard className="w-5 h-5" />;
  };

  const accountTypeColor = (type: string) => {
    if (type === 'CASH') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (type === 'MOBILE_MONEY') return 'bg-blue-50 border-blue-200 text-blue-700';
    if (type === 'BANK') return 'bg-indigo-50 border-indigo-200 text-indigo-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  if (confirmedSale) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">Payment Confirmed!</h2>
        <p className="text-gray-500 mt-2">Receipt <strong>{confirmedSale.receipt_number}</strong> has been generated.</p>
        <div className="mt-4 text-sm text-gray-500">The pharmacist has been notified to dispense the medicine.</div>
        <button onClick={() => setConfirmedSale(null)} className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">Back to Queue</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-none">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Cashier Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" /> Auto-refreshing every 6 seconds
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm border ${pendingOrders.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {pendingOrders.length} Pending {pendingOrders.length === 1 ? 'Order' : 'Orders'}
        </div>
      </div>

      {/* Order Queue */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="text-center py-16 text-gray-400"><RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" /><p>Loading orders…</p></div>
        ) : pendingOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"><Clock className="w-10 h-10 opacity-30" /></div>
            <p className="font-semibold text-gray-500 text-lg">No Pending Orders</p>
            <p className="text-sm mt-1">Waiting for pharmacist to send orders…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">Pending Order</p>
                    <p className="font-black text-gray-900 text-base">{order.order_number}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {order.patient && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <User className="w-4 h-4 text-gray-400" /> <span className="font-semibold">{order.patient.name}</span>
                  </div>
                )}

                <div className="space-y-1.5 mb-4 flex-1">
                  {(order.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-700">{item.name}</span>
                        {item.batch_number && <span className="ml-1.5 text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">#{item.batch_number}</span>}
                        <span className="text-gray-400"> × {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-gray-800">ETB {(item.quantity * item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 mb-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500">Total</span>
                  <span className="text-xl font-black text-indigo-700">ETB {Number(order.total_amount).toFixed(2)}</span>
                </div>

                {order.is_controlled_transaction && (
                  <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> Contains Controlled Substance
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => handleCancel(order.id)} className="flex-none px-3 py-2.5 bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 rounded-xl transition-all font-bold text-xs">
                    Cancel
                  </button>
                  <button onClick={() => openPayment(order)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" /> Accept Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={`Accept Payment — ${selectedOrder?.order_number}`}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Order Summary</p>
            <div className="space-y-1">
              {((selectedOrder?.items || []) as any[]).map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-gray-900">ETB {(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between font-black text-lg">
              <span>Total Due</span>
              <span className="text-indigo-700">ETB {Number(selectedOrder?.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Select Payment Account</p>
            {paymentAccounts.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm border border-dashed rounded-xl">
                No payment accounts configured. Ask admin to add accounts.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                {paymentAccounts.map(acc => (
                  <button key={acc.id} onClick={() => setSelectedAccount(acc)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedAccount?.id === acc.id ? 'border-indigo-500 bg-indigo-50' : `${accountTypeColor(acc.type)} hover:border-indigo-300`}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedAccount?.id === acc.id ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                      {accountTypeIcon(acc.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{acc.name}</p>
                      {acc.account_number && <p className="text-xs text-gray-500">{acc.account_number}</p>}
                    </div>
                    {selectedAccount?.id === acc.id && <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">Cancel</button>
            <button
              disabled={!selectedAccount || confirmLoading}
              onClick={handleConfirm}
              className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {confirmLoading ? 'Confirming…' : 'Confirm Receipt'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

const POS = () => {
  const { role } = useAuth();
  if (role === 'CASHIER') return <CashierPOS />;
  return <PharmacistPOS />;
};

export default POS;
