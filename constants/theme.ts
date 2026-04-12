export const palette = {
  // Main Theme Colors
  primary: '#5B2C6F',
  primaryLight: '#7D3C98',
  primaryDark: '#4A235A',
  
  // Accents
  gold: '#D4A017',
  goldLight: '#F4D03F',

  // Background and Surfaces
  background: '#F8F5F0',
  surface: '#FFFFFF',

  // Typography
  text: '#2C3E50',
  textSecondary: '#7F8C8D',

  // Status and Structure
  success: '#27AE60',
  danger: '#E74C3C',
  warning: '#F39C12',
  border: '#E8E0D8',

  // Preserving legacy fallbacks needed by existing code
  primaryMuted: 'rgba(91,44,111,0.1)',
  error: '#E74C3C',
  accent: '#D4A017',
  accentSoft: '#F4D03F',

  glassWhite: 'rgba(255, 255, 255, 0.97)',
  glassDark: 'rgba(0,0,0,0.5)',
  glassGold: 'rgba(212,160,23,0.1)',
  glassBorder: '#E8E0D8',
  glassBorderDark: '#2A2A3E',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export const touchMin = 44;

