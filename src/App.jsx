import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { SemesterProvider } from './context/SemesterContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jadwal from './pages/Jadwal';
import Tugas from './pages/Tugas';
import Kalender from './pages/Kalender';
import FAQ from './pages/FAQ';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Profile from './pages/Profile';
import WhatsAppPage from './pages/WhatsAppPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <SemesterProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/jadwal" element={<Jadwal />} />
                <Route path="/tugas" element={<Tugas />} />
                <Route path="/kalender" element={<Kalender />} />
                <Route path="/grup" element={<Groups />} />
                <Route path="/grup/:id" element={<GroupDetail />} />
                <Route path="/profil" element={<Profile />} />
                <Route path="/whatsapp" element={<WhatsAppPage />} />
                <Route path="/faq" element={<FAQ />} />
              </Route>
            </Routes>
          </ToastProvider>
          </SemesterProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
