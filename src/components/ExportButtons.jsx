import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportButtons = ({ data = [], columns = [], filename = 'reporte', title = 'Reporte NeoMarket' }) => {
  const extractValue = (row, col) => {
    if (typeof col.accessor === 'function') return col.accessor(row);
    return row[col.accessor] !== undefined ? row[col.accessor] : '';
  };

  const handlePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

      autoTable(doc, {
        head: [columns.map((c) => c.header)],
        body: data.map((row) => columns.map((c) => extractValue(row, c))),
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
      });

      doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error exportando PDF:', err);
    }
  };

  const handleExcel = () => {
    try {
      const rows = data.map((row) => {
        const obj = {};
        columns.forEach((c) => (obj[c.header] = extractValue(row, c)));
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Error exportando Excel:', err);
    }
  };

  return (
    <div className="export-group">
      <button className="btn btn-secondary btn-sm" onClick={handlePDF} disabled={!data.length} title="Exportar PDF" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        PDF
      </button>
      <button className="btn btn-secondary btn-sm" onClick={handleExcel} disabled={!data.length} title="Exportar Excel" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
        Excel
      </button>
    </div>
  );
};

export default ExportButtons;
