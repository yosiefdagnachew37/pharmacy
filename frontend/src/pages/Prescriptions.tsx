import { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  FileText, 
  Plus, 
  Calendar, 
  User, 
  ExternalLink,
  ClipboardCheck,
  Clock,
  Save,
  Trash2
} from 'lucide-react';
import Modal from '../components/Modal';

interface Medicine {
  id: string;
  name: string;
}

interface Patient {
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

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_name: '',
    items: [{ medicine_id: '', dosage: '', duration: '' }]
  });

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await client.get('/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [patientsRes, medicinesRes] = await Promise.all([
        client.get('/patients'),
        client.get('/medicines')
      ]);
      setPatients(patientsRes.data);
      setMedicines(medicinesRes.data);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchOptions();
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine_id: '', dosage: '', duration: '' }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/prescriptions', formData);
      setIsModalOpen(false);
      fetchPrescriptions();
      setFormData({
        patient_id: '',
        doctor_name: '',
        items: [{ medicine_id: '', dosage: '', duration: '' }]
      });
    } catch (err: any) {
      console.error('Error creating prescription:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error creating prescription. Ensure all fields are filled.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Prescription
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-gray-400 italic rounded-xl border border-gray-100 shadow-sm">
            Retrieving medical files...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400 italic rounded-xl border border-gray-100 shadow-sm">
            No active prescriptions on file.
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-200 transition-all">
              <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{prescription.patient?.name || prescription.patient_name}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-0.5">
                      <User className="w-3 h-3 mr-1" />
                      Dr. {prescription.doctor_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Prescribed On</p>
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prescription.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <h4 className="font-bold text-gray-800 text-sm mb-2">{item.medicine?.name || 'Unknown Medicine'}</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs text-gray-600">
                          <ClipboardCheck className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                          {item.dosage}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 mr-2 text-orange-400" />
                          {item.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue New Prescription">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              >
                <option value="">Choose a patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800">Prescribed Medications</h4>
              <button 
                type="button" 
                onClick={addItem}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Medicine
              </button>
            </div>
            
            {formData.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                {formData.items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)}
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
                      const newItems = [...formData.items];
                      newItems[idx].medicine_id = e.target.value;
                      setFormData({ ...formData, items: newItems });
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
                        const newItems = [...formData.items];
                        newItems[idx].dosage = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                    />
                    <input
                      required
                      placeholder="Duration (e.g. 5 days)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={item.duration}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].duration = e.target.value;
                        setFormData({ ...formData, items: newItems });
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
              onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default Prescriptions;
