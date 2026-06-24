import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ShieldCheck, Clock, TrendingUp, Truck, Users, Activity, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Datos de ejemplo que pueden ser reemplazados con llamadas a la API
  const stats = [
    { label: 'Guías del Mes', value: '—', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Verificadas', value: '—', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pendientes', value: '—', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Conductores Activos', value: '—', icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Bienvenido, <span className="font-semibold text-slate-700">{user?.username}</span> — Panel de administración general.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Módulos de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sistema Logístico</h3>
              <p className="text-slate-400 text-sm">Perene Transport S.A.C.</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Usa el menú lateral para gestionar guías de remisión, verificar contenedores y revisar el cumplimiento operativo de conductores.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-semibold mb-1">
            <Activity className="w-4 h-4" /> Acceso Rápido
          </div>
          <a href="/admin/verificaciones" className="block w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 transition-colors active:scale-95">
            → Control de Carga
          </a>
          <div className="block w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-400 cursor-not-allowed">
            → Reportes (próximamente)
          </div>
          <div className="block w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-400 cursor-not-allowed">
            → Exportar datos (próximamente)
          </div>
        </div>
      </div>

      {/* Info técnica de la sesión */}
      <div className="mt-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Sesión Activa
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-0.5">Usuario</p>
            <p className="font-semibold text-slate-800">{user?.username}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-0.5">Correo</p>
            <p className="font-semibold text-slate-800 truncate">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-0.5">Rol</p>
            <span className="inline-block bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Administrador</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-0.5">API</p>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">● Conectada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
