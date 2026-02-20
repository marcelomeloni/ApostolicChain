import * as d3 from 'd3-force';
import { NODE_SPACING } from './constants';

/**
 * Converte um start_date (ano numérico) para a posição Y equivalente
 * na escala dos papas (sortIndex * NODE_SPACING).
 * Usa os nós papas já posicionados como referência de interpolação.
 */
function dateToY(year, popeNodes) {
  if (!year || popeNodes.length === 0) return 500;

  // Ordena papas por ano
  const sorted = [...popeNodes].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));

  // Antes do primeiro papa
  if (year <= (sorted[0].year ?? 0)) {
    return (sorted[0].sortIndex ?? 1) * NODE_SPACING;
  }

  // Depois do último papa
  if (year >= (sorted[sorted.length - 1].year ?? 9999)) {
    return (sorted[sorted.length - 1].sortIndex ?? sorted.length) * NODE_SPACING;
  }

  // Interpolação linear entre dois papas adjacentes
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const yearA = a.year ?? 0;
    const yearB = b.year ?? 0;
    if (year >= yearA && year <= yearB) {
      const t = yearB === yearA ? 0 : (year - yearA) / (yearB - yearA);
      const idxA = a.sortIndex ?? i;
      const idxB = b.sortIndex ?? i + 1;
      return (idxA + t * (idxB - idxA)) * NODE_SPACING;
    }
  }

  return 500;
}

export const configureSimulation = (fg, graphData) => {
  if (!fg) return;

  // Nós papas (linha principal) — usados como âncoras de interpolação
  const popeNodes = graphData.nodes.filter(
    n => (n.type === 'pope' || n.type === 'root') && n.sortIndex !== undefined
  );

  fg.d3Force('center', null);

  const linkForce = fg.d3Force('link');
  if (linkForce) {
    linkForce
      .distance(link => {
        const srcType = link.source?.type ?? '';
        const tgtType = link.target?.type ?? '';
        const isMainLine =
          (srcType === 'pope' || srcType === 'root') &&
          (tgtType === 'pope' || tgtType === 'root');
        return isMainLine ? NODE_SPACING * 0.85 : NODE_SPACING * 1.5;
      })
      .strength(link => {
        const srcType = link.source?.type ?? '';
        const tgtType = link.target?.type ?? '';
        return srcType === 'root' || tgtType === 'root' ? 1.0 : 0.7;
      });
  }

  fg.d3Force('y', d3.forceY()
    .y(node => {
      // Jesus fixo no topo
      if (node.id === 'jesus') return 0;

      // Papas: posição exata pelo sortIndex
      if (node.type === 'pope' && node.sortIndex !== undefined) {
        return node.sortIndex * NODE_SPACING;
      }

      // Bispos/recovered/lost: interpola pela data usando a escala dos papas
      const year = node.year ?? node.start_date ?? null;
      if (year != null) {
        return dateToY(year, popeNodes);
      }

      return 500;
    })
    .strength(node => {
      if (node.type === 'root' || node.type === 'pope') return 1.0;
      if (node.type === 'recovered' || node.type === 'lost') return 0.85; // força maior p/ alinhar
      return 0.6;
    })
  );

  fg.d3Force('x', d3.forceX()
    .x(node => {
      if (node.type === 'root' || node.type === 'pope') return 0;
      // Lado determinístico baseado no hash
      const hashSeed = node.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const side = hashSeed % 2 === 0 ? 1 : -1;
      const depth = node.traceDepth ?? 1;
      return side * (130 + depth * 22);
    })
    .strength(node => {
      if (node.type === 'root' || node.type === 'pope') return 1.0;
      return 0.5;
    })
  );

  fg.d3Force('collide', d3.forceCollide(node => {
    if (node.type === 'root') return 26;
    if (node.type === 'pope') return 18;
    return 14;
  }).strength(1.0).iterations(3));

  fg.d3Force('charge', d3.forceManyBody()
    .strength(node => node.type === 'recovered' ? -60 : -25)
    .distanceMax(250)
  );
};
