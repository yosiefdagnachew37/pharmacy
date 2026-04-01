import { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { 
  Database, 
  Download, 
  RotateCcw, 
  Activity, 
  Shield, 
  HardDrive,
  Cpu,
  CheckCircle2,
  Users,
  Edit,
  Trash2,
  Plus,
  Lock,
  Check,
  ShieldOff
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { toastSuccess, toastError } from '../components/Toast';
import ColumnFilter from '../components/ColumnFilter';

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

interface User {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  manager_pin: string | null;
}

const System = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'system' | 'users'>('system');
  const [backups, setBackups] = useState<Backup[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  
  // User Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'CASHIER',
    manager_pin: ''
  });

  // ─── Column Filters ──────────────────────────────────────────
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    username: [],
    role: [],
    status: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'system') {
        // Status is accessible to all admins; backups list is SuperAdmin-only
        const statusRes = await client.get('/system/status');
        setStatus(statusRes.data);

        if (isSuperAdmin) {
          const backupsRes = await client.get('/system/backups');
          setBackups(backupsRes.data);
        }
      } else {
        const res = await client.get('/users');
        setUsers(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Unique Options & Filtering ──────────────────────────────
  const uniqueUsernames = useMemo(() => [...new Set(users.map(u => u.username))].sort(), [users]);
  const uniqueRoles = useMemo(() => [...new Set(users.map(u => u.role))].sort(), [users]);
  const uniqueAccountStatuses = useMemo(() => ['Active', 'Inactive'], []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const userStatus = user.is_active ? 'Active' : 'Inactive';
      const matchesUsername = columnFilters.username.length === 0 || columnFilters.username.includes(user.username);
      const matchesRole = columnFilters.role.length === 0 || columnFilters.role.includes(user.role);
      const matchesStatus = columnFilters.status.length === 0 || columnFilters.status.includes(userStatus);

      return matchesUsername && matchesRole && matchesStatus;
    });
  }, [users, columnFilters]);

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleBackup = async () => {
    if (!isSuperAdmin) return;
    setActionLoading(true);
    try {
      await client.post('/system/backup');
      await fetchData();
      toastSuccess('Backup created', 'System backup successfully generated.');
    } catch (err) {
      toastError('Backup failed', 'Could not create system backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (!isSuperAdmin) return;
    setActionLoading(true);
    try {
      await client.post(`/system/restore/${filename}`);
      toastSuccess('Restore successful', 'System restored. Please restart the app.');
    } catch (err) {
      toastError('Restore failed', 'Could not restore from backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    // Sanitize data
    const payload = { ...userFormData };
    if (!payload.manager_pin) payload.manager_pin = null as any;
    if (editingUser && !payload.password) delete (payload as any).password;

    try {
      if (editingUser) {
        await client.patch(`/users/${editingUser.id}`, payload);
        toastSuccess('User updated', 'User information successfully modified.');
      } else {
        await client.post('/users', payload);
        toastSuccess('User created', 'New user added to the system.');
      }
      setShowUserModal(false);
      fetchData();
    } catch (err) {
      toastError('Operation failed', 'Could not save user changes.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await client.delete(`/users/${id}`);
      toastSuccess('User deactivated', 'Access revoked for this user.');
      fetchData();
    } catch (err) {
      toastError('Failed', 'Could not deactivate user.');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Are you sure you want to reactivate this user?')) return;
    try {
      await client.patch(`/users/${id}`, { is_active: true });
      toastSuccess('User reactivated', 'Access successfully restored for this user.');
      fetchData();
    } catch (err) {
      toastError('Failed', 'Could not reactivate user.');
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
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure system security, manage users, and database maintenance.</p>
        </div>
        <div className="flex gap-4">
           {activeTab === 'system' ? (
              isSuperAdmin ? (
                <button 
                  onClick={handleBackup}
                  disabled={actionLoading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all disabled:opacity-50"
                >
                  <Download className="w-5 h-5 mr-3" />
                  {actionLoading ? 'Creating...' : 'Create Backup'}
                </button>
              ) : null
           ) : (
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setUserFormData({ username: '', password: '', role: 'CASHIER', manager_pin: '' });
                  setShowUserModal(true);
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all"
              >
                <Plus className="w-5 h-5 mr-3" />
                Add New User
              </button>
           )}
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('system')}
          className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'system' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> System Status &amp; Backups
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> User Management
          </div>
        </button>
      </div>

      {activeTab === 'system' ? (
        <>
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

          {/* SuperAdmin-only: Backup History */}
          {isSuperAdmin ? (
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
                              <RotateCcw className="w-4 h-4 mr-2" /> Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Admin: locked banner instead of backup controls */
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex items-center gap-5">
              <div className="flex-shrink-0 bg-amber-100 p-4 rounded-xl">
                <ShieldOff className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-base">Backup &amp; Restore — SuperAdmin Only</h3>
                <p className="text-sm text-amber-600 mt-1">
                  Database backup and restore operations are restricted to Platform SuperAdmins.
                  The system status above is available for monitoring purposes. Contact your platform administrator for backup operations.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-indigo-600 mr-3" />
              <h2 className="font-bold text-gray-800">Organization Users</h2>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setColumnFilters({ username: [], role: [], status: [] })}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear All Filters ({activeFilterCount})
              </button>
            )}
          </div>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest sticky top-0 z-30 shadow-sm">
                <tr>
                  <ColumnFilter
                    label="Username"
                    options={uniqueUsernames}
                    selectedValues={columnFilters.username}
                    onFilterChange={(v) => updateFilter('username', v)}
                  />
                  <ColumnFilter
                    label="Role"
                    options={uniqueRoles}
                    selectedValues={columnFilters.role}
                    onFilterChange={(v) => updateFilter('role', v)}
                  />
                  <th className="px-6 py-4">Manager PIN</th>
                  <ColumnFilter
                    label="Status"
                    options={uniqueAccountStatuses}
                    selectedValues={columnFilters.status}
                    onFilterChange={(v) => updateFilter('status', v)}
                    align="center"
                  />
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">Loading users...</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{u.username}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 
                          u.role === 'PHARMACIST' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold">
                        {u.manager_pin ? (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <Lock className="w-3 h-3" /> {u.manager_pin}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Not Set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold uppercase ${u.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {u.role !== 'SUPER_ADMIN' && (
                            <button 
                              onClick={() => {
                                setEditingUser(u);
                                setUserFormData({
                                  username: u.username,
                                  password: '',
                                  role: u.role,
                                  manager_pin: u.manager_pin || ''
                                });
                                setShowUserModal(true);
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {u.username !== 'admin' && u.role !== 'SUPER_ADMIN' && (
                            u.is_active ? (
                              <button 
                                onClick={() => handleDeactivate(u.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Deactivate User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleReactivate(u.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Reactivate User"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? 'Edit User Profile' : 'Register New User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold"
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">{editingUser ? 'New Password' : 'Password'}</label>
              <input
                required={!editingUser}
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder={editingUser ? 'Leave blank to keep same' : '••••••'}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Account Role</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold"
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="PHARMACIST">PHARMACIST</option>
                <option value="CASHIER">CASHIER</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Manager Authorization PIN</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 1234"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold tracking-widest"
                  value={userFormData.manager_pin}
                  onChange={(e) => setUserFormData({ ...userFormData, manager_pin: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
               type="button"
               onClick={() => setShowUserModal(false)}
               className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? 'Saving...' : (editingUser ? <><Check className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Create Account</>)}
            </button>
          </div>
        </form>
      </Modal>

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
