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
  CheckCircle 
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  total_stock: number;
}

interface CartItem {
  medicine_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

const POS = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await client.get('/medicines');
        setMedicines(response.data);
      } catch (err) {
        console.error('Error fetching medicines:', err);
      }
    };
    fetchMedicines();
  }, []);

  const addToCart = (med: Medicine) => {
    if (med.total_stock <= 0) return;
    
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
        unit_price: 10.0 // Mock price, logic for pricing needed in backend/entity
      }]);
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

  const total = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await client.post('/sales', {
        patient_id: patientId || undefined,
        items: cart,
        total_price: total,
        payment_method: 'CASH'
      });
      setSuccess(true);
      setCart([]);
      setPatientId('');
      // Refresh medicines stock
      const response = await client.get('/medicines');
      setMedicines(response.data);
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please check stock availability.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.generic_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">Sale Completed!</h2>
        <p className="text-gray-500 mt-2">Inventory has been updated and transaction logged.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
        >
          New Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-8">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search medicine by name or generic name..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredMedicines.map(med => (
            <button
              key={med.id}
              onClick={() => addToCart(med)}
              disabled={med.total_stock <= 0}
              className={`p-4 bg-white border rounded-xl text-left hover:border-indigo-500 hover:shadow-md transition-all ${med.total_stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'border-gray-200'}`}
            >
              <h3 className="font-bold text-gray-900 truncate">{med.name}</h3>
              <p className="text-xs text-gray-500 mb-3 truncate">{med.generic_name}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-indigo-600">$10.00</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${med.total_stock < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  Stock: {med.total_stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="w-96 bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="font-bold text-gray-800">Current Sale</h2>
          </div>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.medicine_id} className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center mt-1 space-x-3">
                    <button onClick={() => updateQuantity(item.medicine_id, -1)} className="text-gray-400 hover:text-indigo-600"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-bold text-gray-600 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine_id, 1)} className="text-gray-400 hover:text-indigo-600"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-gray-900">${(item.quantity * item.unit_price).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.medicine_id)} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-3 h-3 ml-auto" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <div className="mb-4">
            <div className="flex items-center mb-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Patient ID (Optional)" 
                className="bg-transparent text-sm w-full focus:outline-none"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-800 font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {loading ? 'Processing...' : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Complete Checkout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
