import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts y Páginas del sistema
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import ConductorDashboard from './pages/driver/ConductorDashboard';
import VerificacionGuias from './pages/admin/VerificacionGuias';
import AdminDashboard from './pages/admin/AdminDashboard';
import Liquidaciones from './pages/cashier/Liquidaciones';

/**
 * Componente de ruta protegida por rol.
 * Redirige al login si no hay sesión activa, o a "/" si el rol no tiene permisos.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.rolid)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();

  // Redireccion automática según rolid al acceder a "/"
  const getRootRedirect = () => {
    if (!user) return '/login';
    if (user.rolid === 1) return '/admin/verificaciones';
    if (user.rolid === 2) return '/cashier/liquidaciones';
    if (user.rolid === 3) return '/driver/ruta';
    return '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Raíz: redirige según sesión y rol */}
      <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />

      {/* Login público */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas dentro del DashboardLayout */}
      <Route element={<DashboardLayout />}>

        {/* Admin (rolid = 1) */}
        <Route
          path="/admin/verificaciones"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <VerificacionGuias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Cajero (rolid = 2) */}
        <Route
          path="/cashier/liquidaciones"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <Liquidaciones />
            </ProtectedRoute>
          }
        />

        {/* Conductor (rolid = 3) */}
        <Route
          path="/driver/ruta"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <ConductorDashboard />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* Cualquier ruta desconocida redirige a raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
