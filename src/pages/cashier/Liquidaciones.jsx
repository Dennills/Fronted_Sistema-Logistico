import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { previsualizarLiquidacion, procesarLiquidacion } from '../../services/apiService';
import {
  Calculator, Calendar, CheckCircle2,
  CheckSquare, Square, RefreshCw, AlertCircle,
} from 'lucide-react';

export default function Liquidaciones() {
  const { user } = useAuth();

  const [filtros, setFiltros] = useState({
    conductorid: '', empresaid: '', fecha_inicio: '', fecha_fin: '',
  });
  const [guiasPendientes, setGuiasPendientes] = useState([]);
  const [seleccionadas, setSeleccionadas]     = useState([]);

  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [loadingProcesar, setLoadingProcesar] = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [errorMsg, setErrorMsg]               = useState('');
  const [buscado, setBuscado]                 = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!filtros.conductorid || !filtros.fecha_inicio || !filtros.fecha_fin) {
      setErrorMsg('Ingresa el ID del conductor y el rango de fechas.');
      return;
    }
    setLoadingBusqueda(true);
    setErrorMsg('');
    setSeleccionadas([]);

    try {
      // GET /api/liquidaciones/previsualizar (todos los params son requeridos)
      const res = await previsualizarLiquidacion({
        conductorid:  parseInt(filtros.conductorid),
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin:    filtros.fecha_fin,
      });
      const data = res.data;
      // La API devuelve: { guias: [...], total: N } o directamente un array
      const guias = Array.isArray(data) ? data : (data?.guias || []);
      setGuiasPendientes(guias);
      setBuscado(true);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setErrorMsg(
        err.code === 'ERR_NETWORK'
          ? 'No se puede conectar con el servidor. Verifica que FastAPI esté corriendo.'
          : Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : (detail || err.message)
      );
    } finally {
      setLoadingBusqueda(false);
    }
  };

  const toggleCheck  = (id) =>
    setSeleccionadas((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSeleccionadas(seleccionadas.length === guiasPendientes.length ? [] : guiasPendientes.map((g) => g.id));

  const handleProcesar = async () => {
    if (seleccionadas.length === 0) return;
    if (!filtros.empresaid) {
      setErrorMsg('Ingresa el ID de la empresa para procesar el cierre.');
      return;
    }
    setLoadingProcesar(true);
    setErrorMsg('');

    // Payload exacto según LiquidacionProcesarRequest del OpenAPI
    const payload = {
      conductorid:   parseInt(filtros.conductorid),
      empresaid:     parseInt(filtros.empresaid),
      periodoinicio: filtros.fecha_inicio,
      periodofin:    filtros.fecha_fin,
      cerradopor:    user?.id,
      guias_ids:     seleccionadas,
    };

    try {
      await procesarLiquidacion(payload);
      setGuiasPendientes((prev) => prev.filter((g) => !seleccionadas.includes(g.id)));
      setSeleccionadas([]);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 4500);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setErrorMsg(Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : (detail || err.message));
    } finally {
      setLoadingProcesar(false);
    }
  };

  const todosSeleccionados = guiasPendientes.length > 0 && seleccionadas.length === guiasPendientes.length;

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen relative">

      {/* Modal de Éxito */}
      {showModal && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-emerald-900 text-emerald-50 px-6 py-4 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Cierre Quincenal Procesado</p>
              <p className="text-emerald-300 text-xs mt-0.5">Las guías fueron liquidadas y congeladas correctamente.</p>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Liquidaciones</h1>
        <p className="text-slate-500 text-sm mt-0.5">Cierre financiero quincenal · {user?.username}</p>
      </div>

      {errorMsg && (
        <div className="mb-5 flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
        </div>
      )}

      {/* Formulario de búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" /> Parámetros de Búsqueda
        </h2>
        <form onSubmit={handleBuscar} className="flex flex-wrap gap-3 items-end">

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">ID Conductor</label>
            <input type="number" required value={filtros.conductorid}
              onChange={(e) => { setFiltros({ ...filtros, conductorid: e.target.value }); setErrorMsg(''); }}
              placeholder="Ej. 1"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">ID Empresa</label>
            <input type="number" value={filtros.empresaid}
              onChange={(e) => setFiltros({ ...filtros, empresaid: e.target.value })}
              placeholder="Ej. 1 (para cierre)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Fecha Inicio</label>
            <input type="date" required value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Fecha Fin</label>
            <input type="date" required value={filtros.fecha_fin}
              onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <button type="submit" disabled={loadingBusqueda}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm h-[42px]"
          >
            {loadingBusqueda
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados */}
      {buscado && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-800">Guías Pendientes de Liquidar</h3>
              <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                {guiasPendientes.length} guías
              </span>
            </div>
            {seleccionadas.length > 0 && (
              <span className="text-xs font-semibold text-slate-500">
                {seleccionadas.length} seleccionada{seleccionadas.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-5 w-12">
                    <button onClick={toggleAll}>
                      {todosSeleccionados
                        ? <CheckSquare className="w-4 h-4 text-slate-900" />
                        : <Square className="w-4 h-4 text-slate-300" />}
                    </button>
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">N° Guía</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contenedor</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guiasPendientes.length === 0 ? (
                  <tr><td colSpan="4" className="py-14 text-center text-slate-400 text-sm">
                    No hay guías pendientes en este período.
                  </td></tr>
                ) : guiasPendientes.map((g) => {
                  const checked = seleccionadas.includes(g.id);
                  return (
                    <tr key={g.id} onClick={() => toggleCheck(g.id)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${checked ? 'bg-slate-50' : ''}`}
                    >
                      <td className="py-4 px-5">
                        {checked ? <CheckSquare className="w-4 h-4 text-slate-900" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </td>
                      <td className="py-4 px-5 font-semibold text-sm text-slate-900">{g.numeroguia || `GR-${g.id}`}</td>
                      <td className="py-4 px-5 hidden md:table-cell">
                        <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-mono">
                          {g.contenedor?.numerocontenedor || '—'}
                        </code>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-600">{g.fechaservicio || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {guiasPendientes.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {seleccionadas.length === 0
                  ? 'Selecciona las guías para liquidar.'
                  : `Se liquidarán ${seleccionadas.length} guía${seleccionadas.length !== 1 ? 's' : ''}.`}
              </p>
              <button onClick={handleProcesar}
                disabled={seleccionadas.length === 0 || loadingProcesar}
                className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-sm ${
                  seleccionadas.length > 0
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                } disabled:opacity-60`}
              >
                {loadingProcesar
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />}
                Procesar Cierre Quincenal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
