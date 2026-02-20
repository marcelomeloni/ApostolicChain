// Espaçamento lógico vertical entre nós
export const NODE_SPACING = 14;

// Limiares de Zoom
export const ZOOM_CLUSTER = 0.9;
export const ZOOM_DETAIL = 1.8;

// Raios dos Nós
export const RADII = {
  ROOT: 14,
  POPE: 10,
  BISHOP: 6,
  LOST: 8
};

// Cores (Mapeadas para variáveis do Tailwind se desejar, aqui hardcoded para Canvas)
export const COLORS = {
  BG: '#fafaf9', // stone-50
  TEXT_ROOT: '#78350f',
  TEXT_DEFAULT: '#1e293b',
  TEXT_LOST: '#dc2626',
  LINK_HIGHLIGHT: '#f59e0b',
  LINK_SUCCESSION: 'rgba(212,175,55,0.7)',
  LINK_DEFAULT: 'rgba(148,163,184,0.35)'

};
