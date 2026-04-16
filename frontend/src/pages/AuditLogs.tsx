import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import { User, Clock, ShieldCheck, Search } from 'lucide-react';
import ColumnFilter from '../components/ColumnFilter';
import { formatDate } from '../utils/dateUtils';

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
      const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.entity.toLowerCase().includes(searchTerm.toLowerCase());

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Audit Trail</h1>
        <div className="flex items-center gap-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:ring-2 focus:ring-indigo-100 outline-none"
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
                  label="Component"
                  options={uniqueComponents}
                  selectedValues={columnFilters.component}
                  onFilterChange={(v) => updateFilter('component', v)}
                />
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
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-2 text-gray-300" />
                        <div className="flex flex-col">
                          <span className="font-bold">{formatDate(log.created_at)}</span>
                          <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
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
              {!loading && filteredLogs.length === 0 && logs.length > 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No logs match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
