export const palette = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  primary: '#1E4A78',
  primaryMuted: '#3A6EA5',
  accent: '#C9A227',
  accentSoft: '#E8D89A',
  text: '#1A2B3D',
  textSecondary: '#4A5F73',
  border: '#D4DDE8',
  error: '#B3261E',
  success: '#2E6F40',
  // Novos tokens translúcidos para o estilo "vitral" em painéis finos
  glassWhite: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(13, 33, 54, 0.25)',
  glassGold: 'rgba(201, 162, 39, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassBorderDark: 'rgba(30, 74, 120, 0.2)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 0,
  md: 0,
  lg: 0,
  full: 9999, // Para casos onde um círculo é estritamente necessário (ex: beads do rosário)
} as const;

export const touchMin = 44;
