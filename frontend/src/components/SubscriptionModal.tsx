import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Building2,
  ShoppingBag,
  BarChart2,
  Package,
  Wallet2
} from 'lucide-react';
import Modal from './Modal';
import client from '../api/client';
import { formatDate } from '../utils/dateUtils';
import { toastSuccess, toastError } from './Toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'request'>('overview');
  const [requestNotes, setRequestNotes] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await client.get('/organizations/subscription');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleRequestUpgrade = async () => {
    if (!selectedPlanId) return;
    setSubmitting(true);
    try {
      await client.post('/organizations/request-upgrade', {
        planId: selectedPlanId,
        notes: requestNotes
      });
      toastSuccess('Request Sent', 'Your upgrade request has been submitted to the platform administration.');
      fetchData();
      setActiveTab('overview');
      setRequestNotes('');
      setSelectedPlanId(null);
    } catch (err) {
      toastError('Error', 'Failed to submit upgrade request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscription Management"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col h-[600px]">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Plan Overview
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            Compare Plans
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'request' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Request Upgrade
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-bold">Synchronizing subscription details...</p>
          </div>
        ) : !data ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
            <h3 className="text-xl font-black text-gray-900">Connection Error</h3>
            <p className="text-gray-500 mt-2">We couldn't retrieve your subscription status. Please refresh or contact support.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'overview' && (
              <div className="space-y-6 pb-4">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                  <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                          Current Plan
                        </span>
                        {data.organization.status === 'ACTIVE' ? (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-100 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                            {data.organization.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-4xl font-black mb-1">{data.organization.plan_name}</h3>
                      <p className="text-indigo-100 font-medium opacity-80">{data.currentPlan?.description || 'Your organization is on our professional business tier.'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-3 mb-1">
                        <Clock className="w-5 h-5 text-indigo-200" />
                        <span className="text-sm font-bold text-indigo-100 uppercase tracking-tight">Renewal Date</span>
                      </div>
                      <div className="text-xl font-black">
                        {data.organization.expiry_date 
                          ? formatDate(data.organization.expiry_date)
                          : 'Perpetual License'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Included Modules</h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {data.features.filter((f: any) => f.isIncluded).length} / {data.features.length} Enabled
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.features.map((feat: any) => {
                      const IconComponent = ({
                        Building2,
                        ShoppingBag,
                        BarChart2,
                        Package,
                        Wallet2,
                        CreditCard,
                        CheckCircle2
                      } as Record<string, any>)[feat.icon] || CreditCard;

                      return (
                        <div 
                          key={feat.key} 
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                            feat.isIncluded 
                              ? 'bg-white border-gray-100 shadow-sm' 
                              : 'bg-gray-50 border-dashed border-gray-200 opacity-60'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            feat.isIncluded ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-900 truncate">{feat.name}</h5>
                              {feat.isNew && <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase">New</span>}
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">{feat.description}</p>
                          </div>
                          {feat.isIncluded ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-6 pb-4">
                <div className="text-center py-4">
                  <h3 className="text-2xl font-black text-gray-900">Compare All Tiers</h3>
                  <p className="text-gray-500 font-medium">Find the perfect plan for your pharmacy scale.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.availablePlans.map((plan: any) => (
                    <div key={plan.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-400 uppercase block tracking-widest">Monthly</span>
                          <span className="text-xl font-black text-gray-900">ETB {Number(plan.costs).toLocaleString()}</span>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h4>
                      <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">{plan.description || "Unlock advanced features and priority support."}</p>
                      
                      <div className="space-y-3 mb-8">
                        {plan.features.map((f: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5" />
                            <span className="font-medium">{f}</span>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setActiveTab('request');
                        }}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                      >
                        Request This Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'request' && (
              <div className="flex flex-col gap-6 py-6 pb-4 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Upgrade Request</h3>
                  <p className="text-gray-500 font-medium">Submit a manual request to the platform administration to modify your subscription status.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Select Target Plan</label>
                    <div className="grid grid-cols-1 gap-2">
                       {data.availablePlans.map((p: any) => (
                         <button
                           key={p.id}
                           onClick={() => setSelectedPlanId(p.id)}
                           className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                             selectedPlanId === p.id 
                               ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
                               : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                           }`}
                         >
                           <div>
                             <span className="text-sm font-black text-gray-900 block">{p.name}</span>
                             <span className="text-[10px] font-bold text-indigo-600">ETB {Number(p.costs).toLocaleString()} / month</span>
                           </div>
                           {selectedPlanId === p.id && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Internal Notes / Request Context</label>
                    <textarea 
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Please mention your reason for upgrade or specific branch requirements..."
                    />
                  </div>

                  <button 
                    disabled={!selectedPlanId || submitting || data.myRequests?.some((r: any) => r.status === 'PENDING')}
                    onClick={handleRequestUpgrade}
                    className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {data.myRequests?.some((r: any) => r.status === 'PENDING') 
                      ? 'Upgrade Request is Pending Review' 
                      : 'Submit Upgrade Request'}
                  </button>

                  {/* Request History */}
                  {data.myRequests?.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Request History</h4>
                      </div>
                      <div className="space-y-3">
                        {data.myRequests.map((req: any) => (
                          <div key={req.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-gray-900">{req.plan?.name} Plan</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white border border-gray-100 ${
                                req.status === 'APPROVED' ? 'text-emerald-600' : 
                                req.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-400 font-bold mb-2">
                              Submitted on {new Date(req.created_at).toLocaleDateString()}
                            </div>
                            {req.admin_notes && (
                              <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-[10px] text-gray-600 font-medium leading-relaxed italic">
                                "{req.admin_notes}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
