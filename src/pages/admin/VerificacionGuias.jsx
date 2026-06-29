import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGuias, verificarGuia, updateEstadoGuia } from '../../services/apiService';
import {
  ShieldCheck, Clock, Search, RefreshCw,
  Package, TrendingUp, Filter, AlertTriangle, Wifi, XCircle, FileSearch, Route
} from 'lucide-react';

export default function VerificacionGuias() {
  const { user } = useAuth();

  const [guias, setGuias]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [errorInfo, setErrorInfo]       = useState(null);

  // Estados para Trazabilidad
  const [busquedaContenedor, setBusquedaContenedor] = useState('');
  const [timelineContenedor, setTimelineContenedor] = useState(null);

  async function fetchGuias() {
    setLoading(true);
    setErrorInfo(null);
    try {
      const res = await getGuias({ rolid: 1 });
      const raw = res.data;
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (raw && typeof raw === 'object') {
        const found = Object.values(raw).find(v => Array.isArray(v));
        list = found || [];
      }
      setGuias(list.map(g => ({ ...g, _verificando: false, _anulando: false })));
    } catch (err) {
      setErrorInfo({ message: err.message || 'Error al conectar' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGuias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (guiaid) => {
    setGuias(prev => prev.map(g => g.id === guiaid || g.guiaid === guiaid ? { ...g, _verificando: true } : g));
    try {
      const verificadorId = user?.usuarioid || 1;
      await verificarGuia(guiaid, verificadorId, 1);
      setGuias(prev => prev.map(g =>
        g.id === guiaid || g.guiaid === guiaid
          ? { ...g, _verificando: false, vehiculoverificado: true, anulada: false }
          : g
      ));
    } catch (err) {
      setGuias(prev => prev.map(g => g.id === guiaid || g.guiaid === guiaid ? { ...g, _verificando: false } : g));
      alert(`Error al verificar`);
    }
  };

  const handleAnular = async (guiaid) => {
    const motivo = window.prompt("Por favor, ingrese el motivo de la anulación:");
    if (!motivo || motivo.trim() === "") {
      alert("El motivo es obligatorio para anular.");
      return;
    }

    setGuias(prev => prev.map(g => g.id === guiaid || g.guiaid === guiaid ? { ...g, _anulando: true } : g));
    try {
      await updateEstadoGuia(guiaid, 'ANULADA', motivo);
      setGuias(prev => prev.map(g =>
        g.id === guiaid || g.guiaid === guiaid
          ? { ...g, _anulando: false, anulada: true, motivoanulacion: motivo, vehiculoverificado: false }
          : g
      ));
    } catch (err) {
      setGuias(prev => prev.map(g => g.id === guiaid || g.guiaid === guiaid ? { ...g, _anulando: false } : g));
      alert(`Error al anular`);
    }
  };

  const buscarTrazabilidad = (e) => {
    e.preventDefault();
    if (!busquedaContenedor.trim()) {
      setTimelineContenedor(null);
      return;
    }
    const historial = guias.filter(g => 
      (g.contenedor?.numerocontenedor || '').toLowerCase() === busquedaContenedor.toLowerCase().trim()
    ).sort((a, b) => new Date(b.fecharegistro || b.fechaservicio) - new Date(a.fecharegistro || a.fechaservicio));
    
    setTimelineContenedor(historial);
  };

  // KPIs
  const totalGuias       = guias.length;
  const totalPendientes  = guias.filter(g => !g.vehiculoverificado && !g.anulada).length;
  const totalVerificadas = guias.filter(g => g.vehiculoverificado).length;
  const totalAnuladas    = guias.filter(g => g.anulada).length;

  const guiasFiltradas = guias.filter(g => {
    const t = busqueda.toLowerCase();
    const matchBusqueda = !t
      || (g.numeroguia || '').toLowerCase().includes(t)
      || String(g.empresaid || '').includes(t)
      || (g.contenedor?.numerocontenedor || '').toLowerCase().includes(t);
    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'pendiente'  && !g.vehiculoverificado && !g.anulada) ||
      (filtroEstado === 'verificado' && g.vehiculoverificado) ||
      (filtroEstado === 'anulada' && g.anulada);
    return matchBusqueda && matchEstado;
  });

  const getNumCont = (g) => g.contenedor?.numerocontenedor || null;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-slate-400" /> Control Global Administrativo
          </h1>
          <p className="text-slate-500 mt-1">Monitoreo, Trazabilidad y Validación de Guías</p>
        </div>
        <button onClick={fetchGuias} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-md">
          <RefreshCw className="w-4 h-4" /> Actualizar Datos
        </button>
      </div>

      {/* Trazabilidad de Contenedor */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-500" /> Trazabilidad de Contenedor
        </h2>
        
        <form onSubmit={buscarTrazabilidad} className="flex gap-3 max-w-2xl">
          <input
            type="text"
            placeholder="Ingrese código de contenedor (Ej. HLXU1234567)"
            value={busquedaContenedor}
            onChange={e => setBusquedaContenedor(e.target.value)}
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 uppercase transition-all"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
            Buscar Historial
          </button>
        </form>

        {timelineContenedor && (
          <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Route className="w-4 h-4 text-slate-400" /> Línea de tiempo para: <span className="text-blue-600 uppercase">{busquedaContenedor}</span>
            </h3>
            
            {timelineContenedor.length === 0 ? (
              <p className="text-slate-500 text-sm">No se encontraron registros para este contenedor.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {timelineContenedor.map((g, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <TruckIcon className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800">{g.numeroguia || `G-${g.id}`}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${g.anulada ? 'bg-red-100 text-red-700' : g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {g.anulada ? 'ANULADA' : g.vehiculoverificado ? 'VALIDADA' : 'PENDIENTE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{g.fechaservicio}</p>
                      <p className="text-sm mt-2 text-slate-600">ID Conductor: <span className="font-bold">{g.conductorid}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Registradas</p>
            <p className="text-4xl font-bold">{loading ? '…' : totalGuias}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Pendientes</p>
            <p className="text-4xl font-bold text-slate-900">{loading ? '…' : totalPendientes}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">Validadas</p>
            <p className="text-4xl font-bold text-slate-900">{loading ? '…' : totalVerificadas}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <p className="text-red-500 text-xs font-bold uppercase tracking-wider mb-2">Anuladas</p>
            <p className="text-4xl font-bold text-slate-900">{loading ? '…' : totalAnuladas}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por guía o contenedor..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
              {['todos', 'pendiente', 'verificado', 'anulada'].map(f => (
                <button key={f} onClick={() => setFiltroEstado(f)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all capitalize ${
                    filtroEstado === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >{f}</button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Documento</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Contenedor</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha / Chofer</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guiasFiltradas.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-slate-400">
                    <Wifi className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron guías</p>
                  </td></tr>
                ) : guiasFiltradas.map(g => (
                  <tr key={g.id || g.guiaid} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{g.numeroguia || `G-${g.id}`}</p>
                      <p className="text-xs text-slate-400">ID #{g.id || g.guiaid}</p>
                      {g.motivoanulacion && (
                        <p className="text-xs text-red-500 mt-1 italic max-w-[200px] truncate">Motivo: {g.motivoanulacion}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getNumCont(g)
                        ? <code className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{getNumCont(g)}</code>
                        : <span className="text-xs text-slate-400">N/A</span>
                      }
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-700">{g.fechaservicio}</p>
                      <p className="text-xs text-slate-500">Conductor: {g.conductorid}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        g.anulada ? 'bg-red-100 text-red-700' :
                        g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {g.anulada ? 'ANULADA' : g.vehiculoverificado ? 'VALIDADA' : 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!g.vehiculoverificado && !g.anulada ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleVerify(g.id || g.guiaid)} disabled={g._verificando}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                          >
                            {g._verificando ? '...' : 'Verificar'}
                          </button>
                          <button onClick={() => handleAnular(g.id || g.guiaid)} disabled={g._anulando}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-lg text-xs transition-colors disabled:opacity-50"
                          >
                            {g._anulando ? '...' : 'Anular'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">{g.anulada ? 'Bloqueado' : 'Completado'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const TruckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="12" x="2" y="8" rx="2.5" />
    <path d="M18 12.5V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4.5" />
    <circle cx="6.5" cy="18.5" r="1.5" />
    <circle cx="17.5" cy="18.5" r="1.5" />
  </svg>
);
