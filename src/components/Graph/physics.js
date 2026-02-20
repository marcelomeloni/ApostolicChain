import * as d3 from 'd3-force';
import { NODE_SPACING } from './constants';

export const configureSimulation = (fg, graphData) => {
  if (!fg) return;

  // Impede que o D3 centralize o "centro de massa", respeitando o Y=0 como topo absoluto
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
        return (srcType === 'root' || tgtType === 'root') ? 1.0 : 0.7;
      });
  }

  fg.d3Force('y', d3.forceY()
    .y(node => {
      if (node.id === 'jesus') return 0;
      if (node.sortIndex !== undefined) return node.sortIndex * NODE_SPACING;
      
      // Interpolação cronológica para ramos laterais (bispos/lost)
      if (node.start_date) return (node.start_date / 50) * NODE_SPACING;
      return 500;
    })
    .strength(node => (node.type === 'root' || node.type === 'pope' ? 1.0 : 0.6))
  );

  fg.d3Force('x', d3.forceX()
    .x(node => {
      if (node.type === 'root' || node.type === 'pope') return 0;

      // Estabilidade lateral determinística baseada no ID do nó
      const hashSeed = node.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const side = hashSeed % 2 === 0 ? 1 : -1;
      const depth = node.traceDepth ?? 1;

      return side * (130 + depth * 22);
    })
    .strength(node => (node.type === 'root' || node.type === 'pope' ? 1.0 : 0.5))
  );

  fg.d3Force('collide', d3.forceCollide(node => {
    if (node.type === 'root') return 26;
    if (node.type === 'pope') return 18;
    return 14;
  }).strength(1.0).iterations(3));

  fg.d3Force('charge', d3.forceManyBody()
    .strength(node => (node.type === 'recovered' ? -60 : -25))
    .distanceMax(250)
  );
};
