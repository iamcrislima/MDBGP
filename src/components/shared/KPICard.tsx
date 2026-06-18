import React, { useState } from 'react';

interface KPICardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: string;
  borderColor: string;
  tooltip?: string;
}

export default function KPICard({ title, subtitle, value, icon, borderColor, tooltip }: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconBg = `${borderColor}18`;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e5e7eb',
      padding: '18px 20px',
      flex: 1, minWidth: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, background: iconBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`bi ${icon}`} style={{ color: borderColor, fontSize: 20 }} />
        </div>
        {tooltip && (
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', fontSize: 13, lineHeight: 1 }}
            >
              <i className="bi bi-info-circle" />
            </button>
            {showTooltip && (
              <div style={{ position: 'absolute', top: 22, right: 0, background: '#1e1e2d', color: '#fff', fontSize: 11, padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10 }}>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}
