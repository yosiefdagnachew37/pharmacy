import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Search, User, Phone, MapPin, Save, Trash2, FileText,
  ShoppingCart, Loader2, Calendar, ChevronRight, Clock,
  ClipboardCheck, ExternalLink, Edit2
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { toastSuccess, toastError } from '../components/Toast';
import { extractErrorMessage } from '../utils/errorUtils';

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  allergies: string[];
  prescriptions?: any[];
  sales?: any[];
}

interface Medicine {
  id: string;
  name: string;
}

interface PrescriptionItem {
  medicine_id: string;
  medicine: { name: string };
  dosage: string;
  duration: string;
}

interface Prescription {
  id: string;
  patient_name: string;
  patient: { name: string };
  doctor_name: string;
  items: PrescriptionItem[];
  created_at: string;
}

const Patients = () => {
  const { canCreate, canDelete } = useAuth();

  // ─── Patient State ──────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  // ─── Prescription State ─────────────────────────────────────────
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionLoading, setPrescriptionLoading] = useState(true);
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [rxFormData, setRxFormData] = useState({
    patient_id: '',
    doctor_name: '',
    items: [{ medicine_id: '', dosage: '', duration: '' }]
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

  const fetchPrescriptions = async () => {
    setPrescriptionLoading(true);
    try {
      const response = await client.get('/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setPrescriptionLoading(false);
    }
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
    fetchPrescriptions();
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
      toastError('Delete failed', 'Patient may be linked to sales or prescriptions.');
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

  // ─── Prescription Handlers ─────────────────────────────────────
  const addRxItem = () => {
    setRxFormData({
      ...rxFormData,
      items: [...rxFormData.items, { medicine_id: '', dosage: '', duration: '' }]
    });
  };

  const removeRxItem = (index: number) => {
    setRxFormData({
      ...rxFormData,
      items: rxFormData.items.filter((_, i) => i !== index)
    });
  };

  const handleRxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/prescriptions', rxFormData);
      setIsPrescriptionModalOpen(false);
      fetchPrescriptions();
      setRxFormData({
        patient_id: '',
        doctor_name: '',
        items: [{ medicine_id: '', dosage: '', duration: '' }]
      });
    } catch (err: any) {
      console.error('Error creating prescription:', err.response?.data || err.message);
      const msg = extractErrorMessage(err, 'Error creating prescription. Ensure all fields are filled.');
      toastError('Prescription failed', msg);
    }
  };

  // ─── Filtered Data ─────────────────────────────────────────────
  const filteredPatients = patients.filter(p =>
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Patient Directory</h1>
            <p className="text-sm text-gray-500">Manage patient records and medical history</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {canCreate('patients') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all font-bold shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register Patient
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or phone number..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-gray-500 italic">Finding patient records...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 italic">No patients found match your search.</div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => fetchHistory(patient.id)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer relative group overflow-hidden"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-indigo-300" />
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <User className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleEdit(patient, e)}
                        className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Edit Patient"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {canDelete('patients') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(patient.id); }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1">{patient.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {patient.gender}, {patient.age} years old
                    <span className="ml-2 px-1.5 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-400 border border-gray-100 rounded">
                      #{patient.id.slice(0, 8)}
                    </span>
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      {patient.phone || 'No phone recorded'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 truncate">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{patient.address || 'Address not provided'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies?.length > 0 ? (
                          patient.allergies.map(a => (
                            <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-medium border border-red-100">{a}</span>
                          ))
                        ) : (
                          <span className="text-[10px] text-green-600 font-medium italic">None recorded</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-indigo-600 flex items-center">
                      View History <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? undefined as any : parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={formData.allergies?.join(', ')}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPatientId(null);
                setFormData({ name: '', phone: '', age: 30, gender: 'OTHER', address: '', allergies: [] });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingPatientId ? 'Update Patient' : 'Register Patient'}
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
        <div className="mb-4 flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-xl">
            <span className="text-sm font-medium text-gray-600 flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Medical & Purchase Records
            </span>
            {canCreate('prescriptions') && (
              <button
                onClick={() => {
                  setRxFormData({ ...rxFormData, patient_id: selectedHistory?.id || '' });
                  setIsPrescriptionModalOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-indigo-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Prescription
              </button>
            )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-1 pr-3 custom-scrollbar">
          {historyLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 italic">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
              <p>Retrieving complete medical history...</p>
            </div>
          ) : !selectedHistory || (selectedHistory.prescriptions?.length === 0 && selectedHistory.sales?.length === 0) ? (
            <div className="py-12 text-center text-gray-400 italic border-2 border-dashed border-gray-100 rounded-2xl">
              No medical or purchase history found for this patient.
            </div>
          ) : (
            <div className="space-y-8 py-4">
              {[
                ...(selectedHistory.prescriptions || []).map(p => ({ ...p, type: 'PRESCRIPTION' })),
                ...(selectedHistory.sales || []).map(s => ({ ...s, type: 'SALE' }))
              ]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item) => (
                  <div key={`${item.type}-${item.id}`} className="relative pl-8 pb-2">
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-100 last:hidden" />
                    <div className={`absolute left-0 top-1 p-1.5 rounded-full z-10 ${item.type === 'PRESCRIPTION' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                      }`}>
                      {item.type === 'PRESCRIPTION' ? <FileText className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${item.type === 'PRESCRIPTION' ? 'text-indigo-500' : 'text-green-500'
                            }`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-gray-400 font-medium flex items-center mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {item.type === 'SALE' && (
                          <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                            ETB {Number(item.total_amount).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="space-y-3">
                          {item.items?.map((detail: any, i: number) => (
                            <div key={i} className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{detail.medicine?.name || 'Unknown'}</p>
                                  {item.type === 'PRESCRIPTION' && (
                                    <div className="flex items-center text-[11px] text-gray-500 space-x-3 mt-0.5">
                                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-gray-300" /> {detail.dosage}</span>
                                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-gray-300" /> {detail.duration}</span>
                                    </div>
                                  )}
                                  {item.type === 'SALE' && (
                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                      Quantity: <span className="text-gray-600">{detail.quantity}</span> × ETB {Number(detail.unit_price).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {item.type === 'SALE' && (
                                <span className="text-xs font-bold text-gray-500">ETB {Number(detail.subtotal).toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {item.type === 'PRESCRIPTION' && item.doctor_name && (
                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            Prescribed By: <span className="text-indigo-600 ml-1">Dr. {item.doctor_name}</span>
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

      {/* New Prescription Modal */}
      <Modal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} title="Issue New Prescription">
        <form onSubmit={handleRxSubmit} className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Patient</p>
              <p className="text-base font-bold text-indigo-900">{selectedHistory?.name}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Patient ID</p>
               <p className="text-xs font-mono font-bold text-indigo-600">#{selectedHistory?.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
              <input
                required
                type="text"
                placeholder="Name of the prescribing doctor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={rxFormData.doctor_name}
                onChange={(e) => setRxFormData({ ...rxFormData, doctor_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800">Prescribed Medications</h4>
              <button
                type="button"
                onClick={addRxItem}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Medicine
              </button>
            </div>

            {rxFormData.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                {rxFormData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRxItem(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={item.medicine_id}
                    onChange={(e) => {
                      const newItems = [...rxFormData.items];
                      newItems[idx].medicine_id = e.target.value;
                      setRxFormData({ ...rxFormData, items: newItems });
                    }}
                  >
                    <option value="">Select Medicine...</option>
                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      placeholder="Dosage (e.g. 1x3)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={item.dosage}
                      onChange={(e) => {
                        const newItems = [...rxFormData.items];
                        newItems[idx].dosage = e.target.value;
                        setRxFormData({ ...rxFormData, items: newItems });
                      }}
                    />
                    <input
                      required
                      placeholder="Duration (e.g. 5 days)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={item.duration}
                      onChange={(e) => {
                        const newItems = [...rxFormData.items];
                        newItems[idx].duration = e.target.value;
                        setRxFormData({ ...rxFormData, items: newItems });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-100"
            >
              <Save className="w-4 h-4 mr-2" />
              Issue Prescription
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
