import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HomeService } from '../services/HomeService';
import { GraphCanvas } from '../components/GraphCanvas';
import { ControlPanel } from '../components/ControlPanel';
import { Timeline } from '../components/Timeline';
import { Legend } from '../components/Legend';

export const NODE_SPACING = 38;
const PEDRO_HASH = '0xea8b4da913e8cca3e26fb3f76c8a4ac20e0c7c25e1273ebf8f654706da07ef09';

export default function ApostolicTree() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [isTracing, setIsTracing] = useState(false);

  // ─── 1. LOAD INITIAL GRAPH ────────────────────────────────────────────────
  useEffect(() => {
    const initGraph = async () => {
      const popes = await HomeService.getMainChain();

      // ✅ Ordena por papacy_start_date — nulls vão para o FIM
      const sortedPopes = [...popes]
        .filter(p => p.hash !== 'jesus')
        .sort((a, b) => {
          const dateA = a.papacyStartDate ?? a.papacy_start_date;
          const dateB = b.papacyStartDate ?? b.papacy_start_date;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateA) - new Date(dateB);
        });

      // Jesus: sortIndex -3 para ficar acima de São Pedro
      const nodes = [{
        id: 'jesus',
        name: 'Jesus Cristo',
        type: 'root',
        val: 15,
        color: '#fbbf24',
        imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Christ_Pantocrator_mosaic_from_Hagia_Sophia_2744_x_2900_pixels_3.1_MB.jpg/220px-Christ_Pantocrator_mosaic_from_Hagia_Sophia_2744_x_2900_pixels_3.1_MB.jpg',
        parent_hash: null,
        century: 1,
        start_date: 33,
        year: 33,
        sortIndex: -3,
        isCenturyAnchor: false,
        fx: 0,
        fy: -3 * NODE_SPACING,
      }];

      const links = [];
      const seenCenturies = new Set([1]);
      const hashToIndex = new Map();

      const SPIRAL_A = 18;        // distância entre voltas
const SPIRAL_START = 60;    // raio inicial (deixa espaço para Jesus no centro)
const TURNS_PER_100_YEARS = 0.8; // velocidade de rotação por século

sortedPopes.forEach((pope, i) => {
  const rawDate = pope.papacyStartDate ?? pope.papacy_start_date;
  const year = rawDate ? new Date(rawDate).getFullYear() : 2100;

  const century = year ? Math.ceil(year / 100) : null;
  const isAnchor = century != null && !seenCenturies.has(century);
  if (isAnchor) seenCenturies.add(century);

  // ✅ Ângulo baseado no ANO REAL — não no índice
  // Assim papas do mesmo século ficam agrupados na mesma volta
  const angle = (year / 100) * TURNS_PER_100_YEARS * 2 * Math.PI;
  const radius = SPIRAL_START + SPIRAL_A * (year / 100) * TURNS_PER_100_YEARS;

  const spiralX = radius * Math.cos(angle);
  const spiralY = radius * Math.sin(angle);

  hashToIndex.set(pope.hash, i + 1);

  nodes.push({
    id: pope.hash,
    name: pope.name,
    type: 'pope',
    val: 6,
    color: '#d4af37',
    imgUrl: pope.imgUrl || null,
    parent_hash: pope.parentHash ?? pope.parent_hash ?? null,
    century,
    start_date: year,
    year,
    sortIndex: i + 1,
    isCenturyAnchor: isAnchor,
    // ✅ Posição inicial da espiral — física só refina, não explode
    initialX: spiralX,
    initialY: spiralY,
  });
});
      // ✅ Links via parent_hash
      const allIds = new Set(nodes.map(n => n.id));

      sortedPopes.forEach(pope => {
        const parentHash = pope.parentHash ?? pope.parent_hash;
        if (!parentHash || parentHash.toLowerCase() === '00x00x00') return;

        if (allIds.has(parentHash)) {
          links.push({ source: pope.hash, target: parentHash, linkType: 'consecration' });
          return;
        }

        // Parent não carregado — conecta ao predecessor cronológico como fallback visual
        const myIndex = hashToIndex.get(pope.hash) ?? 1;
        if (myIndex > 1) {
          const predecessorHash = sortedPopes[myIndex - 2]?.hash;
          if (predecessorHash) {
            links.push({ source: pope.hash, target: predecessorHash, linkType: 'inferred' });
          }
        }
      });

      // São Pedro → Jesus
      if (allIds.has(PEDRO_HASH)) {
        links.push({ source: PEDRO_HASH, target: 'jesus', linkType: 'consecration' });
      }

      setGraphData({ nodes, links });
    };

    initGraph();
  }, []);

  // ─── 2. TIMELINE ─────────────────────────────────────────────────────────
  const availableCenturies = useMemo(() => {
    const centuries = new Set(graphData.nodes.map(n => n.century));
    return Array.from(centuries).sort((a, b) => a - b).filter(Boolean);
  }, [graphData.nodes]);

  const flyToCentury = useCallback((century) => {
    const fg = fgRef.current;
    if (!fg) return;
    const target = graphData.nodes.find(n => n.century === century && n.isCenturyAnchor);
    if (target) {
      fg.centerAt(0, (target.sortIndex ?? 0) * NODE_SPACING - 80, 1000);
      fg.zoom(2.5, 1000);
    }
  }, [graphData.nodes]);

  // ─── 3. TRACE PATH ───────────────────────────────────────────────────────
  const tracePathToJesus = useCallback(async (startNode) => {
    setIsTracing(true);

    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();
    newHighlightNodes.add(startNode.id);

    let chain = [];
    try {
      chain = await HomeService.traceLineage(startNode.id);
    } catch (e) {
      console.warn('traceLineage failed:', e);
    }

    if (chain.length > 0) {
      setGraphData(prev => {
        const existingIds = new Set(prev.nodes.map(n => n.id));
        const newNodes = [];
        const newLinks = [];

        chain.forEach((clergy, i) => {
          const rawDate = clergy.papacyStartDate ?? clergy.papacy_start_date
            ?? clergy.startDate ?? clergy.start_date;
          const year = rawDate ? new Date(rawDate).getFullYear() : 0;

          if (!existingIds.has(clergy.hash)) {
            newNodes.push({
              ...clergy,
              id: clergy.hash,
              start_date: year,
              year,
              val: 4,
              color: '#94a3b8',
              type: 'recovered',
              traceDepth: i,
              traceMaxDepth: chain.length - 1,
              parent_hash: clergy.parentHash ?? clergy.parent_hash ?? null,
            });
            existingIds.add(clergy.hash);
          }

          if (i < chain.length - 1) {
            const childHash  = clergy.hash;
            const parentHash = chain[i + 1].hash;
            const alreadyExists = prev.links.some(l =>
              (l.source?.id ?? l.source) === childHash &&
              (l.target?.id ?? l.target) === parentHash
            );
            if (!alreadyExists) {
              newLinks.push({ source: childHash, target: parentHash, linkType: 'consecration' });
            }
          }
        });

        // Garante link do startNode ao primeiro da chain (se não for ele mesmo)
        if (chain.length > 0 && chain[0].hash !== startNode.id) {
          newLinks.push({ source: startNode.id, target: chain[0].hash, linkType: 'consecration' });
        }

        return {
          nodes: [...prev.nodes, ...newNodes],
          links: [...prev.links, ...newLinks],
        };
      });
    }

    // Monta highlights
    const chainIds   = chain.map(c => c.hash);
    const fullChain  = chainIds[0] === startNode.id
      ? chainIds
      : [startNode.id, ...chainIds];

    fullChain.forEach(id => newHighlightNodes.add(id));

    for (let i = 0; i < fullChain.length - 1; i++) {
      newHighlightLinks.add(`${fullChain[i]}->${fullChain[i + 1]}`);
      newHighlightLinks.add(`${fullChain[i + 1]}->${fullChain[i]}`);
    }

    // Trata fim da chain
    const lastHash   = fullChain[fullChain.length - 1];
    const lastNode   = chain.find(c => c.hash === lastHash);
    const lastParent = lastNode?.parentHash ?? lastNode?.parent_hash;

    if (!lastParent || lastParent.toLowerCase() === '00x00x00') {
      // Chain quebrada — nó "Dados Perdidos"
      const lostId = `lost_${lastHash}`;
      setGraphData(prev => {
        if (prev.nodes.find(n => n.id === lostId)) return prev;
        return {
          nodes: [...prev.nodes, {
            id: lostId,
            name: 'Dados Perdidos',
            type: 'lost',
            val: 10,
            color: '#ef4444',
            parent_hash: PEDRO_HASH,
            start_date: (lastNode?.start_date ?? 100) - 30,
          }],
          links: [
            ...prev.links,
            { source: lastHash,    target: lostId,     linkType: 'lost' },
            { source: lostId,      target: PEDRO_HASH, linkType: 'lost' },
          ],
        };
      });
      newHighlightNodes.add(lostId);
      newHighlightNodes.add(PEDRO_HASH);
      newHighlightNodes.add('jesus');
      newHighlightLinks.add(`${lastHash}->${lostId}`);
      newHighlightLinks.add(`${lostId}->${PEDRO_HASH}`);
      newHighlightLinks.add(`${PEDRO_HASH}->jesus`);

    } else if (lastParent === PEDRO_HASH) {
      newHighlightNodes.add(PEDRO_HASH);
      newHighlightNodes.add('jesus');
      newHighlightLinks.add(`${lastHash}->${PEDRO_HASH}`);
      newHighlightLinks.add(`${PEDRO_HASH}->jesus`);

    } else if (lastParent === 'jesus') {
      newHighlightNodes.add('jesus');
      newHighlightLinks.add(`${lastHash}->jesus`);
    }

    // Sempre destaca São Pedro e Jesus no final
    newHighlightNodes.add(PEDRO_HASH);
    newHighlightNodes.add('jesus');
    newHighlightLinks.add(`${PEDRO_HASH}->jesus`);
    newHighlightLinks.add(`jesus->${PEDRO_HASH}`);

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
    setIsTracing(false);

    setTimeout(() => {
      const fg = fgRef.current;
      if (!fg || typeof fg.zoomToFit !== 'function') return;
      fg.zoomToFit(900, 60, node => newHighlightNodes.has(node.id));
      setTimeout(() => {
        const z = fgRef.current?.zoom();
        if (typeof z === 'number' && z < 1.1) fgRef.current.zoom(1.1, 300);
      }, 950);
    }, 150);

  }, [graphData]);

  // ─── 4. CLEAN TRANSIENT NODES ────────────────────────────────────────────
  const cleanTransientNodes = useCallback(() => {
    setGraphData(prev => {
      const removedIds = new Set(
        prev.nodes
          .filter(n => n.type === 'lost' || n.type === 'recovered')
          .map(n => n.id)
      );
      if (removedIds.size === 0) return prev;
      return {
        nodes: prev.nodes.filter(n => !removedIds.has(n.id)),
        links: prev.links.filter(l => {
          const src = l.source?.id ?? l.source;
          const tgt = l.target?.id ?? l.target;
          return !removedIds.has(src) && !removedIds.has(tgt);
        }),
      };
    });
  }, []);

  // ─── 5. INTERACTIONS ─────────────────────────────────────────────────────
  const handleNodeClick = useCallback(async (node) => {
    cleanTransientNodes();
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setIsTracing(false);
    if (node.type === 'lost') return;
    tracePathToJesus(node);
  }, [tracePathToJesus, cleanTransientNodes]);

  const handleSearch = useCallback((clergy) => {
    if (!clergy) return;
    const node = graphData.nodes.find(n => n.id === clergy.hash) ?? {
      ...clergy,
      id: clergy.hash,
      start_date: clergy.papacyStartDate ?? clergy.papacy_start_date
        ? new Date(clergy.papacyStartDate ?? clergy.papacy_start_date).getFullYear()
        : 0,
      parent_hash: clergy.parentHash ?? clergy.parent_hash ?? null,
      type: clergy.role?.toLowerCase() === 'pope' ? 'pope' : 'recovered',
    };
    handleNodeClick(node);
  }, [graphData.nodes, handleNodeClick]);

  const clearSelection = useCallback(() => {
    cleanTransientNodes();
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setSearchTerm('');
    setIsTracing(false);
    const fg = fgRef.current;
    if (fg) {
      const popeNodes = graphData.nodes.filter(n => n.type === 'pope' || n.type === 'root');
      const maxIdx    = Math.max(...popeNodes.map(n => n.sortIndex ?? 0));
      const totalH    = maxIdx * NODE_SPACING;
      const targetZoom = Math.min((window.innerHeight * 0.75) / totalH, 2.5);
      fg.centerAt(0, totalH * 0.3, 700);
      fg.zoom(Math.max(targetZoom, 0.4), 700);
    }
  }, [cleanTransientNodes, graphData.nodes]);

  // ─── 6. RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen overflow-hidden font-serif">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-[#e7e5e4] to-[#a8a29e] -z-20" />
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] -z-10 mix-blend-multiply" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@400;700&display=swap');
      `}</style>

      <div className="z-50 relative">
        <ControlPanel
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          onClear={clearSelection}
          hasSelection={highlightNodes.size > 0}
        />
        <Legend />
        <Timeline availableCenturies={availableCenturies} onSelectCentury={flyToCentury} />
      </div>

      <GraphCanvas
        fgRef={fgRef}
        graphData={graphData}
        onNodeClick={handleNodeClick}
        highlightNodes={highlightNodes}
        highlightLinks={highlightLinks}
        isTracing={isTracing}
      />
    </div>
  );
}

