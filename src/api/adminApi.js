import axios from 'axios';

/**
 * Instancia centralizada de Axios para el panel de administración.
 * baseURL apunta a /api/admin, que Vite redirige al backend (localhost:8080).
 */
const api = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de errores global
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message ||
      'Error desconocido';
    error.apiMessage = typeof msg === 'string' ? msg : JSON.stringify(msg);
    console.error('Admin API Error:', error.apiMessage);
    return Promise.reject(error);
  }
);

// ── AUTH ──────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  api.post('/login', { email, password });

// ── DASHBOARD ────────────────────────────────────────
export const getEstadoTienda = () => api.get('/estado-tienda');
export const getResumenHoy   = () => api.get('/compras/resumen-hoy');

// ── CLIENTES ─────────────────────────────────────────
export const getClientes = () => api.get('/clientes');

// ── COMPRAS ──────────────────────────────────────────
export const getCompras = () => api.get('/compras');

// ── INVENTARIO ───────────────────────────────────────
export const getInventario = () => api.get('/inventario');
export const getStockBajo  = () => api.get('/inventario/stock-bajo');

// ── PREDICCIONES / IA ────────────────────────────────
export const getPrediccionCliente = (clienteId) =>
  api.get(`/predicciones/cliente/${clienteId}`);

export const getPedidosSugeridos = () =>
  api.get('/predicciones/pedidos-sugeridos');

export const getMasVendidos = (top = 10) =>
  api.get('/predicciones/mas-vendidos', { params: { top } });

export default api;
