import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  icon,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger    = confirmVariant === 'danger';
  const iconClass   = icon ?? (isDanger ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill');
  const iconColor   = isDanger ? '#dc2626' : '#00963F';
  const iconBg      = isDanger ? '#fef2f2' : '#E8F5E9';
  const confirmBg   = isDanger ? '#dc2626' : '#00963F';
  const confirmHov  = isDanger ? '#b91c1c' : '#007A32';

  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', zIndex: 2000 }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: 14,
        width: 420, maxWidth: 'calc(100vw - 32px)',
        padding: '32px 28px 24px',
        zIndex: 2010,
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        fontFamily: 'Open Sans, sans-serif',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, background: iconBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className={`bi ${iconClass}`} style={{ fontSize: 26, color: iconColor }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{message}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{ padding: '10px 28px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'Open Sans, sans-serif', minWidth: 110 }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '10px 28px', border: 'none', borderRadius: 8, background: confirmBg, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', minWidth: 110 }}
            onMouseEnter={e => (e.currentTarget.style.background = confirmHov)}
            onMouseLeave={e => (e.currentTarget.style.background = confirmBg)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
