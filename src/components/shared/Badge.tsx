import React from 'react';

export type BadgeVariant =
  | 'success' | 'error' | 'warning' | 'neutral' | 'info'
  | 'vigente' | 'encerrado' | 'pendente' | 'ativo' | 'inativo'
  | 'transferido';

export type BadgeSize = 'sm' | 'md';
export type BadgeContext = 'default' | 'dark';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: BadgeSize;
  context?: BadgeContext;
  icon?: string;
}

type ColorPair = { bg: string; color: string };

const LIGHT: Record<BadgeVariant, ColorPair> = {
  success:   { bg: 'var(--color-success-bg)',  color: 'var(--color-success)' },
  ativo:     { bg: 'var(--color-success-bg)',  color: 'var(--color-success)' },
  vigente:   { bg: 'var(--color-success-bg)',  color: 'var(--color-success)' },
  error:     { bg: 'var(--color-error-bg)',    color: 'var(--color-error)' },
  inativo:   { bg: 'var(--color-error-bg)',    color: 'var(--color-error)' },
  warning:   { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)' },
  pendente:  { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)' },
  info:      { bg: 'var(--color-info-bg)',     color: 'var(--color-info)' },
  neutral:     { bg: 'var(--color-bg-subtle)',      color: 'var(--color-text-secondary)' },
  encerrado:   { bg: 'var(--color-bg-subtle)',      color: 'var(--color-text-secondary)' },
  transferido: { bg: 'var(--color-transferred-bg)', color: 'var(--color-transferred)' },
};

// Variantes para badges em superfícies escuras (ex: header navy #12121f)
const DARK: Record<BadgeVariant, ColorPair> = {
  success:   { bg: 'var(--color-primary)',          color: 'var(--color-text-inverse)' },
  ativo:     { bg: 'var(--color-primary)',          color: 'var(--color-text-inverse)' },
  vigente:   { bg: 'var(--color-primary)',          color: 'var(--color-text-inverse)' },
  error:     { bg: 'var(--color-error)',            color: 'var(--color-text-inverse)' },
  inativo:   { bg: 'var(--color-error)',            color: 'var(--color-text-inverse)' },
  warning:   { bg: 'var(--color-mdb-yellow)',       color: 'var(--color-text-ink)' },
  pendente:  { bg: 'var(--color-mdb-yellow)',       color: 'var(--color-text-ink)' },
  info:      { bg: 'var(--color-info)',             color: 'var(--color-text-inverse)' },
  neutral:     { bg: 'var(--color-badge-dark-bg)',    color: 'var(--color-badge-dark-text)' },
  encerrado:   { bg: 'var(--color-badge-dark-bg)',    color: 'var(--color-badge-dark-text)' },
  transferido: { bg: 'var(--color-transferred)',      color: 'var(--color-text-inverse)' },
};

export function Badge({ variant, label, size = 'md', context = 'default', icon }: BadgeProps) {
  const { bg, color } = context === 'dark' ? DARK[variant] : LIGHT[variant];
  const padding = size === 'sm' ? '1px 8px' : '2px 10px';

  return (
    <span style={{
      background: bg,
      color,
      borderRadius: 'var(--radius-pill)',
      padding,
      fontSize: 'var(--font-size-badge)',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: icon ? 4 : undefined,
    }}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: '9.5px' }} />}
      {label}
    </span>
  );
}

export default Badge;
