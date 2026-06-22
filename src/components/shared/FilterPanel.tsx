import React from 'react';
import Button from './Button';

export interface FilterPanelProps {
  open: boolean;
  onFilter: () => void;
  onClear: () => void;
  loading?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function FilterPanel({ open, onFilter, onClear, loading, children, action, style }: FilterPanelProps) {
  if (!open) return null;
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-card-y) var(--space-card)',
      marginBottom: 'var(--space-section)',
      ...style,
    }}>
      {children}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-gap-actions)', marginTop: 16 }}>
        {action}
        <Button variant="ghost" onClick={onClear} icon="bi-x-lg" disabled={loading}>Limpar</Button>
        <Button variant="primary" onClick={onFilter} icon="bi-search" loading={loading}>Filtrar</Button>
      </div>
    </div>
  );
}

export default FilterPanel;
