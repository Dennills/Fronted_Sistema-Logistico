import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

/**
 * Decodifica el payload de un JWT sin librerías externas.
 * Útil para extraer el user_id (sub) que la API no retorna explícitamente.
 */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al recargar
  useEffect(() => {
    const token    = localStorage.getItem('access_token');
    const email    = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    const rolid    = localStorage.getItem('rolid');
    const userId   = localStorage.getItem('user_id');

    if (token && rolid) {
      setUser({
        token,
        email,
        username,
        rolid:  parseInt(rolid, 10),
        id:     userId ? parseInt(userId, 10) : null,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data;

      const access_token = data.access_token;
      const userEmail    = data.email;
      const username     = data.username;
      const rolid        = data.rolid;

      // Intentar obtener el ID del usuario:
      // 1) La API lo puede devolver como 'id' o 'user_id'
      // 2) Si no lo devuelve, lo extraemos del payload del JWT (campo 'sub')
      let userId = data.id || data.user_id || null;
      if (!userId && access_token) {
        const payload = decodeJwtPayload(access_token);
        // Supabase pone el UUID del usuario en 'sub'
        // Intentamos también campos numéricos que el backend pueda usar
        userId = payload.user_id || payload.id || payload.sub || null;
      }

      // Persistencia
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('username', username);
      localStorage.setItem('rolid', String(rolid));
      if (userId) localStorage.setItem('user_id', String(userId));

      setUser({
        token:    access_token,
        email:    userEmail,
        username,
        rolid:    parseInt(rolid, 10),
        id:       userId,
      });

      return { success: true, rolid: parseInt(rolid, 10) };
    } catch (error) {
      console.error('Error de autenticación:', error.response?.data || error.message);
      let message = 'Credenciales incorrectas o servidor no disponible.';
      if (error.response?.status === 422) {
        message = 'Formato inválido. Verifica tu correo y contraseña.';
      } else if (error.response?.status === 401) {
        message = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'ERR_NETWORK') {
        message = 'No se puede conectar con el servidor.';
      }
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
};
