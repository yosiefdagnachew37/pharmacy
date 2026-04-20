import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Search, User, Phone, MapPin, Save, Trash2, FileText,
  ShoppingCart, Loader2, Calendar, ChevronRight, Clock,
  ClipboardCheck, ExternalLink, Edit2, Package
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { toastSuccess, toastError } from '../components/Toast';
import { formatDate } from '../utils/dateUtils';
import { extractErrorMessage } from '../utils/errorUtils';

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  allergies: string[];
  reminders?: any[];
  sales?: any[];
  created_at: string;
}

interface Medicine {
  id: string;
  name: string;
}

interface PatientReminder {
  id: string;
  patient_id: string;
  medication_name: string;
  last_purchase_date: string;
  dispensed_quantity: number;
  expected_duration_days: number;
  depletion_date: string;
  is_resolved: boolean;
  created_at: string;
}

const Patients = () => {
  const { canCreate, canDelete } = useAuth();

  // ─── Patient State ──────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PATIENTS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Patient | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    phone: '',
    age: 30,
    gender: 'OTHER',
    address: '',
    allergies: []
  });

  // ─── Reminder State ─────────────────────────────────────────
  const [reminders, setReminders] = useState<PatientReminder[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [reminderFormData, setReminderFormData] = useState({
    patient_id: '',
    medication_name: '',
    last_purchase_date: new Date().toISOString().split('T')[0],
    dispensed_quantity: '',
    expected_duration_days: '',
    depletion_date: ''
  });

  // ─── Data Fetching ──────────────────────────────────────────────
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await client.get('/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDepletionDate = (startDate: string, durationStr: string) => {
    if (!startDate || !durationStr) return '';
    const duration = parseInt(durationStr);
    if (isNaN(duration)) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + duration);
    return date.toISOString().split('T')[0];
  };

  const fetchMedicines = async () => {
    try {
      const response = await client.get('/medicines');
      setMedicines(response.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const fetchHistory = async (id: string) => {
    setHistoryLoading(true);
    setIsHistoryModalOpen(true);
    try {
      const response = await client.get(`/patients/${id}/history`);
      setSelectedHistory(response.data);
    } catch (err) {
      console.error('Error fetching patient history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchMedicines();
  }, []);

  // ─── Patient Handlers ──────────────────────────────────────────
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await client.delete(`/patients/${id}`);
      fetchPatients();
      toastSuccess('Patient record deleted.');
    } catch (err) {
      toastError('Delete failed', 'Patient may be linked to sales or reminders.');
    }
  };

  const handleEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatientId(patient.id);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      allergies: patient.allergies || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatientId) {
        await client.patch(`/patients/${editingPatientId}`, formData);
        toastSuccess('Patient record updated successfully.');
      } else {
        await client.post('/patients', formData);
        toastSuccess('Patient registered successfully.');
      }
      setIsModalOpen(false);
      setEditingPatientId(null);
      setFormData({ name: '', phone: '', age: 30, gender: 'OTHER', address: '', allergies: [] });
      fetchPatients();
    } catch (err: any) {
      console.error('Error saving patient:', err.response?.data || err.message);
      const msg = extractErrorMessage(err, 'Error saving patient.');
      toastError(editingPatientId ? 'Update failed' : 'Registration failed', msg);
    }
  };

  // ─── Reminder Handlers ─────────────────────────────────────
  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...reminderFormData,
        dispensed_quantity: Number(reminderFormData.dispensed_quantity),
        expected_duration_days: Number(reminderFormData.expected_duration_days)
      };
      await client.post(`/patients/${reminderFormData.patient_id}/reminders`, payload);
      setIsReminderModalOpen(false);
      toastSuccess('Medication reminder scheduled.');
      if (selectedHistory) fetchHistory(selectedHistory.id); // Refresh history
      setReminderFormData({
        patient_id: '',
        medication_name: '',
        last_purchase_date: new Date().toISOString().split('T')[0],
        dispensed_quantity: '',
        expected_duration_days: '',
        depletion_date: ''
      });
    } catch (err: any) {
      console.error('Error creating reminder:', err.response?.data || err.message);
      const msg = extractErrorMessage(err, 'Error creating reminder. Ensure all fields are filled.');
      toastError('Reminder failed', msg);
    }
  };

  // ─── Filtered Data ─────────────────────────────────────────────
  const filteredPatients = patients.filter(p =>
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE));
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * PATIENTS_PER_PAGE, currentPage * PATIENTS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Patient Directory</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Manage patient records and medical history</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {canCreate('patients') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all font-black text-xs shadow-lg shadow-indigo-50 active:scale-95 uppercase tracking-widest"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Register Patient
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-[11px] font-medium"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Searching records…</div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest border border-dashed rounded-xl">No patients found</div>
        ) : (
          paginatedPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => fetchHistory(patient.id)}
              className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-50 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer relative group overflow-hidden flex flex-col"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex items-center space-x-1">
                  {canCreate('patients') && (
                    <button
                      onClick={(e) => handleEdit(patient, e)}
                      className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Edit Patient"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete('patients') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(patient.id); }}
                      className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Patient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-sm font-black text-gray-900 mb-0.5 truncate tracking-tight">{patient.name}</h3>
                <p className="text-[10px] text-gray-500 mb-3 font-bold uppercase tracking-tight">
                  {patient.gender}, {patient.age}Y
                  <span className="ml-1.5 px-1 py-0.5 bg-gray-50 text-[8px] font-black text-gray-400 border border-gray-100 rounded uppercase">
                    #{patient.id.slice(0, 6)}
                  </span>
                </p>

                <div className="space-y-1.5 mb-3.5">
                  <div className="flex items-center text-[11px] text-gray-600 font-medium truncate">
                    <Phone className="w-3 h-3 mr-1.5 text-gray-400 shrink-0" />
                    <span className="truncate">{patient.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center text-[11px] text-gray-600 font-medium truncate">
                    <MapPin className="w-3 h-3 mr-1.5 text-gray-400 shrink-0" />
                    <span className="truncate">{patient.address || 'No address'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-gray-50 flex items-center justify-between mt-auto">
                <div className="min-h-[18px] flex items-center">
                  {patient.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.slice(0, 2).map(a => (
                        <span key={a} className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[8px] font-black border border-rose-100 uppercase tracking-tighter">{a}</span>
                      ))}
                      {patient.allergies.length > 2 && <span className="text-[8px] font-black text-gray-400">+{patient.allergies.length - 2}</span>}
                    </div>
                  ) : (
                    <span className="text-[8px] text-emerald-600 font-black uppercase tracking-tighter opacity-60">No allergies</span>
                  )}
                </div>
                <div className="text-[10px] font-black text-indigo-600 flex items-center uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  History <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            Prev
          </button>
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">
            Page {currentPage} of {totalPages} · {filteredPatients.length} patients
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* Register/Edit Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatientId(null);
          setFormData({ name: '', phone: '', age: 30, gender: 'OTHER', address: '', allergies: [] });
        }}
        title={editingPatientId ? "Edit Patient Record" : "Register New Patient"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 ml-1">Full Name</label>
            <input
              required
              type="text"
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-xs font-bold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 ml-1">Age</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-xs font-bold"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? undefined as any : parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 ml-1">Gender</label>
              <select
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-xs font-bold"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-xs font-bold"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 ml-1">Address</label>
            <textarea
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-xs font-bold"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 ml-1">Allergies (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-50 focus:outline-none text-xs font-bold placeholder:font-normal"
              value={formData.allergies?.join(', ')}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPatientId(null);
                setFormData({ name: '', phone: '', age: 30, gender: 'OTHER', address: '', allergies: [] });
              }}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-100 transition-all"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {editingPatientId ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`${selectedHistory?.name || 'Patient'}'s Full History`}
      >
        <div className="mb-3.5 flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
          <span className="text-[11px] font-black text-gray-400 flex items-center uppercase tracking-widest">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Medical Records
          </span>
          {canCreate('patients') && (
            <button
              onClick={() => {
                setReminderFormData({ ...reminderFormData, patient_id: selectedHistory?.id || '', last_purchase_date: new Date().toISOString().split('T')[0] });
                setIsReminderModalOpen(true);
              }}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              <Clock className="w-3 h-3 mr-1.5" /> Set Reminder
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-1 pr-3 custom-scrollbar">
          {historyLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 italic">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
              <p>Retrieving complete medical history...</p>
            </div>
          ) : !selectedHistory || (selectedHistory.reminders?.length === 0 && selectedHistory.sales?.length === 0) ? (
            <div className="py-12 text-center text-gray-400 italic border-2 border-dashed border-gray-100 rounded-2xl">
              No medical or purchase history found for this patient.
            </div>
          ) : (
            <div className="space-y-8 py-4">
              {[
                ...(selectedHistory.reminders || []).map(p => ({ ...p, type: 'REMINDER' })),
                ...(selectedHistory.sales || []).map(s => ({ ...s, type: 'SALE' }))
              ]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item) => (
                  <div key={`${item.type}-${item.id}`} className="relative pl-8 pb-2">
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-100 last:hidden" />
                    <div className={`absolute left-0 top-1 p-1.5 rounded-full z-10 ${item.type === 'REMINDER' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      }`}>
                      {item.type === 'REMINDER' ? <Clock className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${item.type === 'REMINDER' ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                            {item.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold flex items-center mt-0.5 uppercase tracking-tighter">
                            <Calendar className="w-2.5 h-2.5 mr-1" />
                            {new Date(item.created_at).toLocaleDateString()} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {item.type === 'SALE' && (
                          <span className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                            ETB {Number(item.total_amount).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-gray-50 p-2.5 shadow-sm">
                        <div className="space-y-2">
                          {item.items?.map((detail: any, i: number) => (
                            <div key={i} className="flex items-start justify-between">
                              <div className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-100 mt-1.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] font-black text-gray-800 leading-tight tracking-tight">{detail.medicine?.name || 'Unknown'}</p>
                                  {item.type === 'REMINDER' && (
                                    <div className="flex flex-col text-[10px] text-gray-500 mt-1 space-y-0.5">
                                      <span className="font-bold text-gray-700">Med: {item.medication_name}</span>
                                      <span className="flex items-center"><Calendar className="w-2.5 h-2.5 mr-1 text-gray-400" /> Start: {new Date(item.last_purchase_date).toLocaleDateString()}</span>
                                      <span className="flex items-center"><Package className="w-2.5 h-2.5 mr-1 text-gray-400" /> Qty: {item.dispensed_quantity} ({item.expected_duration_days} days)</span>
                                    </div>
                                  )}
                                  {item.type === 'SALE' && (
                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">
                                      Qty: <span className="text-gray-700">{detail.quantity}</span> × ETB {Number(detail.unit_price).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {item.type === 'SALE' && (
                                <span className="text-[10px] font-black text-gray-500 tracking-tighter">ETB {Number(detail.subtotal).toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {item.type === 'REMINDER' && (
                          <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-[9px] uppercase font-black tracking-tight">
                            <span className="text-gray-600">Depletion Date</span>
                            <span className={`px-1.5 py-0.5 rounded ${new Date(item.depletion_date) <= new Date() ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{new Date(item.depletion_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Generate Reminder Modal */}
      <Modal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} title="Set Follow-up Reminder">
        <form onSubmit={handleReminderSubmit} className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-0.5">Patient</p>
              <p className="text-sm font-black text-amber-900 tracking-tight">{selectedHistory?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-0.5">Reference</p>
              <p className="text-[10px] font-mono font-black text-amber-600 uppercase">#{selectedHistory?.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Medication Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Insulin, Metformin"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-50 focus:outline-none text-xs font-bold"
                value={reminderFormData.medication_name}
                onChange={(e) => setReminderFormData(prev => ({ ...prev, medication_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Last Purchase</label>
                <input
                  required
                  type="date"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-50 focus:outline-none text-xs font-bold"
                  value={reminderFormData.last_purchase_date}
                  onChange={(e) => setReminderFormData(prev => ({ ...prev, last_purchase_date: e.target.value, depletion_date: calculateDepletionDate(e.target.value, prev.expected_duration_days) }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Qty Dispensed</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="30"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-50 focus:outline-none text-xs font-bold"
                  value={reminderFormData.dispensed_quantity}
                  onChange={(e) => setReminderFormData(prev => ({ ...prev, dispensed_quantity: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Duration (Days)</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="30"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-50 focus:outline-none text-xs font-bold"
                  value={reminderFormData.expected_duration_days}
                  onChange={(e) => setReminderFormData(prev => ({ ...prev, expected_duration_days: e.target.value, depletion_date: calculateDepletionDate(prev.last_purchase_date, e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 ml-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Est. Depletion</label>
                <input
                  required
                  type="date"
                  className="w-full px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-xs font-black text-rose-600 focus:outline-none tracking-tight"
                  value={reminderFormData.depletion_date}
                  onChange={(e) => setReminderFormData(prev => ({ ...prev, depletion_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white bg-amber-500 border border-transparent rounded-lg hover:bg-amber-600 flex items-center shadow-lg shadow-amber-50 transition-all"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Schedule
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient record? This action cannot be undone."
      />
    </div>
  );
};

export default Patients;
