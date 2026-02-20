// GraphCanvas.jsx
import React, { useCallback, useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { NODE_SPACING, ZOOM_CLUSTER, COLORS } from './Graph/constants';
import { configureSimulation } from './Graph/physics';
import { paintNode, getLinkStyle } from './Graph/renderers';

export function GraphCanvas({ fgRef, graphData, onNodeClick, highlightNodes, highlightLinks, isTracing }) {
  const [currentZoom, setCurrentZoom] = useState(0.6);
  const initialCameraSet = useRef(false);
  const simulationConfigured = useRef(false);

  const effectiveZoom = isTracing ? Math.max(currentZoom, ZOOM_CLUSTER + 0.01) : currentZoom;

  // ─── 1. Configure simulation ONCE on first load ───────────────────────────
  useEffect(() => {
    if (simulationConfigured.current) return;
    if (!fgRef.current || graphData.nodes.length === 0) return;

    // Pre-position ALL nodes before physics starts — critical to prevent explosion
   graphData.nodes.forEach(node => {
  if (node.id === 'jesus') {
    node.fx = 0;
    node.fy = 0;
    node.x  = 0;
    node.y  = 0;
  } else if (node.initialX !== undefined) {
    node.x = node.initialX;
    node.y = node.initialY;
  }
});

    configureSimulation(fgRef.current, graphData);
    simulationConfigured.current = true;
  }, [graphData.nodes.length, fgRef]);

  // ─── 2. Soft reheat only when transient nodes are added ──────────────────
  useEffect(() => {
    if (!simulationConfigured.current) return;
    const fg = fgRef.current;
    if (!fg) return;

    const hasTransient = graphData.nodes.some(n => n.type === 'recovered' || n.type === 'lost');
    if (!hasTransient) return;

    // Soft reheat: don't restart fully, just nudge
    const sim = fg.d3Force('link');
    if (sim) fg.d3ReheatSimulation();
  }, [graphData.nodes.length, fgRef]);

  // ─── 3. Initial camera framing ────────────────────────────────────────────
  useEffect(() => {
    if (initialCameraSet.current || graphData.nodes.length === 0) return;

    const timer = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg || typeof fg.graphData !== 'function') return;

      const yNodes = fg.graphData().nodes.filter(n => n.type === 'pope' || n.type === 'root');
      if (yNodes.length === 0) return;

      const allY = yNodes.map(n => n.y).filter(y => Number.isFinite(y));
      if (allY.length === 0) return;

      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      const rangeY = (maxY - minY) || 400;

      const screenH = window.innerHeight;
      const targetZoom = Math.min((screenH * 0.75) / rangeY, 2.5);

      fg.centerAt(0, minY + rangeY * 0.3, 800);
      fg.zoom(Math.max(targetZoom, 0.3), 800);
      initialCameraSet.current = true;
    }, 1500); // wait for warmupTicks + physics to settle

    return () => clearTimeout(timer);
  }, [graphData.nodes.length, fgRef]);

  // ─── 4. Render wrappers ───────────────────────────────────────────────────
  const handlePaintNode = useCallback((node, ctx, globalScale) => {
    paintNode({ node, ctx, globalScale, effectiveZoom, highlightNodes });
  }, [effectiveZoom, highlightNodes]);

  const handleLinkColor = useCallback(link => {
    return getLinkStyle(link, effectiveZoom, highlightLinks).color;
  }, [effectiveZoom, highlightLinks]);

  const handleLinkWidth = useCallback(link => {
    return getLinkStyle(link, effectiveZoom, highlightLinks).width;
  }, [effectiveZoom, highlightLinks]);

  // ✅ Use curvature from getLinkStyle so inferred links are visually distinct
  const handleLinkCurvature = useCallback(link => {
    return getLinkStyle(link, effectiveZoom, highlightLinks).curvature ?? 0;
  }, [effectiveZoom, highlightLinks]);

  // ─── 5. Link particle animation on highlighted path ───────────────────────
  const handleLinkParticles = useCallback(link => {
    const id  = `${link.source?.id ?? link.source}->${link.target?.id ?? link.target}`;
    const rev = `${link.target?.id ?? link.target}->${link.source?.id ?? link.source}`;
    return (highlightLinks.has(id) || highlightLinks.has(rev)) ? 3 : 0;
  }, [highlightLinks]);

  const handleParticleColor = useCallback(link => {
    const id  = `${link.source?.id ?? link.source}->${link.target?.id ?? link.target}`;
    const rev = `${link.target?.id ?? link.target}->${link.source?.id ?? link.source}`;
    return (highlightLinks.has(id) || highlightLinks.has(rev)) ? '#fbbf24' : 'transparent';
  }, [highlightLinks]);

  return (
    <div className="w-full h-full overflow-hidden relative">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        dagMode={null}
        backgroundColor={COLORS.BG}
        onZoom={({ k }) => setCurrentZoom(k)}

        // Node rendering
        nodeCanvasObject={handlePaintNode}
        nodeCanvasObjectMode={() => 'replace'}

        // Link rendering
        linkColor={handleLinkColor}
        linkWidth={handleLinkWidth}
        linkCurvature={handleLinkCurvature}

        // ✅ Animated particles along highlighted path
        linkDirectionalParticles={handleLinkParticles}
        linkDirectionalParticleColor={handleParticleColor}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}

        // Physics — slower decay = more stable, less flying
        d3VelocityDecay={0.65}
        d3AlphaDecay={0.025}
        d3AlphaMin={0.001}

        // Interactions
        onNodeClick={onNodeClick}
        minZoom={0.1}
        maxZoom={14}
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}

        // Run physics ticks before first paint — nodes start near correct positions
        warmupTicks={120}
        cooldownTicks={300}
      />
    </div>
  );

}
