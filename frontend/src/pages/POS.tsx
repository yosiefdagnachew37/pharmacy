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
  Lock
} from 'lucide-react';
import Modal from '../components/Modal';
import PrescriptionAttachment from '../components/PrescriptionAttachment';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  total_stock: number;
  selling_price: number;
  current_selling_price: number;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, custRes] = await Promise.all([
          client.get('/medicines'),
          client.get('/credit/customers') // Using the new credit module endpoint for all registered customers
        ]);

        // Use current_selling_price if it exists, otherwise fallback to selling_price
        const formattedMeds = medRes.data.map((m: any) => ({
          ...m,
          selling_price: m.current_selling_price ? Number(m.current_selling_price) : Number(m.selling_price)
        }));

        setMedicines(formattedMeds);
        setCustomers(custRes.data);
      } catch (err) {
        console.error('Error fetching POS data:', err);
      }
    };
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

  const updatePrice = (id: string, newPrice: number) => {
    setCart(cart.map(item =>
      item.medicine_id === id ? { ...item, unit_price: newPrice >= 0 ? newPrice : 0 } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const hasControlledItems = cart.some(item => medicines.find(m => m.id === item.medicine_id)?.is_controlled);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (hasControlledItems && !prescriptionUrl) {
      alert('Prescription attachment is required for controlled substances.');
      return;
    }

    if (paymentMethod === 'CREDIT' && !patientId) {
      alert('Credit sales require selecting a registered customer.');
      return;
    }

    setLoading(true);
    try {
      const saleItems = cart.map(item => ({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const res = await client.post('/sales', {
        patient_id: patientId || undefined,
        items: saleItems,
        total_price: total,
        payment_method: paymentMethod,
        prescription_image_url: prescriptionUrl || undefined
      });
      setReceipt(res.data);
      setSuccess(true);
      setCart([]);
      setPatientId('');
      setPaymentMethod('CASH');

      // Refresh medicines stock
      const stockRes = await client.get('/medicines');
      setMedicines(stockRes.data);
    } catch (err: any) {
      console.error('Checkout failed:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Checkout failed. Please check stock availability.');
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
                body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: black; }
                .text-center { text-align: center; }
                .bold { font-weight: bold; }
                .flex { display: flex; justify-content: space-between; }
                .border-bottom { border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
                .qr-code { text-align: center; margin-top: 20px; }
                .qr-code img { max-width: 150px; }
              </style>
              </head><body>
                <h2 class="text-center bold">PHARMACY RECEIPT</h2>
                <div class="text-center border-bottom">${fullReceipt.receipt_number}</div>
                <div>Date: ${new Date(fullReceipt.date).toLocaleString()}</div>
                <div>Cashier: ${fullReceipt.cashier}</div>
                <div class="border-bottom">Customer: ${fullReceipt.customer}</div>
                ${fullReceipt.items.map((item: any) => `
                  <div class="flex">
                    <span>${item.name} x${item.quantity}</span>
                    <span>$${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                `).join('')}
                <div class="border-bottom" style="margin-top: 10px;"></div>
                <div class="flex bold" style="font-size: 1.2em;">
                   <span>TOTAL</span>
                   <span>$${Number(fullReceipt.total).toFixed(2)}</span>
                </div>
                <div class="text-center" style="margin-top: 10px;">Paid via: ${fullReceipt.payment_method}</div>
                <div class="qr-code">
                  <img src="${fullReceipt.qr_code}" alt="QR Verification" />
                  <p style="font-size: 10px;">Scan to Verify</p>
                </div>
                <div class="text-center" style="margin-top: 20px; font-size: 10px;">Thank you for your business!</div>
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
                <span className="text-gray-900">${Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-dashed border-gray-300 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${Number(receipt.total_amount).toFixed(2)}</span>
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
    <div className="flex flex-col lg:flex-row h-full gap-8">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicine (Name or Generic)..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <span className="text-base font-black text-indigo-700">${Number(med.selling_price || 0).toFixed(2)}</span>
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
      <div className="w-full lg:w-[400px] bg-white border border-gray-100 rounded-[2rem] shadow-xl flex flex-col h-fit lg:h-full sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
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

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium">Scan or select items</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.medicine_id} className="group flex justify-between items-start bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 pr-2">{item.name}</h4>
                  <div className="flex items-center mt-2 bg-white w-fit rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.medicine_id, -1)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine_id, 1)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between h-full items-end">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      className="w-16 text-right text-[15px] font-black text-indigo-600 bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none p-0 hide-arrows"
                      value={item.unit_price}
                      onChange={(e) => updatePrice(item.medicine_id, parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                  <p className="text-[13px] font-bold text-gray-500">Total: ${(item.quantity * item.unit_price).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.medicine_id)} className="text-rose-400 hover:text-rose-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50/50 rounded-b-[2rem] border-t border-gray-100 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Customer / Patient</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className={`w-full pl-9 pr-4 py-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-medium appearance-none ${paymentMethod === 'CREDIT' && !patientId ? 'border-amber-300 ring-2 ring-amber-50 shadow-sm shadow-amber-100' : 'border-gray-200'}`}
              >
                <option value="">Walk-in Customer (Unregistered)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            </div>
            {paymentMethod === 'CREDIT' && !patientId && (
              <p className="text-[10px] font-bold text-amber-600 mt-1 ml-1 flex items-center gap-1">
                Required for Credit Sales.
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CASH' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Wallet className="w-4 h-4" /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod('CREDIT')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CREDIT' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Building2 className="w-4 h-4" /> Credit
              </button>
              <button
                onClick={() => setPaymentMethod('CHEQUE')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CHEQUE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <CreditCard className="w-4 h-4" /> Cheque
              </button>
            </div>
          </div>

          {/* Controlled Substance Compliance */}
          {hasControlledItems && (
            <div className="pt-4 border-t border-dashed border-gray-200">
              <PrescriptionAttachment
                onAttachment={setPrescriptionUrl}
                attachedUrl={prescriptionUrl}
              />
              {!prescriptionUrl && (
                <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Prescription attachment required for controlled drugs.
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase">Subtotal</span>
              <span className="text-sm font-bold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end text-gray-900">
              <span className="text-sm font-black uppercase">Total Due</span>
              <span className="text-3xl font-black">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || loading || (paymentMethod === 'CREDIT' && !patientId) || (hasControlledItems && !prescriptionUrl)}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:transform-none transition-all mt-4"
          >
            {loading ? 'Processing...' : `Charge $${total.toFixed(2)}`}
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
    </div>
  );
};

export default POS;
