import React, { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalRecords?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  emptyMessage?: string;
  striped?: boolean;
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  current: number;
  total: number;
  onPage: (p: number) => void;
  pageSize: number;
  totalRecords: number;
}

function Pagination({ current, total, onPage, pageSize, totalRecords }: PaginationProps) {
  const from = totalRecords === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, totalRecords);

  const pages: (number | '...')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    padding: '6px 11px', border: '1px solid #e5e7eb', borderRadius: 6,
    background: active ? '#00963F' : '#fff',
    color: active ? '#fff' : disabled ? '#d1d5db' : '#374151',
    fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'Open Sans, sans-serif',
    minWidth: 36, textAlign: 'center',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>
        Mostrando de <strong>{from}</strong> até <strong>{to}</strong> de <strong>{totalRecords.toLocaleString('pt-BR')}</strong> registros
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button style={btnStyle(false, current === 1)} onClick={() => current > 1 && onPage(current - 1)}>
          Anterior
        </button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} style={{ padding: '6px 8px', color: '#6b7280', fontSize: 13 }}>...</span>
            : <button key={p} style={btnStyle(p === current)} onClick={() => onPage(p as number)}>{p}</button>
        )}
        <button style={btnStyle(false, current === total)} onClick={() => current < total && onPage(current + 1)}>
          Próximo
        </button>
      </div>
    </div>
  );
}

// ── Main DataTable ────────────────────────────────────────────────────────────

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  totalRecords,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  onSort,
  emptyMessage = 'Nenhum registro encontrado.',
  striped = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const total = totalRecords ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      {/* Page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>Exibir</span>
        {[10, 25, 50, 100].map(n => (
          <button key={n} onClick={() => onPageSizeChange?.(n)}
            style={{ padding: '3px 10px', borderRadius: 5, border: `1px solid ${n === pageSize ? '#00963F' : '#e5e7eb'}`, background: n === pageSize ? '#00963F' : '#fff', color: n === pageSize ? '#fff' : '#374151', fontSize: 12, fontWeight: n === pageSize ? 600 : 400, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', transition: 'all 0.12s' }}>
            {n}
          </button>
        ))}
        <span style={{ fontSize: 13, color: '#6b7280' }}>por página</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontWeight: 600, fontSize: 12, color: '#6b7280',
                    borderBottom: '2px solid #e5e7eb',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: col.width,
                    background: '#fff',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable !== false && (
                      <span style={{ display: 'inline-flex', flexDirection: 'column', opacity: sortKey === String(col.key) ? 1 : 0.4 }}>
                        <i className={`bi bi-caret-up-fill`} style={{ fontSize: 8, lineHeight: 1, color: sortKey === String(col.key) && sortDir === 'asc' ? '#00963F' : '#9ca3af' }} />
                        <i className={`bi bi-caret-down-fill`} style={{ fontSize: 8, lineHeight: 1, color: sortKey === String(col.key) && sortDir === 'desc' ? '#00963F' : '#9ca3af' }} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  <i className="bi bi-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: striped && ri % 2 === 1 ? '#fafafa' : '#fff',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                  onMouseLeave={e => (e.currentTarget.style.background = striped && ri % 2 === 1 ? '#fafafa' : '#fff')}
                >
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #f3f4f6',
                        color: '#374151',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render
                        ? col.render(row)
                        : (() => {
                          const v = (row as Record<string, unknown>)[String(col.key)];
                          const s = String(v ?? '');
                          const empty = !s || ['nao informada', 'n/a', '---', 'undefined', 'null'].includes(s.toLowerCase());
                          return empty ? <span style={{ color: '#d1d5db', fontSize: 14 }}>—</span> : s;
                        })()}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onPage={onPageChange}
          pageSize={pageSize}
          totalRecords={total}
        />
      )}
    </div>
  );
}
