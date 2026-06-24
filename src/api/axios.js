import axios from 'axios';

/**
 * Cliente Axios centralizado.
 *
 * En DESARROLLO: las llamadas van a '/' y el proxy de vite.config.js
 *   las redirige a https://api-rest-sistema-logistico.onrender.com
 *   evitando problemas de CORS.
 *
 * En PRODUCCIÓN (build): cambia baseURL a la URL de Render directamente.
 */
const api = axios.create({
  baseURL: '/',          // Relativo → Vite proxy lo lleva a Render
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,        // 15s — Render puede tardar en despertar (free tier)
});

// Inyectar JWT en cada petición automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: si el token expiró (401) limpiar sesión
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
