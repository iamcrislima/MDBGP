import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  title?: string;
  type?: 'warning' | 'error' | 'success';
  onClose: () => void;
  autoClose?: number;
}

export default function Toast({ message, title, type = 'warning', onClose, autoClose = 4000 }: ToastProps) {
  useEffect(() => {
    if (autoClose > 0) {
      const t = setTimeout(onClose, autoClose);
      return () => clearTimeout(t);
    }
  }, [autoClose, onClose]);

  const colors: Record<string, { bg: string; border: string; icon: string; iconColor: string }> = {
    warning: { bg: '#fffbeb', border: '#fbbf24', icon: 'bi-exclamation-triangle-fill', iconColor: '#d97706' },
    error:   { bg: '#fef2f2', border: '#f87171', icon: 'bi-x-circle-fill', iconColor: 'var(--color-error)' },
    success: { bg: '#f0fdf4', border: '#4ade80', icon: 'bi-check-circle-fill', iconColor: '#16a34a' },
  };

  const c = colors[type];

  return (
    <div style={{
      position: 'fixed', top: 76, right: 20,
      zIndex: 2000, minWidth: 320, maxWidth: 420,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderLeft: `4px solid ${c.border}`,
      borderRadius: 8,
      padding: '14px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      animation: 'slideInToast 0.3s ease',
    }}>
      <style>{`
        @keyframes slideInToast {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <i className={`bi ${c.icon}`} style={{ color: c.iconColor, fontSize: 18, flexShrink: 0, marginTop: 1 }} />

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1e2d', marginBottom: 2 }}>
          {title ?? (type === 'warning' ? 'Atenção!' : type === 'error' ? 'Erro!' : 'Sucesso!')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-dark)', lineHeight: 1.5 }}>{message}</div>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1, padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Hook to use toasts ────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  title?: string;
  type?: 'warning' | 'error' | 'success';
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((message: string, type: 'warning' | 'error' | 'success' = 'warning', title?: string) => {
    const id = Date.now();
    setToasts(p => [...p, { message, type, title, id }]);
  }, []);

  const close = useCallback((id: number) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map((t, i) => (
        <div key={t.id} style={{ position: 'fixed', top: 76 + i * 80, right: 20, zIndex: 2000 }}>
          <Toast message={t.message} title={t.title} type={t.type} onClose={() => close(t.id)} />
        </div>
      ))}
    </>
  );

  return { show, ToastContainer };
}
