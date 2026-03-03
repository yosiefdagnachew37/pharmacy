import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import {
    Calendar,
    Search,
    FileText,
    Download,
    User,
    CreditCard,
    Eye,
    Loader2
} from 'lucide-react';
import Modal from '../components/Modal';
import ColumnFilter from '../components/ColumnFilter';

interface Sale {
    id: string;
    receipt_number: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    patient?: { name: string };
    user?: { username: string };
    items: Array<{
        medicine: { name: string };
        quantity: number;
        unit_price: number;
    }>;
}

const SalesLog = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [exporting, setExporting] = useState(false);

    // ─── Column Filters ──────────────────────────────────────────
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        patient: [],
        method: [],
        user: [],
    });

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await client.get('/reporting/sales');
                setSales(response.data);
            } catch (error) {
                console.error('Failed to fetch sales log', error);
            } finally {
                setLoading(false);
            }
        };
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
    const uniquePatients = useMemo(() => [...new Set(sales.map(s => s.patient?.name || 'Walk-in'))].sort(), [sales]);
    const uniqueMethods = useMemo(() => [...new Set(sales.map(s => s.payment_method).filter(Boolean))].sort(), [sales]);
    const uniqueUsers = useMemo(() => [...new Set(sales.map(s => s.user?.username || 'System'))].sort(), [sales]);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchesSearch =
                (sale.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (sale.patient?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            const patientName = sale.patient?.name || 'Walk-in';
            const userName = sale.user?.username || 'System';
            const matchesPatient = columnFilters.patient.length === 0 || columnFilters.patient.includes(patientName);
            const matchesMethod = columnFilters.method.length === 0 || columnFilters.method.includes(sale.payment_method);
            const matchesUser = columnFilters.user.length === 0 || columnFilters.user.includes(userName);

            return matchesSearch && matchesPatient && matchesMethod && matchesUser;
        });
    }, [sales, searchTerm, columnFilters]);

    const updateFilter = (column: string, values: string[]) => {
        setColumnFilters(prev => ({ ...prev, [column]: values }));
    };

    const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales Log</h1>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by receipt number or patient name..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={() => setColumnFilters({ patient: [], method: [], user: [] })}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                        Clear All Filters ({activeFilterCount})
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 italic">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                        <p>Loading transaction history...</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 italic">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt #</th>
                                    <ColumnFilter
                                        label="Patient"
                                        options={uniquePatients}
                                        selectedValues={columnFilters.patient}
                                        onFilterChange={(v) => updateFilter('patient', v)}
                                    />
                                    <ColumnFilter
                                        label="Method"
                                        options={uniqueMethods}
                                        selectedValues={columnFilters.method}
                                        onFilterChange={(v) => updateFilter('method', v)}
                                    />
                                    <ColumnFilter
                                        label="User"
                                        options={uniqueUsers}
                                        selectedValues={columnFilters.user}
                                        onFilterChange={(v) => updateFilter('user', v)}
                                    />
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {new Date(sale.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-gray-400 ml-5">
                                                {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                {sale.receipt_number || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <User className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {sale.patient?.name || 'Walk-in'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-xs font-bold text-gray-500 uppercase">
                                                <CreditCard className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {sale.payment_method}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {sale.user?.username || 'System'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                ${Number(sale.total_amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                title={`Transaction Details: ${selectedSale?.receipt_number || 'N/A'}`}
            >
                {selectedSale && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patient Information</p>
                                <p className="text-sm font-bold text-gray-800">{selectedSale.patient?.name || 'Walk-in'}</p>
                                <p className="text-xs text-gray-500">{new Date(selectedSale.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</p>
                                <p className="text-sm font-bold text-green-600">{selectedSale.payment_method}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Items Purchased</p>
                            <div className="space-y-3">
                                {selectedSale.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{item.medicine?.name}</span>
                                            <span className="text-[10px] text-gray-400">Quantity: {item.quantity}</span>
                                        </div>
                                        <span className="font-mono text-gray-600">${(item.quantity * item.unit_price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Total Amount</span>
                                <span className="text-xl font-black text-indigo-600">${Number(selectedSale.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalesLog;
