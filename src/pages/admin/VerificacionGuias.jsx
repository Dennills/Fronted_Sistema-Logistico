import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGuias, verificarGuia } from '../../services/apiService';
import { ShieldCheck, Clock, Search, RefreshCw, Package, TrendingUp, Filter, AlertTriangle } from 'lucide-react';

export default function VerificacionGuias() {
  const { user } = useAuth();

  const [guias, setGuias]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [errorGlobal, setErrorGlobal]   = useState('');

  const fetchGuias = useCallback(async () => {
    setLoading(true);
    setErrorGlobal('');
    try {
      // GET /api/guias/?rolid=1  — sin más filtros para traer todas las guías
      const res = await getGuias({ rolid: 1 });
      const raw  = res.data;

      // La API puede retornar array directo O { guias: [...] } O { data: [...] }
      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && typeof raw === 'object') {
        list = raw.guias || raw.data || raw.items || Object.values(raw).find(Array.isArray) || [];
      }

      setGuias(list.map((g) => ({ ...g, _verificando: false })));
    } catch (err) {
      console.error('Error guías:', err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 403) {
        setErrorGlobal('Acceso denegado. Tu rol no tiene permisos para ver guías.');
      } else if (err.response?.status === 401) {
        setErrorGlobal('Sesión expirada. Por favor vuelve a iniciar sesión.');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorGlobal('No se puede conectar con el servidor. Verifica tu conexión.');
      } else {
        setErrorGlobal(`Error del servidor (${err.response?.status}): ${JSON.stringify(err.response?.data?.detail || err.message)}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuias(); }, [fetchGuias]);

  const handleVerify = async (guiaid) => {
    setGuias((prev) => prev.map((g) => g.id === guiaid ? { ...g, _verificando: true } : g));
    try {
      await verificarGuia(guiaid, user?.id, 1);
      setGuias((prev) => prev.map((g) =>
        g.id === guiaid
          ? { ...g, _verificando: false, vehiculoverificado: true, contenedorverificado: true }
          : g
      ));
    } catch (err) {
      console.error('Error verificar:', err.response?.data || err.message);
      setGuias((prev) => prev.map((g) => g.id === guiaid ? { ...g, _verificando: false } : g));
      const msg = err.response?.data?.detail || err.message;
      alert(`No se pudo verificar: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
    }
  };

  const totalPendientes  = guias.filter((g) => !g.vehiculoverificado).length;
  const totalVerificadas = guias.filter((g) =>  g.vehiculoverificado).length;
  const totalGuias       = guias.length;

  const guiasFiltradas = guias.filter((g) => {
    const t = busqueda.toLowerCase();
    const matchBusqueda = !t
      || (g.numeroguia  || '').toLowerCase().includes(t)
      || String(g.empresaid || '').includes(t)
      || (g.contenedor?.numerocontenedor || '').toLowerCase().includes(t);
    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'pendiente'  && !g.vehiculoverificado) ||
      (filtroEstado === 'verificado' &&  g.vehiculoverificado);
    return matchBusqueda && matchEstado;
  });

  // Extraer número de contenedor con múltiples fallbacks
  const getContenedor = (g) =>
    g.contenedor?.numerocontenedor ||
    g.contenedor?.numero_contenedor ||
    g.contenedor?.numero ||
    g.numerocontenedor ||
    null;

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Control de Carga</h1>
          <p className="text-slate-500 text-sm mt-0.5">Verificación de guías · {user?.username}</p>
        </div>
        <button onClick={fetchGuias}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-2 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Banner de error */}
      {errorGlobal && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {errorGlobal}
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
            <div className="bg-amber-400 h-1 rounded-full transition-all"
              style={{ width: totalGuias ? `${(totalPendientes / totalGuias) * 100}%` : '0%' }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" /> Verificadas
          </div>
          <p className="text-4xl font-bold text-slate-900">{loading ? '…' : totalVerificadas}</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full transition-all"
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

        {/* Barra de herramientas */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar guía, empresa, contenedor..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {['todos', 'pendiente', 'verificado'].map((f) => (
              <button key={f} onClick={() => setFiltroEstado(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all capitalize ${
                  filtroEstado === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Tabla responsiva */}
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
                    <span className="text-sm">Cargando guías desde la API…</span>
                  </div>
                </td></tr>
              ) : guiasFiltradas.length === 0 ? (
                <tr><td colSpan="6" className="py-14 text-center text-slate-400 text-sm">
                  {errorGlobal ? 'Error al cargar datos.' : 'No se encontraron guías.'}
                </td></tr>
              ) : guiasFiltradas.map((g) => {
                const numCont    = getContenedor(g);
                const aprobada   = g.vehiculoverificado;
                return (
                  <tr key={g.id} className={`hover:bg-slate-50/80 transition-colors ${g._verificando ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-5">
                      <p className="text-sm font-semibold text-slate-900">{g.numeroguia || `GR-${g.id}`}</p>
                      <p className="text-xs text-slate-400">ID #{g.id}</p>
                    </td>
                    <td className="py-4 px-5 hidden md:table-cell text-sm text-slate-600">{g.empresaid || '—'}</td>
                    <td className="py-4 px-5">
                      {numCont
                        ? <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-mono">{numCont}</code>
                        : <span className="text-xs text-slate-400 italic">Sin contenedor</span>
                      }
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-500 hidden sm:table-cell">{g.fechaservicio || '—'}</td>
                    <td className="py-4 px-5">
                      {aprobada ? (
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
                      {!aprobada ? (
                        <button onClick={() => handleVerify(g.id)} disabled={g._verificando}
                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold py-2 px-3.5 rounded-lg active:scale-95 transition-all shadow-sm"
                        >
                          {g._verificando
                            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <ShieldCheck className="w-3.5 h-3.5" />
                          }
                          {g._verificando ? 'Procesando…' : 'Dar VB'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">✓ Listo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
