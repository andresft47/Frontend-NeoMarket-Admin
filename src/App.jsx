import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Compras from './pages/Compras';
import Inventario from './pages/Inventario';
import Pedidos from './pages/Pedidos';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route without Sidebar / Header */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes wrapped inside AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/pedidos" element={<Pedidos />} />
          </Route>
          
          {/* Catch-all route to redirect back to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

