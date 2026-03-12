import { useEffect, useState } from 'react';
import client from '../api/client';
import { Search, Calendar, ChevronRight, RotateCcw, FileText, User, Printer, Lock, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';

interface Sale {
    id: string;
    receipt_number: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    is_refunded: boolean;
    refund_amount: number;
    is_controlled_transaction: boolean;
    prescription_image_url?: string;
    patient?: { name: string };
    user?: { name: string };
    items: any[];
}

const SalesHistory = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [refundItem, setRefundItem] = useState<{ medicine_id: string, name: string, quantity: number, price: number } | null>(null);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await client.get('/sales');
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const filteredSales = sales.filter(s =>
        (s.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.patient?.name?.toLowerCase() || 'walk-in').includes(searchTerm.toLowerCase())
    );

    const handleOpenDetail = (sale: Sale) => {
        setSelectedSale(sale);
        setIsDetailModalOpen(true);
    };

    const handleOpenRefund = (sale: Sale, item: any) => {
        setRefundItem({
            medicine_id: item.medicine_id,
            name: item.medicine?.name || 'Unknown',
            quantity: item.quantity,
            price: item.unit_price
        });
        setSelectedSale(sale);
        setIsRefundModalOpen(true);
    };

    const processRefund = async () => {
        if (!selectedSale || !refundItem) return;
        try {
            await client.post(`/sales/${selectedSale.id}/refund`, {
                medicine_id: refundItem.medicine_id,
                quantity: refundItem.quantity,
                amount: Number(refundItem.price) * Number(refundItem.quantity),
                reason: refundReason
            });
            alert('Refund processed successfully');
            setIsRefundModalOpen(false);
            setIsDetailModalOpen(false);
            fetchSales();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Refund failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by receipt or customer..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Receipt #</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Compliance</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading history...</td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{sale.receipt_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(sale.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {sale.patient?.name || 'Walk-in'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.is_controlled_transaction ? (
                                                <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-indigo-100 shadow-sm">
                                                    <Lock className="w-3 h-3" /> Controlled
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">Regular</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ${Number(sale.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.is_refunded ? (
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">Refunded (${Number(sale.refund_amount).toFixed(2)})</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Completed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenDetail(sale)}
                                                className="p-1 hover:bg-gray-100 rounded text-indigo-600"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sale Detail Modal */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Sale Details">
                {selectedSale && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                            <div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase">Receipt Number</p>
                                <p className="font-mono">{selectedSale.receipt_number}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase">Date & Time</p>
                                <p>{new Date(selectedSale.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase">Cashier</p>
                                <p>{selectedSale.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase">Payment Method</p>
                                <p className="font-bold">{selectedSale.payment_method}</p>
                            </div>
                        </div>

                        {selectedSale.prescription_image_url && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Attached Prescription
                                </h3>
                                <div className="border rounded-2xl overflow-hidden bg-gray-50 aspect-video flex items-center justify-center relative group">
                                    <img
                                        src={selectedSale.prescription_image_url}
                                        alt="Prescription"
                                        className="max-h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => window.open(selectedSale.prescription_image_url, '_blank')}
                                            className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                                        >
                                            View Full Size
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items</h3>
                            <div className="divide-y divide-gray-100 border rounded-xl">
                                {selectedSale.items?.map((item, idx) => (
                                    <div key={idx} className="p-3 flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.medicine?.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} x ${item.unit_price}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-gray-900">${Number(item.subtotal).toFixed(2)}</p>
                                            {!selectedSale.is_refunded && (
                                                <button
                                                    onClick={() => handleOpenRefund(selectedSale, item)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Process Refund"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dashed flex justify-between items-center font-bold text-lg">
                            <span>Total Amount</span>
                            <span>${Number(selectedSale.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Refund Processing Modal */}
            <Modal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)} title="Process Refund">
                <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                        <RotateCcw className="w-5 h-5 text-amber-600 mt-1" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">Refund for {refundItem?.name}</p>
                            <p className="text-xs text-amber-700">Full return of {refundItem?.quantity} units. Amount to return: ${refundItem ? (Number(refundItem.price) * Number(refundItem.quantity)).toFixed(2) : 0}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reason for Return</label>
                        <textarea
                            rows={3}
                            placeholder="e.g., Damaged item, Incorrect prescription..."
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsRefundModalOpen(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={processRefund}
                            className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
                        >
                            Confirm Refund
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesHistory;
