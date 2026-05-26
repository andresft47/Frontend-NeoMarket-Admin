import React, { useState, useEffect } from 'react';
import { getClientes, getPrediccionCliente, getMasVendidos } from '../api/adminApi';
import DataTable from '../components/DataTable';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Predicciones = () => {
  const [clientes, setClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [predicciones, setPredicciones] = useState([]);
  const [topVendidos, setTopVendidos] = useState([]);
  
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [cargandoPrediccion, setCargandoPrediccion] = useState(false);
  const [cargandoTop, setCargandoTop] = useState(true);
  
  const [errorClientes, setErrorClientes] = useState('');
  const [errorPrediccion, setErrorPrediccion] = useState('');

  // Initial Load
  const initLoad = async () => {
    try {
      setCargandoClientes(true);
      setErrorClientes('');
      const resClientes = await getClientes();
      const activeClientes = resClientes.data.filter(c => c.activo);
      setClientes(activeClientes);
      if (activeClientes.length > 0) {
        setSelectedClienteId(activeClientes[0].id);
      }
    } catch (err) {
      console.error('Error loading clientes for predictions:', err);
      setErrorClientes('No se pudieron cargar los clientes.');
    } finally {
      setCargandoClientes(false);
    }

    try {
      setCargandoTop(true);
      const resTop = await getMasVendidos(10);
      setTopVendidos(resTop.data);
    } catch (err) {
      console.error('Error loading top products:', err);
    } finally {
      setCargandoTop(false);
    }
  };

  useEffect(() => {
    initLoad();
  }, []);

  // Fetch prediction when client changes
  const fetchPrediction = async (id) => {
    if (!id) return;
    try {
      setCargandoPrediccion(true);
      setErrorPrediccion('');
      const res = await getPrediccionCliente(id);
      setPredicciones(res.data);
    } catch (err) {
      console.error('Error fetching prediction for client:', err);
      setErrorPrediccion('No se pudo generar la predicción para este cliente.');
      setPredicciones([]);
    } finally {
      setCargandoPrediccion(false);
    }
  };

  useEffect(() => {
    if (selectedClienteId) {
      fetchPrediction(selectedClienteId);
    }
  }, [selectedClienteId]);

  const handleClienteChange = (e) => {
    setSelectedClienteId(e.target.value);
  };

  const columns = [
    { header: 'ID', accessor: 'productoId', sortable: true },
    { 
      header: 'Producto Recomendado', 
      accessor: 'nombreProducto', 
      sortable: true,
      cell: (row) => <strong>{row.nombreProducto}</strong>
    },
    { 
      header: 'Veces Comprado', 
      accessor: 'vecesComprado', 
      sortable: true,
      cell: (row) => <span>{row.vecesComprado} veces</span>
    },
    { 
      header: 'Promedio Unidades', 
      accessor: 'promedioUnidadesPorCompra', 
      sortable: true,
      cell: (row) => <span>{row.promedioUnidadesPorCompra ? row.promedioUnidadesPorCompra.toFixed(1) : '1.0'} u.</span>
    },
    { 
      header: 'Probabilidad de Compra', 
      accessor: 'probabilidadCompra', 
      sortable: true,
      cell: (row) => {
        const prob = (row.probabilidadCompra || 0) * 100;
        let color = 'var(--danger-500)';
        if (prob >= 75) color = 'var(--success-500)';
        else if (prob >= 40) color = 'var(--warning-500)';

        return (
          <div className="prob-container">
            <span style={{ fontWeight: 'bold', color: color, marginRight: '8px' }}>
              {prob.toFixed(0)}%
            </span>
            <div className="progress-bar-bg" style={{ width: '60px', height: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
              <div 
                className="progress-bar-fill" 
                style={{ width: `${prob}%`, backgroundColor: color, height: '100%' }}
              ></div>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Prioridad Oferta', 
      accessor: 'nivelPrioridad', 
      sortable: true,
      cell: (row) => {
        const prio = row.nivelPrioridad || 'BAJA';
        let badgeClass = 'badge-success';
        if (prio === 'ALTA') badgeClass = 'badge-danger';
        else if (prio === 'MEDIA') badgeClass = 'badge-warning';

        return (
          <span className={`badge ${badgeClass}`}>
            {prio}
          </span>
        );
      }
    },
    { 
      header: 'Análisis IA / Recomendación', 
      accessor: 'descripcion', 
      sortable: false,
      cell: (row) => <span className="text-sm italic" style={{ fontSize: '0.85rem' }}>"{row.descripcion || 'Sin análisis'}"</span>
    }
  ];

  return (
    <div className="predicciones-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Predicciones y Análisis IA</h1>
          <p className="page-subtitle">Visualiza estadísticas avanzadas de mercado y el comportamiento predictivo de los clientes.</p>
        </div>
      </div>

      {/* Top Products Analytics */}
      <div className="card stagger">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>📊 Top 10 Productos Más Consumidos (Análisis de Ventas)</h3>
        {cargandoTop ? (
          <div className="section-loader" style={{ height: '200px' }}>
            <div className="spinner"></div>
          </div>
        ) : topVendidos.length === 0 ? (
          <p className="no-data">No hay suficientes registros de compras para generar estadísticas de productos.</p>
        ) : (
          <div className="chart-container" style={{ minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="nombre" stroke="#9ca3af" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#9ca3af" fontSize={11} label={{ value: 'Unidades Vendidas', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#6b7280' } }} />
                <Tooltip 
                  formatter={(v) => [v, 'Unidades']} 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="cantidadVendida" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Client Purchases Predictions */}
      <div className="card stagger" style={{ marginTop: '24px' }}>
        <div className="prediction-selection-header">
          <div className="header-text">
            <h3 className="card-title">🔮 Predicción de Compras Futuras por Cliente</h3>
            <p className="text-muted text-sm">Selecciona un cliente para estimar probabilísticamente su próxima canasta de compras.</p>
          </div>
          <div className="selector-container">
            {cargandoClientes ? (
              <span>Cargando clientes...</span>
            ) : errorClientes ? (
              <span className="text-danger">{errorClientes}</span>
            ) : (
              <div className="select-wrapper">
                <span className="select-icon">👤</span>
                <select 
                  value={selectedClienteId} 
                  onChange={handleClienteChange} 
                  className="client-prediction-select"
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />

        {cargandoPrediccion ? (
          <div className="section-loader" style={{ height: '200px' }}>
            <div className="spinner"></div>
            <p>Corriendo modelos predictivos para el cliente...</p>
          </div>
        ) : errorPrediccion ? (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">{errorPrediccion}</span>
          </div>
        ) : predicciones.length === 0 ? (
          <div className="no-data-card" style={{ padding: '30px', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📊</span>
            <h4>Sin historial de compras suficiente</h4>
            <p className="text-muted" style={{ maxWidth: '450px', margin: '4px auto 0 auto' }}>
              Este cliente aún no ha registrado transacciones suficientes para alimentar el algoritmo de recomendación predictiva.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={predicciones}
            searchable={false} // Small focused dataset, no search needed
            pageSize={5}
          />
        )}
      </div>

      {/* Advanced AI Roadmap */}
      <div className="advanced-ai-roadmap animate-fade-in stagger" style={{ marginTop: '24px' }}>
        <div className="ai-card">
          <div className="ai-badge-label">PREMIUM PREVIEW</div>
          <div className="ai-card-content">
            <div className="ai-card-icon">🧠</div>
            <div className="ai-card-info">
              <h3>Próxima Integración: Modelos de Deep Learning Avanzados</h3>
              <p>
                Estamos entrenando un modelo de Redes Neuronales Recurrentes (LSTM) y Filtrado Colaborativo Neuronal para predecir no solo QUÉ comprarán los clientes, sino EXACTAMENTE en qué día de la semana y qué promociones dinámicas maximizarán su tasa de conversión.
              </p>
              <div className="ai-features">
                <span className="ai-feature-tag">📅 Previsión de Demanda Temporal</span>
                <span className="ai-feature-tag">💸 Optimización Dinámica de Precios</span>
                <span className="ai-feature-tag">🔄 Segmentación Automática en Clústeres (K-Means)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predicciones;
