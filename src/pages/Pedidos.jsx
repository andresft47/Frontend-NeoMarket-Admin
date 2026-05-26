import React, { useState, useEffect, useMemo } from 'react';
import { getPedidosSugeridos } from '../api/adminApi';
import DataTable from '../components/DataTable';
import ExportButtons from '../components/ExportButtons';
import KpiCard from '../components/KpiCard';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const loadPedidos = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await getPedidosSugeridos();
      setPedidos(res.data);
    } catch (err) {
      console.error('Error fetching pedidos sugeridos:', err);
      setError('No se pudo cargar los pedidos sugeridos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  };

  const metrics = useMemo(() => {
    const totalPedidos = pedidos.length;
    const costoTotal = pedidos.reduce((sum, p) => sum + (p.costoEstimado || 0), 0);
    const totalUnidades = pedidos.reduce((sum, p) => sum + (p.cantidadSugerida || 0), 0);

    return {
      totalPedidos,
      costoTotal,
      totalUnidades
    };
  }, [pedidos]);

  const columns = [
    { header: 'ID Prod', accessor: 'productoId', sortable: true },
    { 
      header: 'Producto', 
      accessor: 'nombreProducto', 
      sortable: true,
      cell: (row) => <strong>{row.nombreProducto}</strong>
    },
    { header: 'Proveedor Asignado', accessor: 'proveedor', sortable: true },
    { 
      header: 'Stock / Mín', 
      accessor: 'stockActual',
      sortable: true,
      cell: (row) => (
        <span>
          {row.stockActual} u. <span className="text-muted">/ {row.stockMinimo} u.</span>
        </span>
      )
    },
    { 
      header: 'Cantidad Sugerida', 
      accessor: 'cantidadSugerida', 
      sortable: true,
      cell: (row) => (
        <span className="badge badge-success animate-pulse-soft" style={{ fontSize: '0.95rem', fontWeight: 'bold', padding: '6px 12px' }}>
          +{row.cantidadSugerida} u.
        </span>
      )
    },
    { 
      header: 'Costo Estimado', 
      accessor: 'costoEstimado', 
      sortable: true,
      cell: (row) => <strong>{formatCurrency(row.costoEstimado || 0)}</strong>
    },
    { 
      header: 'Motivo Recomendación', 
      accessor: 'motivo', 
      sortable: true,
      cell: (row) => {
        const isBajo = row.motivo === 'STOCK_BAJO';
        const isAltaDemanda = row.motivo === 'DEMANDA_ALTA';
        
        let badgeClass = 'badge-danger';
        let label = row.motivo || 'STOCK_BAJO';

        if (isAltaDemanda) {
          badgeClass = 'badge-warning';
          label = 'Demanda Alta';
        } else if (isBajo) {
          badgeClass = 'badge-danger';
          label = 'Stock Crítico';
        } else if (label.includes('STOCK_BAJO') && label.includes('DEMANDA_ALTA')) {
          badgeClass = 'badge-danger animate-pulse-soft';
          label = 'Stock Crítico + Demanda Alta';
        }

        return (
          <span className={`badge ${badgeClass}`}>
            {label}
          </span>
        );
      }
    }
  ];

  return (
    <div className="pedidos-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos Sugeridos</h1>
          <p className="page-subtitle">Recomendaciones automatizadas de reabastecimiento generadas por el motor de inventario.</p>
        </div>
        <div className="header-actions">
          <button onClick={loadPedidos} className="btn-refresh" style={{ marginRight: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-icon">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Actualizar
          </button>
          <ExportButtons 
            data={pedidos} 
            columns={columns} 
            filename="pedidos_sugeridos_neomarket" 
            title="Pedidos Sugeridos a Proveedores - NeoMarket" 
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="kpi-grid stagger">
        <KpiCard
          titulo="Productos a Reordenar"
          valor={`${metrics.totalPedidos} SKUs`}
          icono="caja"
          color="blue"
        />
        <KpiCard
          titulo="Total Unidades"
          valor={`${metrics.totalUnidades} u.`}
          icono="paquete"
          color="green"
        />
        <KpiCard
          titulo="Costo Estimado Compra"
          valor={formatCurrency(metrics.costoTotal)}
          icono="ventas"
          color="amber"
          tendencia="Sugerido de reposición"
        />
      </div>

      {cargando ? (
        <div className="section-loader animate-fade-in">
          <div className="spinner"></div>
          <p>Generando recomendaciones de pedidos...</p>
        </div>
      ) : error ? (
        <div className="error-container animate-fade-in">
          <div className="alert alert-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className="alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <span className="alert-message">{error}</span>
          </div>
          <button className="btn btn-primary" onClick={loadPedidos}>Reintentar</button>
        </div>
      ) : (
        <div className="card stagger" style={{ marginTop: '24px' }}>
          {pedidos.length === 0 ? (
            <div className="no-data-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ backgroundColor: 'var(--success-100)', color: 'var(--success-600)', borderRadius: '50%', padding: '16px', display: 'inline-flex' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
              </div>
              <h3>¡Todo en orden! No se requieren pedidos sugeridos.</h3>
              <p className="text-muted" style={{ maxWidth: '500px', margin: '8px auto 0 auto' }}>
                Todos los productos cuentan con niveles de stock saludables en bodega y estanterías en comparación con sus márgenes de seguridad.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={pedidos}
              searchable={true}
              searchPlaceholder="Buscar por producto, proveedor, motivo..."
              searchKeys={['nombreProducto', 'proveedor', 'motivo']}
              pageSize={10}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Pedidos;
