import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import { User, Clock, ShieldCheck, Search, FileText } from 'lucide-react';
import ColumnFilter from '../components/ColumnFilter';
import { formatDate } from '../utils/dateUtils';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  description: string;
  user_id: string;
  user: { username: string };
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE:       'bg-blue-50 text-blue-700',
  UPDATE:       'bg-amber-50 text-amber-700',
  DELETE:       'bg-red-50 text-red-700',
  SELL:         'bg-emerald-50 text-emerald-700',
  REFUND:       'bg-rose-50 text-rose-700',
  PAYMENT:      'bg-violet-50 text-violet-700',
  PURCHASE:     'bg-cyan-50 text-cyan-700',
  TRANSFER:     'bg-indigo-50 text-indigo-700',
  STOCK_ADJUST: 'bg-orange-50 text-orange-700',
  LOGIN:        'bg-gray-100 text-gray-600',
  LOGOUT:       'bg-gray-100 text-gray-500',
  DISPENSE:     'bg-teal-50 text-teal-700',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Column Filters ──────────────────────────────────────────
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    user: [],
    action: [],
    component: [],
    date: [],
  });

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

  // ─── Unique Options & Filtering ──────────────────────────────
  const uniqueUsers = useMemo(() => [...new Set(logs.map(l => l.user?.username || 'Unknown'))].sort(), [logs]);
  const uniqueActions = useMemo(() => [...new Set(logs.map(l => l.action))].sort(), [logs]);
  const uniqueComponents = useMemo(() => [...new Set(logs.map(l => l.entity))].sort(), [logs]);
  const uniqueDates = useMemo(() => [...new Set(logs.map(l => formatDate(l.created_at)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const username = log.user?.username || 'Unknown';
      const logDate = formatDate(log.created_at);
      const matchesSearch =
        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUser = columnFilters.user.length === 0 || columnFilters.user.includes(username);
      const matchesAction = columnFilters.action.length === 0 || columnFilters.action.includes(log.action);
      const matchesComponent = columnFilters.component.length === 0 || columnFilters.component.includes(log.entity);
      const matchesDate = columnFilters.date.length === 0 || columnFilters.date.includes(logDate);

      return matchesSearch && matchesUser && matchesAction && matchesComponent && matchesDate;
    });
  }, [logs, searchTerm, columnFilters]);

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Trail</h1>
          <p className="text-xs text-gray-500 mt-0.5">Complete history of all critical system activities</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:ring-2 focus:ring-indigo-100 outline-none w-52"
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setColumnFilters({ user: [], action: [], component: [], date: [] })}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              Clear All Filters ({activeFilterCount})
            </button>
          )}
          <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Secured Logging Active
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['CREATE','SELL','PAYMENT','DELETE'].map(action => {
          const count = logs.filter(l => l.action === action).length;
          return (
            <div key={action} className={`px-4 py-3 rounded-xl border flex items-center justify-between ${ACTION_COLORS[action] || 'bg-gray-50 text-gray-600'} border-current/20`}>
              <span className="text-xs font-bold uppercase tracking-wider">{action}</span>
              <span className="text-lg font-black">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest sticky top-0 z-30 shadow-sm">
              <tr>
                <ColumnFilter
                  label="Timestamp"
                  options={uniqueDates}
                  selectedValues={columnFilters.date}
                  onFilterChange={(v) => updateFilter('date', v)}
                />
                <ColumnFilter
                  label="User"
                  options={uniqueUsers}
                  selectedValues={columnFilters.user}
                  onFilterChange={(v) => updateFilter('user', v)}
                />
                <ColumnFilter
                  label="Action"
                  options={uniqueActions}
                  selectedValues={columnFilters.action}
                  onFilterChange={(v) => updateFilter('action', v)}
                />
                <ColumnFilter
                  label="Module"
                  options={uniqueComponents}
                  selectedValues={columnFilters.component}
                  onFilterChange={(v) => updateFilter('component', v)}
                />
                <th className="px-6 py-4 text-left">Details</th>
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
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-2 text-gray-300 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-bold">{formatDate(log.created_at)}</span>
                          <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-bold text-gray-800">
                        <User className="w-3.5 h-3.5 mr-2 text-indigo-400 flex-shrink-0" />
                        {log.user?.username || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {log.description ? (
                        <div className="flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-700 leading-relaxed">{log.description}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-mono">{log.id.slice(0, 12)}...</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredLogs.length === 0 && logs.length > 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No logs match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-bold text-gray-600">{filteredLogs.length}</span> of <span className="font-bold text-gray-600">{logs.length}</span> log entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
