import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

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
  mobileCard?: (row: T, index: number) => React.ReactNode;
}

// ── Main DataTable ────────────────────────────────────────────────────────────
export default function DataTable<T extends object>({
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
  mobileCard,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    let raf = 0;
    const fn = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobile(window.innerWidth < 768));
    };
    window.addEventListener('resize', fn);
    return () => { window.removeEventListener('resize', fn); cancelAnimationFrame(raf); };
  }, []);

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const total      = totalRecords ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showCards  = isMobile && !!mobileCard;

  return (
    <div>

      {/* ── Mobile card view ── */}
      {showCards ? (
        <div>
          {data.length === 0 ? (
            <EmptyState icon="bi-inbox" title={emptyMessage} size="sm" />
          ) : (
            <div className="mobile-card-list">
              {data.map((row, i) => (
                <React.Fragment key={String((row as Record<string, unknown>).id ?? i)}>{mobileCard!(row, i)}</React.Fragment>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Desktop/Tablet table view ── */
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
                      fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)',
                      borderBottom: '2px solid var(--color-border)',
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none', whiteSpace: 'nowrap',
                      width: col.width, background: '#fff',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.sortable !== false && (
                        <span style={{ display: 'inline-flex', flexDirection: 'column', opacity: sortKey === String(col.key) ? 1 : 0.4 }}>
                          <i className="bi bi-caret-up-fill" style={{ fontSize: 8, lineHeight: 1, color: sortKey === String(col.key) && sortDir === 'asc' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                          <i className="bi bi-caret-down-fill" style={{ fontSize: 8, lineHeight: 1, color: sortKey === String(col.key) && sortDir === 'desc' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
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
                  <td colSpan={columns.length}>
                    <EmptyState icon="bi-inbox" title={emptyMessage} size="sm" />
                  </td>
                </tr>
              ) : (
                data.map((row, ri) => (
                  <tr
                    key={String((row as Record<string, unknown>).id ?? ri)}
                    style={{ background: striped && ri % 2 === 1 ? '#fafafa' : '#fff', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                    onMouseLeave={e => (e.currentTarget.style.background = striped && ri % 2 === 1 ? '#fafafa' : '#fff')}
                  >
                    {columns.map(col => (
                      <td key={String(col.key)} style={{ padding: '11px 14px', borderBottom: '1px solid var(--color-bg-page)', color: 'var(--color-text-dark)', verticalAlign: 'middle' }}>
                        {col.render
                          ? col.render(row)
                          : (() => {
                            const v = (row as Record<string, unknown>)[String(col.key)];
                            const s = String(v ?? '');
                            const empty = !s || ['nao informada', 'n/a', '---', 'undefined', 'null'].includes(s.toLowerCase());
                            return empty ? <span style={{ color: 'var(--color-border-input)', fontSize: 14 }}>—</span> : s;
                          })()}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={total}
          itemsPerPage={pageSize}
          onItemsPerPageChange={onPageSizeChange}
          itemsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </div>
  );
}
