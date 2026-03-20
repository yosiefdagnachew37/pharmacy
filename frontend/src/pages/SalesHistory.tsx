import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import { Search, Calendar, ChevronRight, RotateCcw, FileText, User, Printer, Lock, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import ColumnFilter from '../components/ColumnFilter';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';

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
    user?: { name: string; username?: string };
    items: any[];
    credit_records?: Array<{ status: string }>;
    split_payments?: Array<{ method: string; amount: number }>;
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
    const [exporting, setExporting] = useState(false);

    // ─── Column Filters ──────────────────────────────────────────
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        receipt: [],
        date: [],
        patient: [],
        method: [],
        user: [],
        status: [],
    });

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

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            const response = await client.get('/reporting/sales/export/excel', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to export sales report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    // ─── Unique Options ──────────────────────────────────────────
    const uniqueReceipts = useMemo(() => [...new Set(sales.map(s => s.receipt_number))].sort(), [sales]);
    const uniqueDates = useMemo(() => [...new Set(sales.map(s => new Date(s.created_at).toLocaleDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [sales]);
    const uniquePatients = useMemo(() => [...new Set(sales.map(s => s.patient?.name || 'Walk-in'))].sort(), [sales]);
    const uniqueMethods = useMemo(() => [...new Set(sales.map(s => s.payment_method).filter(Boolean))].sort(), [sales]);
    const uniqueUsers = useMemo(() => [...new Set(sales.map(s => s.user?.name || s.user?.username || 'System'))].sort(), [sales]);
    const uniqueStatuses = useMemo(() => ['Completed', 'Refunded'], []);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchesSearch =
                (sale.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (sale.patient?.name?.toLowerCase() || 'walk-in').includes(searchTerm.toLowerCase());

            const patientName = sale.patient?.name || 'Walk-in';
            const userName = sale.user?.name || sale.user?.username || 'System';
            const saleDate = new Date(sale.created_at).toLocaleDateString();
            const saleStatus = sale.is_refunded ? 'Refunded' : 'Completed';

            const matchesReceipt = columnFilters.receipt.length === 0 || columnFilters.receipt.includes(sale.receipt_number);
            const matchesDate = columnFilters.date.length === 0 || columnFilters.date.includes(saleDate);
            const matchesPatient = columnFilters.patient.length === 0 || columnFilters.patient.includes(patientName);
            const matchesMethod = columnFilters.method.length === 0 || columnFilters.method.includes(sale.payment_method);
            const matchesUser = columnFilters.user.length === 0 || columnFilters.user.includes(userName);
            const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(saleStatus);

            return matchesSearch && matchesReceipt && matchesDate && matchesPatient && matchesMethod && matchesUser && matchesStatus;
        });
    }, [sales, searchTerm, columnFilters]);

    const updateFilter = (column: string, values: string[]) => {
        setColumnFilters(prev => ({ ...prev, [column]: values }));
    };

    const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

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
            toastSuccess('Refund processed successfully.');
            setIsRefundModalOpen(false);
            setIsDetailModalOpen(false);
            fetchSales();
        } catch (error: any) {
            const msg = extractErrorMessage(error, 'Refund failed. Please try again.');
            toastError('Refund failed', msg);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
                    <p className="text-gray-500 text-sm">View and manage all transaction history</p>
                </div>
                <div className="flex w-full sm:w-auto">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {exporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        {exporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by receipt or customer..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setColumnFilters({ receipt: [], date: [], patient: [], method: [], user: [], status: [] })}
                            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                            Clear All Filters ({activeFilterCount})
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold sticky top-0 z-30 shadow-sm">
                            <tr>
                                <ColumnFilter
                                    label="Receipt #"
                                    options={uniqueReceipts}
                                    selectedValues={columnFilters.receipt}
                                    onFilterChange={(v) => updateFilter('receipt', v)}
                                    className="px-3 py-3"
                                />
                                <ColumnFilter
                                    label="Date"
                                    options={uniqueDates}
                                    selectedValues={columnFilters.date}
                                    onFilterChange={(v) => updateFilter('date', v)}
                                    className="px-3 py-3"
                                />
                                <ColumnFilter
                                    label="Customer"
                                    options={uniquePatients}
                                    selectedValues={columnFilters.patient}
                                    onFilterChange={(v) => updateFilter('patient', v)}
                                    className="px-3 py-3 hidden md:table-cell"
                                />
                                <th className="px-3 py-3 text-center hidden sm:table-cell">Type</th>
                                <th className="px-3 py-3 text-right">Amount</th>
                                <ColumnFilter
                                    label="Method"
                                    options={uniqueMethods}
                                    selectedValues={columnFilters.method}
                                    onFilterChange={(v) => updateFilter('method', v)}
                                    className="px-3 py-3 text-center hidden lg:table-cell"
                                    align="center"
                                />
                                <ColumnFilter
                                    label="Cashier"
                                    options={uniqueUsers}
                                    selectedValues={columnFilters.user}
                                    onFilterChange={(v) => updateFilter('user', v)}
                                    className="px-3 py-3 hidden xl:table-cell"
                                />
                                <ColumnFilter
                                    label="Status"
                                    options={uniqueStatuses}
                                    selectedValues={columnFilters.status}
                                    onFilterChange={(v) => updateFilter('status', v)}
                                    className="px-3 py-3 text-center hidden sm:table-cell"
                                />
                                <th className="px-3 py-3 text-right sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">Loading history...</td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                        <td className="px-3 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{sale.receipt_number}</td>
                                        <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">
                                            {new Date(sale.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3 text-xs font-semibold text-gray-800 truncate max-w-[140px] hidden md:table-cell" title={sale.patient?.name || 'Walk-in'}>
                                            {sale.patient?.name || 'Walk-in'}
                                        </td>
                                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                                            {sale.is_controlled_transaction ? (
                                                <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-indigo-100 shadow-sm">
                                                    <Lock className="w-3 h-3" /> Ctrl
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">Reg</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-xs font-bold text-gray-900 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end">
                                                <span>ETB {Number(sale.total_amount).toFixed(2)}</span>
                                                <span className={`sm:hidden text-[9px] font-bold uppercase ${sale.is_refunded ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {sale.is_refunded ? 'Refunded' : 'Paid'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center hidden lg:table-cell">
                                            <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 border border-gray-300 uppercase shadow-sm">{sale.payment_method}</span>
                                        </td>
                                        <td className="px-3 py-3 text-xs text-gray-700 truncate max-w-[100px] hidden xl:table-cell" title={sale.user?.name || sale.user?.username || 'System'}>
                                            {sale.user?.name || sale.user?.username || 'System'}
                                        </td>
                                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                                            {sale.is_refunded ? (
                                                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100">Refunded</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold border border-green-100">Paid</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right sticky right-0 bg-white/95 backdrop-blur-sm z-10 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] border-l border-gray-50">
                                            <button
                                                onClick={() => handleOpenDetail(sale)}
                                                className="p-1 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
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
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} x ETB {item.unit_price}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-gray-900">ETB {Number(item.subtotal).toFixed(2)}</p>
                                            {!item.is_refunded && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            const hasUnpaidCredit = (selectedSale.payment_method === 'CREDIT' || selectedSale.split_payments?.some(p => p.method === 'CREDIT')) && 
                                                                                   selectedSale.credit_records?.some(cr => cr.status !== 'PAID');
                                                            
                                                            if (hasUnpaidCredit) {
                                                                toastError('Refund Restricted', 'This sale was made on credit and must be fully paid before a refund can be processed.');
                                                                return;
                                                            }
                                                            handleOpenRefund(selectedSale, item);
                                                        }}
                                                        className={`p-2 rounded-lg transition-all ${
                                                            ((selectedSale.payment_method === 'CREDIT' || selectedSale.split_payments?.some(p => p.method === 'CREDIT')) && 
                                                             selectedSale.credit_records?.some(cr => cr.status !== 'PAID'))
                                                            ? 'text-gray-300 cursor-not-allowed' 
                                                            : 'text-rose-500 hover:bg-rose-50'
                                                        }`}
                                                        title={((selectedSale.payment_method === 'CREDIT' || selectedSale.split_payments?.some(p => p.method === 'CREDIT')) && 
                                                                selectedSale.credit_records?.some(cr => cr.status !== 'PAID'))
                                                                ? 'Refund restricted until credit is paid'
                                                                : 'Process Refund'}
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    {((selectedSale.payment_method === 'CREDIT' || selectedSale.split_payments?.some(p => p.method === 'CREDIT')) && 
                                                      selectedSale.credit_records?.some(cr => cr.status !== 'PAID')) && (
                                                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 italic">
                                                            Awaiting Credit Payment
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {item.is_refunded && (
                                                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100">
                                                    Refunded
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dashed flex justify-between items-center font-bold text-lg">
                            <span>Total Amount</span>
                            <span>ETB {Number(selectedSale.total_amount).toFixed(2)}</span>
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
                            <p className="text-xs text-amber-700">Full return of {refundItem?.quantity} units. Amount to return: ETB {refundItem ? (Number(refundItem.price) * Number(refundItem.quantity)).toFixed(2) : 0}</p>
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
