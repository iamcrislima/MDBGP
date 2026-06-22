import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'muted';
  /** Full-page overlay: position fixed, inset 0, white 70% bg, centered. */
  overlay?: boolean;
  style?: React.CSSProperties;
}

const SIZES: Record<NonNullable<LoadingSpinnerProps['size']>, number> = {
  sm: 16,
  md: 24,
  lg: 36,
};

const COLORS: Record<NonNullable<LoadingSpinnerProps['color']>, string> = {
  primary: 'var(--color-primary)',
  white:   '#ffffff',
  muted:   'var(--color-text-muted)',
};

export function LoadingSpinner({ size = 'md', color = 'primary', overlay = false, style }: LoadingSpinnerProps) {
  const px  = SIZES[size];
  const col = COLORS[color];

  const spinner = (
    <div style={{
      width: px, height: px,
      border: '2px solid transparent',
      borderTop: `2px solid ${col}`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
      ...(!overlay ? style : {}),
    }} />
  );

  if (!overlay) return spinner;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(255,255,255,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      ...style,
    }}>
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
