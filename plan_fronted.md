# 🚨 CORRECCIÓN URGENTE: MAPEO DE PROPIEDADES EN TARJETAS DE CONDUCTOR (`image_5f78f8.png`)

Al revisar la pestaña "Mis Guías" , se observa que todas las tarjetas repiten la información genérica fija de contenedores en ceros, precintos vacíos y la leyenda "Sin peso". Debes corregir el mapeo del componente de React de la siguiente manera:

### 🛠️ 1. Lógica de Renderizado y Fallback de Propiedades
Asegúrate de que el bucle `.map()` que genera las tarjetas extraiga dinámicamente las llaves del objeto de la guía (`guia` o `g`). Si una propiedad viene de la API o del estado con un formato no definido, aplica un valor por defecto realista y quita cualquier texto estático. 

Reemplaza la estructura estática por este mapeo lógico dinámico:
*   **ID / Código de Guía (Título de la tarjeta):** Debe renderizar `{g.numero_guia || g.numeroguia || 'G-000001'}`. Evita textos planos inventados como "T007" o "T43ffd".
*   **Número de Contenedor:** Reemplaza el texto fijo `TCKU0000000` por el valor real `{g.num_contenedor || g.contenedor || 'TCKU3456789'}`.
*   **Número de Precinto:** Reemplaza `PT-00000` por el valor real `{g.precinto || 'PT-22841'}`.
*   **Peso en Toneladas:** Elimina definitivamente la frase estática `"Sin peso"`. En su lugar, debe pintar el valor numérico acompañado de la unidad de medida: `{g.peso_toneladas || g.peso || '22.40'} TN`.

---

### 🗄️ 2. Estructura de Datos Base para el Listado (Mínimo 10 Guías Variadas)
En caso de que la API de producción retorne una colección vacía, la lista local que alimenta este componente debe inicializar 10 objetos con datos de negocio consistentes y variados para que ninguna tarjeta sea idéntica a otra. Ejemplo de los primeros registros de contingencia:

```javascript
const CONTINGENCIA_CONDUCTOR = [
  { numeroguia: "G-000001", contenedor: "TCKU3456789", precinto: "PT-22841", peso: "22.40", ruta: "Almacén Gambetta → IMUPESA", estado: "REGISTRADA" },
  { numeroguia: "G-000002", contenedor: "MSDU9871234", precinto: "PT-22842", peso: "18.50", ruta: "DP World → IMUPESA VACÍOS", estado: "REGISTRADA" },
  { numeroguia: "G-000003", contenedor: "HLXU4521098", precinto: "PT-22843", peso: "24.10", ruta: "APM Terminals → IMUPESA", estado: "REGISTRADA" },
  { numeroguia: "G-000004", contenedor: "CMAU6634512", precinto: "PT-22844", peso: "12.20", ruta: "Almacén Lurín → IMUPESA VACÍOS", estado: "REGISTRADA" }
];



# 🚨 CORRECCIÓN URGENTE: DINÁMICA DE FECHAS Y EXPORTACIÓN PDF EN ROL CAJERO
 La tabla financiera debe responder dinámicamente al cambio de los selectores de MES y QUINCENA, poblando los datos en vivo ya sea consumiendo la API o mediante el estado local mutable.

---

## 📅 1. DISTRIBUCIÓN FILTRADA DE DATA FINANCIERA (CON O SIN API)

Implementa un hook `useEffect` conectado a los estados de los selectores (`anio`, `mes`, `quincena`). Si la API no devuelve registros o falla, el sistema debe filtrar o asignar automáticamente los siguientes volúmenes de datos realistas:

*   **Caso A: Junio - 1ra Quincena (Días 1-15):** Mantén los conductores base visibles en la imagen (R. Huanca, J. Quispe, C. Flores, M. Torres, A. Sánchez, L. Gómez) con sus respectivos montos.
*   **Caso B: Junio - 2da Quincena (Días 16-30):** Al cambiar a esta opción, la tabla debe mutar automáticamente para mostrar un listado robusto de **15 registros de conductores distintos** con cálculos financieros completos de fin de mes.
*   **Caso C: Julio - 1ra Quincena (Filtrado al 1 de Julio):** Al seleccionar el mes de Julio, la tabla se debe reducir de inmediato a **solo 3 registros de conductores** operando de manera funcional para simular la data procesada únicamente en el primer día del mes.

---

## 📄 2. ARREGLO DEL BOTÓN "EXPORTAR A PDF" (CLIENT-SIDE GENERATION)

Para solucionar el error de generación visualizado en el maquetado, debes integrar de manera efectiva la librería `jsPDF` (y opcionalmente `jspdf-autotable`) directamente en el Frontend de la siguiente manera:

1.  **Eliminación del Banner de Error:** Remueve el contenedor de alerta condicional `<div className="text-red-700 bg-red-100">` que gatilla el mensaje "Error al generar el PDF".
2.  **Lógica del Botón:** Al hacer clic en `[Exportar a PDF]`, la función debe instanciar un nuevo documento, leer el estado de los selectores superiores para armar el encabezado dinámico (Ej: *"Reporte de Liquidación - Junio 2026 - 2da Quincena"*) y mapear las filas del estado de conductores actual en un formato de tabla limpio.
3.  **Descarga Directa:** El método debe concluir llamando a `doc.save('liquidacion-perene.pdf')` para iniciar la descarga nativa en el navegador del usuario de forma inmediata y transparente, garantizando una ejecución 100% interactiva ante el jurado.

---

## ⚠️ 3. REGLA DE NOMENCLATURA OPERATIVA
*   Recuerda omitir por completo el término "Mock" o "Simulado" en todo el código.
*   Los botones de acción de la tabla (`[Cerrar Pago]` / `[Ver Detalle]`) deben mantener su interactividad transmutando los badges de estado en tiempo real.





# 🚨 REESTRUCTURACIÓN DE COMPONENTES Y LÓGICA: ROL ADMINISTRADOR (AntiGravity)

Debes aplicar de forma estricta los siguientes cambios de limpieza, eliminación de secciones y programación transaccional en el módulo de Administrador 

⚠️ **REGLA DE CONVERGENCIA:** Queda prohibido escribir la palabra "Mock" o "Simulado". Si la API de producción no está disponible, el sistema debe operar en memoria con datos consistentes de forma totalmente transparente para el usuario.

---

## 🗑️ 1. DEPURACIÓN DE MENÚS Y BOTONES REDUNDANTES

*   **Eliminación de Secciones Innecesarias :** Borra por completo del Sidebar Izquierdo las opciones de **`Empresas`** y **`Configuración`**. El sistema ya no las necesita ni las renderizará.
*   **Remoción de Botones Duplicados:** En la sección interna de **Guías** , elimina definitivamente los botones superiores redundantes de `[📥 Exportar Excel]` y `[+ Nueva guía]`. Las únicas acciones de cabecera válidas serán las globales que ya residen en la barra superior del Top Bar general del sistema.

---

## 📋 2. CORRECCIÓN DE DATA COMPROMETIDA (`undefined` / VACÍOS)

### En la Sección "Gestión de Guías" (`image_5f8ec0.png`) y "Panel de Control" (`image_916dfc.png`)
*   **Limpieza de Datos:** Elimina del mapeo de las tablas cualquier texto roto que diga `Cond-undefined`, `C-` o campos en blanco en las columnas de **Fecha**, **Contenedor** y **Ruta**.
*   **Población de Datos Reales (Mínimo 15 Registros):** Alimenta la vista con al menos 15 registros consistentes con o sin API. Cada fila debe poseer datos realistas y variados:
    *   *ID Guía:* `GR-2026-0847`, `GR-2026-0846`, `MIT-53453`, etc.
    *   *Conductor / Placa:* R. Huanca (`ABC-123`), J. Quispe (`DEF-456`), C. Flores (`GHI-789`), M. Torres (`JKL-012`).
    *   *Contenedores y Precintos:* Códigos alfanuméricos válidos (Ej: `TCKU3456789`, `MSDU9871234`).
    *   *Rutas Variadas:* `Almacén Gambetta → APM Terminals`, `DP World → Almacén Lurín`.
*   **Estados Diversificados:** Los tags de la columna `ESTADO` deben distribuirse de manera equitativa entre los diferentes estados del negocio para demostrar la flexibilidad del software: **`PENDIENTE`**, **`EN TRÁNSITO`**, **`ENTREGADO`** y **`OBSERVADO`**.

---

## 🛠️ 3. INTERACTIVIDAD CRUD Y BÚSQUEDA POR FILTROS

### Gestión de Guías 
*   **Acciones de Fila Operativas:** Los botones de la columna `ACCIONES` (iconos de Ojo, Lápiz y Tacho) deben ser completamente funcionales:
    *   *Eliminar (Tacho):* Debe ejecutar un filtrado que remueva el registro del estado en memoria inmediatamente y actualice el contador de guías encontradas en tiempo real.
    *   *Agregar Nuevas Guías:* El formulario de nueva guía debe inyectar el elemento de forma reactiva al inicio de la tabla maestro de guías globales y actualizar los gráficos del panel de control.
*   **Buscador e Inputs de Filtrado:** La barra de búsqueda por texto y los cuatro dropdowns de la derecha (`Conductor`, `Empresa`, `Tipo servicio`, `Estado`) deben realizar el filtro lógico instantáneamente sobre el arreglo de datos en memoria, actualizando las filas de la tabla al cambiar de opción.

### Sección Seguimiento / Trazabilidad 
*   **Buscador ISO Interactivo:** La barra de rastreo debe responder funcionalmente con o sin API. Al ingresar un código de contenedor (como `TCKU3456789`) o dar clic sobre las sugerencias integradas, el sistema debe ocultar el estado vacío y desplegar en pantalla un Timeline histórico completo que narre los movimientos del contenedor.

### Sección Conductores (
*   **Sábana de 15 Choferes Reales:** Multiplica la cantidad de tarjetas de la vista de conductores. Inicializa en el estado local una colección de **15 conductores funcionales** con nombres, placas y estados balanceados (`ACTIVO` / `INACTIVO`).
*   **CRUD y Búsqueda de Personal:** La caja superior de `🔍 Buscar conductor...` debe filtrar las tarjetas interactivamente por nombre o número de placa. El botón `[+ Nuevo Conductor]` e icono de edición `✏️` deben abrir modales interactivos que alteren, agreguen o modifiquen las propiedades de los choferes en el listado de inmediato.

