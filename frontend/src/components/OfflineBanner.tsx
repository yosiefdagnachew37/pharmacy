import { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import client from '../api/client';

const isElectron = !!(window as any).electronAPI || navigator.userAgent.includes('Electron');

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  // In LAN client mode, read the stored server URL
  const lanServerUrl = localStorage.getItem('lan_server_url');
  const isLanClient = isElectron && !!lanServerUrl;

  // Only monitor if: LAN client (has server URL configured) OR web/SaaS mode.
  // Do NOT monitor if LAN client has not been configured yet (setup screen).
  const shouldMonitor = isLanClient || !isElectron;

  const checkConnection = async () => {
    if (!shouldMonitor) return;
    setChecking(true);
    try {
      await client.get('/users/status/health', { timeout: 3000 });
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!shouldMonitor) return;
    const interval = setInterval(checkConnection, 60000); // Every 60s
    checkConnection(); // Initial check
    return () => clearInterval(interval);
  }, [shouldMonitor]);

  if (!isOffline || !shouldMonitor) return null;

  // Show a clear message depending on mode
  const message = isLanClient
    ? `LAN SERVER UNREACHABLE: Cannot connect to ${lanServerUrl}. Check that the server PC is on and the network is connected.`
    : 'SYSTEM OFFLINE: Local backend server is unreachable. Some features may be disabled.';

  return (
    <div className="bg-red-600 text-white px-6 py-2 flex items-center justify-between shadow-2xl animate-pulse">
      <div className="flex items-center">
        <WifiOff className="w-5 h-5 mr-3" />
        <span className="font-bold text-sm tracking-wide">{message}</span>
      </div>
      <button
        onClick={checkConnection}
        disabled={checking}
        className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all"
      >
        {checking ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
        Reconnect Now
      </button>
    </div>
  );
};

export default OfflineBanner;
