import axios from 'axios';

/**
 * Cliente Axios centralizado.
 * - baseURL relativa: Vite proxy (dev) y Vercel rewrites (prod) lo llevan a Render.
 * - Cache-Control: no-cache → evita respuestas 304 vacías del navegador.
 */
const api = axios.create({
  baseURL: '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // Forzar respuesta fresca en cada petición — evita el 304 "Not Modified"
    // que devuelve body vacío y rompe el parseo de datos
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Inyectar JWT en cada petición y agregar timestamp anti-caché
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Agregar _t a los params GET para forzar petición nueva siempre
    if (config.method === 'get' || !config.method) {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
