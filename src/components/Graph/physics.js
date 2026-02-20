// physics.js — completo
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
        if (isMainLine) return 0.85;
        if (srcType === 'recovered' || tgtType === 'recovered') return 0.5;
        return 0.3;
      });
  }

  // ✅ Força Y — usa sortIndex que já é a posição ordinal correta
  fg.d3Force('y', d3.forceY()
    .y(node => {
      if (node.sortIndex !== undefined) return node.sortIndex * NODE_SPACING;
      if (node.start_date) return (node.start_date / 50) * NODE_SPACING;
      return 300;
    })
    .strength(node => {
      if (node.type === 'root') return 1.0;
      if (node.type === 'pope') return 0.98; // mais forte — não deixa sair da linha
      if (node.type === 'recovered') return 0.6;
      return 0.4;
    })
  );

  fg.d3Force('x', d3.forceX()
    .x(node => {
      if (node.type === 'root' || node.type === 'pope') return 0;
      const code = node.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const side = code % 2 === 0 ? 1 : -1;
      const depth = node.traceDepth ?? 1;
      return side * (100 + depth * 18);
    })
    .strength(node => {
      if (node.type === 'root') return 1.0;
      if (node.type === 'pope') return 0.95;
      if (node.type === 'recovered') return 0.65;
      return 0.5;
    })
  );

  fg.d3F
