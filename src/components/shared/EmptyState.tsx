import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** sm: padding 32px · md: padding 52px. Default md. */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function EmptyState({ icon = 'bi-inbox', title, subtitle, action, size = 'md', style }: EmptyStateProps) {
  const padding = size === 'sm' ? 32 : 52;
  const iconSize = size === 'sm' ? '2rem' : '2.5rem';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding, ...style,
    }}>
      <i className={`bi ${icon}`} style={{ fontSize: iconSize, color: 'var(--color-text-muted)' }} />
      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 12 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
          {subtitle}
        </div>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
