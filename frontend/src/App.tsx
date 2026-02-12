import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Batches from './pages/Batches';
import POS from './pages/POS';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import Alerts from './pages/Alerts';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import System from './pages/System';
import OfflineBanner from './components/OfflineBanner';

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="batches" element={<Batches />} />
          <Route path="pos" element={<POS />} />
          <Route path="patients" element={<Patients />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="system" element={<System />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
