import React from 'react';

export default function DataTable({ columns, rows, empty = 'No records found.', onRowClick }) {
  return (
    <div className="bf-table-wrap">
      <table className="bf-table">
        <thead><tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr></thead>
        <tbody>
          {rows?.length ? rows.map((row, index) => (
            <tr key={row.id || index} onClick={() => onRowClick?.(row)} className={onRowClick ? 'bf-clickable' : ''}>
              {columns.map((col) => <td key={col.key}>{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>)}
            </tr>
          )) : <tr><td colSpan={columns.length} className="bf-empty">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
