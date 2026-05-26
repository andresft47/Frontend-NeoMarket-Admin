import React, { useState, useEffect } from 'react';
import { 
  getEstadoTienda, 
  getResumenHoy, 
  getMasVendidos, 
  getCompras 
} from '../api/adminApi';
import KpiCard from '../components/KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';

/* ── SVG Icons ── */
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconWarning = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [masVendidos, setMasVendidos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setCargando(true);
      setError('');
      
      const [resKpi, resVendidos, resCompras] = await Promise.allSettled([
        getEstadoTienda(),
        getMasVendidos(5),
        getCompras()
      ]);

      let kpiFailed = true;
      let comprasFailed = true;

      if (resKpi.status === 'fulfilled') {
        setKpis(resKpi.value.data);
        kpiFailed = false;
      } else {
        console.error('Error loading KPIs:', resKpi.reason);
      }

      if (resVendidos.status === 'fulfilled') {
        setMasVendidos(resVendidos.value.data || []);
      } else {
        console.error('Error loading top products:', resVendidos.reason);
        setMasVendidos([]);
      }

      if (resCompras.status === 'fulfilled') {
        let data = resCompras.value.data;
        if (!Array.isArray(data)) {
          data = data?.content || [];
        }
        if (!Array.isArray(data)) {
          console.error("La respuesta de compras no es un array:", resCompras.value.data);
          data = [];
        }
        setCompras(data);
        comprasFailed = false;
      } else {
        console.error('Error loading purchases history:', resCompras.reason);
        setCompras([]);
      }

      if (kpiFailed && comprasFailed) {
        setError('No se pudo conectar con el servidor para obtener los datos esenciales del dashboard.');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al conectar con el servidor. Por favor, intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process sales over time data (grouped by date) for Area Chart
  const salesHistoryData = React.useMemo(() => {
    if (!Array.isArray(compras) || compras.length === 0) return [];
    
    const grouped = {};
    compras.forEach(c => {
      if (!c.fecha) return;
      let dateStr = '';
      if (Array.isArray(c.fecha)) {
        const [year, month, day] = c.fecha;
        dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        dateStr = String(c.fecha).split('T')[0];
      }
      grouped[dateStr] = (grouped[dateStr] || 0) + (c.total || 0);
    });

    return Object.keys(grouped)
      .sort()
      .slice(-7)
      .map(date => {
        const parts = date.split('-');
        const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
        return {
          fecha: displayDate,
          Ventas: Math.round(grouped[date] * 100) / 100
        };
      });
  }, [compras]);

  // Process payment method breakdown for Pie Chart
  const paymentMethodData = React.useMemo(() => {
    if (!Array.isArray(compras) || compras.length === 0) return [];
    
    const counts = {};
    compras.forEach(c => {
      const method = c.metodoPago || 'OTRO';
      counts[method] = (counts[method] || 0) + 1;
    });

    return Object.keys(counts).map(method => ({
      name: method,
      value: counts[method]
    }));
  }, [compras]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (cargando) {
    return (
      <div className="section-loader animate-fade-in">
        <div className="spinner"></div>
        <p>Cargando datos del panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container animate-fade-in">
        <div className="alert alert-danger">
          <span className="alert-icon"><IconWarning /></span>
          <span className="alert-message">{error}</span>
        </div>
        <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  };

  // Format date helper
  const formatDate = (val) => {
    if (!val) return 'N/A';
    if (Array.isArray(val)) {
      const [year, month, day] = val;
      return `${day}/${month}/${year}`;
    }
    try {
      return new Date(val).toLocaleDateString('es-CO');
    } catch (e) {
      return String(val);
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Panel de Control</h1>
          <p className="page-subtitle">Bienvenido al centro de administración de NeoMarket.</p>
        </div>
        <button onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconRefresh /> Actualizar
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="kpi-grid stagger">
        <KpiCard
          titulo="Ventas de Hoy"
          valor={formatCurrency(kpis?.ventasHoy || 0)}
          icono="ventas"
          color="blue"
          tendencia={`${kpis?.comprasHoy || 0} compras`}
        />
        <KpiCard
          titulo="Ventas del Mes"
          valor={formatCurrency(kpis?.ventasMes || 0)}
          icono="tendencia"
          color="green"
          tendencia={`${kpis?.comprasMes || 0} compras`}
        />
        <KpiCard
          titulo="Clientes Activos"
          valor={kpis?.clientesActivos || 0}
          icono="usuarios"
          color="purple"
        />
        <KpiCard
          titulo="Alerta Inventario"
          valor={kpis?.productosStockBajo || 0}
          icono="alerta"
          color={kpis?.productosStockBajo > 0 ? 'red' : 'blue'}
          tendencia="Stock bajo mínimo"
        />
      </div>

      {/* Charts Section - Row 1 */}
      <div className="charts-grid stagger">
        {/* Sales Area Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-title">Evolución de Ventas</h4>
            <span className="chart-badge">Últimos 7 días</span>
          </div>
          <div className="chart-body">
            {salesHistoryData.length === 0 ? (
              <div className="no-data-chart">No hay suficiente historial de compras</div>
            ) : (
              <ResponsiveContainer width="100%" height={280} minWidth={200} minHeight={200}>
                <AreaChart data={salesHistoryData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="fecha" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Ventas" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorVentas)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Sold Products */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-title">Productos Más Vendidos</h4>
            <span className="chart-badge">Top 5</span>
          </div>
          <div className="chart-body">
            {masVendidos.length === 0 ? (
              <div className="no-data-chart">No hay registros de ventas de productos</div>
            ) : (
              <ResponsiveContainer width="100%" height={280} minWidth={200} minHeight={200}>
                <BarChart data={masVendidos} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="nombre" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip 
                    formatter={(v) => [v, 'Unidades']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalUnidades" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20}>
                    {masVendidos.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section - Row 2 */}
      <div className="charts-grid stagger" style={{ marginTop: '24px' }}>
        {/* Payment Methods Donut */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-title">Métodos de Pago</h4>
            <span className="chart-badge">Distribución</span>
          </div>
          <div className="chart-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {paymentMethodData.length === 0 ? (
              <div className="no-data-chart">No hay registros de transacciones</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
                <div style={{ flex: '1', minWidth: '180px', height: 260, position: 'relative' }}>
                  <ResponsiveContainer width="99%" height={260}>
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(v) => [v, 'Transacciones']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="pie-legend">
                  {paymentMethodData.map((item, index) => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <div>
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">{item.value} compras</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Purchases Table */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-title">Compras Recientes</h4>
            <span className="chart-badge">{compras.length} total</span>
          </div>
          <div className="recent-purchases-list">
            {compras.length === 0 ? (
              <p className="no-data" style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>No se han registrado compras recientemente</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table table-compact">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.slice(-5).reverse().map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="table-avatar">
                              {c.cliente ? c.cliente.nombre?.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span>{c.cliente ? `${c.cliente.nombre} ${c.cliente.apellido}` : 'Cliente Anónimo'}</span>
                          </div>
                        </td>
                        <td>{formatDate(c.fecha)}</td>
                        <td><strong>{formatCurrency(c.total || 0)}</strong></td>
                        <td>
                          <span className={`badge badge-flat`}>
                            {c.metodoPago}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
