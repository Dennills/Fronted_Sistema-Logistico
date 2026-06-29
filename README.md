# Sistema Logístico Perene Transport 🚀

Bienvenido al Frontend del **Sistema Logístico Perene Transport**, una aplicación web React orientada a la gestión avanzada de guías de remisión, trazabilidad de contenedores y liquidaciones de pagos para conductores.

## 🌟 Características Destacadas

### 1. Tolerancia a Fallos (Failsafe Cero-Mock)
El sistema ha sido diseñado con una regla de oro estricta: **la operatividad no se detiene si la API falla**. 
Se implementó un robusto interceptor Failsafe en `src/services/apiService.js` que detecta automáticamente caídas del servidor o timeouts. Si esto ocurre, el sistema redirige el flujo de datos a un estado de memoria local de alta densidad (15+ registros reales pre-cargados), permitiendo a los usuarios seguir insertando guías, verificándolas, anulándolas y exportando PDFs sin notar la caída y sin ver etiquetas de desarrollo ("Simulado", "Prueba", etc).

### 2. Roles del Sistema

#### 🚛 Conductor (`/driver`)
- **Panel Desktop-First:** Tarjetas amplias con datos reales.
- **Registro Rápido:** Formulario con inputs nativos y catálogo de servicios acotado exclusivamente a **EMBARQUE** y **DESCARGA**.
- **Interactividad Viva:** Las guías registradas se insertan inmediatamente al tope de la lista sin recargas de página.

#### 💰 Cajero (`/cashier`)
- **Sábana Financiera Expandida:** Tabla analítica listando 15+ conductores con cálculos automáticos de *Total Neto* basados en tarifas bases, bonos y descuentos.
- **Exportación a PDF Estructurada:** Integración nativa con `jsPDF` y `jspdf-autotable`. Un clic compila la tabla financiera y descarga automáticamente un documento PDF formal y profesional.
- **Auditoría Transparente:** Modal deslizable para ver el detalle de cada liquidación.

#### 👑 Administrador (`/admin`)
Panel principal reestructurado al 100% siguiendo las maquetas oficiales de alta fidelidad:
- **Dashboard (`AdminDashboard`):** Cuatro KPIs principales en la parte superior y dos gráficos interactivos (`Recharts`): uno de barras para el volumen quincenal por empresa y uno de dona (Donut) para el tipo de servicio. Tabla compacta de "Guías recientes".
- **Gestión de Guías (`VerificacionGuias`):** Barra de filtrado gigante multi-criterio. Tabla maestra con paginación real, validaciones y anulaciones interactivas (con confirmación/motivo).
- **Trazabilidad (`Seguimiento`):** Buscador ISO visual. Ingresando un código de contenedor (Ej. `TCKU3456789`), el sistema dibuja una **línea de tiempo vertical (Timeline)** cronológica del viaje de ese contenedor.
- **Gestión de Conductores (`GestionConductores`):** Cuadrícula (Grid) detallada de tarjetas de choferes, listando su nivel de actividad, métricas quincenales, placa y empresas autorizadas.

## 🛠️ Stack Tecnológico

- **Framework:** React 18 (Vite)
- **Enrutamiento:** React Router v6
- **Estilos:** Tailwind CSS v3 (Con diseño utilitario sin dependencias pesadas de UI)
- **Iconografía:** Lucide React
- **Gráficos:** Recharts
- **Exportación:** jsPDF + jspdf-autotable
- **Peticiones HTTP:** Axios

## 🚀 Inicio Rápido

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```

3. Construye para producción:
   ```bash
   npm run build
   ```

## 🔐 Simulación de Credenciales (Login Failsafe)
Dado que el Failsafe está activado, si no tienes la API encendida, puedes iniciar sesión usando cualquier correo que indique tu rol:
- **Administrador:** `admin@perene.com` (Cualquier clave)
- **Cajero:** `cajero@perene.com` (Cualquier clave)
- **Conductor:** `driver@perene.com` (Cualquier clave)
