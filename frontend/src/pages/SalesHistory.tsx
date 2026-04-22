import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import { Search, Calendar, ChevronRight, RotateCcw, FileText, User, Printer, Lock, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import ColumnFilter from '../components/ColumnFilter';
import { toastSuccess, toastError } from '../components/Toast';
import { formatDate } from '../utils/dateUtils';
import { extractErrorMessage } from '../utils/errorUtils';
import AttachmentModal from '../components/AttachmentModal';

interface Sale {
    id: string;
    receipt_number: string;
    total_amount: number;
    payment_method: string;
    payment_account_name?: string;
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
    const [showAttachment, setShowAttachment] = useState(false);
    const [orgInfo, setOrgInfo] = useState<any>(null);

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
            const [salesRes, orgRes] = await Promise.all([
                client.get('/sales'),
                client.get('/organizations/my-org').catch(() => ({ data: null }))
            ]);
            setSales(salesRes.data);
            if (orgRes?.data) setOrgInfo(orgRes.data);
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
    const uniqueDates = useMemo(() => [...new Set(sales.map(s => formatDate(s.created_at)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [sales]);
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
            const saleDate = formatDate(sale.created_at);
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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Sales History</h1>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Transaction Archive</p>
                </div>
                <div className="flex w-full sm:w-auto">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {exporting ? (
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-3.5 h-3.5 mr-2" />
                        )}
                        {exporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-visible">
                <div className="p-2 border-b border-gray-50 flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="Search receipt or customer..."
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-50 text-[11px] font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setColumnFilters({ receipt: [], date: [], patient: [], method: [], user: [], status: [] })}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap uppercase tracking-widest"
                        >
                            Reset ({activeFilterCount})
                        </button>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[9px] font-black tracking-widest sticky top-0 z-30 border-b border-gray-50">
                            <tr>
                                <ColumnFilter
                                    label="Receipt #"
                                    options={uniqueReceipts}
                                    selectedValues={columnFilters.receipt}
                                    onFilterChange={(v) => updateFilter('receipt', v)}
                                    className="px-2 py-2"
                                />
                                <ColumnFilter
                                    label="Date"
                                    options={uniqueDates}
                                    selectedValues={columnFilters.date}
                                    onFilterChange={(v) => updateFilter('date', v)}
                                    className="px-2 py-2"
                                />
                                <ColumnFilter
                                    label="Customer"
                                    options={uniquePatients}
                                    selectedValues={columnFilters.patient}
                                    onFilterChange={(v) => updateFilter('patient', v)}
                                    className="px-2 py-2 hidden md:table-cell"
                                />
                                <th className="px-2 py-2 text-center hidden sm:table-cell">Type</th>
                                <th className="px-2 py-2 text-right">Amount</th>
                                <ColumnFilter
                                    label="Method"
                                    options={uniqueMethods}
                                    selectedValues={columnFilters.method}
                                    onFilterChange={(v) => updateFilter('method', v)}
                                    className="px-2 py-2 text-center hidden lg:table-cell"
                                    align="center"
                                />
                                <ColumnFilter
                                    label="Cashier"
                                    options={uniqueUsers}
                                    selectedValues={columnFilters.user}
                                    onFilterChange={(v) => updateFilter('user', v)}
                                    className="px-2 py-2 hidden xl:table-cell"
                                />
                                <ColumnFilter
                                    label="Status"
                                    options={uniqueStatuses}
                                    selectedValues={columnFilters.status}
                                    onFilterChange={(v) => updateFilter('status', v)}
                                    className="px-2 py-2 text-center hidden sm:table-cell"
                                />
                                <th className="px-2 py-2 text-right sticky right-0 bg-gray-50/50 z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={9} className="px-6 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Initialising archive…</td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan={9} className="px-6 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching records</td></tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-2 py-1.5 font-mono text-[10px] font-black text-indigo-600 whitespace-nowrap">{sale.receipt_number}</td>
                                        <td className="px-2 py-1.5 text-[10px] font-bold text-gray-500 whitespace-nowrap uppercase tracking-tighter">
                                            {formatDate(sale.created_at)}
                                        </td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-gray-800 truncate max-w-[140px] hidden md:table-cell tracking-tight" title={sale.patient?.name || 'Walk-in'}>
                                            {sale.patient?.name || 'Walk-in'}
                                        </td>
                                        <td className="px-2 py-1.5 text-center hidden sm:table-cell">
                                            {sale.is_controlled_transaction ? (
                                                <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-indigo-100 tracking-tighter">
                                                    <Lock className="w-2.5 h-2.5" /> Ctrl
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-[8px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">Reg</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-gray-900 whitespace-nowrap text-right tracking-tight">
                                            <div className="flex flex-col items-end">
                                                <span>ETB {Number(sale.total_amount).toFixed(2)}</span>
                                                <span className={`sm:hidden text-[7px] font-black uppercase tracking-widest ${sale.is_refunded ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {sale.is_refunded ? 'Refunded' : 'Paid'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 text-center hidden lg:table-cell">
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black text-gray-500 border border-gray-100 uppercase tracking-tighter">{sale.payment_method}</span>
                                        </td>
                                        <td className="px-2 py-1.5 text-[10px] font-bold text-gray-400 truncate max-w-[100px] hidden xl:table-cell uppercase tracking-tighter" title={sale.user?.name || sale.user?.username || 'System'}>
                                            {sale.user?.name || sale.user?.username || 'System'}
                                        </td>
                                        <td className="px-2 py-1.5 text-center hidden sm:table-cell">
                                            {sale.is_refunded ? (
                                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[8px] font-black border border-rose-100 uppercase tracking-widest">Refunded</span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black border border-emerald-100 uppercase tracking-widest">Paid</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 text-right sticky right-0 bg-white/90 group-hover:bg-indigo-50/90 backdrop-blur-sm z-10 border-l border-gray-50">
                                            <button
                                                onClick={() => handleOpenDetail(sale)}
                                                className="p-1 hover:bg-white rounded-lg text-indigo-400 transition-colors"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-3 space-y-2">
                    {loading ? (
                        <div className="py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl">Searching archive…</div>
                    ) : filteredSales.length === 0 ? (
                        <div className="py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl">No records</div>
                    ) : (
                        filteredSales.map((sale) => (
                            <div key={sale.id} className="bg-white rounded-xl border border-gray-50 shadow-sm p-3 flex flex-col gap-2">
                                <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                                    <div>
                                        <p className="font-mono text-[9px] font-black text-indigo-600 tracking-wider uppercase font-mono">{sale.receipt_number}</p>
                                        <p className="font-black text-gray-900 text-xs mt-0.5 tracking-tight">{sale.patient?.name || 'Walk-in'}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 font-bold uppercase tracking-tighter">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(sale.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {sale.is_refunded ? (
                                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[7px] font-black border border-rose-100 uppercase tracking-widest">Refunded</span>
                                        ) : (
                                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[7px] font-black border border-emerald-100 uppercase tracking-widest">Paid</span>
                                        )}
                                        {sale.is_controlled_transaction && (
                                            <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[7px] font-black uppercase border border-indigo-100 tracking-widest">
                                                <Lock className="w-2.5 h-2.5" /> Ctrl
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black text-gray-500 border border-gray-100 uppercase tracking-tighter">{sale.payment_method}</span>
                                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter opacity-60">By: {sale.user?.name || sale.user?.username || 'Sys'}</span>
                                    </div>
                                    <span className="font-black text-indigo-600 text-sm tracking-tight">ETB {Number(sale.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="pt-1">
                                    <button
                                        onClick={() => handleOpenDetail(sale)}
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-black transition-all active:scale-95 uppercase tracking-widest"
                                    >
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Sale Detail Modal */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Transaction Details">
                {selectedSale && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-[11px]">
                            <div>
                                <p className="text-gray-600 font-black uppercase tracking-widest mb-1 shadow-sm">Receipt #</p>
                                <p className="font-mono font-black text-indigo-600 text-sm tracking-widest">{selectedSale.receipt_number}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-black uppercase tracking-widest mb-1 shadow-sm">Timestamp</p>
                                <p className="font-bold text-gray-700">{formatDate(selectedSale.created_at)} <span className="text-gray-400 px-1">·</span> {new Date(selectedSale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-black uppercase tracking-widest mb-1 shadow-sm">Served By (Staff)</p>
                                <p className="font-bold text-gray-700 uppercase tracking-tighter flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    {selectedSale.user?.name || selectedSale.user?.username || 'System'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-black uppercase tracking-widest mb-1 shadow-sm">Patient / Customer</p>
                                <p className="font-bold text-gray-700 uppercase tracking-tighter bg-white inline-flex px-2 py-0.5 rounded border border-gray-100">
                                    {selectedSale.patient?.name || 'Walk-in'}
                                </p>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-dashed border-gray-200">
                                <p className="text-gray-700 font-black uppercase tracking-widest mb-1">Payment Method & Source</p>
                                <p className="font-black text-indigo-600 uppercase tracking-widest text-xs flex flex-wrap items-center gap-1.5">
                                    <span className="bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 border border-indigo-100">{selectedSale.payment_method}</span>
                                    {selectedSale.payment_method === 'SPLIT' && selectedSale.split_payments ? (
                                        <span className="text-gray-500 font-bold tracking-tighter">
                                            ({selectedSale.split_payments.map(p => `${p.method}: ETB ${p.amount}`).join(' + ')})
                                        </span>
                                    ) : (
                                        selectedSale.payment_account_name && (
                                            <span className="text-gray-500 font-bold tracking-tighter">
                                                via <span className="text-gray-700">{selectedSale.payment_account_name}</span>
                                            </span>
                                        )
                                    )}
                                </p>
                            </div>
                        </div>

                        {selectedSale.prescription_image_url && (
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Prescription Attached
                                </h3>
                                <div className="border border-gray-100 rounded-xl overflow-hidden bg-white aspect-video flex items-center justify-center relative group">
                                    <img
                                        src={selectedSale.prescription_image_url}
                                        alt="Prescription"
                                        className="max-h-full object-contain p-1"
                                    />
                                    <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => window.open(selectedSale.prescription_image_url, '_blank')}
                                            className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl border border-gray-100"
                                        >
                                            Enlarge
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Line Items</h3>
                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl bg-white overflow-hidden">
                                {selectedSale.items?.map((item, idx) => (
                                    <div key={idx} className="p-2.5 flex justify-between items-center">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-gray-900 text-xs tracking-tight truncate">{item.medicine?.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                                {item.quantity} × ETB {item.unit_price}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 pl-2">
                                            <p className="font-black text-gray-900 text-xs tracking-tight">ETB {Number(item.subtotal).toFixed(2)}</p>
                                            {!item.is_refunded && (
                                                <div className="flex flex-col items-end">
                                                    <button
                                                        onClick={() => {
                                                            const hasUnpaidCredit = (selectedSale.payment_method === 'CREDIT' || selectedSale.split_payments?.some(p => p.method === 'CREDIT')) &&
                                                                selectedSale.credit_records?.some(cr => cr.status !== 'PAID');

                                                            if (hasUnpaidCredit) {
                                                                toastError('Refund Restricted', 'Awaiting credit payment.');
                                                                return;
                                                            }
                                                            handleOpenRefund(selectedSale, item);
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-all ${((selectedSale.payment_method === 'CREDIT' || selectedSale.split_payments?.some(p => p.method === 'CREDIT')) &&
                                                            selectedSale.credit_records?.some(cr => cr.status !== 'PAID'))
                                                            ? 'text-gray-200 cursor-not-allowed'
                                                            : 'text-rose-400 hover:bg-rose-50'
                                                            }`}
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            {item.is_refunded && (
                                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[7px] font-black border border-rose-100 uppercase tracking-widest">
                                                    Refunded
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-dashed border-gray-200 flex flex-col sm:flex-row justify-between items-center mt-auto gap-3">
                            <button
                                onClick={() => setShowAttachment(true)}
                                className="w-full sm:w-auto px-4 py-2 bg-indigo-50 text-indigo-700 font-black rounded-lg border border-indigo-100 hover:bg-indigo-100 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] transition-all"
                            >
                                <Printer className="w-3.5 h-3.5" /> Generate Attachment
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transaction</span>
                                <span className="font-black text-indigo-600 text-lg tracking-tight">ETB {Number(selectedSale.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <AttachmentModal
                isOpen={showAttachment}
                onClose={() => setShowAttachment(false)}
                sale={selectedSale}
                orgInfo={orgInfo}
            />

            {/* Refund Processing Modal */}
            <Modal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)} title="Process Return">
                <div className="space-y-3">
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex gap-2.5">
                        <RotateCcw className="w-4 h-4 text-rose-500 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-black text-rose-900 tracking-tight">Return for {refundItem?.name}</p>
                            <p className="text-[10px] text-rose-700 font-bold uppercase tracking-tighter">Full return: {refundItem?.quantity} units · Refund: ETB {refundItem ? (Number(refundItem.price) * Number(refundItem.quantity)).toFixed(2) : 0}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Reason for Return</label>
                        <textarea
                            rows={3}
                            placeholder="Brief description..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-50 outline-none text-xs font-bold leading-relaxed"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => setIsRefundModalOpen(false)}
                            className="flex-1 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={processRefund}
                            className="flex-1 py-2.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
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
