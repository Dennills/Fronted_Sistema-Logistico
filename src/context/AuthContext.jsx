import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializar estado de autenticación desde el almacenamiento local
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    const rolid = localStorage.getItem('rolid');
    const userId = localStorage.getItem('user_id'); // Útil para inyectar en las peticiones

    if (token && rolid) {
      setUser({
        token,
        email,
        username,
        rolid: parseInt(rolid, 10),
        id: parseInt(userId, 10) || 1, // Simulando que el backend devuelve un ID de usuario/conductor
      });
    }
    setLoading(false);
  }, []);

  /**
   * Función estricta para realizar Login contra la API.
   * Valida credenciales e interactúa con POST /api/auth/login
   */
  const login = async (email, password) => {
    try {
      // POST /api/auth/login con estructura validada
      const response = await api.post('/api/auth/login', { email, password });
      
      const { access_token, email: userEmail, username, rolid, id } = response.data;

      // Persistencia global
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('username', username);
      localStorage.setItem('rolid', rolid);
      if (id) localStorage.setItem('user_id', id);

      setUser({
        token: access_token,
        email: userEmail,
        username,
        rolid: parseInt(rolid, 10),
        id: id || 1
      });

      return { success: true, rolid };
    } catch (error) {
      console.error('Error de autenticación:', error);
      // Extraer mensaje de error 422 si existe
      let message = 'Error en las credenciales o conexión al servidor.';
      if (error.response?.status === 422) {
        message = 'Datos inválidos. Por favor, revisa el formato del correo y contraseña.';
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
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
