import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'ghost-primary' | 'icon' | 'link';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps {
  variant: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  style?: React.CSSProperties;
}

const BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: 'var(--font-family)',
  fontWeight: 600,
  fontSize: 'var(--font-size-sm)',
  borderRadius: 'var(--radius-input)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  userSelect: 'none' as const,
  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

function variantStyle(v: ButtonVariant, hov: boolean): React.CSSProperties {
  switch (v) {
    case 'primary':
      return {
        background: hov ? 'var(--color-primary-dark)' : 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: 'none',
      };
    case 'ghost':
      return {
        background: hov ? 'var(--color-bg-subtle)' : 'var(--color-bg-card)',
        color: 'var(--color-text-dark)',
        border: '1px solid var(--color-border-input)',
      };
    case 'ghost-primary':
      return {
        background: hov ? 'var(--color-primary-light)' : 'var(--color-bg-card)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary)',
      };
    case 'danger':
      return {
        background: hov ? 'var(--color-error-dark)' : 'var(--color-error)',
        color: 'var(--color-text-inverse)',
        border: 'none',
      };
    case 'icon':
      return {
        background: 'transparent',
        color: hov ? 'var(--color-text-dark)' : 'var(--color-text-secondary)',
        border: 'none',
      };
    case 'link':
      return {
        background: 'transparent',
        color: 'var(--color-primary)',
        border: 'none',
        textDecoration: hov ? 'underline' : 'none',
        padding: 0,
      };
  }
}

function sizeStyle(v: ButtonVariant, s: ButtonSize): React.CSSProperties {
  if (v === 'icon') {
    const d = s === 'sm' ? 32 : 36;
    return { width: d, height: d, minHeight: d, padding: 0 };
  }
  if (v === 'link') return {};
  return s === 'sm'
    ? { minHeight: 36, padding: '0 12px' }
    : { minHeight: 40, padding: '0 16px' };
}

function spinnerColor(v: ButtonVariant): 'white' | 'primary' | 'muted' {
  if (v === 'primary' || v === 'danger') return 'white';
  if (v === 'ghost-primary' || v === 'link') return 'primary';
  return 'muted';
}

export function Button({
  variant,
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  type = 'button',
  title,
  style: styleProp,
}: ButtonProps) {
  const [hov, setHov] = useState(false);

  const isDisabled = disabled || loading;

  const style: React.CSSProperties = {
    ...BASE,
    ...variantStyle(variant, hov && !isDisabled),
    ...sizeStyle(variant, size),
    opacity: isDisabled ? 0.55 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    ...styleProp,
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={style}
    >
      {loading ? (
        <LoadingSpinner size="sm" color={spinnerColor(variant)} />
      ) : icon ? (
        <i className={`bi ${icon}`} style={{ fontSize: 12, flexShrink: 0 }} />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
