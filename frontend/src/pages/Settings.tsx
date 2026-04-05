import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  Bell, 
  Shield, 
  Settings as SettingsIcon,
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Monitor,
  Layout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getMyOrganization, 
  updateMyOrganization, 
  getMySubscription, 
  requestUpgrade
} from '../api/tenantService';
import { toastSuccess, toastError } from '../components/Toast';
import Modal from '../components/Modal';

type SettingsTab = 'profile' | 'appearance' | 'subscription' | 'notifications' | 'security' | 'preferences';

export default function Settings() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [org, setOrg] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    contact_person: '',
    license_number: ''
  });

  const [notifPrefs, setNotifPrefs] = useState({
    lowStock: true,
    expiryAlerts: true,
    dailyReports: false,
    emailAlerts: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    sidebarDensity: 'comfortable',
    primaryColor: 'indigo'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeNotes, setUpgradeNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgRes, subRes] = await Promise.all([
        getMyOrganization(),
        getMySubscription()
      ]);
      setOrg(orgRes);
      setSubscription(subRes);
      setProfileForm({
        name: orgRes.name || '',
        email: orgRes.email || '',
        phone: orgRes.phone || '',
        address: orgRes.address || '',
        city: orgRes.city || '',
        contact_person: orgRes.contact_person || '',
        license_number: orgRes.license_number || ''
      });
      if (orgRes.preferences) {
        setNotifPrefs(prev => ({ ...prev, ...orgRes.preferences }));
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
      toastError('Error', 'Could not load your pharmacy settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyOrganization(profileForm);
      toastSuccess('Profile Updated', 'Your pharmacy profile has been successfully saved.');
      fetchData();
    } catch (err) {
      toastError('Update Failed', 'Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeRequest = async () => {
    setSaving(true);
    try {
      await requestUpgrade('SILVER', upgradeNotes); 
      toastSuccess('Request Sent', 'Your subscription upgrade request has been submitted to portal admin.');
      setIsUpgradeModalOpen(false);
      fetchData();
    } catch (err) {
      toastError('Request Failed', 'Could not submit your upgrade request.');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = async (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      await updateMyOrganization({ preferences: updated });
      toastSuccess('Preference Saved', 'Your notification settings have been updated.');
    } catch (err) {
      toastError('Error', 'Failed to save notification preferences.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-medium animate-pulse">Initializing settings portal...</div>;

  const tabs: { id: SettingsTab; label: string; icon: any; roles: string[] }[] = [
    { id: 'profile', label: 'Pharmacy Profile', icon: Building2, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard, roles: ['ADMIN'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'security', label: 'Security', icon: Shield, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon, roles: ['ADMIN', 'PHARMACIST'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(role || ''));

  return (
    <div className="max-w-5xl mx-auto p-2 lg:p-4">
      <div className="mb-4">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-400 font-bold text-[10px] mt-0.5 uppercase tracking-wide">Configure pharmacy node & subscription status</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <nav className="space-y-1 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 lg:p-6 shadow-sm relative overflow-hidden min-h-[500px]">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-8 -mt-8" />

             {activeTab === 'profile' && (
               <div className="relative animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Pharmacy Profile</h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Public identity</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Legal Pharmacy Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner border"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Contact Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner border"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Phone Number</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner border"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">City</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={e => setProfileForm({...profileForm, city: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner border"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">License Number</label>
                        <input
                          type="text"
                          value={profileForm.license_number}
                          onChange={e => setProfileForm({...profileForm, license_number: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner border"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Detailed Address</label>
                        <textarea
                          rows={2}
                          value={profileForm.address}
                          onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner border resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {saving ? <Clock className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Profile
                      </button>
                    </div>
                  </form>
               </div>
             )}

             {activeTab === 'appearance' && (
                <div className="animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Appearance</h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Custom workspace</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden group">
                          <div className="flex items-center gap-2 mb-3">
                             <Monitor className="w-4 h-4 text-indigo-600" />
                             <h4 className="text-xs font-bold text-gray-900">System Theme</h4>
                          </div>
                          <div className="flex gap-1.5">
                             {['light', 'dark', 'system'].map((t) => (
                               <button
                                 key={t}
                                 onClick={() => setAppearance({...appearance, theme: t})}
                                 className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                                   appearance.theme === t 
                                     ? 'bg-indigo-600 text-white shadow-lg' 
                                     : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'
                                 }`}
                               >
                                 {t}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                          <div className="flex items-center gap-2 mb-3">
                             <Layout className="w-4 h-4 text-indigo-600" />
                             <h4 className="text-xs font-bold text-gray-900">UI Density</h4>
                          </div>
                          <div className="flex gap-1.5">
                             {['compact', 'comfortable'].map((d) => (
                               <button
                                 key={d}
                                 onClick={() => setAppearance({...appearance, sidebarDensity: d})}
                                 className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                   appearance.sidebarDensity === d 
                                     ? 'bg-indigo-600 text-white shadow-md' 
                                     : 'bg-white text-gray-400 border border-gray-100'
                                 }`}
                               >
                                 {d}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                       <h4 className="text-xs font-bold text-gray-900 mb-3 px-1">Primary Color Palette</h4>
                       <div className="flex flex-wrap gap-2.5">
                          {['indigo', 'emerald', 'sky', 'rose', 'amber'].map((c) => (
                            <button
                              key={c}
                              onClick={() => setAppearance({...appearance, primaryColor: c})}
                              className={`w-9 h-9 rounded-xl transition-all relative ${
                                appearance.primaryColor === c ? 'ring-2 ring-offset-1 ring-gray-300 scale-110' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: `var(--${c}-600, ${c})` }}
                            >
                               {appearance.primaryColor === c && <CheckCircle2 className="w-5 h-5 text-white absolute inset-0 m-auto" />}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
             )}

             {activeTab === 'subscription' && subscription && (
                <div className="animate-in slide-in-from-left duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Billing Status</h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active agreements</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                       <CreditCard className="absolute -bottom-2 -right-2 w-20 h-20 text-white/5 rotate-12" />
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Current Tier</span>
                            <div className="text-2xl font-black tracking-tight">{subscription.organization.plan_name || 'Free Trial'}</div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${subscription.organization.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {subscription.organization.status}
                          </div>
                       </div>
                       <div className="flex items-end justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Expiry Date</span>
                            <div className="text-sm font-bold">{subscription.organization.expiry_date ? new Date(subscription.organization.expiry_date).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-lg font-black tracking-tight">ETB {subscription.currentPlan?.costs || 0}</div>
                             <span className="text-[10px] text-white/40 uppercase font-bold">/ Monthly</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 flex flex-col justify-center items-center text-center">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <h3 className="text-sm font-bold text-gray-900">Need more features?</h3>
                       <p className="text-[11px] text-gray-400 font-medium mt-1 mb-4">Transition to a higher tier for intelligent forecasting and more staff accounts.</p>
                       <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md"
                       >
                         Request Upgrade
                       </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest px-1">Service Entitlements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {subscription.features?.map((f: any) => (
                         <div key={f.key} className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${f.isIncluded ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.isIncluded ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                               <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                               <div className="text-xs font-bold text-gray-800">{f.name}</div>
                               <div className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">{f.isIncluded ? 'Activated' : 'Locked'}</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
             )}

             {activeTab === 'notifications' && (
               <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Notifications</h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Platform alerts</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-2xl">
                     {[
                       { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Notify below threshold.' },
                       { key: 'expiryAlerts', label: 'Expiry Reminders', desc: 'Alerts 30 days before expiry.' },
                       { key: 'dailyReports', label: 'Daily Reports', desc: 'Summary of daily activity.' },
                       { key: 'emailAlerts', label: 'External Email Notifications', desc: 'Forward critical alerts to your organizational email.' },
                     ].map((item) => (
                       <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                          <div>
                            <h4 className="text-xs font-bold text-gray-700">{item.label}</h4>
                            <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleNotif(item.key as any)}
                            className={`w-10 h-5 rounded-full relative transition-all ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-indigo-600' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'left-5.5' : 'left-0.5'}`} />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {activeTab === 'security' && (
               <div className="animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Security & Credentials</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account protection & session management</p>
                    </div>
                  </div>

                  <div className="max-w-xl">
                     <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-3 mb-8">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Changing your password will instantly invalidate all active sessions across other devices. 
                          Ensure you have your new credentials ready for re-authentication.
                        </p>
                     </div>

                     <div className="space-y-6">
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Account Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all border shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">New Secure Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all border shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all border shadow-inner" />
                        </div>
                        <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg active:scale-95">
                          Update Security Credentials
                        </button>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'preferences' && (
               <div className="animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <SettingsIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Customization</h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Branding defaults</p>
                    </div>
                  </div>

                  <div className="space-y-6 max-w-2xl">
                     <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 border-dashed text-center">
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-300">
                           <Building2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">Pharmacy Logo</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 mb-4">Click to upload brand asset.</p>
                        <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600">
                           Upload asset
                        </button>
                     </div>

                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Receipt Header</label>
                        <textarea placeholder="e.g. Community Pharmacy" className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all border shadow-inner" rows={2} />
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Upgrade Request Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade Service Tier"
      >
        <div className="pt-4 space-y-6">
           <div className="bg-indigo-50 p-6 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-indigo-950">Scale your pharmacy operations</h4>
                <p className="text-xs text-indigo-700 leading-relaxed mt-1">
                  Requesting an upgrade will notify our platform administrators. New capabilities will be provisioned once the request is processed.
                </p>
              </div>
           </div>
           
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Message to Administrator</label>
              <textarea
                rows={4}
                value={upgradeNotes}
                onChange={e => setUpgradeNotes(e.target.value)}
                placeholder="Briefly describe your requirements..."
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all border resize-none"
              />
           </div>

           <div className="flex gap-3">
              <button type="button" onClick={() => setIsUpgradeModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={handleUpgradeRequest} disabled={saving} className="flex-[2] py-4 text-sm font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50">
                {saving ? 'Sending...' : 'Submit Upgrade Request'}
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
