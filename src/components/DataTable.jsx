import React, { useState, useMemo } from 'react';

const DataTable = ({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchKeys = [],
  pageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, index: -1, direction: 'asc' });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const requestSort = (key, index) => {
    let direction = 'asc';
    if (sortConfig.index === index && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, index, direction });
  };

  const processedData = useMemo(() => {
    let result = [...data];

    if (searchTerm && searchKeys.length > 0) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = typeof key === 'function' ? key(item) : item[key];
          return val ? String(val).toLowerCase().includes(term) : false;
        })
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = typeof sortConfig.key === 'function' ? sortConfig.key(a) : a[sortConfig.key];
        const bValue = typeof sortConfig.key === 'function' ? sortConfig.key(b) : b[sortConfig.key];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, sortConfig]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const startRecord = processedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, processedData.length);

  return (
    <>
      {searchable && (
        <div className="table-controls">
          <div className="table-search">
            <span className="table-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="table-actions">
            <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
              {startRecord}–{endRecord} de {processedData.length}
            </span>
          </div>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => col.sortable !== false && requestSort(col.accessor, i)}
                  className={sortConfig.index === i ? 'sorted' : ''}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  {col.header}
                  {col.sortable !== false && sortConfig.index === i && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--gray-400)' }}>
                  No se encontraron registros
                </td>
              </tr>
            ) : (
              paginatedData.map((row, ri) => (
                <tr key={ri}>
                  {columns.map((col, ci) => {
                    const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return <td key={ci}>{col.cell ? col.cell(row) : value}</td>;
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="table-pagination">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="table-pagination-btns">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Anterior
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DataTable;
