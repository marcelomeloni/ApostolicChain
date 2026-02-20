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

  // ─── 1. Configure simulation ONCE ────────────────────────────────────────
  useEffect(() => {
    if (simulationConfigured.current) return;
    if (!fgRef.current || graphData.nodes.length === 0) return;

    // ✅ Pre-posiciona todos antes da física rodar
    graphData.nodes.forEach(node => {
      if (node.id === 'jesus') {
        node.fx = 0;
        node.fy = 0;
        node.x  = 0;
        node.y  = 0;
      } else if (node.sortIndex !== undefined) {
        node.x = node.xOffset ?? 0;
        node.y = node.sortIndex * NODE_SPACING;
      }
    });

    configureSimulation(fgRef.current, graphData);
    simulationConfigured.current = true;
  }, [graphData.nodes.length, fgRef]);

  // ─── 2. Reheat suave ao adicionar nós transientes ────────────────────────
  useEffect(() => {
    if (!simulationConfigured.current) return;
    const fg = fgRef.current;
    if (!fg) return;
    const hasTransient = graphData.nodes.some(n => n.type === 'recovered' || n.type === 'lost');
    if (hasTransient) fg.d3ReheatSimulation();
  }, [graphData.nodes.length, fgRef]);

  // ─── 3. Câmera inicial ────────────────────────────────────────────────────
  useEffect(() => {
    if (initialCameraSet.current || graphData.nodes.length === 0) return;

    const timer = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg || typeof fg.zoomToFit !== 'function') return;
      fg.zoomToFit(500, 50);
      initialCameraSet.current = true;
    }, 600);

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

  const handleLinkCurvature = useCallback(link => {
    return getLinkStyle(link, effectiveZoom, highlightLinks).curvature ?? 0;
  }, [effectiveZoom, highlightLinks]);

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

        nodeCanvasObject={handlePaintNode}
        nodeCanvasObjectMode={() => 'replace'}

        linkColor={handleLinkColor}
        linkWidth={handleLinkWidth}
        linkCurvature={handleLinkCurvature}

        linkDirectionalParticles={handleLinkParticles}
        linkDirectionalParticleColor={handleParticleColor}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}

        d3VelocityDecay={0.65}
        d3AlphaDecay={0.025}
        d3AlphaMin={0.001}

        onNodeClick={onNodeClick}
        minZoom={0.1}
        maxZoom={14}
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}

        warmupTicks={0}
        cooldownTicks={500}
      />
    </div>
  );
}
