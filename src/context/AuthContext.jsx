import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAdmin } from '../api/adminApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    const savedAdmin = localStorage.getItem('neomarket_admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Error restaurando sesión de administrador:', e);
        localStorage.removeItem('neomarket_admin');
      }
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await loginAdmin(email, password);
      const adminData = response.data;
      setAdmin(adminData);
      localStorage.setItem('neomarket_admin', JSON.stringify(adminData));
      return adminData;
    } catch (err) {
      const errorMsg = err.apiMessage || 'Credenciales inválidas o error de conexión';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('neomarket_admin');
  };

  const value = {
    admin,
    isAuthenticated: !!admin,
    cargando,
    error,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
