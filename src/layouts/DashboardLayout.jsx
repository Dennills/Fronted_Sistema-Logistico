import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, LogOut, LayoutDashboard, FileText, Map, Users, 
  Building2, Settings, Menu, Calculator, Download, Plus, Circle 
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  const getNavLinks = () => {
    switch (user.rolid) {
      case 1:
        return [
          { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Panel de control' },
          { to: '/admin/verificaciones', icon: FileText, label: 'Guías', badge: '12' },
          { to: '/admin/seguimiento', icon: Map, label: 'Seguimiento' },
          { to: '/admin/conductores', icon: Users, label: 'Conductores' },
          { to: '/admin/empresas', icon: Building2, label: 'Empresas' },
          { to: '/admin/configuracion', icon: Settings, label: 'Configuración' }
        ];
      case 2:
        return [
          { to: '/cashier/liquidaciones', icon: Calculator, label: 'Liquidaciones' },
        ];
      case 3:
        return [
          { to: '/driver/ruta', icon: Truck, label: 'Registro de Ruta' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Panel de control';
    if (path.includes('/admin/verificaciones')) return 'Gestión de guías';
    if (path.includes('/admin/seguimiento')) return 'Trazabilidad de contenedores';
    if (path.includes('/admin/conductores')) return 'Gestión de conductores';
    if (path.includes('/admin/empresas')) return 'Empresas';
    if (path.includes('/admin/configuracion')) return 'Configuración';
    return '';
  };

  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Industrial (Desktop) */}
      <aside className="hidden md:flex flex-col w-[260px] bg-slate-900 text-slate-300 shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-white/10 p-2 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-tight">PERENE TRANSPORT</h2>
            <p className="text-xs font-semibold text-blue-400 mt-0.5">{user.rolid === 1 ? 'Administrador' : user.rolid === 2 ? 'Cajero' : 'Conductor'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5" />
                {link.label}
              </div>
              {link.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm border border-slate-600">
              {user.rolid === 1 ? 'AD' : user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.rolid === 1 ? 'Admin General' : user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
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
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Top Bar Superior (Desktop solo para Admin) */}
        {user.rolid === 1 && (
          <div className="hidden md:flex bg-white h-16 border-b border-slate-200 px-8 items-center justify-between shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">Admin <span className="mx-2 text-slate-300">/</span> <span className="text-slate-900 font-bold">{getBreadcrumb()}</span></span>
              <div className="h-4 w-px bg-slate-200 mx-2"></div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Circle className="w-2 h-2 fill-emerald-500" /> Sistema activo
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500 capitalize">{today}</span>
              <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm transition-all">
                <Download className="w-4 h-4" /> Exportar
              </button>
              <button className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2 shadow-md transition-all">
                <Plus className="w-4 h-4" /> Nueva guía
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
