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
        const isSuspended = message.includes('ORGANIZATION_SUSPENDED');
        const isExpired = message.includes('SUBSCRIPTION_EXPIRED');
        if (isSuspended) {
          setError('Your organization has been suspended. Please contact the system administrator to restore access.');
        } else if (isExpired) {
          setError('Your pharmacy subscription has expired. Please contact the system administrator to renew.');
        } else {
          setError('Access denied. Please contact your system administrator.');
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
          <p className="text-gray-500 mt-2 font-medium">Secure Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className={`p-4 rounded-xl flex items-start text-sm font-medium ${isAmbiguous ? 'bg-orange-50 border border-orange-100 text-orange-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
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
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
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

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-50"
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
    </div>
  );
};

export default Login;
