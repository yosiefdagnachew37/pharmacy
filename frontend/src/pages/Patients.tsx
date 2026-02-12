import { useEffect, useState } from 'react';
import client from '../api/client';
import { Plus, Search, User, Phone, MapPin } from 'lucide-react';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await client.get('/patients');
        setPatients(response.data);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Patient Directory</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Register Patient
        </button>
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
            <div key={patient.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                <button className="text-xs font-bold text-indigo-600 hover:indigo-800 px-3 py-1 bg-indigo-50 rounded-lg">
                  History
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Patients;
