import React, { useState, useEffect, useRef } from 'react';
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
  Layout,
  Upload,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme, Density } from '../contexts/ThemeContext';
import { 
  getMyOrganization, 
  updateMyOrganization, 
  getMySubscription, 
  requestUpgrade,
  changePassword
} from '../api/tenantService';
import { toastSuccess, toastError } from '../components/Toast';
import Modal from '../components/Modal';

type SettingsTab = 'profile' | 'appearance' | 'subscription' | 'notifications' | 'security' | 'preferences';

export default function Settings() {
  const { user, role } = useAuth();
  const { theme, density, setTheme, setDensity, pharmacyLogo, setPharmacyLogo } = useTheme();
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

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeNotes, setUpgradeNotes] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

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
      toastSuccess('Profile Updated', 'Your pharmacy profile has been saved.');
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
      toastSuccess('Request Sent', 'Your upgrade request has been submitted.');
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
      toastSuccess('Saved', 'Notification preference updated.');
    } catch (err) {
      toastError('Error', 'Failed to save notification preference.');
      // Revert on failure
      setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.newPassword || !securityForm.currentPassword) {
      toastError('Validation', 'Please fill in all password fields.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toastError('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (securityForm.newPassword.length < 6) {
      toastError('Too Short', 'New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(securityForm.currentPassword, securityForm.newPassword);
      toastSuccess('Password Updated', 'Your password has been changed successfully.');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update password.';
      toastError('Error', msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toastError('File Too Large', 'Logo must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPharmacyLogo(dataUrl);
      toastSuccess('Logo Saved', 'Pharmacy logo has been updated in the sidebar.');
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-400 font-medium animate-pulse dark:text-gray-500">
      Initializing settings portal...
    </div>
  );

  const tabs: { id: SettingsTab; label: string; icon: any; roles: string[] }[] = [
    { id: 'profile', label: 'Pharmacy Profile', icon: Building2, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'AUDITOR'] },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, roles: ['ADMIN'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'security', label: 'Security', icon: Shield, roles: ['ADMIN', 'PHARMACIST', 'CASHIER', 'AUDITOR'] },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon, roles: ['ADMIN', 'PHARMACIST'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(role || ''));

  return (
    <div className="max-w-5xl mx-auto p-2 lg:p-4">
      <div className="mb-4">
        <h1 className="text-xl font-black text-gray-900 tracking-tight dark:text-white">System Settings</h1>
        <p className="text-gray-400 font-bold text-[10px] mt-0.5 uppercase tracking-wide">Configure pharmacy node &amp; preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <nav className="space-y-0.5 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-28">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-semibold text-xs tracking-tight">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-3 h-3 opacity-60" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 lg:p-5 shadow-sm relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/40 dark:bg-indigo-900/10 rounded-bl-full -mr-6 -mt-6" />

            {/* ========== PROFILE ========== */}
            {activeTab === 'profile' && (
              <div className="relative animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Pharmacy Profile</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Public identity</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-3 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Legal Pharmacy Name</label>
                      <input
                        type="text" required
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Contact Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={e => setProfileForm({...profileForm, city: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">License Number</label>
                      <input
                        type="text"
                        value={profileForm.license_number}
                        onChange={e => setProfileForm({...profileForm, license_number: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Address</label>
                      <textarea
                        rows={2}
                        value={profileForm.address}
                        onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {saving ? <Clock className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========== APPEARANCE ========== */}
            {activeTab === 'appearance' && (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-600">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Appearance</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customize workspace look</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-2xl">
                  {/* Theme Toggle */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">System Theme</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'light' as Theme, label: 'Light', icon: Sun },
                        { value: 'dark' as Theme, label: 'Dark', icon: Moon },
                        { value: 'system' as Theme, label: 'System', icon: Laptop },
                      ] as {value: Theme; label: string; icon: any}[]).map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                            theme === value
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 px-1">
                      {theme === 'system' ? 'Following your OS preference automatically.' : `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode is active.`}
                    </p>
                  </div>

                  {/* UI Density */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Layout className="w-3.5 h-3.5 text-indigo-600" />
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">UI Density</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'comfortable' as Density, label: 'Comfortable', desc: 'More spacing & padding' },
                        { value: 'compact' as Density, label: 'Compact', desc: 'Reduced spacing for dense data' },
                      ] as {value: Density; label: string; desc: string}[]).map(({ value, label, desc }) => (
                        <button
                          key={value}
                          onClick={() => setDensity(value)}
                          className={`flex flex-col items-start p-3 rounded-xl text-left transition-all border ${
                            density === value
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
                          <span className={`text-[10px] mt-0.5 ${density === value ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live preview indicator */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">Changes apply instantly across the entire application.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ========== SUBSCRIPTION ========== */}
            {activeTab === 'subscription' && subscription && (
              <div className="animate-in slide-in-from-left duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Billing Status</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active agreements</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="bg-indigo-600 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-5 rounded-xl text-white shadow-lg relative overflow-hidden">
                    <CreditCard className="absolute -bottom-2 -right-2 w-16 h-16 text-white/10 rotate-12" />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 block mb-0.5">Current Tier</span>
                        <div className="text-xl font-black tracking-tight">{subscription.organization.plan_name || 'Free Trial'}</div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 ${subscription.organization.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {subscription.organization.status}
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 block mb-0.5">Expiry</span>
                        <div className="text-sm font-bold">{subscription.organization.expiry_date ? new Date(subscription.organization.expiry_date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black tracking-tight">ETB {subscription.currentPlan?.costs || 0}</div>
                        <span className="text-[10px] text-white/60 uppercase font-bold">/ Monthly</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-5 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 flex flex-col justify-center items-center text-center">
                    <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-lg flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">Need more features?</h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 mb-3">Transition to a higher tier for advanced capabilities.</p>
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="px-5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-sm hover:bg-indigo-700 transition"
                    >
                      Request Upgrade
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-gray-700 dark:text-gray-300 text-xs uppercase tracking-widest px-1">Service Entitlements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subscription.features?.map((f: any) => (
                      <div key={f.key} className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 ${f.isIncluded ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 opacity-60'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${f.isIncluded ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{f.name}</div>
                          <div className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">{f.isIncluded ? 'Activated' : 'Locked'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== NOTIFICATIONS ========== */}
            {activeTab === 'notifications' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center text-rose-500">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Notifications</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Platform alert preferences</p>
                  </div>
                </div>

                <div className="space-y-2 max-w-xl">
                  {[
                    { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Notify when items fall below threshold.' },
                    { key: 'expiryAlerts', label: 'Expiry Reminders', desc: 'Alerts 30 days before expiry date.' },
                    { key: 'dailyReports', label: 'Daily Summary Reports', desc: 'Receive a daily activity summary.' },
                    { key: 'emailAlerts', label: 'Email Notifications', desc: 'Forward critical alerts to your organizational email.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.label}</h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotif(item.key as any)}
                        className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                        aria-label={`Toggle ${item.label}`}
                        role="switch"
                        aria-checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== SECURITY ========== */}
            {activeTab === 'security' && (
              <div className="animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex items-center justify-center text-sky-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Security &amp; Credentials</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Password management</p>
                  </div>
                </div>

                <div className="max-w-md">
                  {/* Warning notice */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-xl flex items-start gap-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                      Changing your password will invalidate all active sessions on other devices.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    {/* Current Password */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={securityForm.currentPassword}
                          onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3" /> New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={securityForm.newPassword}
                          onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          placeholder="Min. 6 characters"
                          className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                          required minLength={6}
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {securityForm.newPassword && (
                        <div className="mt-1.5 px-1">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                securityForm.newPassword.length >= i * 3
                                  ? i <= 1 ? 'bg-rose-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }`} />
                            ))}
                          </div>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {securityForm.newPassword.length < 6 ? 'Too short' : securityForm.newPassword.length < 8 ? 'Weak' : securityForm.newPassword.length < 10 ? 'Good' : 'Strong'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3" /> Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={securityForm.confirmPassword}
                          onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          className={`w-full bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 border rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all pr-10 ${
                            securityForm.confirmPassword && securityForm.confirmPassword !== securityForm.newPassword
                              ? 'border-rose-400 dark:border-rose-500'
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                          required
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {securityForm.confirmPassword && securityForm.confirmPassword !== securityForm.newPassword && (
                        <p className="text-[10px] text-rose-500 mt-1 px-1">Passwords do not match</p>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={passwordSaving || (!!securityForm.confirmPassword && securityForm.confirmPassword !== securityForm.newPassword)}
                        className="px-5 py-2 bg-sky-600 text-white rounded-lg font-bold text-xs hover:bg-sky-700 transition-all flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        {passwordSaving ? <Clock className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========== PREFERENCES ========== */}
            {activeTab === 'preferences' && (
              <div className="animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-600">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">Preferences</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Branding &amp; customization</p>
                  </div>
                </div>

                <div className="space-y-5 max-w-xl">
                  {/* Logo Upload */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">Pharmacy Logo</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">Upload your logo — it appears in the top-left of the sidebar next to "Pharmacy ERP".</p>
                    
                    <div className="flex items-center gap-4">
                      {/* Preview */}
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {pharmacyLogo ? (
                          <img src={pharmacyLogo} alt="Pharmacy logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Building2 className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          <Upload className="w-3 h-3" />
                          Upload Logo
                        </button>
                        {pharmacyLogo && (
                          <button
                            onClick={() => { setPharmacyLogo(null); toastSuccess('Removed', 'Logo has been cleared.'); }}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-500 transition-all"
                          >
                            Remove Logo
                          </button>
                        )}
                        <p className="text-[9px] text-gray-400">PNG, JPG, SVG — max 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Header */}
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Receipt Header Text</label>
                    <textarea
                      placeholder="e.g. Community Pharmacy — Your Health, Our Priority"
                      className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      rows={2}
                    />
                    <p className="text-[9px] text-gray-400 mt-1">This appears as a custom header on printed receipts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Request Modal */}
      <Modal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} title="Upgrade Service Tier">
        <div className="pt-3 space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-indigo-950 dark:text-indigo-100 text-sm">Scale your pharmacy operations</h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed mt-1">
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
              className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 border border-gray-100 dark:border-gray-600 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setIsUpgradeModalOpen(false)} className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">Cancel</button>
            <button onClick={handleUpgradeRequest} disabled={saving} className="flex-[2] py-3 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50">
              {saving ? 'Sending...' : 'Submit Upgrade Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
