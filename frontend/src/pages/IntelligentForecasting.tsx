import { useState, useEffect } from 'react';
import {
    TrendingUp, AlertTriangle, PackageX, Calendar, Search,
    ShoppingCart, RefreshCw, BarChart2, Zap, CheckCircle
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const IntelligentForecasting = () => {
    const { role } = useAuth();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [deadStock, setDeadStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'RECOMMENDATIONS' | 'DEAD_STOCK'>('RECOMMENDATIONS');
    const [search, setSearch] = useState('');
    const [triggering, setTriggering] = useState(false);

    const fetchData = async () => {
        try {
            const [recRes, deadRes] = await Promise.all([
                client.get('/forecasting/recommendations'),
                client.get('/forecasting/dead-stock')
            ]);
            setRecommendations(recRes.data);
            setDeadStock(deadRes.data);
        } catch (err) {
            console.error('Failed to load forecasting data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const triggerManualForecast = async () => {
        setTriggering(true);
        try {
            await client.post('/forecasting/trigger-manual');
            alert('Forecast generation started in the background. It may take a few moments. Please refresh later.');
        } catch (err) {
            console.error('Failed to trigger forecast', err);
            alert('Error triggering forecast');
        } finally {
            setTriggering(false);
        }
    };

    const filteredRecs = recommendations.filter(r =>
        r.medicine?.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredDeadStock = deadStock.filter(d =>
        d.medicine?.name.toLowerCase().includes(search.toLowerCase())
    );

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-600" /> Intelligent Forecasting
                    </h1>
                    <p className="text-gray-500 mt-1">Data-driven purchase recommendations and shelf health analysis</p>
                </div>
                {role === 'ADMIN' && (
                    <button
                        onClick={triggerManualForecast}
                        disabled={triggering}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <Zap className="w-4 h-4" /> {triggering ? 'Running...' : 'Run Analysis Now'}
                    </button>
                )}
            </div>

            <div className="flex space-x-2 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('RECOMMENDATIONS')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'RECOMMENDATIONS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <TrendingUp className="w-4 h-4" /> Recommendations ({recommendations.length})
                </button>
                <button
                    onClick={() => setActiveTab('DEAD_STOCK')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'DEAD_STOCK' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <PackageX className="w-4 h-4" /> Dead Stock ({deadStock.length})
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
            </div>

            {activeTab === 'RECOMMENDATIONS' && (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRecs.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-50">
                            <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800">No Purchase Recommendations</h3>
                            <p className="text-gray-500 mt-1">Your inventory levels are looking healthy based on current demand forecasts.</p>
                        </div>
                    ) : (
                        filteredRecs.map((rec) => (
                            <div key={rec.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{rec.medicine?.name}</h3>
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${getUrgencyBadge(rec.urgency)}`}>
                                            {rec.urgency} Priority
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium mb-3">{rec.reasoning}</p>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Rec. Order:</span>
                                            <span className="text-sm font-black text-indigo-700">{rec.recommended_quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Est. Cost:</span>
                                            <span className="text-sm font-black text-gray-800">${Number(rec.estimated_cost).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 md:w-48 flex-shrink-0">
                                    <div className="text-xs text-gray-400 font-medium text-right mb-2">
                                        Generated: {new Date(rec.created_at).toLocaleDateString()}
                                    </div>
                                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors">
                                        Draft PO
                                    </button>
                                    <button className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'DEAD_STOCK' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Medicine</th>
                                    <th className="px-6 py-4">Current Stock</th>
                                    <th className="px-6 py-4">Unit Cost</th>
                                    <th className="px-6 py-4">Tied Capital</th>
                                    <th className="px-6 py-4">Days Since Last Sale</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDeadStock.map((d, i) => {
                                    const tiedCapital = (d.medicine.total_stock * (d.medicine.unit_price || 0));
                                    return (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {d.medicine.name}
                                                <div className="text-xs text-gray-400 font-normal">{d.medicine.generic_name}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-600">{d.medicine.total_stock}</td>
                                            <td className="px-6 py-4 text-gray-500">${Number(d.medicine.unit_price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 font-bold text-rose-600">${tiedCapital.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-amber-500" />
                                                    <span className="font-bold text-gray-700">{d.days_since_last_sale} Days</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border bg-rose-50 text-rose-600 border-rose-200 inline-flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Dormant
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredDeadStock.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-emerald-300" />
                                            No dead stock detected. All inventory is moving within 60 days.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntelligentForecasting;
