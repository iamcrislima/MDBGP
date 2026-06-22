import React from 'react';

const AVATAR_PALETTE = [
  'var(--color-primary)',
  '#7c3aed',
  '#db2777',
  '#059669',
  '#d97706',
  '#0891b2',
  'var(--color-error)',
];

function hashColor(nome: string): string {
  const sum = nome.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

export interface AvatarProps {
  nome: string;
  size?: number;
  src?: string;
  palette?: 'auto' | 'green' | 'gradient-green' | 'gradient-blue';
  shape?: 'circle' | 'rounded';
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({
  nome,
  size = 36,
  src,
  palette = 'auto',
  shape = 'circle',
  className,
  style,
}: AvatarProps) {
  const initials = nome.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  const fontSize = Math.round(size * 0.38);
  const borderRadius = shape === 'circle' ? 'var(--radius-circle)' : 'var(--radius-card)';

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    flexShrink: 0,
    overflow: 'hidden',
    fontFamily: 'var(--font-family)',
    fontWeight: 700,
    fontSize,
    boxSizing: 'border-box',
    ...style,  // allows callers to override any of the above, including fontSize
  };

  if (src) {
    return (
      <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
        <img src={src} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }

  let bg: string;
  let color: string;

  switch (palette) {
    case 'green':
      bg = 'var(--color-primary-light)';
      color = 'var(--color-primary-dark)';
      break;
    case 'gradient-green':
      bg = 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))';
      color = 'var(--color-text-inverse)';
      break;
    case 'gradient-blue':
      bg = 'linear-gradient(135deg, var(--color-avatar-blue), var(--color-avatar-purple))';
      color = 'var(--color-text-inverse)';
      break;
    default:
      bg = hashColor(nome);
      color = 'var(--color-text-inverse)';
  }

  return (
    <div
      className={className}
      style={{
        ...base,
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}

export default Avatar;
