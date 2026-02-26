import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, User, Phone, MapPin, Save, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  allergies: string[];
}

const Patients = () => {
  const { canCreate, canDelete } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    phone: '',
    age: 30,
    gender: 'OTHER',
    address: '',
    allergies: []
  });

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

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    try {
      await client.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert('Failed to delete patient record.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/patients', formData);
      setIsModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      console.error('Error registering patient:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error registering patient.');
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Patient Directory</h1>
        {canCreate('patients') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Patient
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
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
            <div key={patient.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
               {canDelete('patients') && (
                 <button 
                  onClick={() => handleDelete(patient.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                 >
                  <Trash2 className="w-4 h-4" />
                 </button>
               )}

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ID: {patient.id.slice(0, 8)}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{patient.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{patient.gender}, {patient.age} years old</p>
              
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
                <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 bg-indigo-50/50 rounded-lg">
                  History
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Patient">
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
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
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
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 flex items-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Register Patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Patients;
