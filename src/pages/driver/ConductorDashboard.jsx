import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crearGuia, getGuias } from '../../services/apiService';
import {
  CheckCircle2, ChevronRight, AlertCircle, ArrowLeft,
  Truck, Package, ClipboardList, RefreshCw, AlertTriangle,
} from 'lucide-react';

// ─── CRÍTICO: InputField FUERA del componente para evitar pérdida de foco ───
const InputField = ({ name, label, type = 'text', placeholder, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} autoComplete="off"
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
  const [vistaActiva, setVistaActiva] = useState('historial'); // ← Abre HISTORIAL por defecto

  const [misGuias, setMisGuias]             = useState([]);
  const [loadingGuias, setLoadingGuias]     = useState(true); // ← true desde el inicio
  const [errorGuias, setErrorGuias]         = useState(null);

  // ── Carga automática al montar el componente ──────────────────
  async function cargarMisGuias() {
    setLoadingGuias(true);
    setErrorGuias(null);
    try {
      // IMPORTANTE: el ID del conductor en Supabase es un UUID (string),
      // pero la API espera conductorid como entero.
      // Solución: llamar sin conductorid — el backend usa el token JWT
      // para identificar al conductor y filtrar sus guías.
      const res = await getGuias({});
      setMisGuias(normalizeList(res.data));
    } catch (err) {
      const status = err.response?.status;
      let msg = 'No se pudo cargar tus guías.';
      if (status === 401) msg = 'Sesión expirada. Vuelve a iniciar sesión.';
      else if (status === 403) msg = 'Sin permiso para ver guías.';
      else if (!err.response)  msg = 'Sin conexión al servidor.';
      setErrorGuias(msg);
    } finally {
      setLoadingGuias(false);
    }
  }

  // Cargar historial automáticamente al entrar al módulo
  useEffect(() => {
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
    const campos = ['numeroguia', 'empresaid', 'vehiculoid', 'tiposervicioid', 'origenid', 'destinoid', 'fechaservicio', 'pesotoneladas'];
    if (campos.some(k => !formData[k]?.toString().trim())) {
      setErrorMsg('Completa todos los campos del Paso 1 para continuar.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const campos = ['numerocontenedor', 'precinto', 'tamanioid', 'pesokg', 'terminalid', 'estadocontenedorid'];
    if (campos.some(k => !formData[k]?.toString().trim())) {
      setErrorMsg('Completa todos los datos del contenedor antes de enviar.');
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

    // user.id del JWT de Supabase es un UUID (string).
    // La API necesita conductorid e registradopor como enteros.
    // Si no tenemos el ID numérico guardado, usamos 1 como fallback temporal.
    // TODO: cuando el backend devuelva el id numérico en el login, actualizar aquí.
    const numericId = parseInt(localStorage.getItem('numeric_conductor_id') || '1', 10);

    const payload = {
      numeroguia:     formData.numeroguia.trim(),
      conductorid:    numericId,
      vehiculoid:     parseInt(formData.vehiculoid),
      empresaid:      parseInt(formData.empresaid),
      tiposervicioid: parseInt(formData.tiposervicioid),
      origenid:       parseInt(formData.origenid),
      destinoid:      parseInt(formData.destinoid),
      pesotoneladas:  parseFloat(formData.pesotoneladas),
      estadoid:       1,
      fechaservicio:  formData.fechaservicio,
      registradopor:  numericId,
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
      // Recargar historial automáticamente tras crear
      setTimeout(async () => {
        setSuccess(false);
        await cargarMisGuias();
        setVistaActiva('historial');
      }, 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 422) {
        setErrorMsg(`Validación: ${Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Revisa los campos.'}`);
      } else if (err.response?.status === 401) {
        setErrorMsg('Sesión expirada. Por favor vuelve a iniciar sesión.');
      } else {
        setErrorMsg('No se pudo conectar con el servidor.');
      }
    } finally {
      setSending(false);
    }
  };

  const getNumCont = (g) =>
    g.contenedor?.numerocontenedor || g.contenedor?.numero_contenedor ||
    g.contenedor?.numero || g.numerocontenedor || null;

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
            { id: 'historial', icon: ClipboardList, label: 'Mis Guías' },
            { id: 'form',      icon: Package,       label: 'Nueva Guía' },
          ].map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                vistaActiva === tab.id ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0 p-5">

          {/* ── HISTORIAL (tab por defecto) ── */}
          {vistaActiva === 'historial' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Mis guías registradas</h3>
                <button onClick={cargarMisGuias}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {errorGuias && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {errorGuias}
                </div>
              )}

              {loadingGuias ? (
                <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  <span className="text-sm">Cargando guías…</span>
                </div>
              ) : misGuias.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No tienes guías registradas aún.</p>
                  <p className="text-xs mt-1">Usa "Nueva Guía" para registrar tu primera ruta.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {misGuias.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{g.numeroguia || `GR-${g.id}`}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {g.fechaservicio || '—'} · {getNumCont(g) || 'Sin contenedor'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        g.vehiculoverificado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {g.vehiculoverificado ? '✓ Verificado' : '⏳ Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FORMULARIO ── */}
          {vistaActiva === 'form' && (
            <>
              <div className="flex items-center mb-5">
                {[{ n: 1, label: 'Datos del Viaje' }, { n: 2, label: 'Contenedor' }].map(({ n, label }, i) => (
                  <React.Fragment key={n}>
                    <div className={`flex items-center gap-1.5 ${step >= n ? 'text-slate-900' : 'text-slate-400'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        step >= n ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                      }`}>{n}</div>
                      <span className="text-xs font-semibold hidden sm:block">{label}</span>
                    </div>
                    {i < 1 && <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${step === 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                  </React.Fragment>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                </div>
              )}
              {success && (
                <div className="mb-4 flex items-start gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> ¡Guía registrada! Redirigiendo al historial…
                </div>
              )}

              <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                {step === 1 && (
                  <div className="space-y-3">
                    {/* Aviso sobre el ID numérico del conductor */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                      ⚠️ <strong>ID Conductor numérico:</strong> Ingresa el ID entero de tu cuenta en la tabla <code>conductores</code> de la base de datos (no el UUID de Supabase).
                    </div>
                    <InputField
                      name="_conductorid_num"
                      label="Mi ID de Conductor (numérico)"
                      placeholder="Ej. 1, 2, 3..."
                      type="number"
                      value={localStorage.getItem('numeric_conductor_id') || ''}
                      onChange={(e) => {
                        localStorage.setItem('numeric_conductor_id', e.target.value);
                        // Forzar re-render sin usar state para no perder foco
                        document.getElementById('conductor-id-display').textContent = e.target.value || '—';
                      }}
                    />
                    <p className="text-xs text-slate-400">
                      ID guardado: <span id="conductor-id-display" className="font-semibold text-slate-600">{localStorage.getItem('numeric_conductor_id') || '—'}</span>
                    </p>
                    <InputField name="numeroguia"    label="N° Guía Transportista"  placeholder="Ej. T001-000456"     value={formData.numeroguia}    onChange={handleChange} />
                    <InputField name="empresaid"     label="ID Empresa"             placeholder="Ej. 1"               value={formData.empresaid}     onChange={handleChange} type="number" />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="vehiculoid"     label="ID Vehículo"    placeholder="Ej. 1"           value={formData.vehiculoid}     onChange={handleChange} type="number" />
                      <InputField name="tiposervicioid" label="ID Tipo Serv."  placeholder="1=Lleno 2=Vacío" value={formData.tiposervicioid} onChange={handleChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="origenid"  label="ID Origen"  placeholder="Ej. 1" value={formData.origenid}  onChange={handleChange} type="number" />
                      <InputField name="destinoid" label="ID Destino" placeholder="Ej. 2" value={formData.destinoid} onChange={handleChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="fechaservicio" label="Fecha Servicio"    value={formData.fechaservicio}  onChange={handleChange} type="date" />
                      <InputField name="pesotoneladas" label="Peso (Toneladas)"  placeholder="Ej. 5.5"          value={formData.pesotoneladas} onChange={handleChange} type="number" />
                    </div>
                    <button type="button" onClick={nextStep}
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <InputField name="numerocontenedor" label="N° Contenedor"         placeholder="Ej. HLXU4521098" value={formData.numerocontenedor} onChange={handleChange} />
                    <InputField name="precinto"         label="Precinto de Seguridad" placeholder="Ej. PREC-12345"  value={formData.precinto}         onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="tamanioid" label="ID Tamaño"   placeholder="1=20FT 2=40FT" value={formData.tamanioid} onChange={handleChange} type="number" />
                      <InputField name="pesokg"    label="Peso (KG)"   placeholder="Ej. 25000"     value={formData.pesokg}    onChange={handleChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField name="terminalid"         label="ID Terminal"      placeholder="Ej. 1" value={formData.terminalid}         onChange={handleChange} type="number" />
                      <InputField name="estadocontenedorid" label="ID Estado Físico" placeholder="Ej. 1" value={formData.estadocontenedorid} onChange={handleChange} type="number" />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="button" onClick={() => { setStep(1); setErrorMsg(''); }}
                        className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" /> Volver
                      </button>
                      <button type="submit" disabled={sending}
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
        </div>
      </div>
    </div>
  );
}
