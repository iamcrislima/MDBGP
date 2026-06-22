import React, { useState, useEffect } from 'react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (n: number) => void;
  itemsPerPageOptions?: number[];
}

const PAGE_BTN: React.CSSProperties = {
  minWidth: 32, height: 32, padding: '0 8px',
  borderRadius: 'var(--radius-input)',
  fontSize: 'var(--font-size-xs)',
  fontFamily: 'var(--font-family)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1, boxSizing: 'border-box' as const,
  transition: 'background 0.15s, color 0.15s',
};

function pageBtnStyle(active: boolean, disabled?: boolean): React.CSSProperties {
  return {
    ...PAGE_BTN,
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-primary)' : 'var(--color-bg-card)',
    color: active ? 'var(--color-text-inverse)' : disabled ? 'var(--color-text-muted)' : 'var(--color-text-dark)',
    fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
    cursor: disabled || active ? 'default' : 'pointer',
  };
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50],
}: PaginationProps) {
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

  const perPage = itemsPerPage ?? 10;
  const from = (totalItems ?? 0) === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to   = Math.min(currentPage * perPage, totalItems ?? 0);

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ marginTop: 14 }}>
        {totalItems != null && (
          <p style={{ margin: '0 0 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            {from}–{to} de {totalItems.toLocaleString('pt-BR')} registros
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{ flex: 1, minHeight: 44 }}
          >
            ← Anterior
          </Button>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', textAlign: 'center', minWidth: 72 }}>
            {currentPage} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{ flex: 1, minHeight: 44 }}
          >
            Próximo →
          </Button>
        </div>
      </div>
    );
  }

  // ── Desktop: build page window with ellipsis ───────────────────────────────
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const atFirst = currentPage === 1;
  const atLast  = currentPage === totalPages;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>

      {/* Left: record count + page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {totalItems != null && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Mostrando de <strong>{from}</strong> até <strong>{to}</strong> de{' '}
            <strong>{totalItems.toLocaleString('pt-BR')}</strong> registros
          </span>
        )}
        {onItemsPerPageChange && itemsPerPage != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Exibir</span>
            {itemsPerPageOptions.map(n => (
              <button
                key={n}
                onClick={() => onItemsPerPageChange(n)}
                style={pageBtnStyle(n === itemsPerPage)}
              >
                {n}
              </button>
            ))}
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>por página</span>
          </div>
        )}
      </div>

      {/* Right: navigation */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Button variant="icon" size="sm" disabled={atFirst} onClick={() => onPageChange(1)} title="Primeira página">«</Button>
          <Button variant="icon" size="sm" disabled={atFirst} onClick={() => onPageChange(currentPage - 1)} title="Página anterior">‹</Button>

          {pages.map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} style={{ padding: '0 6px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', display: 'inline-flex', alignItems: 'center', height: 32 }}>…</span>
              : <button key={p} onClick={() => p !== currentPage && onPageChange(p as number)} style={pageBtnStyle(p === currentPage)}>{p}</button>
          )}

          <Button variant="icon" size="sm" disabled={atLast} onClick={() => onPageChange(currentPage + 1)} title="Próxima página">›</Button>
          <Button variant="icon" size="sm" disabled={atLast} onClick={() => onPageChange(totalPages)} title="Última página">»</Button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
