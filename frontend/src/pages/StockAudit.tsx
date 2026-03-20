import { useState, useEffect } from 'react';
import client from '../api/client';
import {
    Barcode,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Save,
    Play,
    Pause,
    X,
    Search,
    Plus,
    Loader2,
    Package,
    History,
    Info
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

interface AuditItem {
    id: string;
    medicine_id: string;
    batch_id: string;
    medicine: { name: string; generic_name: string; unit: string };
    batch: { batch_number: string; expiry_date: string };
    system_quantity: number;
    scanned_quantity: number;
    variance: number;
}

interface Medicine {
    id: string;
    barcode: string;
    sku: string;
}

interface AuditSession {
    id: string;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    notes: string;
    created_at: string;
    completed_at: string | null;
    items: AuditItem[];
}

const StockAudit = () => {
    const [sessions, setSessions] = useState<AuditSession[]>([]);
    const [activeSession, setActiveSession] = useState<AuditSession | null>(null);
    const [finalizeConfirm, setFinalizeConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newNotes, setNewNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [showSummary, setShowSummary] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await client.get('/stock-audit/sessions');
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        // Pre-fetch medicines so we can resolve barcodes to medicine IDs during audit
        client.get('/medicines').then(res => setMedicines(res.data)).catch(console.error);
    }, []);

    // --- Global Barcode Scanner Listener ---
    useEffect(() => {
        if (!activeSession || activeSession.status !== 'IN_PROGRESS') return;

        let barcodeBuffer = '';
        let barcodeTimeout: any;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in the search box, notes, or manual inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
                return;
            }

            if (e.key === 'Enter' && barcodeBuffer.length > 3) {
                // Scanned barcode complete
                const scannedMed = medicines.find(
                    (m) => m.barcode === barcodeBuffer || m.sku === barcodeBuffer
                );

                if (scannedMed) {
                    // Find the audit item matching this medicine
                    // If multiple batches exist, we pick the first one with variance mismatch or the first overall
                    // In a perfect world, batches would have unique GS1 barcodes, but here we add to the first available batch for that medicine.
                    const auditItemsForMed = activeSession.items.filter(item => item.medicine_id === scannedMed.id);

                    if (auditItemsForMed.length > 0) {
                        const targetItem = auditItemsForMed.find(i => i.scanned_quantity < i.system_quantity) || auditItemsForMed[0];
                        const newQty = targetItem.scanned_quantity + 1;
                        handleUpdateQuantity(targetItem.batch_id, newQty);
                    } else {
                        console.warn(`Medicine found but no active batch in this audit session: ${barcodeBuffer}`);
                    }
                } else {
                    console.warn(`Barcode not found in inventory: ${barcodeBuffer}`);
                }

                barcodeBuffer = '';
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;

                clearTimeout(barcodeTimeout);
                barcodeTimeout = setTimeout(() => {
                    barcodeBuffer = '';
                }, 50); // Scanner inputs keys very fast
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(barcodeTimeout);
        };
    }, [activeSession, medicines]);

    const handleStartAudit = async () => {
        try {
            const res = await client.post('/stock-audit/sessions', { notes: newNotes });
            setActiveSession(res.data);
            setShowNewModal(false);
            setNewNotes('');
            fetchSessions();
        } catch (err) {
            alert('Failed to start audit session');
        }
    };

    const handleUpdateQuantity = async (batchId: string, quantity: number) => {
        if (!activeSession) return;
        try {
            await client.patch(`/stock-audit/sessions/${activeSession.id}/items/${batchId}`, { quantity });
            // Update local state
            setActiveSession({
                ...activeSession,
                items: activeSession.items.map(item =>
                    item.batch_id === batchId ? { ...item, scanned_quantity: quantity, variance: quantity - item.system_quantity } : item
                )
            });
        } catch (err) {
            console.error('Failed to update quantity', err);
        }
    };

    const handleFinalize = async () => {
        if (!activeSession) return;
        try {
            await client.post(`/stock-audit/sessions/${activeSession.id}/finalize`);
            setActiveSession(null);
            fetchSessions();
            alert('Audit finalized successfully!');
        } catch (err) {
            alert('Failed to finalize audit');
        }
    };

    const handleViewDetails = async (id: string) => {
        try {
            const res = await client.get(`/stock-audit/sessions/${id}`);
            setActiveSession(res.data);
            if (res.data.status === 'COMPLETED') {
                setShowSummary(true);
            }
        } catch (err) {
            alert('Failed to fetch session details');
        }
    };

    const filteredItems = activeSession?.items.filter(item =>
        item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (activeSession && (activeSession.status === 'IN_PROGRESS' || showSummary)) {
        const isSummary = activeSession.status === 'COMPLETED' || showSummary;

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={() => { setActiveSession(null); setShowSummary(false); }} className="text-indigo-600 font-bold hover:underline">Audits</button>
                            <span className="text-gray-400">/</span>
                            <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">
                                {isSummary ? 'Audit Summary' : 'Active Session'}: {activeSession.id.slice(0, 8)}
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500">{activeSession.notes || 'No notes provided'}</p>
                        {isSummary && activeSession.completed_at && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> 
                                Completed on {new Date(activeSession.completed_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                    {!isSummary && (
                        <button
                            onClick={handleFinalize}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                        >
                            <CheckCircle className="w-5 h-5" /> Finalize & Reconcile
                        </button>
                    )}
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by medicine or batch..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-around sm:justify-center gap-4 sm:gap-6 px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Items</span>
                            <span className="text-lg font-black text-indigo-700">{activeSession.items.length}</span>
                        </div>
                        <div className="w-px h-8 bg-indigo-200"></div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                {isSummary ? 'Discrepancies' : 'Scanned'}
                            </span>
                            <span className={`text-lg font-black ${isSummary ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isSummary 
                                    ? activeSession.items.filter(i => i.variance !== 0).length 
                                    : activeSession.items.filter(i => i.scanned_quantity > 0).length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-4">Medicine</th>
                                    <th className="px-6 py-4">Batch #</th>
                                    <th className="px-6 py-4">System Qty</th>
                                    <th className="px-6 py-4">Physical Qty</th>
                                    <th className="px-6 py-4 text-right">Variance</th>
                                    {!isSummary && <th className="px-6 py-4">Status</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <p className="text-sm font-bold text-gray-800">{item.medicine.name}</p>
                                            <p className="text-[10px] text-gray-500 line-clamp-1">{item.medicine.generic_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold font-mono rounded whitespace-nowrap">
                                                {item.batch.batch_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.system_quantity}</td>
                                        <td className="px-6 py-4">
                                            {isSummary ? (
                                                <span className="text-sm font-bold text-gray-800">{item.scanned_quantity}</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-16 sm:w-20 px-2 py-1 border border-gray-200 rounded font-bold text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={item.scanned_quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.batch_id, parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-bold px-2 py-1 rounded-lg ${item.variance === 0 ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                                                {item.variance > 0 ? `+${item.variance}` : item.variance}
                                            </span>
                                        </td>
                                        {!isSummary && (
                                            <td className="px-6 py-4">
                                                {item.scanned_quantity > 0 ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Checked
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-gray-300 text-[10px] font-bold uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Stock Audits</h1>
                    <p className="text-gray-500 mt-1">Verify physical inventory and reconcile discrepancies.</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                >
                    <Play className="w-5 h-5" /> Start New Audit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>)
                ) : sessions.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium text-lg">No audit history found.</p>
                    </div>
                ) : sessions.map(session => (
                    <div key={session.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : session.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>
                                {session.status === 'COMPLETED' ? <CheckCircle className="w-6 h-6" /> : <History className="w-6 h-6" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${session.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : session.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                {session.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Audit {session.id.slice(0, 8)}</h3>
                        <p className="text-xs text-gray-400 mt-1">{new Date(session.created_at).toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-4 line-clamp-1">{session.notes || 'No notes'}</p>

                        <button
                            onClick={() => handleViewDetails(session.id)}
                            className="w-full mt-6 py-2.5 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Info className="w-4 h-4" /> {session.status === 'IN_PROGRESS' ? 'Resume Session' : 'View Summary'}
                        </button>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                title="Start New Audit Session"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Starting an audit session will snapshot current stock levels for all medicines. You can pause and resume the session at any time.</p>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Session Notes (Optional)</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                            placeholder="e.g., Q1 Quarterly Inventory Check"
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={loading}
                        onClick={handleStartAudit}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                    >
                        Create Audit Session
                    </button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={finalizeConfirm}
                onClose={() => setFinalizeConfirm(false)}
                onConfirm={() => { handleFinalize(); setFinalizeConfirm(false); }}
                title="Finalize Audit"
                message="Are you sure you want to finalize this audit? This will update actual stock levels and create adjustment logs."
            />
        </div>
    );
};

export default StockAudit;
