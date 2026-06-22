import React from 'react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
  action?: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: React.CSSProperties;
}

export function PageHeader({ title, breadcrumb, action, subtitle, style }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-section)',
      ...style,
    }}>
      <div>
        <h1 style={{
          fontSize: 'var(--font-size-h1)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0,
          fontFamily: 'var(--font-family)',
        }}>
          {title}
        </h1>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {breadcrumb.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && ' › '}
                {item.onClick
                  ? <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={item.onClick}>{item.label}</span>
                  : item.label
                }
              </React.Fragment>
            ))}
          </nav>
        )}
        {subtitle != null && (
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
