/**
 * Design token values for non-CSS contexts (Chart.js canvas, inline SVG, etc.)
 * Canvas API does not resolve CSS variables — use these constants instead.
 * Keep in sync with tokens.css.
 */

export const COLORS = {
  // ── Brand MDB ──────────────────────────────────────────────────────────────
  mdbGreen:      '#00963F',
  mdbGreenDark:  '#007A32',
  mdbGreenLight: '#E8F5E9',
  mdbBlue:       '#003399',
  mdbBlue2:      '#336dcc',
  mdbBlue3:      '#6699dd',
  mdbYellow:     '#FFD000',

  // ── Semantic aliases ────────────────────────────────────────────────────────
  primary:       '#00963F',
  primaryDark:   '#007A32',
  primaryLight:  '#E8F5E9',
  primaryBorder: '#A8D5B5',

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:   '#111827',
  textDark:      '#374151',
  textStrong:    '#1e293b',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',

  // ── Borders ─────────────────────────────────────────────────────────────────
  border:        '#e5e7eb',
  borderInput:   '#d1d5db',

  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bgPage:        '#f4f6f9',
  bgCard:        '#ffffff',
  bgSubtle:      '#f9fafb',
  bgInput:       '#f8fafc',

  // ── Feedback ────────────────────────────────────────────────────────────────
  success:       '#15803d',
  successDark:   '#166534',
  successBg:     '#dcfce7',
  error:         '#dc2626',
  errorDark:     '#b91c1c',
  errorBg:       '#fee2e2',
  warning:       '#d97706',
  warningDark:   '#b45309',
  warningBg:     '#fef3c7',

  // ── Chart-specific ──────────────────────────────────────────────────────────
  chartGrid:     '#f3f4f6', // grid lines (y-axis / x-axis)
  chartTick:     '#6b7280', // tick labels
} as const;

export type ColorKey = keyof typeof COLORS;
