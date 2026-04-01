import React, { useState, useMemo } from 'react';
import { 
  ClipboardDocumentListIcon, 
  ShieldExclamationIcon, 
  UserCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import ColumnFilter from '../../components/ColumnFilter';

export default function SuperAdminAudit() {
  // Advanced Column Filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    user: [],
    action: [],
    target: [],
    severity: []
  });

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

  const mockLogs = [
    { id: 1, action: 'Tenant Suspended', target: 'Abinet Pharmacy', user: 'superadmin', time: '2026-03-26 11:30', severity: 'high' },
    { id: 2, action: 'New Tenant Registered', target: 'Kelem Pharmacy', user: 'yosief (owner)', time: '2026-03-26 09:15', severity: 'low' },
    { id: 3, action: 'Platform Config Updated', target: 'Email Settings', user: 'superadmin', time: '2026-03-25 16:45', severity: 'medium' },
    { id: 4, action: 'Subscription Upgraded', target: 'Legehar Pharmacy', user: 'system', time: '2026-03-25 10:00', severity: 'low' },
    { id: 5, action: 'Master Drug Added', target: 'Loratadine', user: 'superadmin', time: '2026-03-24 14:20', severity: 'medium' },
    { id: 6, action: 'Login Failure (Burst)', target: 'Super Admin API', user: '192.168.1.45', time: '2026-03-24 03:00', severity: 'high' },
  ];

  const uniqueActors = useMemo(() => [...new Set(mockLogs.map(l => l.user))].sort(), [mockLogs]);
  const uniqueActions = useMemo(() => [...new Set(mockLogs.map(l => l.action))].sort(), [mockLogs]);
  const uniqueTargets = useMemo(() => [...new Set(mockLogs.map(l => l.target))].sort(), [mockLogs]);
  const severityOptions = ['high', 'medium', 'low'];

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesUser = columnFilters.user.length === 0 || columnFilters.user.includes(log.user);
      const matchesAction = columnFilters.action.length === 0 || columnFilters.action.includes(log.action);
      const matchesTarget = columnFilters.target.length === 0 || columnFilters.target.includes(log.target);
      const matchesSeverity = columnFilters.severity.length === 0 || columnFilters.severity.includes(log.severity);
      return matchesUser && matchesAction && matchesTarget && matchesSeverity;
    });
  }, [mockLogs, columnFilters]);

  const severityColors: any = {
    high: 'bg-rose-50 text-rose-600 border-rose-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit</h1>
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Immutable Security Logs</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm text-xs font-bold text-gray-600">
          <ClockIcon className="h-4 w-4" />
          Real-time Streaming Active
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Results Header with Reset */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
            <ClipboardDocumentListIcon className="h-3.5 w-3.5" />
            <span>{filteredLogs.length} Events Matching</span>
          </div>
          {activeFilterCount > 0 && (
            <button 
              onClick={() => setColumnFilters({ user: [], action: [], target: [], severity: [] })}
              className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <FunnelIcon className="h-3 w-3" />
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Scrollable Table Container */}
        <div className="max-h-[calc(100vh-240px)] min-h-[420px] overflow-y-auto custom-scrollbar pb-48">
          <div className="overflow-x-auto relative">
            <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 sticky top-0 z-30 backdrop-blur-md">
              <tr className="border-b border-gray-100">
                <th className="px-8 py-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Timestamp</th>
                <ColumnFilter
                  label="Actor"
                  options={uniqueActors}
                  selectedValues={columnFilters.user}
                  onFilterChange={(v) => updateFilter('user', v)}
                  className="px-6 py-3"
                />
                <ColumnFilter
                  label="Action"
                  options={uniqueActions}
                  selectedValues={columnFilters.action}
                  onFilterChange={(v) => updateFilter('action', v)}
                  className="px-6 py-3"
                />
                <ColumnFilter
                  label="Target"
                  options={uniqueTargets}
                  selectedValues={columnFilters.target}
                  onFilterChange={(v) => updateFilter('target', v)}
                  className="px-6 py-3"
                />
                <ColumnFilter
                  label="Severity"
                  options={severityOptions}
                  selectedValues={columnFilters.severity}
                  onFilterChange={(v) => updateFilter('severity', v)}
                  align="right"
                  className="px-8 py-3"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length > 0 ? filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-2 whitespace-nowrap">
                    <div className="text-xs font-mono text-gray-600">{log.time}</div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <UserCircleIcon className="h-5 w-5 text-gray-300" />
                       <span className="text-xs font-bold text-gray-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-lg">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                     <div className="text-xs font-bold text-gray-700">{log.target}</div>
                  </td>
                  <td className="px-8 py-2 whitespace-nowrap text-right">
                    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wider border ${severityColors[log.severity]}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <ShieldExclamationIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No audit events match your search criteria.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
           <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">End of visible history</p>
        </div>
      </div>
    </div>
  );
}
