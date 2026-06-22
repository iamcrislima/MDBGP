import React, { useState } from 'react';

export interface KPICardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: string;
  borderColor: string;
  tooltip?: string;
  iconShape?: 'circle' | 'rounded';
  valueSize?: number;
  valueWeight?: number;
}

export function KPICard({
  title,
  subtitle,
  value,
  icon,
  borderColor,
  tooltip,
  iconShape = 'circle',
  valueSize,
  valueWeight = 600,
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconBg = `${borderColor}18`;
  const iconRadius = iconShape === 'circle' ? '50%' : 'var(--radius-card)';

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--color-border)',
      padding: '18px 20px',
      flex: 1, minWidth: 0,
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, background: iconBg, borderRadius: iconRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`bi ${icon}`} style={{ color: borderColor, fontSize: 20 }} />
        </div>
        {tooltip && (
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1 }}
            >
              <i className="bi bi-info-circle" />
            </button>
            {showTooltip && (
              <div style={{ position: 'absolute', top: 22, right: 0, background: '#1e1e2d', color: '#fff', fontSize: 11, padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-dropdown)', zIndex: 10 }}>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: valueSize ?? 'var(--font-size-kpi)', fontWeight: valueWeight, color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

export default KPICard;
