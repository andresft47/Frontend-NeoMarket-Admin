import React, { useState, useEffect } from 'react';
import { getInventario, getStockBajo } from '../api/adminApi';
import DataTable from '../components/DataTable';
import ExportButtons from '../components/ExportButtons';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setCargando(true);
      setError('');
      
      const [resInv, resAlertas] = await Promise.all([
        getInventario(),
        getStockBajo()
      ]);

      setInventario(resInv.data);
      setAlertas(resAlertas.data);
    } catch (err) {
      console.error('Error fetching inventario:', err);
      setError('No se pudo cargar los datos del inventario.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to determine status color
  const getStockStatus = (total, min) => {
    if (total <= min) return { class: 'status-danger', label: 'Bajo Mínimo', color: 'var(--danger-500)' };
    if (total <= min * 1.8) return { class: 'status-warning', label: 'Alerta Media', color: 'var(--warning-500)' };
    return { class: 'status-success', label: 'Saludable', color: 'var(--success-500)' };
  };

  const columns = [
    { header: 'ID', accessor: 'id', sortable: true },
    { 
      header: 'Producto', 
      accessor: (row) => row.producto?.nombre || 'Desconocido', 
      sortable: true,
      cell: (row) => (
        <div>
          <strong>{row.producto?.nombre}</strong>
          <span className="text-muted block text-sm" style={{ display: 'block', fontSize: '0.8rem' }}>
            CB: {row.producto?.codigoBarras || 'N/A'}
          </span>
        </div>
      )
    },
    { 
      header: 'Categoría', 
      accessor: (row) => row.producto?.categoria?.nombre || 'N/A', 
      sortable: true 
    },
    { header: 'En Estante', accessor: 'cantidadEstanteria', sortable: true },
    { header: 'En Bodega', accessor: 'cantidadBodega', sortable: true },
    { 
      header: 'Stock Total', 
      accessor: (row) => (row.cantidadEstanteria || 0) + (row.cantidadBodega || 0), 
      sortable: true,
      cell: (row) => {
        const total = (row.cantidadEstanteria || 0) + (row.cantidadBodega || 0);
        return <strong>{total} u.</strong>;
      }
    },
    { 
      header: 'Mín / Máx', 
      accessor: 'stockMinimo',
      sortable: false,
      cell: (row) => (
        <span className="text-sm">
          {row.stockMinimo} / {row.stockMaximo}
        </span>
      )
    },
    {
      header: 'Nivel Stock',
      sortable: false,
      cell: (row) => {
        const total = (row.cantidadEstanteria || 0) + (row.cantidadBodega || 0);
        const min = row.stockMinimo || 10;
        const max = row.stockMaximo || 100;
        const status = getStockStatus(total, min);
        
        // Calculate percentage (clamped between 0 and 100)
        const percent = Math.min(Math.max((total / max) * 100, 3), 100);

        return (
          <div className="stock-progress-container">
            <div className="stock-progress-label">
              <span className={`stock-status-dot ${status.class}`}></span>
              <span className="text-sm">{status.label}</span>
            </div>
            <div className="progress-bar-bg" title={`${total} de ${max} unidades (max)`}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${percent}%`, 
                  backgroundColor: status.color 
                }}
              ></div>
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="inventario-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bodega e Inventario</h1>
          <p className="page-subtitle">Monitorea los niveles de stock en bodega y estanterías en tiempo real.</p>
        </div>
        <div className="header-actions">
          <button onClick={loadData} className="btn-refresh" style={{ marginRight: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-icon">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Actualizar
          </button>
          <ExportButtons 
            data={inventario} 
            columns={columns.slice(0, 7)} // Exclude Progress Bar cell for simple text columns
            filename="inventario_neomarket" 
            title="Inventario de Productos - NeoMarket" 
          />
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {alertas.length > 0 && (
        <div className="alert-box-container animate-fade-in stagger">
          <div className="alert alert-danger" style={{ borderLeftWidth: '6px', borderRadius: '16px', padding: '16px' }}>
            <span className="alert-icon" style={{ fontSize: '1.8rem', marginRight: '16px', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </span>
            <div className="alert-content">
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Alerta Crítica: ¡Hay {alertas.length} productos con Stock Bajo!</h4>
              <p style={{ margin: '4px 0 10px 0', fontSize: '0.9rem', opacity: 0.9 }}>
                Los siguientes artículos están al límite o por debajo de su margen mínimo de seguridad:
              </p>
              <div className="critical-products-tag-list">
                {alertas.map((item) => {
                  const name = item.producto?.nombre || item.nombre || 'Producto';
                  const total = item.stockTotal !== undefined ? item.stockTotal : ((item.cantidadEstanteria || 0) + (item.cantidadBodega || 0));
                  const min = item.stockMinimo || 10;
                  return (
                    <span key={item.id} className="critical-tag animate-pulse-soft">
                      {name} (Stock: {total} u. / Mín: {min})
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <div className="section-loader">
          <div className="spinner"></div>
          <p>Cargando inventarios...</p>
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
          <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
        </div>
      ) : (
        <div className="card stagger" style={{ marginTop: '20px' }}>
          <DataTable
            columns={columns}
            data={inventario}
            searchable={true}
            searchPlaceholder="Buscar por nombre, código de barras, categoría..."
            searchKeys={[
              'stockMinimo',
              (row) => row.producto?.nombre || '',
              (row) => row.producto?.codigoBarras || '',
              (row) => row.producto?.categoria?.nombre || ''
            ]}
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default Inventario;
