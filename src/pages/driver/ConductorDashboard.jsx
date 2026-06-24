import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crearGuia, getGuias } from '../../services/apiService';
import {
  CheckCircle2, ChevronRight, AlertCircle, ArrowLeft,
  Truck, Package, ClipboardList, RefreshCw,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// CRÍTICO: Input debe estar FUERA del componente principal.
// Si está adentro, React lo destruye/recrea en cada render y
// el campo pierde el foco tras cada keystroke.
// ─────────────────────────────────────────────────────────────
const InputField = ({ name, label, type = 'text', placeholder, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all"
    />
  </div>
);

const FORM_INICIAL = {
  numeroguia: '', empresaid: '', vehiculoid: '', tiposervicioid: '',
  origenid: '', destinoid: '', fechaservicio: '', pesotoneladas: '',
  numerocontenedor: '', precinto: '', tamanioid: '', pesokg: '',
  terminalid: '', estadocontenedorid: '',
};

export default function ConductorDashboard() {
  const { user } = useAuth();

  const [step, setStep]           = useState(1);
  const [formData, setFormData]   = useState(FORM_INICIAL);
  const [errorMsg, setErrorMsg]   = useState('');
  const [success, setSuccess]     = useState(false);
  const [sending, setSending]     = useState(false);
  const [vistaActiva, setVistaActiva] = useState('form');
  const [misGuias, setMisGuias]       = useState([]);
  const [loadingGuias, setLoadingGuias] = useState(false);

  const cargarMisGuias = async () => {
    setLoadingGuias(true);
    try {
      const res = await getGuias({ conductorid: user?.id, rolid: 1 });
      const raw  = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.guias || raw?.data || []);
      setMisGuias(list);
    } catch (e) {
      console.error('Error cargando mis guías:', e);
    } finally {
      setLoadingGuias(false);
    }
  };

  const handleTabChange = (tab) => {
    setVistaActiva(tab);
    if (tab === 'historial') cargarMisGuias();
  };

  // useCallback para evitar que onChange cambie de referencia en cada render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  }, []);

  const validateStep1 = () => {
    const campos = ['numeroguia', 'empresaid', 'vehiculoid', 'tiposervicioid', 'origenid', 'destinoid', 'fechaservicio', 'pesotoneladas'];
    if (campos.some((k) => !formData[k]?.toString().trim())) {
      setErrorMsg('Completa todos los campos del Paso 1 para continuar.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const campos = ['numerocontenedor', 'precinto', 'tamanioid', 'pesokg', 'terminalid', 'estadocontenedorid'];
    if (campos.some((k) => !formData[k]?.toString().trim())) {
      setErrorMsg('Completa todos los datos del contenedor antes de enviar.');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep1()) { setErrorMsg(''); setStep(2); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setSending(true);
    setErrorMsg('');

    // Payload exacto según GuiaCreateRequest del OpenAPI
    const payload = {
      numeroguia:     formData.numeroguia.trim(),
      conductorid:    user?.id,
      vehiculoid:     parseInt(formData.vehiculoid),
      empresaid:      parseInt(formData.empresaid),
      tiposervicioid: parseInt(formData.tiposervicioid),
      origenid:       parseInt(formData.origenid),
      destinoid:      parseInt(formData.destinoid),
      pesotoneladas:  parseFloat(formData.pesotoneladas),
      estadoid:       1,
      fechaservicio:  formData.fechaservicio,
      registradopor:  user?.id,
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
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 422) {
        setErrorMsg(`Validación: ${Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Revisa los campos.'}`);
      } else if (err.response?.status === 401) {
        setErrorMsg('Sesión expirada. Por favor vuelve a iniciar sesión.');
      } else {
        setErrorMsg('No se pudo conectar con el servidor.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center py-6 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="bg-slate-900 text-white rounded-t-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-slate-400" />
            <h1 className="text-xl font-bold tracking-tight">Módulo Conductor</h1>
          </div>
          <p className="text-slate-400 text-sm">{user?.username} · Registro de ruta</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800">
          {[
            { id: 'form', icon: Package, label: 'Nueva Guía' },
            { id: 'historial', icon: ClipboardList, label: 'Mis Guías' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                vistaActiva === tab.id ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0 p-5">

          {/* ── FORMULARIO ── */}
          {vistaActiva === 'form' && (
            <>
              {/* Stepper */}
              <div className="flex items-center mb-5">
                {[{ n: 1, label: 'Datos del Viaje' }, { n: 2, label: 'Contenedor' }].map(({ n, label }, i) => (
                  <React.Fragment key={n}>
                    <div className={`flex items-center gap-1.5 ${step >= n ? 'text-slate-900' : 'text-slate-400'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        step >= n ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                      }`}>{n}</div>
                      <span className="text-xs font-semibold hidden sm:block">{label}</span>
                    </div>
                    {i < 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${step === 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Alertas */}
              {errorMsg && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                </div>
              )}
              {success && (
                <div className="mb-4 flex items-start gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> ¡Guía registrada exitosamente con su contenedor!
                </div>
              )}

              <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

                {/* PASO 1 */}
                {step === 1 && (
                  <div className="space-y-3">
                    <InputField name="numeroguia"    label="N° Guía Transportista"  placeholder="Ej. T001-000456"      value={formData.numeroguia}    onChange={handleChange} />
                    <InputField name="empresaid"     label="ID Empresa"             placeholder="Ej. 1"                 value={formData.empresaid}     onChange={handleChange} type="number" />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="vehiculoid"     label="ID Vehículo"    placeholder="Ej. 1"            value={formData.vehiculoid}     onChange={handleChange} type="number" />
                      <InputField name="tiposervicioid" label="ID Tipo Serv."  placeholder="1=Lleno 2=Vacío"  value={formData.tiposervicioid} onChange={handleChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="origenid"  label="ID Origen"  placeholder="Ej. 1" value={formData.origenid}  onChange={handleChange} type="number" />
                      <InputField name="destinoid" label="ID Destino" placeholder="Ej. 2" value={formData.destinoid} onChange={handleChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="fechaservicio"  label="Fecha Servicio"    value={formData.fechaservicio}  onChange={handleChange} type="date" />
                      <InputField name="pesotoneladas"  label="Peso (Toneladas)"  placeholder="Ej. 5.5"           value={formData.pesotoneladas} onChange={handleChange} type="number" />
                    </div>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* PASO 2 */}
                {step === 2 && (
                  <div className="space-y-3">
                    <InputField name="numerocontenedor" label="N° Contenedor"         placeholder="Ej. HLXU4521098" value={formData.numerocontenedor} onChange={handleChange} />
                    <InputField name="precinto"         label="Precinto de Seguridad" placeholder="Ej. PREC-12345"  value={formData.precinto}         onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="tamanioid" label="ID Tamaño"    placeholder="1=20FT 2=40FT" value={formData.tamanioid} onChange={handleChange} type="number" />
                      <InputField name="pesokg"    label="Peso (KG)"    placeholder="Ej. 25000"     value={formData.pesokg}    onChange={handleChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="terminalid"         label="ID Terminal"      placeholder="Ej. 1" value={formData.terminalid}         onChange={handleChange} type="number" />
                      <InputField name="estadocontenedorid" label="ID Estado Físico" placeholder="Ej. 1" value={formData.estadocontenedorid} onChange={handleChange} type="number" />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setErrorMsg(''); }}
                        className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" /> Volver
                      </button>
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex-[2] bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                      >
                        {sending
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <><CheckCircle2 className="w-4 h-4" /> Enviar Guía</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}

          {/* ── HISTORIAL ── */}
          {vistaActiva === 'historial' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Mis últimas guías registradas</h3>
                <button
                  onClick={cargarMisGuias}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {loadingGuias ? (
                <div className="py-10 flex justify-center">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                </div>
              ) : misGuias.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">
                  No tienes guías registradas aún.
                </div>
              ) : (
                <div className="space-y-2">
                  {misGuias.map((g) => {
                    // Manejar distintos nombres que puede usar la API para el número de contenedor
                    const numCont = g.contenedor?.numerocontenedor
                      || g.contenedor?.numero_contenedor
                      || g.numerocontenedor
                      || '—';
                    return (
                      <div
                        key={g.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{g.numeroguia || `GR-${g.id}`}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {g.fechaservicio} · {numCont}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {g.vehiculoverificado ? 'Verificado' : 'Pendiente'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
