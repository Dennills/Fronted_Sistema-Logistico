import api from '../api/axios';

// ─────────────────────────────────────────────────────────────
//  GUÍAS — Endpoints reales confirmados por el OpenAPI JSON
// ─────────────────────────────────────────────────────────────

/**
 * Registra una nueva guía de remisión con su contenedor anidado.
 * POST /api/guias/
 */
export const crearGuia = (payload) => api.post('/api/guias/', payload);

/**
 * Lista todas las guías. Acepta filtros opcionales por query params.
 * GET /api/guias/?rolid={rolid}&conductorid={id}&fecha_inicio=&fecha_fin=
 */
export const getGuias = (params = {}) => api.get('/api/guias/', { params });

/**
 * Dar visto bueno (verificar) a una guía. Solo para rolid=1 (Admin).
 * PATCH /api/guias/{guiaid}/verificar?rolid=1
 */
export const verificarGuia = (guiaid, usuarioverificador, rolid) =>
  api.patch(
    `/api/guias/${guiaid}/verificar`,
    { usuarioverificador },
    { params: { rolid } }
  );

// ─────────────────────────────────────────────────────────────
//  LIQUIDACIONES — Endpoints reales confirmados
// ─────────────────────────────────────────────────────────────

/**
 * Previsualizar guías pendientes de un conductor en un rango de fechas.
 * GET /api/liquidaciones/previsualizar?conductorid=&fecha_inicio=&fecha_fin=
 */
export const previsualizarLiquidacion = (params) =>
  api.get('/api/liquidaciones/previsualizar', { params });

/**
 * Procesar cierre quincenal de liquidación.
 * POST /api/liquidaciones/procesar
 * Body: LiquidacionProcesarRequest { conductorid, empresaid, periodoinicio, periodofin, cerradopor, guias_ids[] }
 */
export const procesarLiquidacion = (payload) =>
  api.post('/api/liquidaciones/procesar', payload);
