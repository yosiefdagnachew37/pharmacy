import { useState, useEffect } from 'react';
import client from '../api/client';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  CheckCircle,
  Wallet,
  Building2,
  Printer,
  Download,
  AlertTriangle,
  Lock,
  Percent,
  Banknote,
  Barcode,
  Package
} from 'lucide-react';
import Modal from '../components/Modal';
import PrescriptionAttachment from '../components/PrescriptionAttachment';
import { toastError, toastWarning, toastSuccess } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';

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

interface CartItem {
  medicine_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

const POS = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [patientId, setPatientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingMed, setPendingMed] = useState<Medicine | null>(null);
  const [managerPin, setManagerPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);

  // Phase 5 features
  const [cartDiscount, setCartDiscount] = useState<number | undefined>(0);
  const [splitAmounts, setSplitAmounts] = useState<{ cash: number | undefined, card: number }>({ cash: 0, card: 0 });

  // Quick Add Patient
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', address: '' });
  const [addPatientLoading, setAddPatientLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');

  const fetchData = async () => {
    try {
      const [medRes, patientRes, custRes] = await Promise.all([
        client.get('/medicines'),
        client.get('/patients').catch(() => ({ data: [] })),
        client.get('/credit/customers').catch(() => ({ data: [] }))
      ]);

      if (medRes?.data) {
        const formattedMeds = medRes.data.map((m: any) => ({
          ...m,
          selling_price: Number(m.selling_price || 0)
        }));
        setMedicines(formattedMeds);
      }

      // Merge patients and credit customers, deduplicate by Name (case-insensitive)
      const patientList = (patientRes?.data || []).map((p: any) => ({ id: p.id, name: p.name, phone: p.phone || '' }));
      const creditList = (custRes?.data || []).map((c: any) => ({ id: c.id, name: c.name, phone: c.phone || '' }));
      
      const mergedMap = new Map();
      patientList.forEach((p: any) => mergedMap.set(p.name.toLowerCase(), p));
      creditList.forEach((c: any) => {
        const key = c.name.toLowerCase();
        if (!mergedMap.has(key)) {
          mergedMap.set(key, c);
        }
      });

      setCustomers(Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error fetching POS data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Barcode Scanner Logic ---
  useEffect(() => {
    let barcodeBuffer = '';
    let barcodeTimeout: any;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses if focus is in an input field (search, customer ID, etc.)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === 'Enter' && barcodeBuffer.length > 3) {
        // Barcode scan complete
        const scannedMed = medicines.find(
          (m) => m.barcode === barcodeBuffer || m.sku === barcodeBuffer
        );
        if (scannedMed) {
          addToCart(scannedMed);
        } else {
          console.warn(`Barcode not found in active inventory: ${barcodeBuffer}`);
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        // Collect characters
        barcodeBuffer += e.key;

        // Reset buffer if typing is too slow (human typing vs scanner)
        clearTimeout(barcodeTimeout);
        barcodeTimeout = setTimeout(() => {
          barcodeBuffer = '';
        }, 50); // Scanner inputs keys within 20-40ms usually
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(barcodeTimeout);
    };
  }, [medicines, cart]);

  const addToCart = (med: Medicine) => {
    if (med.total_stock <= 0) return;

    if (med.is_controlled) {
      setPendingMed(med);
      setShowAuthModal(true);
      return;
    }

    processAddToCart(med);
  };

  const processAddToCart = (med: Medicine) => {
    const existing = cart.find(item => item.medicine_id === med.id);
    if (existing) {
      if (existing.quantity >= med.total_stock) return;
      setCart(cart.map(item =>
        item.medicine_id === med.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        medicine_id: med.id,
        name: med.name,
        quantity: 1,
        unit_price: med.selling_price || 0
      }]);
    }
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await client.post('/users/verify-pin', { pin: managerPin });
      if (res.data.valid) {
        if (pendingMed) {
          processAddToCart(pendingMed);
        }
        setShowAuthModal(false);
        setPendingMed(null);
        setManagerPin('');
      } else {
        setAuthError('Invalid Authorization PIN or insufficient permissions');
      }
    } catch (err) {
      setAuthError('Authorization service error');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.medicine_id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.medicine_id === id) {
        const newQty = item.quantity + delta;
        const med = medicines.find(m => m.id === id);
        if (newQty > 0 && med && newQty <= med.total_stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const updatePrice = (id: string, newPrice: number | undefined) => {
    setCart(cart.map(item =>
      item.medicine_id === id ? { ...item, unit_price: newPrice !== undefined ? (newPrice >= 0 ? newPrice : 0) : 0 } : item
    ));
  };

  const handleQuickAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name) return;
    setAddPatientLoading(true);
    try {
      const res = await client.post('/patients', newPatient);
      toastSuccess('Success', 'New customer registered successfully.');
      setShowAddPatientModal(false);
      setNewPatient({ name: '', phone: '', address: '' });
      await fetchData();
      setPatientId(res.data.id);
    } catch (err) {
      console.error('Failed to add patient', err);
      toastError('Error', 'Failed to register customer.');
    } finally {
      setAddPatientLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountAmount = (subtotal * ((cartDiscount ?? 0) / 100));
  const total = subtotal - discountAmount;
  const hasControlledItems = cart.some(item => medicines.find(m => m.id === item.medicine_id)?.is_controlled);

  useEffect(() => {
    // Auto-update split amounts if we switch away or total changes
    if (paymentMethod === 'SPLIT') {
      const cashVal = splitAmounts.cash ?? 0;
      const remaining = total - cashVal;
      setSplitAmounts(prev => ({ ...prev, card: remaining >= 0 ? remaining : 0 }));
    }
  }, [total, paymentMethod, splitAmounts.cash]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (hasControlledItems && !prescriptionUrl) {
      toastWarning('Prescription required', 'Please attach a prescription for controlled substances before charging.');
      return;
    }

    if (paymentMethod === 'CREDIT' && !patientId) {
      toastWarning('Customer required', 'Credit sales require selecting a registered customer.');
      return;
    }

    setLoading(true);
    try {
      const saleItems = cart.map(item => ({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const payload: any = {
        patient_id: patientId || undefined,
        items: saleItems,
        total_price: total,
        payment_method: paymentMethod,
        discount: discountAmount,
        prescription_image_url: prescriptionUrl || undefined
      };

      if (paymentMethod === 'SPLIT') {
        payload.split_payments = [
          { method: 'CASH', amount: splitAmounts.cash ?? 0 },
          { method: 'CREDIT_CARD', amount: splitAmounts.card }
        ];
      }

      const res = await client.post('/sales', payload);
      setReceipt(res.data);
      setSuccess(true);
      setCart([]);
      setPatientId('');
      setPaymentMethod('CASH');
      setCartDiscount(0);
      setSplitAmounts({ cash: 0, card: 0 });

      // Refresh medicines stock
      fetchData();
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Checkout failed. Please check stock availability.');
      toastError('Checkout failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(m =>
    (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (m.generic_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (success && receipt) {
    const fetchAndPrintReceipt = async () => {
      try {
        const res = await client.get(`/receipts/${receipt.id}`);
        const fullReceipt = res.data;
        // In a real app, this would open a printable PDF or trigger a thermal printer
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
          receiptWindow.document.write(`
              <html><head><title>Receipt ${fullReceipt.receipt_number}</title>
              <style>
                body { font-family: monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: black; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .flex { display: flex; justify-content: space-between; }
                .border-bottom { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                .qr-code { text-align: center; margin-top: 20px; }
                .qr-code img { max-width: 150px; display: block; margin: 0 auto; }
                .header h2 { margin: 0; padding: 0; font-size: 1.5em; }
                .header p { margin: 2px 0; font-size: 0.9em; }
              </style>
              </head><body>
                <div class="header text-center border-bottom">
                  <h2>PHARMACY RECEIPT</h2>
                  <p>123 Health Ave, Pharma City</p>
                  <p>Tel: +1 234 567 8900</p>
                  <p>License No. PHAR-2026</p>
                </div>
                <div><b>Receipt No:</b> ${fullReceipt.receipt_number}</div>
                <div><b>Date:</b> ${new Date(fullReceipt.date).toLocaleString()}</div>
                <div><b>Cashier:</b> ${fullReceipt.cashier}</div>
                <div class="border-bottom"><b>Customer:</b> ${fullReceipt.customer}</div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                  <thead>
                    <tr style="border-bottom: 1px dashed #000;">
                      <th style="text-align: left;">Item</th>
                      <th style="text-align: right;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Sub</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${fullReceipt.items.map((item: any) => `
                      <tr>
                        <td style="text-align: left; padding: 4px 0;">${item.name}</td>
                        <td style="text-align: right;">${item.quantity}</td>
                        <td style="text-align: right;">${Number(item.unit_price).toFixed(2)}</td>
                        <td style="text-align: right;">${Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div class="flex">
                   <span>Subtotal:</span>
                   <span>ETB ${(Number(fullReceipt.total) + Number(fullReceipt.discount)).toFixed(2)}</span>
                </div>
                ${fullReceipt.discount > 0 ? `
                <div class="flex" style="color: #666;">
                   <span>Discount:</span>
                   <span>-ETB ${Number(fullReceipt.discount).toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="border-bottom" style="margin-top: 5px;"></div>
                <div class="flex bold" style="font-size: 1.2em;">
                   <span>TOTAL</span>
                   <span>ETB ${Number(fullReceipt.total).toFixed(2)}</span>
                </div>
                <div class="text-center bold" style="margin-top: 10px; text-transform: uppercase;">
                  Paid via: ${fullReceipt.payment_method}
                </div>
                
                <div class="qr-code">
                  <img src="${fullReceipt.qr_code}" alt="QR Verification" />
                  <p style="font-size: 10px; margin-top: 4px;">Scan for verification</p>
                </div>
                <div class="text-center border-bottom" style="margin-top: 10px;"></div>
                <div class="text-center" style="margin-top: 10px; font-size: 12px; font-weight: bold;">Thank you for your business!</div>
              </body></html>
            `);
          receiptWindow.document.close();
          receiptWindow.focus();
          setTimeout(() => { receiptWindow.print(); }, 500);
        }
      } catch (err) {
        console.error("Failed to generate receipt", err);
        alert("Failed to fetch full receipt data.");
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">Sale Completed!</h2>
        <p className="text-gray-500 mt-2">
          {receipt.payment_method === 'CREDIT'
            ? 'Credit transaction logged. Customer debt updated.'
            : 'Inventory has been updated and transaction logged.'}
        </p>

        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-left">
          <p className="text-xs text-center text-gray-400 font-mono mb-4">{receipt.receipt_number}</p>
          <div className="space-y-2 mb-4">
            {receipt.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item.medicine?.name} x{item.quantity}</span>
                <span className="text-gray-900">ETB {Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-dashed border-gray-300 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>ETB {Number(receipt.total_amount).toFixed(2)}</span>
          </div>
          <div className="mt-2 text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-1 rounded-md uppercase">
            {receipt.payment_method}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => { setSuccess(false); setReceipt(null); }}
            className="bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-2xl font-bold shadow-sm hover:bg-indigo-50 active:scale-95 transition-all"
          >
            New Transaction
          </button>
          <button
            onClick={fetchAndPrintReceipt}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" /> Print Full Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 gap-6 relative">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex mb-4 bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex-none">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4" />
          Products
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'cart' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cart.length > 0 && (
            <span className={`absolute top-2 right-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
              activeTab === 'cart' ? 'bg-white text-indigo-600 border-indigo-600' : 'bg-rose-500 text-white border-white'
            }`}>
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Product Selection */}
      <div className={`flex-1 flex flex-col min-h-0 ${activeTab !== 'products' && 'hidden lg:flex'}`}>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicine (Name or Generic)..."
            className="w-full pl-12 pr-36 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg" title="USB barcode scanner supported: plug in your scanner and scan any medicine barcode to instantly add it to the cart.">
            <Barcode className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Barcode Scanner Ready</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredMedicines.map(med => (
            <button
              key={med.id}
              onClick={() => addToCart(med)}
              disabled={med.total_stock <= 0}
              className={`p-5 bg-white border rounded-2xl text-left hover:border-indigo-400 hover:shadow-lg transition-all group ${med.total_stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed border-gray-100' : 'border-gray-50 shadow-sm'}`}
            >
              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{med.name}</h3>
              <p className="text-xs text-gray-500 mb-4 line-clamp-1 h-4">{med.generic_name}</p>
              <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-auto">
                <div>
                  <span className="text-xs text-gray-400 font-bold block mb-0.5">Price</span>
                  <span className="text-base font-black text-indigo-700">ETB {Number(med.selling_price || 0).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase">In Stock</span>
                  <span className={`text-xs font-black px-2 py-1 rounded-md ${med.total_stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {med.total_stock}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className={`w-full lg:w-[420px] bg-white border border-gray-100 rounded-[2rem] shadow-xl flex flex-col h-full min-h-0 flex-shrink-0 lg:max-h-full ${activeTab !== 'cart' && 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-gray-50 flex items-center justify-between flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-gray-800 text-lg">Current Sale</h2>
          </div>
          <button
            onClick={() => setCart([])}
            className="text-[10px] font-black uppercase text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-all"
          >
            Clear Cart
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium">Scan or select items</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.medicine_id} className="group relative bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-gray-800 pr-8 leading-tight">{item.name}</h4>
                  <button 
                    onClick={() => removeFromCart(item.medicine_id)} 
                    className="absolute top-3 right-3 text-gray-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.medicine_id, -1)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine_id, 1)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Price</span>
                      <input
                        type="number"
                        className="w-14 text-right text-xs font-bold text-indigo-600 bg-white border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-indigo-500 hide-arrows"
                        value={item.unit_price ?? ''}
                        onChange={(e) => updatePrice(item.medicine_id, e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        step="0.01"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-gray-900">ETB {(item.quantity * item.unit_price).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Section: Customer, Payment, Totals & Charge Button */}
        <div className="p-3 bg-gray-50/50 rounded-b-[2rem] border-t border-gray-100 flex flex-col gap-1.5 flex-none overflow-y-auto custom-scrollbar">
          {/* Customer Selection */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Customer / Patient</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={patientId}
                onChange={(e) => {
                  if (e.target.value === 'NEW_CUSTOMER') {
                    setShowAddPatientModal(true);
                  } else {
                    setPatientId(e.target.value);
                  }
                }}
                className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-xs font-medium appearance-none ${paymentMethod === 'CREDIT' && !patientId ? 'border-amber-300 ring-2 ring-amber-50' : 'border-gray-200'}`}
              >
                <option value="">Walk-in Customer (Unregistered)</option>
                <option value="NEW_CUSTOMER" className="text-indigo-600 font-bold">+ New Customer (Quick Add)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`py-1.5 px-1 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CASH' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Wallet className="w-3.5 h-3.5" /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod('CREDIT')}
                className={`py-1.5 px-1 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CREDIT' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Building2 className="w-3.5 h-3.5" /> Credit
              </button>
              <button
                onClick={() => setPaymentMethod('SPLIT')}
                className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-2 transition-all col-span-2 ${paymentMethod === 'SPLIT' ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Banknote className="w-3.5 h-3.5" /> <span>Split Payment (Cash + Card)</span>
              </button>
            </div>

            {/* Split Inputs - constrained height */}
            <div className="max-h-[120px] overflow-y-auto custom-scrollbar mt-2">
              {paymentMethod === 'SPLIT' && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cash</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-100 font-black text-purple-700"
                       value={splitAmounts.cash ?? ''}
                       onChange={(e) => setSplitAmounts(prev => ({ ...prev, cash: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                     />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Card</label>
                    <div className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-black text-gray-600 flex items-center h-[30px]">
                      ETB {splitAmounts.card.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controlled Substance Compliance */}
          {hasControlledItems && (
            <div className="pt-2 border-t border-dashed border-gray-200">
              <PrescriptionAttachment
                onAttachment={setPrescriptionUrl}
                attachedUrl={prescriptionUrl}
              />
            </div>
          )}

          <div className="pt-2 border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-[10px] font-bold uppercase flex items-center gap-1"><Percent className="w-3 h-3" /> Discount</span>
              <div className="relative w-16">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full text-right bg-white border border-gray-200 rounded-md px-1 py-0.5 text-xs font-bold focus:outline-none focus:border-indigo-400"
                  value={cartDiscount ?? ''}
                  onChange={(e) => setCartDiscount(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
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
            disabled={cart.length === 0 || loading || (paymentMethod === 'CREDIT' && !patientId) || (paymentMethod === 'SPLIT' && ((splitAmounts.cash ?? 0) + splitAmounts.card !== total)) || (hasControlledItems && !prescriptionUrl)}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none transition-all mt-1"
          >
            {loading ? 'Processing...' : `Charge ETB ${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingMed(null); setManagerPin(''); setAuthError(''); }}
        title="Authorization Required"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="p-2 bg-amber-500 text-white rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Controlled Substance Detected</p>
              <p className="text-xs text-gray-500">"{pendingMed?.name}" requires manager authorization to be added to the cart.</p>
            </div>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Manager Authorization PIN</label>
              <p className="text-[10px] text-indigo-500 mb-2 ml-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINs are set per-user in <strong>System → User Management</strong>.
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="password"
                  placeholder="Enter PIN"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold tracking-widest ${authError ? 'border-rose-300' : 'border-gray-200'}`}
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                />
              </div>
              {authError && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{authError}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowAuthModal(false); setPendingMed(null); setManagerPin(''); setAuthError(''); }}
                className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Authorize
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* QUICK ADD PATIENT MODAL */}
      <Modal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        title="Quick Register Customer"
      >
        <form onSubmit={handleQuickAddPatient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
              placeholder="e.g. Abebe Kebede"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
              placeholder="09..."
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address (Optional)</label>
            <textarea
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm resize-none"
              rows={2}
              value={newPatient.address}
              onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddPatientModal(false)}
              className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addPatientLoading}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm disabled:opacity-50"
            >
              {addPatientLoading ? 'Registering...' : 'Register & Select'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default POS;
