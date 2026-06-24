import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGuias, verificarGuia } from '../../services/apiService';
import {
  ShieldCheck, Clock, Search, RefreshCw,
  Package, TrendingUp, Filter, AlertTriangle, Wifi
} from 'lucide-react';

export default function VerificacionGuias() {
  const { user } = useAuth();

  const [guias, setGuias]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [errorInfo, setErrorInfo]       = useState(null); // { status, message }

  // ── Carga directa sin useCallback (más simple, más confiable) ──
  async function fetchGuias() {
    setLoading(true);
    setErrorInfo(null);
    try {
      // Sin filtros adicionales → el backend devuelve las últimas 50 guías
      // rolid=1 indica que quien consulta es Administrador
      const res = await getGuias({ rolid: 1 });
      const raw = res.data;

      // Normalización: la API puede devolver array o { guias: [...] }
      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && typeof raw === 'object') {
        // Buscar el primer array en cualquier clave del objeto
        const found = Object.values(raw).find(v => Array.isArray(v));
        list = found || [];
      }
      setGuias(list.map(g => ({ ...g, _verificando: false })));
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      let message = 'Error desconocido.';
      if (!err.response) {
        message = 'Sin conexión al servidor. Verifica tu red o que la API esté activa.';
      } else if (status === 401) {
        message = 'Token expirado o inválido. Por favor cierra sesión y vuelve a entrar.';
      } else if (status === 403) {
        message = 'Tu cuenta no tiene permisos de Administrador para ver guías.';
      } else if (status === 422) {
        message = `Error de validación: ${JSON.stringify(detail)}`;
      } else {
        message = `Error ${status}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
      }
      setErrorInfo({ status, message });
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial automática al montar el componente
  useEffect(() => {
    fetchGuias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (guiaid) => {
    setGuias(prev => prev.map(g => g.id === guiaid ? { ...g, _verificando: true } : g));
    try {
      await verificarGuia(guiaid, user?.id, 1);
      setGuias(prev => prev.map(g =>
        g.id === guiaid
          ? { ...g, _verificando: false, vehiculoverificado: true, contenedorverificado: true }
          : g
      ));
    } catch (err) {
      setGuias(prev => prev.map(g => g.id === guiaid ? { ...g, _verificando: false } : g));
      const detail = err.response?.data?.detail;
      alert(`No se pudo verificar: ${typeof detail === 'string' ? detail : JSON.stringify(detail) || err.message}`);
    }
  };

  const totalPendientes  = guias.filter(g => !g.vehiculoverificado).length;
  const totalVerificadas = guias.filter(g =>  g.vehiculoverificado).length;
  const totalGuias       = guias.length;

  const guiasFiltradas = guias.filter(g => {
    const t = busqueda.toLowerCase();
    const matchBusqueda = !t
      || (g.numeroguia || '').toLowerCase().includes(t)
      || String(g.empresaid || '').includes(t)
      || (g.contenedor?.numerocontenedor || g.contenedor?.numero || '').toLowerCase().includes(t);
    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'pendiente'  && !g.vehiculoverificado) ||
      (filtroEstado === 'verificado' &&  g.vehiculoverificado);
    return matchBusqueda && matchEstado;
  });

  const getNumCont = (g) =>
    g.contenedor?.numerocontenedor ||
    g.contenedor?.numero_contenedor ||
    g.contenedor?.numero ||
    g.numerocontenedor || null;

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Control de Carga</h1>
          <p className="text-slate-500 text-sm mt-0.5">Verificación de guías · {user?.username}</p>
        </div>
        <button
          onClick={fetchGuias}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-2 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Error detallado */}
      {errorInfo && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
          <div className="flex items-start gap-2 text-red-700 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {errorInfo.status ? `Error ${errorInfo.status}` : 'Sin conexión'}
          </div>
          <p className="text-red-600 text-xs ml-6">{errorInfo.message}</p>
          <button
            onClick={fetchGuias}
            className="mt-3 ml-6 text-xs font-semibold text-red-700 underline hover:no-underline"
          >
            Reintentar →
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 md:col-span-1 bg-slate-900 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Package className="w-4 h-4" /> Total
          </div>
          <p className="text-4xl font-bold">{loading ? '…' : totalGuias}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <Clock className="w-4 h-4" /> Pendientes
          </div>
          <p className="text-4xl font-bold text-slate-900">{loading ? '…' : totalPendientes}</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-amber-400 h-1 rounded-full"
              style={{ width: totalGuias ? `${(totalPendientes / totalGuias) * 100}%` : '0%' }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" /> Verificadas
          </div>
          <p className="text-4xl font-bold text-slate-900">{loading ? '…' : totalVerificadas}</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full"
              style={{ width: totalGuias ? `${(totalVerificadas / totalGuias) * 100}%` : '0%' }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingUp className="w-4 h-4" /> Cumplimiento
          </div>
          <p className="text-4xl font-bold text-slate-900">
            {loading || totalGuias === 0 ? '—' : `${Math.round((totalVerificadas / totalGuias) * 100)}%`}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar guía, empresa, contenedor..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {['todos', 'pendiente', 'verificado'].map(f => (
              <button key={f} onClick={() => setFiltroEstado(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all capitalize ${
                  filtroEstado === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">N° Guía</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Empresa</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenedor</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    <span className="text-sm">Cargando guías…</span>
                  </div>
                </td></tr>
              ) : guiasFiltradas.length === 0 && !errorInfo ? (
                <tr><td colSpan="6" className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Wifi className="w-8 h-8" />
                    <p className="text-sm font-medium">No hay guías registradas</p>
                    <p className="text-xs">Los conductores aún no han registrado guías en el sistema.</p>
                  </div>
                </td></tr>
              ) : guiasFiltradas.map(g => (
                <tr key={g.id} className={`hover:bg-slate-50/80 transition-colors ${g._verificando ? 'opacity-50' : ''}`}>
                  <td className="py-4 px-5">
                    <p className="text-sm font-semibold text-slate-900">{g.numeroguia || `GR-${g.id}`}</p>
                    <p className="text-xs text-slate-400">ID #{g.id}</p>
                  </td>
                  <td className="py-4 px-5 hidden md:table-cell text-sm text-slate-600">{g.empresaid || '—'}</td>
                  <td className="py-4 px-5">
                    {getNumCont(g)
                      ? <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-mono">{getNumCont(g)}</code>
                      : <span className="text-xs text-slate-400 italic">Sin contenedor</span>
                    }
                  </td>
                  <td className="py-4 px-5 text-sm text-slate-500 hidden sm:table-cell">{g.fechaservicio || '—'}</td>
                  <td className="py-4 px-5">
                    {g.vehiculoverificado ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" /> Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    {!g.vehiculoverificado ? (
                      <button onClick={() => handleVerify(g.id)} disabled={g._verificando}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold py-2 px-3.5 rounded-lg active:scale-95 transition-all shadow-sm"
                      >
                        {g._verificando
                          ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <ShieldCheck className="w-3.5 h-3.5" />}
                        {g._verificando ? 'Procesando…' : 'Dar VB'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">✓ Listo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && guias.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-400">
            Mostrando {guiasFiltradas.length} de {guias.length} guías
          </div>
        )}
      </div>
    </div>
  );
}
