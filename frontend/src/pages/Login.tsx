import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Pill, Lock, User, AlertCircle, Building2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAmbiguous, setIsAmbiguous] = useState(false);

  // Terms and Conditions State
  const [agreedToTerms, setAgreedToTerms] = useState(
    localStorage.getItem('hasAcceptedTerms') === 'true'
  );
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/login', {
        username,
        password,
        organization_name: organizationName
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (agreedToTerms) {
        localStorage.setItem('hasAcceptedTerms', 'true');
      }

      window.dispatchEvent(new Event('storage'));

      const user = response.data.user;
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || '';

      if (status === 409) {
        setIsAmbiguous(true);
        setError('Multiple pharmacies found with these credentials. Please enter your Pharmacy name below.');
      } else if (status === 403) {
        // Organization suspended or subscription issue
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message || '');
        const isSuspended = messageStr.includes('ORGANIZATION_SUSPENDED');
        const isExpired = messageStr.includes('SUBSCRIPTION_EXPIRED');
        const isDeactivated = messageStr.includes('USER_DEACTIVATED');
        if (isSuspended) {
          setError('Your organization has been suspended. Please contact the system administrator to restore access.');
        } else if (isExpired) {
          setError('Your pharmacy subscription has expired. Please contact the system administrator to renew.');
        } else if (isDeactivated) {
          setError('Your account has been deactivated. Please contact your system administrator.');
        } else {
          setError(messageStr.includes('Forbidden') ? 'Access denied. Please contact your system administrator.' : messageStr);
        }
      } else if (status === 401) {
        setError('Incorrect username or password. Please try again.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-gray-50 bg-gray-50/50">
          <div className="inline-flex p-4 bg-white rounded-2xl text-indigo-600 mb-4 shadow-sm">
            <Pill className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pharmacy ERP</h1>
          <p className="text-gray-900 mt-2 font-medium">Secure Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className={`p-4 rounded-xl flex items-start text-sm font-medium ${isAmbiguous ? 'bg-orange-50 border border-orange-100 text-orange-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {(isAmbiguous || organizationName) && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Pharmacy Name</label>
                <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-50 px-1.5 py-0.5 rounded tracking-tighter ring-1 ring-indigo-100">REQUIRED</span>
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                <input
                  type="text"
                  required={isAmbiguous}
                  className="w-full pl-12 pr-4 py-4 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold placeholder:font-medium uppercase placeholder:normal-case text-sm tracking-tight text-indigo-900 shadow-inner"
                  placeholder="e.g. ABINET PHARMACY"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>
            </div>
          )}

          {(!localStorage.getItem('hasAcceptedTerms')) && (
            <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded cursor-pointer border-gray-300 focus:ring-indigo-500 shadow-sm"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                I have read and agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-indigo-600 font-bold hover:underline">System Terms and Conditions</button> for organizational usage.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!agreedToTerms && !localStorage.getItem('hasAcceptedTerms'))}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-xs">
              Protected by encrypted local-first security.
            </p>
          </div>
        </form>
      </div>
      {/* Terms Modal overlay */}
      {showTerms && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">System End-User License Agreement</h3>
            </div>
            <div className="p-6 text-sm text-gray-600 overflow-y-auto max-h-[60vh] space-y-4 font-medium leading-relaxed">
              <p>By accessing and utilizing this Pharmacy Enterprise Resource Planning application ("The System"), you enter into a binding agreement summarizing the terms of service.</p>

              <p className="font-bold text-gray-900 mb-1">1. Licensing & Usage Limitations</p>
              <p>This software is provided specifically for the authorized organizational node under a designated subscription tier. You may not reverse-engineer, decompile, bypass internal module locks, or duplicate the deployment binaries without explicit platform administration consent.</p>

              <p className="font-bold text-gray-900 mb-1">2. Audit & Data Policy</p>
              <p>All stock tracking, financial auditing, and usage logs recorded within The System belong strictly to the managing entity. The platform administrators reserve the right to temporarily suspend, block, or limit access to specific modules if an organization fails to maintain an active subscription or violates proper usage policies.</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTerms(false);
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
