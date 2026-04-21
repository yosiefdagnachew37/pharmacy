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
import { formatDate } from '../utils/dateUtils';
import { extractErrorMessage } from '../utils/errorUtils';
import { useAuth } from '../contexts/AuthContext';
import AttachmentModal from '../components/AttachmentModal';

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
  max_qty?: number;
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
  const [cartDiscount, setCartDiscount] = useState<number | string>('');
  const [cartDiscountValue, setCartDiscountValue] = useState<number | string>('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [loading, setLoading] = useState(false);
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const isPharmacist = user?.role === 'PHARMACIST';
  const canCheckout = user?.role === 'ADMIN' || user?.role === 'PHARMACY_MANAGER' || (isPharmacist && user?.can_checkout === true);

  // Direct checkout state
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [showDirectCheckoutModal, setShowDirectCheckoutModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT' | 'SPLIT'>('CASH');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [confirmedSale, setConfirmedSale] = useState<any>(null);
  const [showAttachment, setShowAttachment] = useState(false);

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
      const [medRes, patientRes, custRes, orgRes, accRes] = await Promise.all([
        client.get('/medicines'),
        client.get('/patients').catch(() => ({ data: [] })),
        client.get('/credit/customers').catch(() => ({ data: [] })),
        client.get('/organizations/my-org').catch(() => ({ data: null })),
        canCheckout ? client.get('/payment-accounts/active').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      if (orgRes?.data) setOrgInfo(orgRes.data);
      if (accRes?.data) setPaymentAccounts(accRes.data);
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
  }, [canCheckout]);

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
    // If no stock, we can't sell it
    if (med.total_stock <= 0) {
      toastError('Out of Stock', `"${med.name}" has no recorded inventory.`);
      return;
    }
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
        max_qty: batch ? batch.quantity_remaining : med.total_stock,
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
    let warningShown = false;
    setCart(cart.map(item => {
      if (item.medicine_id === medicine_id && item.batch_id === batch_id) {
        const newQty = item.quantity + delta;
        
        if (newQty > 0) {
           const limit = item.max_qty ?? Infinity;
           if (newQty > limit) {
             if (!warningShown) {
               toastWarning('Insufficient Stock', `Only ${limit} items available in this batch.`);
               warningShown = true; // prevent multiple toasts if map runs multiple times (React StrictMode)
             }
             return item; // Do not update quantity
           }
           return { ...item, quantity: newQty };
        }
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
  let rawDiscountAmount = discountType === 'PERCENTAGE'
    ? subtotal * ((Number(cartDiscount) || 0) / 100)
    : (Number(cartDiscountValue) || 0);
  const isDiscountExceeding = rawDiscountAmount > subtotal;
  let discountAmount = isDiscountExceeding ? subtotal : rawDiscountAmount; // Ensure bounded calculation
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

    // Client-side validation for stock limits before sending to cashier
    for (const item of cart) {
      const limit = item.max_qty ?? Infinity;
      if (item.quantity > limit) {
        toastError('Insufficient Stock', `Cannot send order. Batch ${item.batch_number || ''} of ${item.name} only has ${limit} available, but ${item.quantity} requested.`);
        return;
      }
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

  const handleDirectCheckoutConfirm = async () => {
    if (paymentMode === 'CASH' && !selectedAccount) return toastError('Error', 'Please select a payment account for cash receipt.');
    if (paymentMode === 'CREDIT' && !patientId) return toastError('Error', 'Patient is required for credit transactions.');
    if (paymentMode === 'SPLIT') {
      if (!selectedAccount) return toastError('Error', 'Please select a payment account for the upfront portion.');
      if (!patientId) return toastError('Error', 'Patient is required for the credit portion.');
      if (!amountPaid || amountPaid <= 0 || amountPaid >= total) return toastError('Error', 'Invalid upfront amount.');
    }

    setLoading(true);
    try {
      const payload: any = {
        items: cart.map(i => ({ medicine_id: i.medicine_id, name: i.name, quantity: i.quantity, unit_price: i.unit_price, batch_id: i.batch_id, batch_number: i.batch_number, expiry_date: i.expiry_date })),
        total_amount: total,
        discount: discountAmount,
        patient_id: patientId || undefined,
        prescription_image_url: prescriptionUrl || undefined,
        is_controlled_transaction: hasControlledItems,
      };

      // We first create the order, then immediately confirm it
      const orderRes = await client.post('/sales/orders', payload);
      const confirmPayload: any = { payment_method: paymentMode };
      if (paymentMode === 'CASH') {
         confirmPayload.payment_account_id = selectedAccount?.id;
         confirmPayload.payment_account_name = selectedAccount?.name;
      } else if (paymentMode === 'SPLIT') {
         confirmPayload.payment_account_id = selectedAccount?.id;
         confirmPayload.payment_account_name = selectedAccount?.name;
         confirmPayload.amount_paid = Number(amountPaid);
      }
      
      const res = await client.post(`/sales/orders/${orderRes.data.id}/confirm`, confirmPayload);
      setConfirmedSale(res.data);
      setShowDirectCheckoutModal(false);
      toastSuccess('Direct Checkout Complete', `Sale confirmed successfully.`);
    } catch (err: any) {
      toastError('Checkout Failed', extractErrorMessage(err, 'Could not complete direct checkout.'));
    } finally {
      setLoading(false);
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

  // ── "Direct Action Success" screen ──────────────────────────────────────────
  if (confirmedSale) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <CheckCircle className="w-16 h-16 text-emerald-500 mb-3" />
        <h2 className="text-xl font-black text-gray-800">Sale Confirmed!</h2>
        <p className="text-gray-500 mt-1 text-sm tracking-tight">Receipt <strong>{confirmedSale.receipt_number}</strong> generated.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button onClick={() => { setConfirmedSale(null); setCart([]); setPatientId(''); setCartDiscount(''); setCartDiscountValue(''); setPrescriptionUrl(null); fetchData(); }} className="w-full justify-center bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-gray-200 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Sale
          </button>
          <button onClick={() => setShowAttachment(true)} className="w-full justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
        <AttachmentModal isOpen={showAttachment} onClose={() => setShowAttachment(false)} sale={confirmedSale} orgInfo={orgInfo} />
      </div>
    );
  }

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
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3 animate-pulse">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-gray-800">Waiting for Cashier…</h2>
            <p className="text-gray-500 mt-1 text-xs">Order <strong>{current.order_number}</strong> is in the cashier queue.</p>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5 animate-spin" /> Auto-refreshing every 6s</p>
            <div className="mt-4 bg-white border border-gray-100 rounded-xl shadow-sm p-4 w-full max-w-sm text-left space-y-1.5">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    {item.batch_number && <span className="ml-2 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Batch: {item.batch_number}</span>}
                    <span className="text-gray-400">× {item.quantity}</span>
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
          className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all text-xs"
        >
          {isConfirmed || isCancelled ? 'New Transaction' : 'Start New Sale Order'}
        </button>
      </div>
    );
  }

  // ── Main POS UI ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 gap-4 relative">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex mb-2 bg-white p-1 rounded-lg shadow-sm border border-gray-100 flex-none">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-2 px-3 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Package className="w-4 h-4" /> Products
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex-1 py-2 px-3 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5 relative ${activeTab === 'cart' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
          <ShoppingCart className="w-4 h-4" /> Cart
          {cart.length > 0 && <span className={`absolute top-1 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border-2 ${activeTab === 'cart' ? 'bg-white text-indigo-600 border-indigo-600' : 'bg-rose-500 text-white border-white'}`}>{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
        </button>
      </div>

      {/* Product Grid */}
      <div className={`flex-1 flex flex-col min-h-0 ${activeTab !== 'products' && 'hidden lg:flex'}`}>
        <div className="relative mb-3.5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search medicine (Name or Generic)..." className="w-full pl-10 pr-28 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-xs font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100" title="USB barcode scanner supported">
            <Barcode className="w-3 h-3" /><span className="text-[8px] font-black tracking-tight">Scanner Ready</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-6">
          {filteredMedicines.map(med => (
            <button key={med.id} onClick={() => openBatchPicker(med)} disabled={med.total_stock <= 0}
              className={`p-3.5 bg-white border rounded-xl text-left hover:border-indigo-400 hover:shadow-md transition-all group ${med.total_stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed border-gray-100' : 'border-gray-50 shadow-sm'}`}>
              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm">{med.name}</h3>
              <p className="text-[10px] text-gray-500 mb-3 line-clamp-1 h-3.5">{med.generic_name}</p>
              <div className="flex justify-between items-end border-t border-gray-50 pt-2.5">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block mb-0.5 uppercase tracking-tighter">Price</span>
                  <span className="text-sm font-black text-indigo-700">ETB {Number(med.selling_price || 0).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 font-bold block mb-0.5 uppercase tracking-tighter">In Stock</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${med.total_stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{med.total_stock}</span>
                </div>
              </div>
              {med.is_controlled && <div className="mt-2 text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-amber-100 max-w-fit"><Lock className="w-2.5 h-2.5" /> Controlled</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className={`w-full lg:w-[360px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xl flex flex-col h-full min-h-0 flex-shrink-0 ${activeTab !== 'cart' && 'hidden lg:flex'}`}>
        <div className="p-3 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between flex-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><ShoppingCart className="w-4 h-4" /></div>
            <h2 className="font-bold text-gray-800 dark:text-slate-100 text-base tracking-tight">Current Sale</h2>
          </div>
          <button onClick={() => setCart([])} className="text-[9px] font-black uppercase text-rose-500 hover:text-white bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500 px-2 py-1 rounded-md transition-all">Clear</button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-10" /><p className="font-medium text-xs">Click a medicine to add</p><p className="text-[10px] mt-1">FEFO batch selected automatically</p></div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.medicine_id}-${item.batch_id}-${idx}`} className="group relative bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-gray-100/50 dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-1">
                  <div className="pr-6">
                    <h4 className="text-[13px] font-bold text-gray-800 leading-tight">{item.name}</h4>
                    {item.batch_number ? (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded border inline-flex items-center gap-0.5 ${item.is_fefo_default ? expiryColor(item.expiry_date!) : 'text-purple-600 bg-purple-50 border-purple-200'}`}>
                          <Layers className="w-2.5 h-2.5" /> {item.batch_number}
                        </span>
                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded border inline-flex items-center gap-0.5 ${expiryColor(item.expiry_date!)}`}>
                          <Calendar className="w-2.5 h-2.5" /> {formatDate(item.expiry_date!)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-400 mt-0.5 inline-block">Auto FEFO at checkout</span>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(item.medicine_id, item.batch_id)} className="absolute top-2.5 right-2.5 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center justify-between gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100/50">
                  <div className="flex items-center bg-white rounded border border-gray-200 overflow-hidden">
                    <button onClick={() => updateQuantity(item.medicine_id, item.batch_id, -1)} className="p-0.5 text-gray-400 hover:text-indigo-600 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="text-[11px] font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine_id, item.batch_id, 1)} className="p-0.5 text-gray-400 hover:text-indigo-600 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    <input type="number" className="w-12 text-right text-[10px] font-bold text-indigo-600 bg-white border border-gray-100 rounded px-1 py-0.5 outline-none focus:border-indigo-300 hide-arrows" value={item.unit_price ?? ''} onChange={e => updatePrice(item.medicine_id, item.batch_id, parseFloat(e.target.value) || 0)} step="0.01" />
                    <p className="text-[10px] font-black text-gray-900 ml-1">ETB {(item.quantity * item.unit_price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-3 bg-gray-50/50 dark:bg-slate-800/80 rounded-b-xl border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2 flex-none">
          {/* Customer */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-400 uppercase mb-1 ml-1 tracking-wider">Customer / Patient</label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select value={patientId} onChange={e => e.target.value === 'NEW_CUSTOMER' ? setShowAddPatientModal(true) : setPatientId(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 text-xs font-medium appearance-none">
                <option value="">Walk-in Customer</option>
                <option value="NEW_CUSTOMER" className="text-indigo-600 font-bold">+ New Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
              </select>
            </div>
          </div>

          {/* Prescription */}
          {hasControlledItems && (
            <div className="pt-0.5 border-t border-dashed border-gray-200">
              <PrescriptionAttachment onAttachment={setPrescriptionUrl} attachedUrl={prescriptionUrl} />
            </div>
          )}

          {/* Discount + Totals */}
          <div className="pt-2 border-t border-dashed border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center text-gray-800 dark:text-slate-200 mb-1.5">
              <span className="text-[9px] font-bold uppercase flex items-center gap-1 tracking-tight"><Percent className="w-2.5 h-2.5" /> Discount</span>
              <div className="flex items-center gap-1.5">
                <div className="relative w-12">
                  <input type="number" min="0" max="100" className={`w-full text-right bg-white dark:bg-slate-900 border ${discountType === 'PERCENTAGE' ? 'border-indigo-400 ring-1 ring-indigo-50' : 'border-gray-200 dark:border-slate-700'} rounded px-1 py-0.5 text-[10px] font-bold focus:outline-none`} value={discountType === 'PERCENTAGE' ? cartDiscount : ''} onChange={e => { setCartDiscount(e.target.value); setDiscountType('PERCENTAGE'); }} placeholder="0" />
                  <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-gray-400 text-[8px] font-bold">%</span>
                </div>
                <div className="relative w-16">
                  <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-gray-400 text-[8px] font-bold">ETB</span>
                  <input type="number" min="0" className={`w-full text-right bg-white dark:bg-slate-900 border ${discountType === 'FIXED' ? 'border-indigo-400 ring-1 ring-indigo-50' : 'border-gray-200 dark:border-slate-700'} rounded pl-5 pr-0.5 py-0.5 text-[10px] font-bold focus:outline-none`} value={discountType === 'FIXED' ? cartDiscountValue : ''} onChange={e => { setCartDiscountValue(e.target.value); setDiscountType('FIXED'); }} placeholder="0" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-gray-800 dark:text-slate-200 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-tight">Subtotal</span>
              <span className="text-[11px] font-bold">ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end text-gray-900 dark:text-slate-100 mt-1.5">
              <div className="flex flex-col">
                {isDiscountExceeding && <span className="text-[8px] font-bold text-rose-600 uppercase tracking-tighter">Limit exceeded</span>}
                {!isDiscountExceeding && discountAmount > 0 && <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">-ETB {discountAmount.toFixed(2)}</span>}
                <span className="text-[9px] font-black uppercase leading-none text-gray-400 dark:text-slate-200 mt-0.5 tracking-wider">Total Due</span>
              </div>
              <span className="text-lg font-black leading-none text-indigo-700 dark:text-indigo-400">ETB {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2.5 mt-1">
            <button
              disabled={cart.length === 0 || loading || (hasControlledItems && !prescriptionUrl) || isDiscountExceeding}
              onClick={handleSendToCashier}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-black text-xs shadow-lg shadow-indigo-50 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {canCheckout ? 'Queue' : 'Send to Cashier'}
            </button>
            {canCheckout && (
               <button
                 disabled={cart.length === 0 || loading || (hasControlledItems && !prescriptionUrl) || isDiscountExceeding}
                 onClick={() => {
                    // pre-validate
                    for (const item of cart) {
                      const limit = item.max_qty ?? Infinity;
                      if (item.quantity > limit) return toastError('Insufficient Stock', `Batch limit reached for ${item.name}`);
                    }
                    setSelectedAccount(null);
                    setPaymentMode('CASH');
                    setAmountPaid('');
                    setShowDirectCheckoutModal(true);
                 }}
                 className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-black text-xs shadow-lg shadow-emerald-50 hover:bg-emerald-700 hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
               >
                 <Wallet className="w-3.5 h-3.5" /> Direct Checkout
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Batch Picker Modal */}
      <Modal isOpen={showBatchModal} onClose={() => { setShowBatchModal(false); setPendingMedForBatch(null); }} title={`Select Batch — ${pendingMedForBatch?.name}`}>
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-[10px] text-indigo-700 font-bold uppercase tracking-tight">
            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Batches sorted by FEFO (Recommended)</span>
          </div>
          {batchLoading ? (
            <div className="text-center py-6 text-gray-400 font-bold text-xs uppercase tracking-widest"><RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1.5" />Loading…</div>
          ) : availableBatches.length === 0 ? (
            <div className="text-center py-6 text-gray-400 italic text-xs uppercase tracking-widest border border-dashed rounded-lg">No valid batches</div>
          ) : (
            <>
              {availableBatches.map((batch, idx) => (
                <button key={batch.id} onClick={() => addToCartWithBatch(pendingMedForBatch!, batch, idx === 0)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${idx === 0 ? 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-black text-gray-800 text-[11px]">Batch #{batch.batch_number}</span>
                        {idx === 0 && <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm shadow-indigo-100">FEFO RECOMMENDED</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded border inline-flex items-center gap-0.5 ${expiryColor(batch.expiry_date)}`}>
                          <Calendar className="w-2.5 h-2.5" /> Exp: {formatDate(batch.expiry_date)}
                        </span>
                        <span className="text-gray-400 font-bold tracking-tight uppercase">Qty: <strong className="text-gray-800">{batch.quantity_remaining}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-700 uppercase tracking-tighter">ETB {Number(batch.selling_price || pendingMedForBatch?.selling_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </button>
              ))}
              <div className="pt-1.5 border-t border-gray-100">
                <button onClick={() => addToCartWithBatch(pendingMedForBatch!, availableBatches[0], true)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-black text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95">
                  Confirm Recommended Batch
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Manager PIN Modal */}
      <Modal isOpen={showAuthModal} onClose={() => { setShowAuthModal(false); setPendingMed(null); setManagerPin(''); setAuthError(''); }} title="Authorization Required">
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
            <div><p className="text-xs font-black text-gray-800 uppercase tracking-tight">Controlled Substance</p><p className="text-[10px] text-gray-500 mt-0.5">Manager authorization required for "{pendingMed?.name}".</p></div>
          </div>
          <form onSubmit={handleAuthorize} className="space-y-3.5">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input autoFocus type="password" placeholder="Enter Manager PIN" className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-50 outline-none font-bold tracking-widest text-sm ${authError ? 'border-rose-300' : 'border-gray-200'}`} value={managerPin} onChange={e => setManagerPin(e.target.value)} />
              {authError && <p className="text-[9px] font-black text-rose-500 mt-1 ml-1 uppercase tracking-tighter">{authError}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowAuthModal(false); setPendingMed(null); setManagerPin(''); setAuthError(''); }} className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-all border border-gray-200 text-xs">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-black rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-xs uppercase tracking-widest">{authLoading ? 'Checking…' : 'Authorize'}</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Quick Add Patient Modal */}
      <Modal isOpen={showAddPatientModal} onClose={() => setShowAddPatientModal(false)} title="Register Customer">
        <form onSubmit={handleQuickAddPatient} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name *</label>
            <input type="text" required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold" value={newPatient.name} onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
            <input type="tel" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold" value={newPatient.phone} onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1.5">
            <button type="button" onClick={() => setShowAddPatientModal(false)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-lg border border-gray-200 hover:bg-gray-100 transition-all text-xs">Cancel</button>
            <button type="submit" disabled={addPatientLoading} className="flex-1 py-2.5 bg-indigo-600 text-white font-black rounded-lg hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">{addPatientLoading ? 'Saving…' : 'Register'}</button>
          </div>
        </form>
      </Modal>

      {/* Direct Checkout Modal */}
      <Modal isOpen={showDirectCheckoutModal} onClose={() => setShowDirectCheckoutModal(false)} title={`Direct Checkout`}>
        <div className="space-y-3.5">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex justify-between font-black text-base">
              <span className="text-black text-[11px] tracking-widest self-center uppercase">Total Due</span>
              <span className="text-indigo-700">ETB {Number(total || 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <div className="flex bg-gray-100 p-1 rounded-lg mb-3.5 text-[10px] font-black uppercase tracking-tight">
              <button onClick={() => setPaymentMode('CASH')} className={`flex-1 py-1.5 rounded-md transition-all ${paymentMode === 'CASH' ? 'bg-white shadow-sm text-gray-900 border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>Full Cash</button>
              <button onClick={() => setPaymentMode('CREDIT')} className={`flex-1 py-1.5 rounded-md transition-all ${paymentMode === 'CREDIT' ? 'bg-white shadow-sm text-gray-900 border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>Full Credit</button>
              <button onClick={() => setPaymentMode('SPLIT')} className={`flex-1 py-1.5 rounded-md transition-all ${paymentMode === 'SPLIT' ? 'bg-white shadow-sm text-gray-900 border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>Split Payment</button>
            </div>

            {paymentMode !== 'CASH' && !patientId && (
              <div className="bg-rose-50 text-rose-600 border border-rose-100 p-2.5 rounded-lg text-[10px] font-black tracking-tight mb-3.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Cannot issue credit: No patient attached to cart.
              </div>
            )}

            {paymentMode === 'SPLIT' && (
              <div className="mb-3.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Upfront Amount Paid (ETB)</label>
                <input type="number" step="0.01" min="0" max={total} value={amountPaid} onChange={e => setAmountPaid(e.target.value ? Number(e.target.value) : '')} className="w-full text-base font-black text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-50 transition-all outline-none" placeholder="0.00" />
                {amountPaid && amountPaid > 0 && amountPaid < total && (
                  <p className="text-[9px] font-black text-indigo-500 ml-1 mt-1 uppercase tracking-tight">Remaining ETB {(total - (amountPaid as number)).toFixed(2)} will be credited.</p>
                )}
              </div>
            )}

            {paymentMode !== 'CREDIT' && (
              <>
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Select Payment Account</p>
                {paymentAccounts.length === 0 ? (
                  <div className="text-center py-5 text-gray-400 text-[11px] font-bold italic border border-dashed rounded-lg bg-gray-50">
                    No payment accounts defined.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {paymentAccounts.map(acc => (
                      <button key={acc.id} onClick={() => setSelectedAccount(acc)}
                        className={`w-full text-left p-2 rounded-lg border-2 transition-all flex items-center gap-2.5 ${selectedAccount?.id === acc.id ? 'border-indigo-500 bg-indigo-50' : `${accountTypeColor(acc.type)} hover:border-indigo-200`}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedAccount?.id === acc.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
                          <div className="scale-75">{accountTypeIcon(acc.type)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-xs truncate leading-tight">{acc.name}</p>
                          {acc.account_number && <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">{acc.account_number}</p>}
                        </div>
                        {selectedAccount?.id === acc.id && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 pt-1.5">
            <button onClick={() => setShowDirectCheckoutModal(false)} className="flex-1 py-2.5 bg-gray-50 text-gray-500 font-bold rounded-lg border border-gray-100 hover:bg-gray-100 transition-all text-xs uppercase tracking-widest">Cancel</button>
            <button
              disabled={
                loading ||
                (paymentMode !== 'CREDIT' && !selectedAccount) ||
                (paymentMode !== 'CASH' && !patientId) ||
                (paymentMode === 'SPLIT' && (!amountPaid || amountPaid <= 0 || amountPaid >= total))
              }
              onClick={handleDirectCheckoutConfirm}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-black rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Completing…' : 'Complete Sale'}
            </button>
          </div>
        </div>
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
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT' | 'SPLIT'>('CASH');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmedSale, setConfirmedSale] = useState<any>(null);
  const [showAttachment, setShowAttachment] = useState(false);
  const [orgInfo, setOrgInfo] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, accountsRes, orgRes] = await Promise.all([
        client.get('/sales/orders/pending'),
        client.get('/payment-accounts/active'),
        client.get('/organizations/my-org').catch(() => ({ data: null })),
      ]);
      setPendingOrders(ordersRes.data || []);
      setPaymentAccounts(accountsRes.data || []);
      if (orgRes?.data) setOrgInfo(orgRes.data);
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
    setPaymentMode('CASH');
    setAmountPaid('');
    setShowPaymentModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;

    // Validations
    if (paymentMode === 'CASH' && !selectedAccount) return toastError('Error', 'Please select a payment account for cash receipt.');
    if (paymentMode === 'CREDIT' && !selectedOrder.patient) return toastError('Error', 'Patient is required for credit transactions.');
    if (paymentMode === 'SPLIT') {
      if (!selectedAccount) return toastError('Error', 'Please select a payment account for the upfront portion.');
      if (!selectedOrder.patient) return toastError('Error', 'Patient is required for the credit portion.');
      if (!amountPaid || amountPaid <= 0 || amountPaid >= selectedOrder.total_amount) return toastError('Error', 'Invalid upfront amount.');
    }

    setConfirmLoading(true);
    try {
      const payload: any = { payment_method: paymentMode };

      if (paymentMode === 'CASH') {
        payload.payment_account_id = selectedAccount?.id;
        payload.payment_account_name = selectedAccount?.name;
      } else if (paymentMode === 'SPLIT') {
        payload.payment_account_id = selectedAccount?.id;
        payload.payment_account_name = selectedAccount?.name;
        payload.amount_paid = Number(amountPaid);
      }

      const res = await client.post(`/sales/orders/${selectedOrder.id}/confirm`, payload);
      setConfirmedSale(res.data);

      let msg = '';
      if (paymentMode === 'CASH') msg = `ETB ${Number(selectedOrder.total_amount).toFixed(2)} received via ${selectedAccount?.name || 'Account'}.`;
      else if (paymentMode === 'CREDIT') msg = `Credit sale recorded for ${selectedOrder.patient?.name}.`;
      else msg = `ETB ${amountPaid} received via ${selectedAccount?.name}, remainder passed to credit.`;

      toastSuccess('Payment Confirmed', msg);

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
        <CheckCircle className="w-16 h-16 text-emerald-500 mb-3" />
        <h2 className="text-xl font-black text-gray-800">Payment Confirmed!</h2>
        <p className="text-gray-500 mt-1 text-sm tracking-tight">Receipt <strong>{confirmedSale.receipt_number}</strong> generated.</p>
        <div className="mt-2 text-xs text-gray-400">Pharmacist notified to dispense medicine.</div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button onClick={() => setConfirmedSale(null)} className="w-full justify-center bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-gray-200 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </button>
          <button onClick={() => setShowAttachment(true)} className="w-full justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2">
            <Printer className="w-4 h-4" /> Generate Attachment
          </button>
        </div>

        <AttachmentModal 
          isOpen={showAttachment} 
          onClose={() => setShowAttachment(false)} 
          sale={confirmedSale} 
          orgInfo={orgInfo} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-none">
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Cashier Queue</h1>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" /> Auto-refreshing every 6s
          </p>
        </div>
        <div className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase border shadow-sm ${pendingOrders.length > 0 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 ml-1">Pending Order</p>
                    <p className="font-black text-gray-900 text-xs tracking-tight">{order.order_number}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase opacity-60">{formatDate(order.created_at)}</span>
                </div>

                {order.patient && (
                  <div className="flex items-center gap-2 mb-2.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                    <User className="w-3.5 h-3.5 text-gray-400" /> <span className="font-black tracking-tight">{order.patient.name}</span>
                  </div>
                )}

                <div className="space-y-1 mb-3.5 flex-1">
                  {(order.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-[11px] leading-tight">
                      <div>
                        <span className="font-bold text-gray-600">{item.name}</span>
                        <span className="text-gray-400 ml-1">× {item.quantity}</span>
                      </div>
                      <span className="font-black text-gray-800">ETB {(item.quantity * item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-2.5 mb-3 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-600">Total Amount</span>
                  <span className="text-lg font-black text-indigo-700 tracking-tighter">ETB {Number(order.total_amount).toFixed(2)}</span>
                </div>

                {order.is_controlled_transaction && (
                  <div className="mb-3 flex items-center gap-1.5 text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-1 rounded-md uppercase tracking-tight">
                    <AlertTriangle className="w-2.5 h-2.5" /> Controlled Substance
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => handleCancel(order.id)} className="flex-none px-3 py-2.5 bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 rounded-xl transition-all font-bold text-xs">
                    Cancel
                  </button>
                  <button onClick={() => openPayment(order)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-50 flex items-center justify-center gap-1.5 tracking-widest active:scale-95">
                    <Wallet className="w-3 h-3" /> Accept Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={`Accept Payment — ${selectedOrder?.order_number}`}>
        <div className="space-y-3.5">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5 ml-1">Order Summary</p>
            <div className="space-y-1">
              {((selectedOrder?.items || []) as any[]).map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-[11px] font-bold text-gray-600">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="text-gray-900 tracking-tight">ETB {(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-200 flex justify-between font-black text-base">
              <span className="text-black text-[11px] tracking-widest self-center">Total Due</span>
              <span className="text-indigo-700">ETB {Number(selectedOrder?.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <div className="flex bg-gray-100 p-1 rounded-lg mb-3.5 text-[10px] font-black uppercase tracking-tight">
              <button onClick={() => setPaymentMode('CASH')} className={`flex-1 py-1.5 rounded-md transition-all ${paymentMode === 'CASH' ? 'bg-white shadow-sm text-gray-900 border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>Full Cash</button>
              <button onClick={() => setPaymentMode('CREDIT')} className={`flex-1 py-1.5 rounded-md transition-all ${paymentMode === 'CREDIT' ? 'bg-white shadow-sm text-gray-900 border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>Full Credit</button>
              <button onClick={() => setPaymentMode('SPLIT')} className={`flex-1 py-1.5 rounded-md transition-all ${paymentMode === 'SPLIT' ? 'bg-white shadow-sm text-gray-900 border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}>Split Payment</button>
            </div>

            {paymentMode !== 'CASH' && !selectedOrder?.patient && (
              <div className="bg-rose-50 text-rose-600 border border-rose-100 p-2.5 rounded-lg text-[10px] font-black tracking-tight mb-3.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Cannot issue credit: No patient attached.
              </div>
            )}

            {paymentMode === 'SPLIT' && (
              <div className="mb-3.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Upfront Amount Paid (ETB)</label>
                <input type="number" step="0.01" min="0" max={selectedOrder?.total_amount} value={amountPaid} onChange={e => setAmountPaid(e.target.value ? Number(e.target.value) : '')} className="w-full text-base font-black text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-50 transition-all outline-none" placeholder="0.00" />
                {amountPaid && amountPaid > 0 && amountPaid < selectedOrder!.total_amount && (
                  <p className="text-[9px] font-black text-indigo-500 ml-1 mt-1 uppercase tracking-tight">Remaining ETB {(selectedOrder!.total_amount - (amountPaid as number)).toFixed(2)} will be credited.</p>
                )}
              </div>
            )}

            {paymentMode !== 'CREDIT' && (
              <>
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Select Payment Account</p>
                {paymentAccounts.length === 0 ? (
                  <div className="text-center py-5 text-gray-400 text-[11px] font-bold italic border border-dashed rounded-lg bg-gray-50">
                    No payment accounts defined.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {paymentAccounts.map(acc => (
                      <button key={acc.id} onClick={() => setSelectedAccount(acc)}
                        className={`w-full text-left p-2 rounded-lg border-2 transition-all flex items-center gap-2.5 ${selectedAccount?.id === acc.id ? 'border-indigo-500 bg-indigo-50' : `${accountTypeColor(acc.type)} hover:border-indigo-200`}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedAccount?.id === acc.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
                          <div className="scale-75">{accountTypeIcon(acc.type)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-xs truncate leading-tight">{acc.name}</p>
                          {acc.account_number && <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">{acc.account_number}</p>}
                        </div>
                        {selectedAccount?.id === acc.id && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 pt-1.5">
            <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 bg-gray-50 text-gray-500 font-bold rounded-lg border border-gray-100 hover:bg-gray-100 transition-all text-xs uppercase tracking-widest">Cancel</button>
            <button
              disabled={
                confirmLoading ||
                (paymentMode !== 'CREDIT' && !selectedAccount) ||
                (paymentMode !== 'CASH' && !selectedOrder?.patient) ||
                (paymentMode === 'SPLIT' && (!amountPaid || amountPaid <= 0 || amountPaid >= selectedOrder!.total_amount))
              }
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-black rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              {confirmLoading ? 'Adding Receipt…' : 'Confirm'}
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
