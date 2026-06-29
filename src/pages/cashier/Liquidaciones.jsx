import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLiquidaciones, cerrarLiquidacionQuincena } from '../../services/apiService';
import {
  Calculator, FileText, CheckCircle2, AlertCircle,
  Calendar, RefreshCw, X, Eye, Download, ShieldCheck
} from 'lucide-react';

export default function Liquidaciones() {
  const { user } = useAuth();

  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    quincena: 1
  });

  const [liquidaciones, setLiquidaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estados para simulación de exportación a PDF
  const [exportando, setExportando] = useState(false);
  const [exportExito, setExportExito] = useState(false);

  // Estado para el modal Drawer de Auditoría
  const [liquidacionSeleccionada, setLiquidacionSeleccionada] = useState(null);

  const cargarLiquidaciones = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getLiquidaciones(filtros);
      setLiquidaciones(res.data?.liquidaciones || []);
    } catch (err) {
      setErrorMsg('No se pudieron cargar las liquidaciones. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLiquidaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.mes, filtros.anio, filtros.quincena]);

  const handleExportPDF = () => {
    setExportando(true);
    setTimeout(() => {
      setExportando(false);
      setExportExito(true);
      setTimeout(() => setExportExito(false), 3000);
    }, 2000); // Simulamos 2 segundos de generación PDF
  };

  const handleCerrarQuincena = async (e, id) => {
    e.stopPropagation(); // Evitar abrir el modal al hacer clic en el botón
    try {
      await cerrarLiquidacionQuincena(id);
      // Actualización Failsafe / Optimista en tiempo real
      setLiquidaciones(prev => prev.map(l => l.id === id ? { ...l, estado: 'CERRADA' } : l));
    } catch (err) {
      setErrorMsg('Error al cerrar la quincena.');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      
      {/* Alertas Flotantes */}
      {exportExito && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold text-sm">Reporte PDF Generado</p>
              <p className="text-slate-400 text-xs mt-0.5">La descarga ha comenzado automáticamente.</p>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal de Auditoría */}
      {liquidacionSeleccionada && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-500" />
                  Auditoría de Pagos
                </h3>
                <p className="text-sm text-slate-500 mt-1">Conductor: {liquidacionSeleccionada.conductor}</p>
              </div>
              <button onClick={() => setLiquidacionSeleccionada(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Guías Totales</p>
                  <p className="text-2xl font-bold text-slate-800">{liquidacionSeleccionada.guias_contadas}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total a Pagar</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(liquidacionSeleccionada.total_neto)}</p>
                </div>
              </div>

              <h4 className="font-bold text-slate-700 text-sm mb-3">Detalle de Guías Contabilizadas</h4>
              
              {liquidacionSeleccionada.detalle_guias?.length > 0 ? (
                <div className="space-y-3">
                  {liquidacionSeleccionada.detalle_guias.map((g, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{g.numeroguia || `G-${g.id}`}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{g.fechaservicio} | {g.contenedor?.numerocontenedor}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-md">
                        VALIDADA
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No hay detalles disponibles en mock para esta liquidación.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-white">
              <button onClick={() => setLiquidacionSeleccionada(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all">
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-slate-400" />
              Módulo Financiero Cajero
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gestión y cierre de liquidaciones quincenales</p>
          </div>
          
          <button 
            onClick={handleExportPDF}
            disabled={exportando || liquidaciones.length === 0}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {exportando ? (
              <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exportando ? 'Generando PDF...' : 'Exportar a PDF'}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Panel de Filtros */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Año</label>
            <select 
              value={filtros.anio} onChange={e => setFiltros({...filtros, anio: parseInt(e.target.value)})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mes</label>
            <select 
              value={filtros.mes} onChange={e => setFiltros({...filtros, mes: parseInt(e.target.value)})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            >
              <option value={1}>Enero</option>
              <option value={2}>Febrero</option>
              <option value={3}>Marzo</option>
              <option value={4}>Abril</option>
              <option value={5}>Mayo</option>
              <option value={6}>Junio</option>
              <option value={7}>Julio</option>
              <option value={8}>Agosto</option>
              <option value={9}>Septiembre</option>
              <option value={10}>Octubre</option>
              <option value={11}>Noviembre</option>
              <option value={12}>Diciembre</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quincena</label>
            <select 
              value={filtros.quincena} onChange={e => setFiltros({...filtros, quincena: parseInt(e.target.value)})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            >
              <option value={1}>1ra Quincena (Días 1-15)</option>
              <option value={2}>2da Quincena (Días 16-31)</option>
            </select>
          </div>

          <button onClick={cargarLiquidaciones} disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl h-[46px] w-[46px] flex items-center justify-center transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          </button>
        </div>

        {/* Tabla Panorámica */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Conductor / Empresa</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Guías</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Base (S/)</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-emerald-600">Bonos</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-red-500">Dsctos</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-800 uppercase tracking-wider text-right bg-slate-100">Total Neto</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liquidaciones.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400">
                      <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-medium">No hay liquidaciones para el período seleccionado.</p>
                    </td>
                  </tr>
                ) : liquidaciones.map((l) => (
                  <tr 
                    key={l.id} 
                    onClick={() => setLiquidacionSeleccionada(l)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{l.conductor}</p>
                      <p className="text-xs text-slate-500">{l.empresa}</p>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-700">{l.guias_contadas}</td>
                    <td className="py-4 px-6 text-right text-slate-600">{formatCurrency(l.tarifa_base)}</td>
                    <td className="py-4 px-6 text-right text-emerald-600 font-medium">+{formatCurrency(l.bonos)}</td>
                    <td className="py-4 px-6 text-right text-red-500 font-medium">-{formatCurrency(l.descuentos)}</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 bg-slate-50/50 group-hover:bg-transparent transition-colors">
                      {formatCurrency(l.total_neto)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        l.estado === 'CERRADA' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {l.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {l.estado === 'ABIERTA' ? (
                        <button 
                          onClick={(e) => handleCerrarQuincena(e, l.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Cerrar Pago
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setLiquidacionSeleccionada(l); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center justify-end gap-1 w-full"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Detalle
                        </button>
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
