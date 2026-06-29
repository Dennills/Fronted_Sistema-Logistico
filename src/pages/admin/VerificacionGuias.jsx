import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGuias, getConductores, updateEstadoGuia } from '../../services/apiService';
import { Search, Download, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VerificacionGuias() {
  const { user } = useAuth();
  const [guias, setGuias] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    busqueda: '', conductor: '', empresa: '', tipo: '', estado: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function load() {
      try {
        const [resGuias, resCond] = await Promise.all([
          getGuias({ rolid: 1 }),
          getConductores()
        ]);
        
        let list = [];
        if (Array.isArray(resGuias.data)) list = resGuias.data;
        else if (resGuias.data?.guias) list = resGuias.data.guias;
        
        setGuias(list);
        setConductores(resCond);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getCondName = (id) => {
    const c = conductores.find(x => x.id == id);
    return c ? c.nombre : `Cond-${id}`;
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Está seguro de eliminar esta guía?')) {
      await updateEstadoGuia(id, 'ANULADA', 'Eliminado por Admin');
      setGuias(prev => prev.map(g => g.id === id || g.guiaid === id ? { ...g, anulada: true } : g));
    }
  };

  const filteredGuias = guias.filter(g => {
    const term = filtros.busqueda.toLowerCase();
    const matchBusqueda = !term || 
      g.numeroguia?.toLowerCase().includes(term) || 
      g.contenedor?.numerocontenedor?.toLowerCase().includes(term);
    
    const matchCond = !filtros.conductor || g.conductorid == filtros.conductor;
    const matchEmp = !filtros.empresa || g.empresaid == filtros.empresa;
    const matchTipo = !filtros.tipo || g.tipo_servicio === filtros.tipo;
    const matchEstado = !filtros.estado || 
      (filtros.estado === 'PENDIENTE' && !g.vehiculoverificado && !g.anulada) ||
      (filtros.estado === 'VALIDADA' && g.vehiculoverificado) ||
      (filtros.estado === 'ANULADA' && g.anulada);

    return matchBusqueda && matchCond && matchEmp && matchTipo && matchEstado;
  });

  const totalPages = Math.ceil(filteredGuias.length / itemsPerPage);
  const currentGuias = filteredGuias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de guías</h1>
          <p className="text-slate-500 font-medium mt-1">{filteredGuias.length} guías encontradas</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl px-4 py-2 hover:bg-blue-700 shadow-md transition-all">
            <Plus className="w-4 h-4" /> Nueva guía
          </button>
        </div>
      </div>

      {/* Barra de Filtrado Avanzado */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-[60%]">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por ID, contenedor o ruta..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex w-full md:w-[40%] gap-3">
          <select value={filtros.conductor} onChange={e => setFiltros({...filtros, conductor: e.target.value})} className="flex-1 bg-white border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Conductor ∨</option>
            {conductores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={filtros.empresa} onChange={e => setFiltros({...filtros, empresa: e.target.value})} className="flex-1 bg-white border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Empresa ∨</option>
            <option value="1">Perene</option>
            <option value="2">GKO</option>
            <option value="3">Pao Cargo</option>
            <option value="4">Elam</option>
          </select>
          <select value={filtros.tipo} onChange={e => setFiltros({...filtros, tipo: e.target.value})} className="flex-1 bg-white border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tipo servicio ∨</option>
            <option value="EMBARQUE">Embarque</option>
            <option value="DESCARGA">Descarga</option>
          </select>
          <select value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})} className="flex-1 bg-white border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Estado ∨</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VALIDADA">Validada</option>
            <option value="ANULADA">Anulada</option>
          </select>
        </div>
      </div>

      {/* Tabla Maestra Principal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">ID Guía</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Conductor / Placa</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Contenedor</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Ruta</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Empresa</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentGuias.map(g => (
                <tr key={g.id || g.guiaid} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-blue-600 cursor-pointer hover:underline">{g.numeroguia}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-medium">{g.fechaservicio}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{getCondName(g.conductorid)}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">ABC-123</p>
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200">{g.contenedor?.numerocontenedor}</code>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs text-slate-500 font-medium">{g.origen}</p>
                    <p className="text-sm text-slate-800 font-bold mt-0.5">→ {g.destino}</p>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-600">Empresa {g.empresaid}</td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{g.tipo_servicio}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      g.anulada ? 'bg-red-100 text-red-700 border border-red-200' :
                      g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {g.anulada ? 'ANULADA' : g.vehiculoverificado ? 'VALIDADA' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <button className="p-2 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors" title="Ver"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-slate-100 hover:text-amber-600 rounded-lg transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(g.id || g.guiaid)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentGuias.length === 0 && !loading && (
                <tr><td colSpan="9" className="py-12 text-center text-slate-500 font-medium">No se encontraron resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <span className="text-sm font-medium text-slate-500">
            {filteredGuias.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredGuias.length)} de ${filteredGuias.length}` : '0 de 0'}
          </span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            ><ChevronLeft className="w-4 h-4" /></button>
            
            <div className="flex items-center gap-1 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} onClick={() => setCurrentPage(i+1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >{i + 1}</button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            ><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
