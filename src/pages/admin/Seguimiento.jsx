import React, { useState, useEffect } from 'react';
import { Package, Search, Download, Route, Clock, Calendar } from 'lucide-react';
import { getGuias } from '../../services/apiService';

export default function Seguimiento() {
  const [guias, setGuias] = useState([]);
  const [busquedaContenedor, setBusquedaContenedor] = useState('');
  const [timelineContenedor, setTimelineContenedor] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await getGuias();
      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (res.data?.guias) list = res.data.guias;
      setGuias(list);
    }
    load();
  }, []);

  const buscarTrazabilidad = (e) => {
    if (e) e.preventDefault();
    if (!busquedaContenedor.trim()) {
      setTimelineContenedor(null);
      return;
    }
    const historial = guias.filter(g => 
      (g.contenedor?.numerocontenedor || '').toLowerCase() === busquedaContenedor.toLowerCase().trim()
    ).sort((a, b) => new Date(b.fecharegistro || b.fechaservicio) - new Date(a.fecharegistro || a.fechaservicio));
    
    setTimelineContenedor(historial);
  };

  const handleSugerencia = (codigo) => {
    setBusquedaContenedor(codigo);
    setTimeout(() => {
      document.getElementById('btn-rastrear').click();
    }, 100);
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trazabilidad de contenedores</h1>
          <p className="text-slate-500 font-medium mt-1">Seguimiento en tiempo real de operaciones</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 shadow-sm transition-all">
          <Download className="w-4 h-4" /> Exportar seguimiento
        </button>
      </div>

      {/* Buscador ISO */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center">
        <form onSubmit={buscarTrazabilidad} className="w-full max-w-2xl flex gap-3 relative">
          <div className="relative flex-1">
            <Package className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ej: TCKU3456789"
              value={busquedaContenedor}
              onChange={e => setBusquedaContenedor(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-800 uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button id="btn-rastrear" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-md transition-all">
            <Search className="w-5 h-5" /> Rastrear
          </button>
        </form>
        
        <div className="mt-5 text-sm font-medium text-slate-500 flex gap-2 flex-wrap justify-center">
          Prueba sugerencias: 
          {['TCKU3456789', 'MSDU9871234', 'HLXU4521098', 'CMAU6634512'].map(c => (
            <button key={c} onClick={() => handleSugerencia(c)} className="text-blue-600 font-bold hover:underline bg-blue-50 px-2 py-0.5 rounded-md">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Vertical */}
      {timelineContenedor && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Route className="w-5 h-5 text-blue-600" /> 
            Historial del contenedor <span className="text-blue-600 ml-1">{busquedaContenedor.toUpperCase()}</span>
          </h2>
          
          {timelineContenedor.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-400">No se encontraron registros operacionales</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-10 pb-8">
              {timelineContenedor.map((g, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Punto en la linea */}
                  <div className="absolute w-6 h-6 bg-blue-100 border-4 border-white rounded-full -left-[13px] top-1 flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  
                  {/* Contenido Card */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                          g.tipo_servicio === 'EMBARQUE' ? 'bg-indigo-100 text-indigo-700' : 'bg-fuchsia-100 text-fuchsia-700'
                        }`}>
                          {g.tipo_servicio}
                        </span>
                        <h3 className="font-bold text-slate-900 text-lg">{g.numeroguia}</h3>
                      </div>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        g.anulada ? 'bg-red-100 text-red-700' :
                        g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {g.anulada ? 'ANULADA' : g.vehiculoverificado ? 'VALIDADA' : 'PENDIENTE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Calendar className="w-3 h-3"/> Fecha</p>
                        <p className="font-semibold text-slate-800">{g.fechaservicio}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> Hora</p>
                        <p className="font-semibold text-slate-800">{g.hora || '10:00'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Ruta</p>
                        <p className="font-semibold text-slate-800">{g.origen} → {g.destino}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Peso</p>
                        <p className="font-semibold text-slate-800">{g.pesotoneladas} TN</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
