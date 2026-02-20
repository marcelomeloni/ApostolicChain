// physics.js
import * as d3 from 'd3-force';
import { NODE_SPACING } from './constants';

export const configureSimulation = (fg, graphData) => {
  if (!fg) return;

  const linkForce = fg.d3Force('link');
  if (linkForce) {
    linkForce
      .distance(link => {
        const srcType = link.source?.type ?? '';
        const tgtType = link.target?.type ?? '';
        const isMainLine =
          (srcType === 'pope' || srcType === 'root') &&
          (tgtType === 'pope' || tgtType === 'root');
        if (isMainLine) return NODE_SPACING * 0.9;
        if (srcType === 'recovered' || tgtType === 'recovered') return NODE_SPACING * 1.4;
        return 50;
      })
      .strength(link => {
        const srcType = link.source?.type ?? '';
        const tgtType = link.target?.type ?? '';
        const isMainLine =
          (srcType === 'pope' || srcType === 'root') &&
          (tgtType === 'pope' || tgtType === 'root');
        if (isMainLine) return 0.9;
        if (srcType === 'recovered' || tgtType === 'recovered') return 0.5;
        return 0.3;
      });
  }

  // ✅ Y: linha vertical — sortIndex * NODE_SPACING
  fg.d3Force('y', d3.forceY()
    .y(node => {
      if (node.sortIndex !== undefined) return node.sortIndex * NODE_SPACING;
      if (node.start_date) return (node.start_date / 50) * NODE_SPACING;
      return 300;
    })
    .strength(node => {
      if (node.type === 'root') return 1.0;
      if (node.type === 'pope') return 0.98;
      if (node.type === 'recovered') return 0.6;
      return 0.4;
    })
  );

  // ✅ X: papas no centro, recovered alternam lados, xOffset agrupa por século
  fg.d3Force('x', d3.forceX()
    .x(node => {
      if (node.type === 'root') return 0;
      if (node.type === 'pope') return node.xOffset ?? 0;
      const code = node.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const side = code % 2 === 0 ? 1 : -1;
      return side * (80 + (node.traceDepth ?? 1) * 14);
    })
    .strength(node => {
      if (node.type === 'root') return 1.0;
      if (node.type === 'pope') return 0.7;
      if (node.type === 'recovered') return 0.5;
      return 0.4;
    })
  );

  fg.d3Force('collide', d3.forceCollide(node => {
    if (node.type === 'root') return 14;
    if (node.type === 'pope') return 8;
    if (node.type === 'recovered') return 10;
    return 8;
  }).strength(0.8).iterations(3));

  fg.d3Force('charge', d3.forceManyBody()
    .strength(node => {
      if (node.type === 'pope' || node.type === 'root') return -15;
      if (node.type === 'recovered') return -25;
      return -10;
    })
    .distanceMax(200)
  );
};
