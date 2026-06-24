import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, LogOut, LayoutDashboard, CheckSquare, Calculator, Menu } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Protección de rutas global en el layout
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generar enlaces dinámicos según el rolid
  const getNavLinks = () => {
    switch (user.rolid) {
      case 1: // Administrador
        return [
          { to: '/admin/verificaciones', icon: CheckSquare, label: 'Control de Carga' },
          { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ];
      case 2: // Cajero
        return [
          { to: '/cashier/liquidaciones', icon: Calculator, label: 'Liquidaciones' },
        ];
      case 3: // Conductor
        return [
          { to: '/driver/ruta', icon: Truck, label: 'Registro de Ruta' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Industrial (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-white/10 p-2 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight tracking-tight">Perene</h2>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Transport</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menú Principal</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm border border-slate-700">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6" />
            <h2 className="font-bold tracking-tight">Perene Transport</h2>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 rounded-md hover:bg-slate-800">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-slate-300 absolute top-16 left-0 right-0 z-30 shadow-xl border-b border-slate-800 pb-4 animate-in slide-in-from-top-2">
            <nav className="px-4 py-2 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-sm ${
                      isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-2"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}

        {/* Main Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
