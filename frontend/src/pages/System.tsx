import { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  Database, 
  Download, 
  RotateCcw, 
  Activity, 
  Shield, 
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

interface Backup {
  filename: string;
  createdAt: string;
  size: number;
}

interface SystemStatus {
  uptime: number;
  memoryUsage: { rss: number; heapUsed: number };
  nodeVersion: string;
  platform: string;
  backupCount: number;
}

const System = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [backupsRes, statusRes] = await Promise.all([
        client.get('/system/backups'),
        client.get('/system/status')
      ]);
      setBackups(backupsRes.data);
      setStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to fetch system data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBackup = async () => {
    setActionLoading(true);
    try {
      await client.post('/system/backup');
      await fetchData();
      alert('Backup created successfully!');
    } catch (err) {
      alert('Backup failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    setActionLoading(true);
    try {
      await client.post(`/system/restore/${filename}`);
      alert('System restored successfully! Please restart the application.');
    } catch (err) {
      alert('Restore failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage database backups, restores, and monitor system health.</p>
        </div>
        <button 
          onClick={handleBackup}
          disabled={actionLoading}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5 mr-3" />
          {actionLoading ? 'Processing...' : 'Create Backup Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-400 mb-2">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Uptime</span>
          </div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">
            {status ? formatUptime(status.uptime) : 'Loading...'}
          </h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-400 mb-2">
            <HardDrive className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Backups</span>
          </div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">
            {status?.backupCount || 0} Saved
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-400 mb-2">
            <Cpu className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Memory</span>
          </div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">
            {status ? `${(status.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB` : 'Loading...'}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-400 mb-2">
            <Shield className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Security</span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-bold text-gray-800 text-sm italic">Encrypted</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center">
          <Database className="w-5 h-5 text-indigo-600 mr-3" />
          <h2 className="font-bold text-gray-800">Backup History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Filename</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-center">Size</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">Scanning archives...</td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No backups available yet.</td></tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{backup.filename}</td>
                    <td className="px-6 py-4 text-sm">{new Date(backup.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-sm">{formatSize(backup.size)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                         onClick={() => setRestoreConfirm(backup.filename)}
                         disabled={actionLoading}
                         className="text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1 flex items-center ml-auto transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-start">
         <AlertCircle className="w-6 h-6 text-orange-600 mr-4 flex-shrink-0" />
         <div>
            <h4 className="font-bold text-orange-800 mb-1">Backup Recommendation</h4>
            <p className="text-sm text-orange-700">
              Daily automated backups are active at 12:00 AM. It is highly recommended to perform a manual backup before major inventory updates or system maintenance. 
              Store physical copies of your backup archives on an external drive for maximum durability.
            </p>
         </div>
      </div>

      <ConfirmModal
        isOpen={!!restoreConfirm}
        onClose={() => setRestoreConfirm(null)}
        onConfirm={() => {
            if (restoreConfirm) {
                handleRestore(restoreConfirm);
                setRestoreConfirm(null);
            }
        }}
        title="Restore Backup"
        message={`Are you sure you want to restore from this backup? This will overwrite your current data.`}
      />
    </div>
  );
};

export default System;
