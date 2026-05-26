import React, { useState, useEffect, useMemo } from 'react';
import { getCompras } from '../api/adminApi';
import DataTable from '../components/DataTable';
import ExportButtons from '../components/ExportButtons';
import KpiCard from '../components/KpiCard';

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Date Filters
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Modal for Details
  const [selectedCompra, setSelectedCompra] = useState(null);

  const loadCompras = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await getCompras();
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data?.content || [];
      }
      if (!Array.isArray(data)) data = [];
      setCompras(data);
    } catch (err) {
      console.error('Error fetching compras:', err);
      setError('No se pudo cargar el historial de compras.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadCompras();
  }, []);

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  };

  // Format date helper
  const formatDate = (val) => {
    if (!val) return 'N/A';
    if (Array.isArray(val)) {
      const [year, month, day, hour, min] = val;
      return `${day}/${month}/${year} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    try {
      return new Date(val).toLocaleString('es-CO');
    } catch (e) {
      return String(val);
    }
  };

  // Filtered purchases
  const filteredCompras = useMemo(() => {
    let result = [...compras];

    if (fechaInicio) {
      const start = new Date(fechaInicio);
      start.setHours(0, 0, 0, 0);
      result = result.filter(c => {
        const d = c.fecha ? (Array.isArray(c.fecha) ? new Date(c.fecha[0], c.fecha[1]-1, c.fecha[2]) : new Date(c.fecha)) : new Date(0);
        return d >= start;
      });
    }

    if (fechaFin) {
      const end = new Date(fechaFin);
      end.setHours(23, 59, 59, 999);
      result = result.filter(c => {
        const d = c.fecha ? (Array.isArray(c.fecha) ? new Date(c.fecha[0], c.fecha[1]-1, c.fecha[2]) : new Date(c.fecha)) : new Date(0);
        return d <= end;
      });
    }

    return result;
  }, [compras, fechaInicio, fechaFin]);

  // Purchase Metrics
  const metrics = useMemo(() => {
    const totalVentas = filteredCompras.reduce((sum, c) => sum + (c.total || 0), 0);
    const transacciones = filteredCompras.length;
    const ticketPromedio = transacciones > 0 ? totalVentas / transacciones : 0;

    return {
      totalVentas,
      transacciones,
      ticketPromedio
    };
  }, [filteredCompras]);

  const columns = [
    { 
      header: 'cliente_id', 
      accessor: (row) => row.cliente ? `${row.cliente.nombre} ${row.cliente.apellido}` : 'Cliente Anónimo',
      sortable: true,
      cell: (row) => row.cliente ? `${row.cliente.nombre} ${row.cliente.apellido}` : <span className="text-gray-400">Cliente Anónimo</span>
    },
    { 
      header: 'fecha', 
      accessor: (row) => formatDate(row.fecha),
      sortable: true
    },
    { 
      header: 'total', 
      accessor: 'total', 
      sortable: true,
      cell: (row) => <strong>{formatCurrency(row.total || 0)}</strong>
    },
    { 
      header: 'metodo_pago', 
      accessor: 'metodoPago', 
      sortable: true,
      cell: (row) => (
        <span className="badge badge-flat">
          {row.metodoPago || 'EFECTIVO'}
        </span>
      )
    },
    {
      header: 'Acciones',
      sortable: false,
      cell: (row) => (
        <button 
          onClick={() => setSelectedCompra(row)} 
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          Ver Detalle
        </button>
      )
    }
  ];

  return (
    <div className="compras-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Compras</h1>
          <p className="page-subtitle">Monitorea y analiza el flujo de transacciones e ingresos de NeoMarket.</p>
        </div>
        <div className="header-actions">
          <button onClick={loadCompras} className="btn-refresh" style={{ marginRight: '12px' }}>
            Actualizar
          </button>
          <ExportButtons 
            data={filteredCompras} 
            columns={columns.slice(0, 4)} // Exclude Actions
            filename="compras_neomarket" 
            title="Historial de Ventas - NeoMarket" 
          />
        </div>
      </div>

      {/* Rango de Fechas Filter */}
      <div className="filter-card stagger">
        <div className="filter-header">
          <div className="filter-title-wrapper">
            <svg className="filter-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h4>Filtrar por Rango de Fechas</h4>
          </div>
          {(fechaInicio || fechaFin) && (
            <button 
              onClick={() => { setFechaInicio(''); setFechaFin(''); }} 
              className="btn-clear-filters"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpiar Filtros
            </button>
          )}
        </div>
        <div className="filter-inputs-grid">
          <div className="date-input-group">
            <label className="date-input-label">Desde</label>
            <div className="date-input-wrapper">
              <svg className="input-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)} 
                className="modern-date-input"
              />
            </div>
          </div>
          
          <div className="date-input-group">
            <label className="date-input-label">Hasta</label>
            <div className="date-input-wrapper">
              <svg className="input-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input 
                type="date" 
                value={fechaFin} 
                onChange={(e) => setFechaFin(e.target.value)} 
                className="modern-date-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary cards */}
      <div className="kpi-grid stagger">
        <KpiCard
          titulo="Ingresos Totales"
          valor={formatCurrency(metrics.totalVentas)}
          icono="ventas"
          color="blue"
          tendencia="En período seleccionado"
        />
        <KpiCard
          titulo="Transacciones"
          valor={String(metrics.transacciones)}
          icono="carrito"
          color="green"
          tendencia="Compras registradas"
        />
        <KpiCard
          titulo="Ticket Promedio"
          valor={formatCurrency(metrics.ticketPromedio)}
          icono="etiqueta"
          color="amber"
          tendencia="Valor medio de compra"
        />
      </div>

      {cargando ? (
        <div className="section-loader">
          <div className="spinner"></div>
          <p>Cargando transacciones...</p>
        </div>
      ) : error ? (
        <div className="error-container animate-fade-in">
          <div className="alert alert-danger">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
          </div>
          <button className="btn btn-primary" onClick={loadCompras}>Reintentar</button>
        </div>
      ) : (
        <div className="card stagger" style={{ marginTop: '24px' }}>
          <DataTable
            columns={columns}
            data={filteredCompras}
            searchable={true}
            searchPlaceholder="Buscar por cajero, cliente, método de pago..."
            searchKeys={[
              'cajero', 
              'metodoPago', 
              (c) => c.cliente ? `${c.cliente.nombre} ${c.cliente.apellido}` : ''
            ]}
            pageSize={10}
          />
        </div>
      )}

      {/* Details Modal */}
      {selectedCompra && (
        <div className="modal-overlay" onClick={() => setSelectedCompra(null)}>
          <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Compra #{selectedCompra.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCompra(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="purchase-meta">
                <div className="meta-item">
                  <strong>Cliente:</strong>
                  <span>{selectedCompra.cliente ? `${selectedCompra.cliente.nombre} ${selectedCompra.cliente.apellido}` : 'Cliente Anónimo'}</span>
                </div>
                <div className="meta-item">
                  <strong>Correo:</strong>
                  <span>{selectedCompra.cliente?.email || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <strong>Fecha / Hora:</strong>
                  <span>{formatDate(selectedCompra.fecha)}</span>
                </div>
                <div className="meta-item">
                  <strong>Método de Pago:</strong>
                  <span className="badge badge-flat">{selectedCompra.metodoPago || 'EFECTIVO'}</span>
                </div>
                <div className="meta-item">
                  <strong>Atendido por:</strong>
                  <span>{selectedCompra.cajero || 'N/A'}</span>
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--gray-800)' }}>Artículos Adquiridos</h4>
              
              <div className="table-responsive" style={{ maxHeight: '250px' }}>
                <table className="custom-table table-compact">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompra.detalles && selectedCompra.detalles.length > 0 ? (
                      selectedCompra.detalles.map((det) => (
                        <tr key={det.id}>
                          <td><strong>{det.producto?.nombre}</strong></td>
                          <td>{det.cantidad}</td>
                          <td>{formatCurrency(det.precioUnitario)}</td>
                          <td><strong>{formatCurrency(det.subtotal)}</strong></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="no-data">No hay detalles de artículos disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="purchase-total-card">
                <span>Total Facturado</span>
                <h2>{formatCurrency(selectedCompra.total || 0)}</h2>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedCompra(null)} className="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compras;
