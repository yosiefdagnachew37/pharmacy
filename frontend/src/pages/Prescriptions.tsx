import { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  FileText, 
  Plus, 
  Calendar, 
  User, 
  ExternalLink,
  ClipboardCheck,
  Clock
} from 'lucide-react';

interface Prescription {
  id: string;
  patient_name: string;
  patient: { name: string };
  doctor_name: string;
  items: Array<{
    medicine: { name: string };
    dosage: string;
    duration: string;
  }>;
  created_at: string;
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await client.get('/prescriptions');
        setPrescriptions(response.data);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
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
                      <h4 className="font-bold text-gray-800 text-sm mb-2">{item.medicine.name}</h4>
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
    </div>
  );
};

export default Prescriptions;
