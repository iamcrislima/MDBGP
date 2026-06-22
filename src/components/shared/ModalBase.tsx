import React, { useEffect } from 'react';

// ─── ModalBase ────────────────────────────────────────────────────────────────

export interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  /** Shell width. Default 640. Accepts number (px) or CSS string. */
  width?: number | string;
  /** Fixed height — use for tabbed modals that need a stable scroll area (ex: '80vh'). */
  height?: string;
  /** Default '90vh'. */
  maxHeight?: string;
  /**
   * Shadow + border preset.
   * 'standard' → --shadow-modal (navy-header modals).
   * 'light'    → --shadow-modal-light + 0.5px border (light-header modals).
   * Default 'standard'.
   */
  shadow?: 'standard' | 'light';
  /** Backdrop rgba opacity (0–1). Default 0.5. */
  backdropOpacity?: number;
  /** Backdrop blur in px. Default 2. */
  backdropBlur?: number;
  /**
   * Z-index base for the backdrop. Shell = zIndex + 10.
   * Default 1060. Use 2000 for ConfirmDialog (renders above other open modals).
   */
  zIndex?: number;
  /**
   * When true, renders as bottom sheet on mobile (position fixed, anchored to bottom).
   * The parent is responsible for deciding whether to pass this based on viewport.
   */
  mobileBottomSheet?: boolean;
  children: React.ReactNode;
  /** Extra styles merged into the shell div. */
  style?: React.CSSProperties;
  role?: string;
  ariaModal?: boolean;
  ariaLabelledby?: string;
}

function ModalBase({
  open,
  onClose,
  width = 640,
  height,
  maxHeight = '90vh',
  shadow = 'standard',
  backdropOpacity = 0.5,
  backdropBlur = 2,
  zIndex = 1060,
  mobileBottomSheet = false,
  children,
  style,
  role = 'dialog',
  ariaModal = true,
  ariaLabelledby,
}: ModalBaseProps) {
  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const shellCentered: React.CSSProperties = {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-modal)',
    width: typeof width === 'number' ? width : width,
    maxWidth: 'calc(100vw - 32px)',
    ...(height ? { height } : {}),
    maxHeight,
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: shadow === 'light' ? 'var(--shadow-modal-light)' : 'var(--shadow-modal)',
    ...(shadow === 'light' ? { border: '0.5px solid var(--color-border)' } : {}),
    zIndex: zIndex + 10,
    fontFamily: 'var(--font-family)',
    ...style,
  };

  const shellBottomSheet: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'var(--color-bg-card)',
    borderRadius: '16px 16px 0 0',
    maxHeight: '92dvh',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
    zIndex: zIndex + 10,
    fontFamily: 'var(--font-family)',
    ...style,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: `rgba(0,0,0,${backdropOpacity})`,
          backdropFilter: `blur(${backdropBlur}px)`,
          zIndex,
        }}
      />

      {/* Shell */}
      <div
        style={mobileBottomSheet ? shellBottomSheet : shellCentered}
        role={role}
        aria-modal={ariaModal || undefined}
        aria-labelledby={ariaLabelledby}
      >
        {children}
      </div>
    </>
  );
}

// ─── NavyHeader ───────────────────────────────────────────────────────────────
//
// Background: var(--color-modal-header) (#12121f).
// `children`  = left content (Avatar/icon + name/details row).
// `right`     = replaces the default × button. Pass a <div> with Badge + Button ×
//               for complex right-side layouts (e.g. VerModal / GerenciarFiliados).
// `closeAlign = 'flex-start'` for tall multi-line headers (e.g. OrgaoModal).

export interface NavyHeaderProps {
  onClose: () => void;
  right?: React.ReactNode;
  closeAlign?: 'center' | 'flex-start';
  children: React.ReactNode;
}

function NavyHeader({ onClose, right, closeAlign = 'center', children }: NavyHeaderProps) {
  return (
    <div style={{
      background: 'var(--color-modal-header)',
      padding: '16px 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        {children}
      </div>
      {right ?? (
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 24, cursor: 'pointer',
            lineHeight: 1, padding: '0 4px',
            flexShrink: 0, alignSelf: closeAlign,
            fontFamily: 'var(--font-family)',
          }}
        >×</button>
      )}
    </div>
  );
}

// ─── LightHeader ──────────────────────────────────────────────────────────────
//
// Background: var(--color-bg-card), with borderBottom.
// `children` = left area: icon + title.
// `actions`  = buttons rendered before the × (e.g. Editar button in Perfil/Usuário modals).
// `tabs`     = tab bar rendered below the top row (rendered inside the same border).
//
// Top row layout:
//   [children (flex, left)]   [actions?  ×  (flex, right)]
// Then, if tabs:
//   [tabs]

export interface LightHeaderProps {
  onClose: () => void;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
}

function LightHeader({ onClose, actions, tabs, children }: LightHeaderProps) {
  return (
    <div style={{
      padding: tabs ? '16px 20px 0' : '16px 20px',
      borderBottom: '1px solid var(--color-border)',
      flexShrink: 0,
      background: 'var(--color-bg-card)',
    }}>
      {/* Top row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: tabs ? 14 : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {children}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {actions}
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: 20, cursor: 'pointer',
              lineHeight: 1, padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-family)',
            }}
          >×</button>
        </div>
      </div>

      {/* Tab bar */}
      {tabs && <div style={{ display: 'flex' }}>{tabs}</div>}
    </div>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────
//
// Scrollable content area.
// Default padding matches navy-header modals ('22px 24px 28px').
// Light-header modals (Perfil/Usuário) use padding='20px'.

export interface BodyProps {
  children: React.ReactNode;
  /** Default '22px 24px 28px'. Light-header modals use '20px'. */
  padding?: string;
  style?: React.CSSProperties;
}

function Body({ children, padding = '22px 24px 28px', style }: BodyProps) {
  return (
    <div style={{ overflowY: 'auto', padding, flex: 1, ...style }}>
      {children}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
//
// Default: right-aligned (justifyContent: 'flex-end').
// For space-between layouts (e.g. info text on left, buttons on right),
// pass style={{ justifyContent: 'space-between' }}.

export interface FooterProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function Footer({ children, style }: FooterProps) {
  return (
    <div style={{
      padding: '12px 20px',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      gap: 8, flexShrink: 0,
      background: 'var(--color-bg-card)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Compose ──────────────────────────────────────────────────────────────────

const ModalBaseWithSubs = Object.assign(ModalBase, {
  NavyHeader,
  LightHeader,
  Body,
  Footer,
});

export default ModalBaseWithSubs;
