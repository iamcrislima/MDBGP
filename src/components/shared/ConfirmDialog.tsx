import React from 'react';
import Button from './Button';
import ModalBase from './ModalBase';

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
  const isDanger  = confirmVariant === 'danger';
  const iconClass = icon ?? (isDanger ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill');
  const iconColor = isDanger ? 'var(--color-error)' : 'var(--color-primary)';
  const iconBg    = isDanger ? '#fef2f2' : 'var(--color-primary-light)';
  return (
    <ModalBase open={open} onClose={onCancel} width={420} zIndex={2000} backdropOpacity={0.45} style={{ borderRadius: 14 }}>
      <div style={{ padding: '32px 28px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, background: iconBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className={`bi ${iconClass}`} style={{ fontSize: 26, color: iconColor }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{message}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
          <Button variant="ghost" onClick={onCancel} style={{ minWidth: 110 }}>Cancelar</Button>
          <Button variant={confirmVariant} onClick={onConfirm} style={{ minWidth: 110 }}>{confirmLabel}</Button>
        </div>
      </div>
    </ModalBase>
  );
}
