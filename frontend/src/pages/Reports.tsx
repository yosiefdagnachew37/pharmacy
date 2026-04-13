import { useState, useEffect } from 'react';
import client from '../api/client';
import {
    BarChart3,
    TrendingUp,
    Package,
    ShoppingCart,
    FileText,
    Table as TableIcon,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    DollarSign,
    FileSpreadsheet,
    File as FileIcon,
    Loader2,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';


type ReportTab = 'profit-loss' | 'sales' | 'purchases' | 'inventory' | 'batches' | 'analytics';

// Expandable Purchase Order Row for Reports
const PurchaseRow = ({ po }: { po: any }) => {
    const [expanded, setExpanded] = useState(false);
    const statusColors: Record<string, string> = {
        COMPLETED: 'bg-emerald-100 text-emerald-700',
        CONFIRMED: 'bg-indigo-100 text-indigo-700',
        APPROVED: 'bg-blue-100 text-blue-700',
        PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
        CANCELLED: 'bg-rose-100 text-rose-700',
        DRAFT: 'bg-gray-100 text-gray-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-2 hover:bg-gray-50 transition-colors text-left"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        {po.po_number || 'PO-??'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[po.status] || 'bg-gray-100 text-gray-600'}`}>
                        {po.status?.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{po.supplier?.name || 'Unknown Supplier'}</span>
                    <span className="text-xs text-gray-400">{new Date(po.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-black text-gray-900">ETB {Number(po.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                </div>
            </button>
            {expanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Ordered Items · By {po.created_by_user?.username || 'System'}
                    </div>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] text-gray-400 uppercase tracking-wide">
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-2 pr-4">Item</th>
                                    <th className="text-right py-2 px-4">Qty Ordered</th>
                                    <th className="text-right py-2 px-4">Unit Price</th>
                                    <th className="text-right py-2 pl-4">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(po.items || []).length === 0 ? (
                                    <tr><td colSpan={4} className="py-4 text-center text-gray-400 italic text-xs">No item details available.</td></tr>
                                ) : (po.items || []).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50/60">
                                        <td className="py-2.5 pr-4 font-semibold text-gray-800">{item.medicine?.name || 'Unknown Item'}</td>
                                        <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-700">{item.quantity_ordered}</td>
                                        <td className="py-2.5 px-4 text-right text-gray-500">ETB {Number(item.unit_price).toFixed(2)}</td>
                                        <td className="py-2.5 pl-4 text-right font-bold text-gray-900">ETB {Number(item.subtotal || item.quantity_ordered * item.unit_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {(po.items || []).length > 0 && (
                                <tfoot>
                                    <tr className="border-t border-gray-200">
                                        <td colSpan={3} className="pt-2.5 text-xs font-black text-gray-600 uppercase tracking-wider">Grand Total</td>
                                        <td className="pt-2.5 pl-4 text-right font-black text-indigo-700">ETB {Number(po.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    
                    {/* Mobile Card View for PO Items */}
                    <div className="md:hidden space-y-2 mt-2">
                        {(po.items || []).length === 0 ? (
                            <div className="py-4 text-center text-gray-400 italic text-xs">No item details available.</div>
                        ) : (po.items || []).map((item: any) => (
                            <div key={item.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm flex flex-col gap-1.5">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-800">{item.medicine?.name || 'Unknown Item'}</span>
                                    <span className="font-black text-gray-900">ETB {Number(item.subtotal || item.quantity_ordered * item.unit_price).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Qty: {item.quantity_ordered}</span>
                                    <span>@ ETB {Number(item.unit_price).toFixed(2)} / ea</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Reports = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('profit-loss');
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Data States
    const defaultProfitLoss = {
        summary: { totalRevenue: 0, totalCost: 0, grossProfit: 0, profitMargin: 0 },
        dailyBreakdown: [],
        medicineBreakdown: []
    };
    const [profitLoss, setProfitLoss] = useState<any>(defaultProfitLoss);
    const [sales, setSales] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [netProfitAnalytics, setNetProfitAnalytics] = useState<any[]>([]);
    const [workingCapital, setWorkingCapital] = useState<any>(null);
    const [paretoData, setParetoData] = useState<any[]>([]);
    const [profitMargins, setProfitMargins] = useState<any[]>([]);
    const [batchTurnover, setBatchTurnover] = useState<any[]>([]);
    const [supplierAging, setSupplierAging] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'profit-loss') {
                const [plRes, dailyNetRes] = await Promise.all([
                    client.get(`/reporting/profit-loss?start=${dateRange.start}&end=${dateRange.end}`),
                    client.get(`/reporting/daily-profit-analytics?start=${dateRange.start}&end=${dateRange.end}`)
                ]);
                setProfitLoss({
                    summary: plRes.data?.summary || defaultProfitLoss.summary,
                    dailyBreakdown: plRes.data?.dailyBreakdown || [],
                    medicineBreakdown: plRes.data?.medicineBreakdown || []
                });
                setNetProfitAnalytics(dailyNetRes.data);
            } else if (activeTab === 'sales') {
                const res = await client.get(`/reporting/sales?start=${dateRange.start}&end=${dateRange.end}`);
                setSales(res.data);
            } else if (activeTab === 'purchases') {
                const res = await client.get(`/reporting/purchases?start=${dateRange.start}&end=${dateRange.end}`);
                setPurchases(res.data);
            } else if (activeTab === 'inventory') {
                const res = await client.get('/reporting/medicines');
                setMedicines(res.data);
            } else if (activeTab === 'batches') {
                const res = await client.get('/reporting/batches-status');
                setBatches(res.data);
            } else if (activeTab === 'analytics') {
                const [wcRes, paretoRes, marginRes, turnoverRes, agingRes] = await Promise.all([
                    client.get('/reporting/working-capital'),
                    client.get(`/reporting/pareto-analysis?start=${dateRange.start}&end=${dateRange.end}`),
                    client.get('/reporting/profit-margin'),
                    client.get('/reporting/batch-turnover'),
                    client.get('/reporting/supplier-payment-aging')
                ]);
                setWorkingCapital(wcRes.data);
                setParetoData(paretoRes.data);
                setProfitMargins(marginRes.data);
                setBatchTurnover(turnoverRes.data);
                setSupplierAging(agingRes.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, dateRange.start, dateRange.end]);

    const handleExport = async (type: string, format: 'excel' | 'pdf' | 'word') => {
        try {
            let url = `/reporting/${type}/export/${format}`;
            if (type === 'sales' || type === 'profit-loss' || type === 'purchases') {
                url += `?start=${dateRange.start}&end=${dateRange.end}`;
            }

            const response = await client.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'docx';
            link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${extension}`;
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    const StatCard = ({ title, value, subValue, icon: Icon, trend, color }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                {subValue && <p className="text-xs text-gray-400 mt-1 font-medium">{subValue}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Global Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium italic">Performance and inventory health insights.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 flex-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <div className="flex items-center gap-1">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="bg-transparent border-none text-[11px] sm:text-xs font-bold text-gray-700 focus:ring-0 p-0 w-[85px] sm:w-[100px]"
                            />
                            <span className="text-gray-300 text-[10px]">/</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="bg-transparent border-none text-[11px] sm:text-xs font-bold text-gray-700 focus:ring-0 p-0 w-[85px] sm:w-[100px]"
                            />
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-full overflow-x-auto no-scrollbar sm:w-fit whitespace-nowrap">
                {[
                    { id: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp },
                    { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
                    { id: 'purchases', label: 'Purchases', icon: FileText },
                    { id: 'inventory', label: 'Inventory', icon: Package },
                    { id: 'batches', label: 'Batches', icon: TableIcon },
                    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReportTab)}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white text-indigo-600 shadow-sm scale-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-gray-400 mt-4 font-medium">Synthesizing report data...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* PROFIT & LOSS View */}
                    {activeTab === 'profit-loss' && (
                        <div className="space-y-6">
                            {(!profitLoss?.summary || profitLoss.summary.totalRevenue === 0) && (
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-amber-700 font-bold">
                                                No financial data found for the selected period.
                                            </p>
                                            <p className="text-sm text-amber-600 mt-1">
                                                The charts below will appear empty until sales are recorded in this date range.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                                <StatCard title="Total Revenue" value={`ETB ${(profitLoss.summary?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="bg-indigo-500" icon={DollarSign} />
                                <StatCard title="Total Cost" value={`ETB ${(profitLoss.summary?.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="bg-orange-500" icon={ShoppingCart} />
                                <StatCard title="Gross Profit" value={`ETB ${(profitLoss.summary?.grossProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="bg-blue-500" icon={TrendingUp} />
                                <StatCard title="Total Expenses" value={`ETB ${(profitLoss.summary?.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="bg-rose-500" icon={FileText} subValue="Amortized + One-time" />
                                <StatCard title="Net Profit" value={`ETB ${(profitLoss.summary?.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="bg-emerald-500" icon={DollarSign} />
                                <StatCard title="Net Margin" value={`${(profitLoss.summary?.netMargin || 0).toFixed(2)}%`} color="bg-purple-500" icon={Percent} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                                        Profit & Revenue Trend
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={profitLoss.dailyBreakdown}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-800">Export Options</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <button onClick={() => handleExport('profit-loss', 'excel')} className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <FileSpreadsheet className="w-5 h-5" />
                                                <span className="font-bold text-sm">Download Excel</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                        <button onClick={() => handleExport('profit-loss', 'pdf')} className="w-full flex items-center justify-between p-4 bg-rose-50 text-rose-700 rounded-2xl hover:bg-rose-100 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5" />
                                                <span className="font-bold text-sm">Generate PDF</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                        <button onClick={() => handleExport('profit-loss', 'word')} className="w-full flex items-center justify-between p-4 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="w-5 h-5" />
                                                <span className="font-bold text-sm">Export to Word</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Net Profit (After Amortized Expenses) */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                                    Net Profit Analytics (Includes Amortized Expenses)
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={netProfitAnalytics}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Bar dataKey="grossProfit" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} name="Gross Profit" />
                                            <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} name="Expenses" />
                                            <Bar dataKey="netProfit" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} name="Net Profit" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <tr>
                                                <th className="pb-3 px-3 whitespace-nowrap">Date</th>
                                                <th className="pb-3 px-3 whitespace-nowrap">Gross Profit</th>
                                                <th className="pb-3 px-3 whitespace-nowrap">Expenses (Amortized)</th>
                                                <th className="pb-3 px-3 whitespace-nowrap">Net Profit</th>
                                                <th className="pb-3 px-3 text-right whitespace-nowrap">Margin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {netProfitAnalytics.map((day, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">{day.date}</td>
                                                    <td className="py-3 px-3 text-gray-800 font-bold whitespace-nowrap">ETB {(day.grossProfit || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-3 text-rose-500 font-bold whitespace-nowrap">-ETB {(day.expenses || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-3 text-emerald-600 font-black whitespace-nowrap">ETB {(day.netProfit || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-3 text-right text-gray-400 font-bold whitespace-nowrap">{(day.margin || 0).toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile Card View for Net Profit Analytics */}
                                <div className="md:hidden mt-4 space-y-3">
                                    {netProfitAnalytics.map((day, idx) => (
                                        <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-gray-800">{day.date}</span>
                                                <span className="text-xs font-bold text-gray-400">{Number(day.margin || 0).toFixed(1)}% Margin</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Gross Profit</p>
                                                    <p className="font-bold text-gray-800">ETB {(day.grossProfit || 0).toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Expenses</p>
                                                    <p className="font-bold text-rose-500">-ETB {(day.expenses || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                                                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Net Profit</span>
                                                <span className="font-black text-emerald-600">ETB {(day.netProfit || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Medicine Breakdown Table */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800">Profitability by Medicine</h3>
                                </div>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap">Medicine Name</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Qty Sold</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Revenue</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Cost</th>
                                                <th className="px-6 py-4 text-right whitespace-nowrap">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {profitLoss.medicineBreakdown.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">{item.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">ETB {Number(item.revenue).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">ETB {Number(item.cost).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-right text-emerald-600 whitespace-nowrap">ETB {Number(item.profit).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile Card View for Medicine Profitability */}
                                <div className="md:hidden p-4 space-y-3 bg-gray-50/50">
                                    {profitLoss.medicineBreakdown.map((item: any, i: number) => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.quantity} sold</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Revenue</p>
                                                    <p className="font-medium text-gray-600">ETB {Number(item.revenue).toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Cost</p>
                                                    <p className="font-medium text-gray-600">ETB {Number(item.cost).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Profit</span>
                                                <span className="font-black text-emerald-600">ETB {Number(item.profit).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SALES View */}
                    {activeTab === 'sales' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Sales Transactions</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Detailed log of all sales within the selected period.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleExport('sales', 'excel')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100 whitespace-nowrap">
                                        <FileSpreadsheet className="w-4 h-4" /> Excel
                                    </button>
                                    <button onClick={() => handleExport('sales', 'pdf')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100 whitespace-nowrap">
                                        <FileText className="w-4 h-4" /> PDF
                                    </button>
                                    <button onClick={() => handleExport('sales', 'word')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100 whitespace-nowrap">
                                        <FileIcon className="w-4 h-4" /> Word
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap">Receipt #</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Date & Time</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Patient</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Method</th>
                                                <th className="px-6 py-4 text-right whitespace-nowrap">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {sales.map((sale) => (
                                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{sale.receipt_number || 'TRX-XXXX'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">{new Date(sale.created_at).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 font-bold whitespace-nowrap">{sale.patient?.name || 'Walk-in'}</td>
                                                    <td className="px-6 py-4 italic text-sm text-gray-400 whitespace-nowrap">{sale.payment_method}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900 whitespace-nowrap">ETB {Number(sale.total_amount).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile Card View for Sales Transactions */}
                                <div className="md:hidden space-y-3 p-4 bg-gray-50/50">
                                    {sales.map((sale) => (
                                        <div key={sale.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                                                <div>
                                                    <p className="text-xs font-mono font-bold text-indigo-600">{sale.receipt_number || 'TRX-XXXX'}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{new Date(sale.created_at).toLocaleString()}</p>
                                                </div>
                                                <span className="text-xs italic text-gray-400">{sale.payment_method}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-700">{sale.patient?.name || 'Walk-in'}</span>
                                                <span className="text-sm font-black text-gray-900">ETB {Number(sale.total_amount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PURCHASES View */}
                    {activeTab === 'purchases' && (
                        <div className="space-y-4">
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Purchase Orders</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">
                                        {purchases.length} orders · ETB {purchases.reduce((s: number, p: any) => s + Number(p.total_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} total
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleExport('purchases', 'excel')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100 whitespace-nowrap">
                                        <FileSpreadsheet className="w-4 h-4" /> Excel
                                    </button>
                                    <button onClick={() => handleExport('purchases', 'pdf')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100 whitespace-nowrap">
                                        <FileText className="w-4 h-4" /> PDF
                                    </button>
                                    <button onClick={() => handleExport('purchases', 'word')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100 whitespace-nowrap">
                                        <FileIcon className="w-4 h-4" /> Word
                                    </button>
                                </div>
                            </div>

                            {purchases.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 italic">
                                    No purchase orders in the selected period.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {purchases.map((po: any) => (
                                        <PurchaseRow key={po.id} po={po} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}


                    {/* INVENTORY View */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                                        Inventory Distribution
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={medicines.slice(0, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                                <Bar dataKey="total_stock" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center gap-4">
                                    <h3 className="text-xl font-bold text-gray-800">Inventory Reporting</h3>
                                    <p className="text-gray-500 font-medium">Export high-level overview of current stock levels and medicine categories.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                        <button onClick={() => handleExport('medicines', 'excel')} className="flex flex-row sm:flex-col items-center justify-center gap-3 p-4 sm:p-6 bg-emerald-50 text-emerald-700 rounded-3xl hover:bg-emerald-100 transition-all border border-emerald-100">
                                            <FileSpreadsheet className="w-5 h-5 sm:w-8 sm:h-8" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Excel</span>
                                        </button>
                                        <button onClick={() => handleExport('medicines', 'pdf')} className="flex flex-row sm:flex-col items-center justify-center gap-3 p-4 sm:p-6 bg-rose-50 text-rose-700 rounded-3xl hover:bg-rose-100 transition-all border border-rose-100">
                                            <FileText className="w-5 h-5 sm:w-8 sm:h-8" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">PDF</span>
                                        </button>
                                        <button onClick={() => handleExport('medicines', 'word')} className="flex flex-row sm:flex-col items-center justify-center gap-3 p-4 sm:p-6 bg-indigo-50 text-indigo-700 rounded-3xl hover:bg-indigo-100 transition-all border border-indigo-100">
                                            <FileIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Word</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap">Medicine</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Generic</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Category</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Stock</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {medicines.map((m) => (
                                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">{m.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{m.generic_name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">
                                                            {m.category || 'General'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">{m.total_stock} {m.unit}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {m.total_stock <= m.minimum_stock_level ? (
                                                            <span className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                                                Low Stock
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                                Healthy
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile Card View for Inventory */}
                                <div className="md:hidden space-y-3 p-4 bg-gray-50/50">
                                    {medicines.map((m) => (
                                        <div key={m.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-2 border-b border-gray-50 pb-2">
                                                <div>
                                                    <p className="font-bold text-gray-800">{m.name}</p>
                                                    <p className="text-[10px] text-gray-500">{m.generic_name || '-'}</p>
                                                </div>
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">{m.category || 'General'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm font-bold text-gray-900">{m.total_stock} {m.unit}</div>
                                                {m.total_stock <= m.minimum_stock_level ? (
                                                    <span className="flex items-center gap-1.5 text-rose-600 text-[10px] font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Healthy
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BATCHES View */}
                    {activeTab === 'batches' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Batch Lifetime & Expiry</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Monitor specific batch numbers and expiration timelines.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleExport('batches', 'excel')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100 whitespace-nowrap">
                                        <FileSpreadsheet className="w-4 h-4" /> Excel
                                    </button>
                                    <button onClick={() => handleExport('batches', 'pdf')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100 whitespace-nowrap">
                                        <FileText className="w-4 h-4" /> PDF
                                    </button>
                                    <button onClick={() => handleExport('batches', 'word')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100 whitespace-nowrap">
                                        <FileIcon className="w-4 h-4" /> Word
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap">Medicine</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Batch Number</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Expiry Date</th>
                                                <th className="px-6 py-4 whitespace-nowrap">Remaining</th>
                                                <th className="px-6 py-4 text-right whitespace-nowrap">Selling Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {batches.map((b) => (
                                                <tr key={b.id} className="hover:bg-gray-100/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">{b.medicine?.name}</td>
                                                    <td className="px-6 py-4 text-xs font-mono text-indigo-600 whitespace-nowrap">{b.batch_number}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                                                        {new Date(b.expiry_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-bold whitespace-nowrap">{b.quantity_remaining}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900 whitespace-nowrap">ETB {Number(b.selling_price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile Card View for Batches */}
                                <div className="md:hidden space-y-3 p-4 bg-gray-50/50">
                                    {batches.map((b) => (
                                        <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-2 border-b border-gray-50 pb-2">
                                                <div>
                                                    <p className="font-bold text-gray-800">{b.medicine?.name}</p>
                                                    <p className="text-[10px] font-mono text-indigo-600">Batch: {b.batch_number}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Expires</p>
                                                    <p className="text-xs font-bold text-gray-700">{new Date(b.expiry_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="text-[10px] text-gray-500 font-medium">Qty: </span>
                                                    <span className="font-bold text-gray-900">{b.quantity_remaining}</span>
                                                </div>
                                                <div className="font-black text-gray-900">ETB {Number(b.selling_price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADVANCED ANALYTICS View */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                                        Pareto Analysis (Revenue Concentration)
                                    </h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={paretoData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                                <Area type="monotone" dataKey="cumulative_percentage" stroke="#4F46E5" strokeWidth={3} fill="#4F46E5" fillOpacity={0.1} name="Cumulative %" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500 italic text-center">Identifying the top revenue contributors (80/20 rule).</p>
                                </div>

                                <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between group">
                                    <div>
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <DollarSign className="w-6 h-6 text-indigo-300" />
                                            Working Capital
                                        </h3>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Net Position</p>
                                                <h4 className="text-3xl font-black">ETB {workingCapital?.net_working_capital?.toLocaleString()}</h4>
                                            </div>
                                            <div className="space-y-3 pt-4 border-t border-indigo-800">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-indigo-300">Inventory Value</span>
                                                    <span className="font-bold">ETB {workingCapital?.inventory_valuation?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-emerald-400">Total Receivables</span>
                                                    <span className="font-bold">+ETB {workingCapital?.outstanding_receivables?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-rose-400">Total Payables</span>
                                                    <span className="font-bold">-ETB {workingCapital?.outstanding_payables?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10 text-xs font-medium text-indigo-100 italic">
                                        Liquidity formula: Inventory + Receivables - Payables.
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Percent className="w-5 h-5 text-purple-500" />
                                        Profit Margin Analysis (Top 10)
                                    </h3>
                                    <div className="space-y-4">
                                        {profitMargins.slice(0, 10).map((m, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-bold text-gray-700">{m.medicine}</span>
                                                    <span className="font-black text-indigo-600">{m.margin_percentage}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.margin_percentage}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <RefreshCcw className="w-5 h-5 text-emerald-500" />
                                        Batch Depletion Metrics (Turnover)
                                    </h3>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                    <th className="py-3 px-2 whitespace-nowrap">Medicine / Batch</th>
                                                    <th className="py-3 px-2 text-right whitespace-nowrap">Qty</th>
                                                    <th className="py-3 px-2 text-right text-gray-800 whitespace-nowrap">Days to Deplete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {batchTurnover.length === 0 ? (
                                                    <tr className="bg-emerald-50/30">
                                                        <td className="py-3 px-2 italic text-gray-400 text-xs whitespace-nowrap" colSpan={3}>
                                                            No batch depletion logs found for the selected period.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    batchTurnover.slice(0, 10).map((bt, i) => (
                                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-2 whitespace-nowrap">
                                                                <p className="font-bold text-gray-700">{bt.name}</p>
                                                                <p className="text-[10px] text-indigo-500 font-mono italic">{bt.batchNo}</p>
                                                            </td>
                                                            <td className="py-3 px-2 text-right font-medium text-gray-500 whitespace-nowrap">{bt.qty}</td>
                                                            <td className="py-3 px-2 text-right whitespace-nowrap">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${bt.days_to_deplete <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                    {bt.days_to_deplete} Days
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Mobile Card View for Batch Depletion */}
                                    <div className="md:hidden mt-4 space-y-3">
                                        {batchTurnover.length === 0 ? (
                                            <div className="p-4 bg-emerald-50/50 rounded-xl text-center text-gray-400 italic text-xs">
                                                No batch depletion logs found for the selected period.
                                            </div>
                                        ) : (
                                            batchTurnover.slice(0, 10).map((bt, i) => (
                                                <div key={i} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-gray-700 text-sm">{bt.name}</p>
                                                        <p className="text-[10px] text-indigo-500 font-mono italic">{bt.batchNo}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-500 font-medium">Qty: {bt.qty}</p>
                                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${bt.days_to_deplete <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {bt.days_to_deplete} Days
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Supplier Payment Aging */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-rose-500" />
                                    Supplier Payment Aging (Payables)
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                <th className="py-3 px-2">Supplier</th>
                                                <th className="py-3 px-2 text-right">0-30 Days</th>
                                                <th className="py-3 px-2 text-right">31-60 Days</th>
                                                <th className="py-3 px-2 text-right">61-90 Days</th>
                                                <th className="py-3 px-2 text-right">&gt; 90 Days</th>
                                                <th className="py-3 px-2 text-right text-gray-800">Total Outstanding</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {supplierAging.length === 0 ? (
                                                <tr className="bg-emerald-50/30">
                                                    <td className="py-4 px-3 italic text-gray-400 text-xs whitespace-nowrap" colSpan={6}>
                                                        No outstanding payables currently recorded.
                                                    </td>
                                                </tr>
                                            ) : (
                                                supplierAging.map((sa: any, i: number) => (
                                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-3 font-bold text-gray-700 whitespace-nowrap">{sa.supplier_name}</td>
                                                        <td className="py-4 px-3 text-right text-gray-500 whitespace-nowrap">{sa.current > 0 ? 'ETB ' + sa.current.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-4 px-3 text-right text-amber-500 whitespace-nowrap">{sa.days_31_60 > 0 ? 'ETB ' + sa.days_31_60.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-4 px-3 text-right text-orange-500 font-medium whitespace-nowrap">{sa.days_61_90 > 0 ? 'ETB ' + sa.days_61_90.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-4 px-3 text-right text-rose-600 font-bold whitespace-nowrap">{sa.over_90 > 0 ? 'ETB ' + sa.over_90.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-4 px-3 text-right font-black text-gray-900 whitespace-nowrap">{'ETB ' + sa.total_outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {supplierAging.length > 0 && (
                                            <tfoot className="border-t-2 border-gray-100">
                                                <tr className="text-sm font-black text-gray-900">
                                                    <td className="py-4 px-3 text-right uppercase tracking-wider text-xs text-gray-500 whitespace-nowrap">Total</td>
                                                    <td className="py-4 px-3 text-right whitespace-nowrap">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.current, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-4 px-3 text-right text-amber-600 whitespace-nowrap">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.days_31_60, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-4 px-3 text-right text-orange-600 whitespace-nowrap">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.days_61_90, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-4 px-3 text-right text-rose-700 whitespace-nowrap">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.over_90, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-4 px-3 text-right text-indigo-700 whitespace-nowrap">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.total_outstanding, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                                
                                {/* Mobile Card View for Supplier Aging */}
                                <div className="md:hidden mt-4 space-y-3">
                                    {supplierAging.length === 0 ? (
                                        <div className="p-4 bg-emerald-50/50 rounded-xl text-center text-gray-400 italic text-xs">
                                            No outstanding payables currently recorded.
                                        </div>
                                    ) : (
                                        supplierAging.map((sa: any, i: number) => (
                                            <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                                                <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                                                    <span className="font-bold text-gray-800">{sa.supplier_name}</span>
                                                    <span className="font-black text-gray-900 text-sm">ETB {sa.total_outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">0-30 Days:</span>
                                                        <span className="font-medium text-gray-700">{sa.current > 0 ? sa.current.toLocaleString() : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">31-60 Days:</span>
                                                        <span className="font-medium text-amber-600">{sa.days_31_60 > 0 ? sa.days_31_60.toLocaleString() : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">61-90 Days:</span>
                                                        <span className="font-medium text-orange-600">{sa.days_61_90 > 0 ? sa.days_61_90.toLocaleString() : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">&gt; 90 Days:</span>
                                                        <span className="font-medium text-rose-600">{sa.over_90 > 0 ? sa.over_90.toLocaleString() : '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default Reports;
