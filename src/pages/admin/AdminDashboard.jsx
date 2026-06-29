import React, { useEffect, useState } from 'react';
import { FileText, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getGuias } from '../../services/apiService';

export default function AdminDashboard() {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getGuias();
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (res.data?.guias) list = res.data.guias;
        setGuias(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const barData = [
    { name: 'Perene', value: 90 },
    { name: 'GKO', value: 85 },
    { name: 'Pao Cargo', value: 65 },
    { name: 'Elam', value: 90 },
    { name: 'Grelan', value: 52 },
  ];

  const donutData = [
    { name: 'Embarque', value: 250 },
    { name: 'Descarga', value: 162 }
  ];
  const COLORS = ['#2563eb', '#f59e0b'];

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-6">
      
      {/* 4 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Guías de hoy</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">38</p>
          <p className="text-sm font-semibold text-emerald-600 mt-2">+12% vs ayer</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Guías quincena</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">412</p>
          <p className="text-sm font-semibold text-slate-400 mt-2">15-30 Jun 2026</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Conductores</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">21</p>
          <p className="text-sm font-semibold text-slate-400 mt-2">R. Huanca en ruta</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Por pagar</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">S/ 12k</p>
          <p className="text-sm font-semibold text-slate-400 mt-2">18 liquidaciones</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[7] bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative">
          <h3 className="font-bold text-slate-800 mb-6">Guías por empresa</h3>
          <span className="absolute top-6 right-6 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
            412 total
          </span>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-[3] bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">Tipo de servicio</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla Recientes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Guías recientes</h3>
          <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">ID Guía</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Hora</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Conductor</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Contenedor</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Ruta</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Empresa</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {guias.slice(0, 5).map((g, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-6"><span className="text-blue-600 font-bold cursor-pointer hover:underline">{g.numeroguia}</span></td>
                  <td className="py-3 px-6 text-sm text-slate-500 font-medium">{g.hora || '12:00'}</td>
                  <td className="py-3 px-6 text-sm font-semibold text-slate-800">C-{g.conductorid}</td>
                  <td className="py-3 px-6"><code className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{g.contenedor?.numerocontenedor}</code></td>
                  <td className="py-3 px-6">
                    <p className="text-xs text-slate-500 font-medium">{g.origen}</p>
                    <p className="text-xs text-slate-800 font-bold">{g.destino}</p>
                  </td>
                  <td className="py-3 px-6 text-sm font-medium text-slate-600">Empresa {g.empresaid}</td>
                  <td className="py-3 px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{g.tipo_servicio}</span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      g.anulada ? 'bg-red-100 text-red-700' :
                      g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {g.anulada ? 'ANULADA' : g.vehiculoverificado ? 'VALIDADA' : 'PENDIENTE'}
                    </span>
                  </td>
                </tr>
              ))}
              {guias.length === 0 && !loading && (
                <tr><td colSpan="8" className="py-8 text-center text-slate-400">Sin guías recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
