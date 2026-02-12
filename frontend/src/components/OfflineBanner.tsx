import { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import client from '../api/client';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      await client.get('/users/status/health', { timeout: 3000 }); // Basic health check
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkConnection, 10000); // Check every 10s
    checkConnection(); // Initial check
    return () => clearInterval(interval);
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-600 text-white px-6 py-2 flex items-center justify-between shadow-2xl animate-pulse">
      <div className="flex items-center">
        <WifiOff className="w-5 h-5 mr-3" />
        <span className="font-bold text-sm tracking-wide">
          SYSTEM OFFLINE: Local backend server is unreachable. Some features may be disabled.
        </span>
      </div>
      <button 
        onClick={checkConnection}
        disabled={checking}
        className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all"
      >
        {checking ? (
          <Loader2 className="w-3 h-3 animate-spin mr-2" />
        ) : null}
        Reconnect Now
      </button>
    </div>
  );
};

export default OfflineBanner;
