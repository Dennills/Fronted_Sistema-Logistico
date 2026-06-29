import React, { useState, useEffect } from 'react';
import { Truck, Edit2, ShieldCheck, ShieldAlert, Plus, Search } from 'lucide-react';
import { getConductores, getGuias } from '../../services/apiService';

export default function GestionConductores() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resCond = await getConductores();
        // Generar data enriquecida para las cards basada en los mocks
        const enriched = resCond.map(c => ({
          ...c,
          guias_quincena: Math.floor(Math.random() * 20) + 5,
          empresas_asoc: Math.floor(Math.random() * 3) + 1,
          nombres_empresas: ['Perene', 'GKO', 'Pao Cargo'].sort(() => 0.5 - Math.random()).slice(0, 2).join(', '),
          servicios: ['EMBARQUE', 'DESCARGA']
        }));
        setConductores(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de conductores</h1>
          <p className="text-slate-500 font-medium mt-1">{conductores.length} conductores registrados</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Buscar conductor..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-xl px-4 py-2 hover:bg-blue-700 shadow-md transition-all">
            <Plus className="w-4 h-4" /> Nuevo conductor
          </button>
        </div>
      </div>

      {/* Grid de 2 Columnas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-slate-500">Cargando conductores...</p>
        ) : (
          conductores.map(c => (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              
              {/* Header Interno */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{c.nombre}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">Placa: <span className="text-slate-800 font-bold">{c.placa}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    c.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {c.estado === 'ACTIVO' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {c.estado}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bloque de Métricas Internas (3 Columnas) */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Guías quincena</p>
                  <p className="text-2xl font-bold text-slate-900">{c.guias_quincena}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Empresas</p>
                  <p className="text-2xl font-bold text-slate-900">{c.empresas_asoc}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID Interno</p>
                  <p className="text-2xl font-bold text-blue-600">C{c.id.toString().padStart(2, '0')}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-500 font-medium">
                    Empresas: <span className="text-slate-800 font-bold">{c.nombres_empresas}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium">Tipos de servicio:</span>
                    {c.servicios.map(srv => (
                      <span key={srv} className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-1 rounded-md border border-slate-200">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
