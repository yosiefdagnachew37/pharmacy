import { useEffect, useState } from 'react';
import client from '../api/client';
import { User, Clock, ShieldCheck } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  user_id: string;
  user: { username: string };
  created_at: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await client.get('/audit');
        setLogs(response.data);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Audit Trail</h1>
        <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Secured Logging Active
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Component</th>
                <th className="px-6 py-4 text-right">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Retrieving secure logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No system activity recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-600 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-2 text-gray-300" />
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-bold text-gray-800">
                        <User className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                        {log.user?.username || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === 'CREATE' ? 'bg-blue-50 text-blue-600' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] text-gray-300 font-mono">
                      {log.id.slice(0, 12)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
