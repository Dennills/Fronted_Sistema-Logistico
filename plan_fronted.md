# PROMPT MAESTRO: Reconstrucción y Adaptación de Interfaces por Roles — FRONT_PERENE

 Vamos a reconstruir y adaptar las pantallas internas por roles del proyecto "FRONT_PERENE" para conectarlas de forma definitiva con nuestra API REST en producción alojada en:
 `https://api-rest-sistema-logistico.onrender.com/`

---

## 🚨 REGLAS ABSOLUTAS DE ARQUITECTURA E INTERACTIVIDAD

1. **NO TOCAR LA PANTALLA DE LOGIN:** La lógica de autenticación actual y la pantalla de Login ya funcionan perfectamente. Debes mantenerlas intactas. Trabajaremos únicamente en los módulos y dashboards internos de cada rol una vez iniciada la sesión.
2. **RESPONSIVIDAD DEL CONDUCTOR (HÍBRIDO PC/MÓVIL):** El panel del Conductor ya no debe estar encerrado en un contenedor rígido de teléfono. Debe usar un layout responsivo (Desktop-First / Mobile-Friendly) basado en grids de Tailwind (`grid grid-cols-1 md:grid-cols-3`). Si se proyecta en la PC de escritorio de la universidad debe verse amplio y profesional, pero si se achica la ventana debe adaptarse fluidamente a formato móvil.
3. **CRUD 100% FUNCIONAL EN MEMORIA (FAILSAFE):** Para asegurar que el sistema sea totalmente interactivo durante la sustentación ante el jurado, todos los componentes deben realizar operaciones CRUD reales en vivo. Si la API en la nube falla, tarda en responder o devuelve arreglos vacíos, debes atrapar el error (`catch`) y operar directamente sobre variables de estado locales (espejo) inicializadas con la data Mock del prototipo.
   - Si el Conductor registra una guía, esta debe insertarse al inicio del listado inmediatamente y actualizar el contador quincenal.
   - Si el Admin valida o anula una guía, el estado visual de esa fila debe mutar y actualizarse en tiempo real en la pantalla.
   - Si el Cajero cierra una quincena, el estado debe cambiar visualmente.

---

## 🛠️ COMPONENTES A IMPLEMENTAR / MODIFICAR

### 1. CAPA DE SERVICIOS (`src/services/apiService.js`)
- Configura las llamadas HTTP hacia la URL base: `https://api-rest-sistema-logistico.onrender.com/api`.
- Inicializa arreglos globales mutables (`let MOCK_GUIAS`, `let MOCK_LIQUIDACIONES`) con datos del prototipo (Conductores reales: R. Huanca, J. Quispe, C. Flores, M. Torres).
- Implementa y exporta las siguientes funciones con manejo de errores `try/catch` de contingencia:
  - `getConductores()`: Si falla la API, devuelve la lista con los 4 choferes, sus placas habituales y estados de actividad.
  - `getAuxiliares()`: Devuelve los catálogos para los formularios (Empresas: Perene, GKO, Pao Cargo; Destinos fijos: IMUPESA / IMUPESA VACÍOS; Configuración: 1x20, 2x20, 1x40; Servicios: Lleno, Vacío, Retiro, Devolución).
  - `getGuias()` / `createGuia(data)`: Si falla la conexión, realiza un `.unshift()` en el arreglo local de MOCK_GUIAS simulando la inserción exacta (normalizando el contenedor a mayúsculas y sin caracteres raros) y devuelve un flag de éxito junto al correlativo simulado (Ej: `G-000004`).
  - `updateEstadoGuia(id, nuevoEstado, motivo)`: Cambia el campo `estado` de la guía en memoria local.
  - `getLiquidaciones()`: Devuelve las sábanas de cálculo financiero quincenal.

### 2. PANEL DEL CONDUCTOR (`src/pages/driver/DriverPanel.jsx`)
- **Header Adaptable:** Muestra datos fijos del chofer logueado ("R. Huanca • Unidad: ABC-123") y dos botones superiores tipo pestañas: `"📋 Mis Guías"` y `"➕ Registrar Nueva"`.
- **Pestaña "Mis Guías":** Un buscador de texto en tiempo real y un Grid responsivo de tarjetas que muestre: número de guía, ruta completa, contenedor, precinto, peso, tipo de operación, estado de carga y tag de estado (`REGISTRADA` / `VALIDADA` / `ANULADA`). Incluye un banner con el contador dinámico de guías registradas en la quincena.
- **Pestaña "Nueva Guía":** Formulario estético utilizando `<input type="date">` nativos del sistema operativo para Fecha de Emisión e Inicio de Traslado. Inputs para Empresa, Placa, Contenedor, Precinto, Peso (numérico) y selectores interactivos para Operación (Embarque/Descarga) y Estado de Carga. Al enviar con éxito, dispara una alerta/modal visual, inyecta la guía en el estado en memoria y redirige automáticamente al listado.

### 3. PANEL DEL CAJERO (`src/pages/cashier/CashierPanel.jsx`)
- **Control de Cierre:** Interfaz panorámica de escritorio con selectores superiores para Mes, Año y Quincena (1ra o 2da).
- **Tabla Financiera:** Muestra las liquidaciones de los conductores detallando: Conductor, Empresa, Nº de guías contadas, Tarifa base, Bonos adicionales, Descuentos aplicados y el Total Neto Calculado a pagar.
- **Acciones Vivas:** 
  - Botón "Cerrar Quincena": Al pulsarlo, cambia el estado visual de esa liquidación de `ABIERTA` a `CERRADA` mediante un badge dinámico de Tailwind.
  - Botón "Exportar a Excel": Simula el streaming de descarga mostrando un aviso estético de procesamiento.
- **Auditoría Interna:** Al hacer clic en la fila de cualquier conductor, abre un modal o panel lateral (Drawer) que renderice la lista exacta de guías de remisión que componen y justifican esa suma de dinero para resolver reclamos.

### 4. PANEL DEL ADMINISTRADOR (`src/pages/admin/AdminPanel.jsx`)
- **Métricas KPI:** 3 tarjetas superiores con contadores dinámicos (Guías Registradas Hoy, Conductores en Ruta, Monto por Liquidar).
- **Tabla Maestra Global:** Listado total de guías del sistema con filtros combinados por rango de fechas y conductor. Cada fila de la tabla debe contar con dos botones de acción CRUD inmediatos:
  - Botón `[Verificar]`: Al darle clic, transmuta el estado de la guía a `VALIDADA` en la interfaz al instante (badge verde).
  - Botón `[Anular]`: Abre un prompt o pequeño modal integrado que solicita obligatoriamente ingresar un "Motivo de anulación". Al confirmar, actualiza el estado a `ANULADA` (badge rojo) e indexa el motivo en el detalle, manteniendo la fila visible en el registro histórico.
- **Trazabilidad de Contenedor:** Sección independiente con un buscador exacto por número de contenedor. Al ingresar un código (Ej: `TCKU3456789`), dibuja un Timeline vertical cronológico e interactivo que muestre todos los movimientos históricos (Fechas, choferes, rutas y estados) por los que ha pasado ese contenedor en el sistema.

---

## 🎨 REQUERIMIENTOS ESTÉTICOS Y TÉCNICOS
- Usa hooks estándar (`useState`, `useEffect`) para controlar los estados mutables espejo.
- Estiliza con Tailwind CSS moderno utilizando esquinas muy redondeadas (`rounded-2xl`), sombras suaves (`shadow-sm`), transiciones de color en los botones (`transition-all duration-200`) y fuentes legibles de gran tamaño para el jurado.
- Asegura que el flujo completo de botones sea interactivo y reactivo en todo momento.