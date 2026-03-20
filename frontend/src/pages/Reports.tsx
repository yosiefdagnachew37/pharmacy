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

type ReportTab = 'profit-loss' | 'sales' | 'inventory' | 'batches' | 'analytics';

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
            if (type === 'sales' || type === 'profit-loss') {
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
                                <div className="mt-6 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="pb-3 px-2">Date</th>
                                                <th className="pb-3 px-2">Gross Profit</th>
                                                <th className="pb-3 px-2">Expenses (Amortized)</th>
                                                <th className="pb-3 px-2">Net Profit</th>
                                                <th className="pb-3 px-2 text-right">Margin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {netProfitAnalytics.map((day, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-3 px-2 text-gray-600 font-medium">{day.date}</td>
                                                    <td className="py-3 px-2 text-gray-800 font-bold">ETB {(day.grossProfit || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-2 text-rose-500 font-bold">-ETB {(day.expenses || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-2 text-emerald-600 font-black">ETB {(day.netProfit || 0).toFixed(2)}</td>
                                                    <td className="py-3 px-2 text-right text-gray-400 font-bold">{(day.margin || 0).toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Medicine Breakdown Table */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800">Profitability by Medicine</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Medicine Name</th>
                                                <th className="px-6 py-4">Qty Sold</th>
                                                <th className="px-6 py-4">Revenue</th>
                                                <th className="px-6 py-4">Cost</th>
                                                <th className="px-6 py-4 text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {profitLoss.medicineBreakdown.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">ETB {Number(item.revenue).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">ETB {Number(item.cost).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-right text-emerald-600">ETB {Number(item.profit).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SALES View */}
                    {activeTab === 'sales' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Sales Transactions</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Detailed log of all sales within the selected period.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => handleExport('sales', 'excel')} className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
                                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                                    </button>
                                    <button onClick={() => handleExport('sales', 'pdf')} className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100">
                                        <FileText className="w-4 h-4" /> Download PDF
                                    </button>
                                    <button onClick={() => handleExport('sales', 'word')} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100">
                                        <FileIcon className="w-4 h-4" /> Word Doc
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Receipt #</th>
                                            <th className="px-6 py-4">Date & Time</th>
                                            <th className="px-6 py-4">Patient</th>
                                            <th className="px-6 py-4">Method</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{sale.receipt_number || 'TRX-XXXX'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{new Date(sale.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 font-bold">{sale.patient?.name || 'Walk-in'}</td>
                                                <td className="px-6 py-4 italic text-sm text-gray-400">{sale.payment_method}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">ETB {Number(sale.total_amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <button onClick={() => handleExport('medicines', 'excel')} className="flex flex-col items-center gap-3 p-6 bg-emerald-50 text-emerald-700 rounded-3xl hover:bg-emerald-100 transition-all border border-emerald-100">
                                            <FileSpreadsheet className="w-8 h-8" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Excel</span>
                                        </button>
                                        <button onClick={() => handleExport('medicines', 'pdf')} className="flex flex-col items-center gap-3 p-6 bg-rose-50 text-rose-700 rounded-3xl hover:bg-rose-100 transition-all border border-rose-100">
                                            <FileText className="w-8 h-8" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">PDF</span>
                                        </button>
                                        <button onClick={() => handleExport('medicines', 'word')} className="flex flex-col items-center gap-3 p-6 bg-indigo-50 text-indigo-700 rounded-3xl hover:bg-indigo-100 transition-all border border-indigo-100">
                                            <FileIcon className="w-8 h-8" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Word</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Medicine</th>
                                            <th className="px-6 py-4">Generic</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {medicines.map((m) => (
                                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{m.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{m.generic_name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">
                                                        {m.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{m.total_stock} {m.unit}</td>
                                                <td className="px-6 py-4">
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
                        </div>
                    )}

                    {/* BATCHES View */}
                    {activeTab === 'batches' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Batch Lifetime & Expiry</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Monitor specific batch numbers and expiration timelines.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleExport('batches', 'excel')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
                                        <FileSpreadsheet className="w-4 h-4" /> Excel
                                    </button>
                                    <button onClick={() => handleExport('batches', 'pdf')} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100">
                                        <FileText className="w-4 h-4" /> PDF
                                    </button>
                                    <button onClick={() => handleExport('batches', 'word')} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100">
                                        <FileIcon className="w-4 h-4" /> Word
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Medicine</th>
                                            <th className="px-6 py-4">Batch Number</th>
                                            <th className="px-6 py-4">Expiry Date</th>
                                            <th className="px-6 py-4">Remaining</th>
                                            <th className="px-6 py-4 text-right">Selling Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {batches.map((b) => (
                                            <tr key={b.id} className="hover:bg-gray-100/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{b.medicine?.name}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-indigo-600">{b.batch_number}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                                    {new Date(b.expiry_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-bold">{b.quantity_remaining}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">ETB {Number(b.selling_price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                    <th className="py-3 px-2">Medicine / Batch</th>
                                                    <th className="py-3 px-2 text-right">Qty</th>
                                                    <th className="py-3 px-2 text-right text-gray-800">Days to Deplete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {batchTurnover.length === 0 ? (
                                                    <tr className="bg-emerald-50/30">
                                                        <td className="py-3 px-2 italic text-gray-400 text-xs" colSpan={3}>
                                                            No batch depletion logs found for the selected period.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    batchTurnover.slice(0, 10).map((bt, i) => (
                                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-2">
                                                                <p className="font-bold text-gray-700">{bt.name}</p>
                                                                <p className="text-[10px] text-indigo-500 font-mono italic">{bt.batchNo}</p>
                                                            </td>
                                                            <td className="py-3 px-2 text-right font-medium text-gray-500">{bt.qty}</td>
                                                            <td className="py-3 px-2 text-right">
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
                                                    <td className="py-3 px-2 italic text-gray-400 text-xs" colSpan={6}>
                                                        No outstanding payables currently recorded.
                                                    </td>
                                                </tr>
                                            ) : (
                                                supplierAging.map((sa: any, i: number) => (
                                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-2 font-bold text-gray-700">{sa.supplier_name}</td>
                                                        <td className="py-3 px-2 text-right text-gray-500">{sa.current > 0 ? 'ETB ' + sa.current.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-3 px-2 text-right text-amber-500">{sa.days_31_60 > 0 ? 'ETB ' + sa.days_31_60.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-3 px-2 text-right text-orange-500 font-medium">{sa.days_61_90 > 0 ? 'ETB ' + sa.days_61_90.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-3 px-2 text-right text-rose-600 font-bold">{sa.over_90 > 0 ? 'ETB ' + sa.over_90.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-3 px-2 text-right font-black text-gray-900">{'ETB ' + sa.total_outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {supplierAging.length > 0 && (
                                            <tfoot className="border-t-2 border-gray-100">
                                                <tr className="text-sm font-black text-gray-900">
                                                    <td className="py-3 px-2 text-right uppercase tracking-wider text-xs text-gray-500">Total</td>
                                                    <td className="py-3 px-2 text-right">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.current, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-amber-600">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.days_31_60, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-orange-600">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.days_61_90, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-rose-700">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.over_90, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right text-indigo-700">{'ETB ' + supplierAging.reduce((acc: number, curr: any) => acc + curr.total_outstanding, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
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
