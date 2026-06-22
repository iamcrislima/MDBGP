import React from 'react';

export interface SectionHeaderProps {
  title: string;
  icon?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function SectionHeader({ title, icon, action, style }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      borderBottom: '1px solid var(--color-border)',
      paddingBottom: 12,
      marginBottom: 16,
      ...style,
    }}>
      {icon && (
        <div style={{
          width: 28,
          height: 28,
          background: 'var(--color-primary-light)',
          borderRadius: 'var(--radius-input)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i className={`bi ${icon}`} style={{ color: 'var(--color-primary)', fontSize: 15 }} />
        </div>
      )}
      <span style={{
        fontWeight: 700,
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
      }}>{title}</span>
      {action && <div style={{ marginLeft: 'auto' }}>{action}</div>}
    </div>
  );
}

export default SectionHeader;
