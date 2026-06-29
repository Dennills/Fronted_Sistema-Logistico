import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crearGuia, getGuias, getAuxiliares } from '../../services/apiService';
import {
  CheckCircle2, ChevronRight, AlertCircle, ArrowLeft,
  Truck, Package, ClipboardList, RefreshCw, AlertTriangle,
  Calendar, MapPin, Hash, User
} from 'lucide-react';

const InputField = ({ name, label, type = 'text', placeholder, value, onChange, options = null }) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {options ? (
      <select
        name={name} value={value} onChange={onChange}
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all"
      >
        <option value="">Seleccione...</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
      </select>
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete="off"
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all"
      />
    )}
  </div>
);

const FORM_INICIAL = {
  numeroguia: '', empresaid: '', vehiculoid: '1', tiposervicioid: '',
  origenid: '1', destinoid: '2', fechaservicio: new Date().toISOString().split('T')[0], pesotoneladas: '',
  numerocontenedor: '', precinto: '', tamanioid: '', pesokg: '',
  terminalid: '1', estadocontenedorid: '1',
};

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const found = Object.values(raw).find(v => Array.isArray(v));
    return found || [];
  }
  return [];
}

export default function ConductorDashboard() {
  const { user } = useAuth();

  const [step, setStep]         = useState(1);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [vistaActiva, setVistaActiva] = useState('historial');

  const [misGuias, setMisGuias]             = useState([]);
  const [loadingGuias, setLoadingGuias]     = useState(true);
  const [errorGuias, setErrorGuias]         = useState(null);
  const [auxiliares, setAuxiliares]         = useState(null);

  async function cargarMisGuias() {
    setLoadingGuias(true);
    setErrorGuias(null);
    try {
      const conductorId = user?.conductorid || parseInt(localStorage.getItem('numeric_conductor_id') || '1', 10);
      const params = { rolid: 3, conductorid: conductorId };
      const res = await getGuias(params);
      setMisGuias(normalizeList(res.data?.guias || res.data));
    } catch (err) {
      setErrorGuias(err.message || 'Error al cargar guías.');
    } finally {
      setLoadingGuias(false);
    }
  }

  async function cargarCatalogos() {
    try {
      const aux = await getAuxiliares();
      setAuxiliares(aux);
    } catch (e) {
      console.warn("Error cargando catálogos", e);
    }
  }

  useEffect(() => {
    cargarCatalogos();
    cargarMisGuias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab) => {
    setVistaActiva(tab);
    if (tab === 'historial') cargarMisGuias();
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  }, []);

  const validateStep1 = () => {
    const campos = ['numeroguia', 'empresaid', 'tiposervicioid', 'fechaservicio', 'pesotoneladas'];
    if (campos.some(k => !formData[k]?.toString().trim())) {
      setErrorMsg('Completa todos los campos obligatorios del Paso 1.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const campos = ['numerocontenedor', 'precinto', 'tamanioid', 'pesokg'];
    if (campos.some(k => !formData[k]?.toString().trim())) {
      setErrorMsg('Completa los datos del contenedor.');
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep1()) { setErrorMsg(''); setStep(2); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setSending(true);
    setErrorMsg('');

    const conductorid_num = user?.conductorid || parseInt(localStorage.getItem('numeric_conductor_id') || '1', 10);
    const usuarioid_num   = user?.usuarioid   || parseInt(localStorage.getItem('usuarioid')   || '1', 10);

    const payload = {
      numeroguia:     formData.numeroguia.trim(),
      conductorid:    conductorid_num,
      vehiculoid:     parseInt(formData.vehiculoid),
      empresaid:      parseInt(formData.empresaid),
      tiposervicioid: parseInt(formData.tiposervicioid),
      origenid:       parseInt(formData.origenid),
      destinoid:      parseInt(formData.destinoid),
      pesotoneladas:  parseFloat(formData.pesotoneladas),
      estadoid:       1,
      fechaservicio:  formData.fechaservicio,
      registradopor:  usuarioid_num,
      contenedor: {
        numerocontenedor:   formData.numerocontenedor.trim(),
        precinto:           formData.precinto.trim(),
        tamanioid:          parseInt(formData.tamanioid),
        pesokg:             parseFloat(formData.pesokg),
        terminalid:         parseInt(formData.terminalid),
        estadocontenedorid: parseInt(formData.estadocontenedorid),
      },
    };

    try {
      await crearGuia(payload);
      setSuccess(true);
      setFormData(FORM_INICIAL);
      setStep(1);
      setTimeout(() => {
        setSuccess(false);
        setVistaActiva('historial');
        cargarMisGuias();
      }, 1500);
    } catch (err) {
      setErrorMsg('No se pudo registrar la guía.');
    } finally {
      setSending(false);
    }
  };

  const getNumCont = (g) => g.contenedor?.numerocontenedor || 'S/N';
  const getPrecinto = (g) => g.contenedor?.precinto || 'S/P';
  
  // Placa simulada
  const placaConductor = user?.username === 'R. Huanca' ? 'ABC-123' : 'X-999';

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Responsivo */}
        <div className="bg-slate-900 text-white rounded-t-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-6 h-6 text-slate-400" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Panel del Conductor</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-slate-200">
                <User className="w-4 h-4" /> {user?.username || 'Chofer'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-slate-200">
                <Hash className="w-4 h-4" /> Placa: {placaConductor}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-3 text-center min-w-[120px]">
            <p className="text-xs text-slate-400 uppercase font-semibold">Guías Quincena</p>
            <p className="text-3xl font-bold text-emerald-400">{misGuias.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'historial', icon: ClipboardList, label: '📋 Mis Guías' },
            { id: 'form',      icon: Package,       label: '➕ Registrar Nueva' },
          ].map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[150px] py-4 text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition-colors ${
                vistaActiva === tab.id ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-3xl shadow-sm border border-slate-100 border-t-0 p-5 md:p-8">

          {/* ── HISTORIAL EN GRID ── */}
          {vistaActiva === 'historial' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Tus Rutas Registradas</h3>
                <button onClick={cargarMisGuias} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {loadingGuias ? (
                <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                  <span className="font-medium">Cargando guías...</span>
                </div>
              ) : misGuias.length === 0 ? (
                <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-semibold text-slate-600">No tienes guías registradas.</p>
                  <p className="text-sm mt-1">Dirígete a "Registrar Nueva" para iniciar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {misGuias.map(g => (
                    <div key={g.id || g.guiaid} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-bold text-slate-900">{g.numeroguia || `G-${g.id}`}</p>
                          <p className="text-xs text-slate-500 font-medium">{g.fechaservicio}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                          g.anulada ? 'bg-red-100 text-red-700' :
                          g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {g.anulada ? 'ANULADA' : g.vehiculoverificado ? 'VALIDADA' : 'REGISTRADA'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Package className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{getNumCont(g)}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-xs">Precinto: {getPrecinto(g)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{g.pesotoneladas ? `${g.pesotoneladas} Ton` : 'Sin peso'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FORMULARIO RESPONSIVO GRID ── */}
          {vistaActiva === 'form' && (
            <div className="max-w-4xl mx-auto">
              {/* Stepper Header */}
              <div className="flex items-center mb-8 bg-slate-50 p-2 rounded-2xl">
                {[{ n: 1, label: 'Datos del Viaje' }, { n: 2, label: 'Contenedor' }].map(({ n, label }, i) => (
                  <React.Fragment key={n}>
                    <div className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                      step === n ? 'bg-white shadow-sm text-slate-900' : step > n ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        step === n ? 'border-slate-900 bg-slate-900 text-white' : step > n ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200'
                      }`}>{step > n ? <CheckCircle2 className="w-5 h-5" /> : n}</div>
                      <span className="text-sm font-bold">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
                </div>
              )}
              {success && (
                <div className="mb-6 flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> ¡Guía registrada exitosamente con modo Failsafe!
                </div>
              )}

              <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                {step === 1 && (
                  <div className="space-y-6">
                    {!user?.conductorid && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex flex-col gap-2">
                        <span className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Falta ID Conductor (Modo Fallback)</span>
                        <InputField
                          name="_conductorid_num" label="Ingresa tu ID numérico manualmente" type="number"
                          value={localStorage.getItem('numeric_conductor_id') || ''}
                          onChange={(e) => localStorage.setItem('numeric_conductor_id', e.target.value)}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField name="numeroguia" label="N° Guía Transportista" placeholder="Ej. T001-000456" value={formData.numeroguia} onChange={handleChange} />
                      <InputField name="empresaid" label="Empresa" value={formData.empresaid} onChange={handleChange} options={auxiliares?.empresas} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <InputField name="tiposervicioid" label="Tipo de Servicio" value={formData.tiposervicioid} onChange={handleChange} options={auxiliares?.servicios} />
                      <InputField name="fechaservicio" label="Fecha Servicio" value={formData.fechaservicio} onChange={handleChange} type="date" />
                      <InputField name="pesotoneladas" label="Peso (Toneladas)" placeholder="Ej. 5.5" value={formData.pesotoneladas} onChange={handleChange} type="number" />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="button" onClick={nextStep} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 active:scale-95 transition-all w-full md:w-auto">
                        Continuar al Contenedor <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField name="numerocontenedor" label="N° Contenedor" placeholder="Ej. HLXU4521098" value={formData.numerocontenedor} onChange={handleChange} />
                      <InputField name="precinto" label="Precinto de Seguridad" placeholder="Ej. PREC-12345" value={formData.precinto} onChange={handleChange} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField name="tamanioid" label="Tamaño" value={formData.tamanioid} onChange={handleChange} options={auxiliares?.tamanos} />
                      <InputField name="pesokg" label="Peso Contenedor (KG)" placeholder="Ej. 25000" value={formData.pesokg} onChange={handleChange} type="number" />
                    </div>

                    <div className="flex flex-col-reverse md:flex-row gap-4 pt-6">
                      <button type="button" onClick={() => { setStep(1); setErrorMsg(''); }} className="border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all w-full md:w-auto">
                        <ArrowLeft className="w-5 h-5" /> Regresar
                      </button>
                      <button type="submit" disabled={sending} className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all w-full md:flex-1 shadow-lg shadow-slate-900/20">
                        {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirmar y Guardar Guía</>}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
