import React, { useState, useEffect } from 'react';
import { getClientes } from '../api/adminApi';
import DataTable from '../components/DataTable';
import ExportButtons from '../components/ExportButtons';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const loadClientes = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await getClientes();
      setClientes(res.data);
    } catch (err) {
      console.error('Error fetching clientes:', err);
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

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

  const columns = [
    { header: 'ID', accessor: 'id', sortable: true },
    { 
      header: 'Nombre Completo', 
      accessor: (row) => `${row.nombre || ''} ${row.apellido || ''}`,
      sortable: true,
      cell: (row) => <strong>{row.nombre} {row.apellido}</strong>
    },
    { header: 'Correo Electrónico', accessor: 'email', sortable: true },
    { header: 'Teléfono', accessor: 'telefono', sortable: false },
    { 
      header: 'Fecha Registro', 
      accessor: (row) => formatDate(row.fechaRegistro),
      sortable: true 
    },
    { 
      header: 'Estado', 
      accessor: 'activo', 
      sortable: true,
      cell: (row) => (
        <span className={`badge ${row.activo ? 'badge-success' : 'badge-danger'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  return (
    <div className="clientes-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes Registrados</h1>
          <p className="page-subtitle">Gestiona y analiza el padrón completo de compradores de NeoMarket.</p>
        </div>
        <div className="header-actions">
          <button onClick={loadClientes} className="btn-refresh" style={{ marginRight: '12px' }}>
            Actualizar
          </button>
          <ExportButtons 
            data={clientes} 
            columns={columns} 
            filename="clientes_neomarket" 
            title="Reporte de Clientes - NeoMarket" 
          />
        </div>
      </div>

      {cargando ? (
        <div className="section-loader">
          <div className="spinner"></div>
          <p>Cargando lista de clientes...</p>
        </div>
      ) : error ? (
        <div className="error-container animate-fade-in">
          <div className="alert alert-danger">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
          </div>
          <button className="btn btn-primary" onClick={loadClientes}>Reintentar</button>
        </div>
      ) : (
        <div className="card stagger">
          <DataTable
            columns={columns}
            data={clientes}
            searchable={true}
            searchPlaceholder="Buscar por nombre, email o teléfono..."
            searchKeys={['nombre', 'apellido', 'email', 'telefono']}
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default Clientes;
