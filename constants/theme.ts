export const palette = {
  // Cores de Fundo (Modo Escuro / Vitral Neon)
  background: '#040b14', // Fundo principal extremamente escuro
  surface: '#0a192f', // Superfícies e paneis sólidos escuros
  
  // Cores de Ação (Vibrantes e Brilhantes)
  primary: '#64ffda', // Um cyan neon que brilha no fundo escuro (como na imagem gerada)
  primaryMuted: '#1E4A78', // O tom clássico para blocos profundos não focados
  accent: '#FFD700', // Dourado forte
  accentSoft: '#B8860B', // Dourado secundário
  
  // Tinta
  text: '#ccd6f6', // Branco levemente prateado brilhante
  textSecondary: '#8892b0', // Cinza azulado para legendas
  
  // Estrutura
  border: '#233554', // Bordas padrões
  error: '#ff5555',
  success: '#50fa7b',
  
  // Texturas de Vidro (Vitral Geométrico Translúcido)
  glassWhite: 'rgba(255, 255, 255, 0.03)',
  glassDark: 'rgba(10, 25, 47, 0.75)',
  glassGold: 'rgba(255, 215, 0, 0.15)',
  glassBorder: 'rgba(100, 255, 218, 0.25)', // Borda cyan suave
  glassBorderDark: 'rgba(10, 25, 47, 0.6)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = { // ZERADO (Arestas afiadas)
  sm: 0,
  md: 0,
  lg: 0,
  full: 9999,
} as const;

export const touchMin = 44;
