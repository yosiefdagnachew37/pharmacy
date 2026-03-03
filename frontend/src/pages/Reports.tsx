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
    RefreshCcw
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

type ReportTab = 'profit-loss' | 'sales' | 'inventory' | 'batches';

const Reports = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('profit-loss');
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Data States
    const [profitLoss, setProfitLoss] = useState<any>(null);
    const [sales, setSales] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'profit-loss') {
                const res = await client.get(`/reporting/profit-loss?start=${dateRange.start}&end=${dateRange.end}`);
                setProfitLoss(res.data);
            } else if (activeTab === 'sales') {
                const res = await client.get(`/reporting/sales?start=${dateRange.start}&end=${dateRange.end}`);
                setSales(res.data);
            } else if (activeTab === 'inventory') {
                const res = await client.get('/reporting/medicines');
                setMedicines(res.data);
            } else if (activeTab === 'batches') {
                const res = await client.get('/reporting/batches-status');
                setBatches(res.data);
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-gray-500 mt-1 font-medium">Gain deep insights into your pharmacy's performance and inventory health.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0"
                        />
                        <span className="text-gray-300 mx-1">/</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0"
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
                {[
                    { id: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp },
                    { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
                    { id: 'inventory', label: 'Inventory', icon: Package },
                    { id: 'batches', label: 'Batches', icon: TableIcon },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReportTab)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white text-indigo-600 shadow-sm scale-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
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
                    {activeTab === 'profit-loss' && profitLoss && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Revenue" value={`$${profitLoss.summary.totalRevenue.toLocaleString()}`} color="bg-indigo-500" icon={DollarSign} />
                                <StatCard title="Total Cost" value={`$${profitLoss.summary.totalCost.toLocaleString()}`} color="bg-orange-500" icon={ShoppingCart} />
                                <StatCard title="Gross Profit" value={`$${profitLoss.summary.grossProfit.toLocaleString()}`} color="bg-emerald-500" icon={TrendingUp} />
                                <StatCard title="Profit Margin" value={`${profitLoss.summary.profitMargin.toFixed(2)}%`} color="bg-purple-500" icon={Percent} />
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
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">${Number(item.revenue).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">${Number(item.cost).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-right text-emerald-600">${Number(item.profit).toFixed(2)}</td>
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
                                <div className="flex gap-2">
                                    <button onClick={() => handleExport('sales', 'excel')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
                                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                                    </button>
                                    <button onClick={() => handleExport('sales', 'pdf')} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100">
                                        <FileText className="w-4 h-4" /> Download PDF
                                    </button>
                                    <button onClick={() => handleExport('sales', 'word')} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100">
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
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">${Number(sale.total_amount).toFixed(2)}</td>
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
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">${Number(b.selling_price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default Reports;
