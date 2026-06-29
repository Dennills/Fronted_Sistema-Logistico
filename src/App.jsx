import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts y Páginas del sistema
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import ConductorDashboard from './pages/driver/ConductorDashboard';
import VerificacionGuias from './pages/admin/VerificacionGuias';
import AdminDashboard from './pages/admin/AdminDashboard';
import Seguimiento from './pages/admin/Seguimiento';
import GestionConductores from './pages/admin/GestionConductores';
import Liquidaciones from './pages/cashier/Liquidaciones';

// Vistas vacías (para el menú)
const PlaceholderView = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <p className="text-slate-500 mt-2">Módulo en construcción.</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.rolid)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();

  const getRootRedirect = () => {
    if (!user) return '/login';
    if (user.rolid === 1) return '/admin/dashboard';
    if (user.rolid === 2) return '/cashier/liquidaciones';
    if (user.rolid === 3) return '/driver/ruta';
    return '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        {/* Rutas Administrador */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[1]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/verificaciones" element={<ProtectedRoute allowedRoles={[1]}><VerificacionGuias /></ProtectedRoute>} />
        <Route path="/admin/seguimiento" element={<ProtectedRoute allowedRoles={[1]}><Seguimiento /></ProtectedRoute>} />
        <Route path="/admin/conductores" element={<ProtectedRoute allowedRoles={[1]}><GestionConductores /></ProtectedRoute>} />
        <Route path="/admin/empresas" element={<ProtectedRoute allowedRoles={[1]}><PlaceholderView title="Empresas" /></ProtectedRoute>} />
        <Route path="/admin/configuracion" element={<ProtectedRoute allowedRoles={[1]}><PlaceholderView title="Configuración" /></ProtectedRoute>} />

        {/* Ruta Cajero */}
        <Route path="/cashier/liquidaciones" element={<ProtectedRoute allowedRoles={[2]}><Liquidaciones /></ProtectedRoute>} />

        {/* Ruta Conductor */}
        <Route path="/driver/ruta" element={<ProtectedRoute allowedRoles={[3]}><ConductorDashboard /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
