// ApostolicTree.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HomeService } from '../services/HomeService';
import { GraphCanvas } from '../components/GraphCanvas';
import { ControlPanel } from '../components/ControlPanel';
import { Timeline } from '../components/Timeline';
import { Legend } from '../components/Legend';

export const NODE_SPACING = 14; // ✅ compacto — era 38
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
        sortIndex: 0,       // ✅ Jesus no topo da linha
        isCenturyAnchor: false,
        fx: 0,
        fy: 0,
        xOffset: 0,
      }];

      const links = [];
      const seenCenturies = new Set([1]);
      const hashToIndex = new Map();

      // Pré-computa quantos papas há por século para o xOffset
      const centuryCount = new Map();
      sortedPopes.forEach(pope => {
        const rawDate = pope.papacyStartDate ?? pope.papacy_start_date;
        const year = rawDate ? new Date(rawDate).getFullYear() : null;
        const century = year ? Math.ceil(year / 100) : 99;
        centuryCount.set(century, (centuryCount.get(century) ?? 0) + 1);
      });

      const centuryPos = new Map(); // posição atual dentro do século

      sortedPopes.forEach((pope, i) => {
        const rawDate = pope.papacyStartDate ?? pope.papacy_start_date;
        const year = rawDate ? new Date(rawDate).getFullYear() : null;
        const century = year ? Math.ceil(year / 100) : 99;

        const isAnchor = !seenCenturies.has(century);
        if (isAnchor) seenCenturies.add(century);

        // ✅ xOffset: alterna esquerda/direita dentro do século
        const pos = centuryPos.get(century) ?? 0;
        centuryPos.set(century, pos + 1);
        const xOffset = (pos % 2 === 0 ? 1 : -1) * Math.floor(pos / 2) * 6;

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
          xOffset,
        });
      });

      const allIds = new Set(nodes.map(n => n.id));

      sortedPopes.forEach(pope => {
        const parentHash = pope.parentHash ?? pope.parent_hash;
        if (!parentHash || parentHash.toLowerCase() === '00x00x00') return;

        if (allIds.has(parentHash)) {
          links.push({ source: pope.hash, target: parentHash, linkType: 'consecration' });
          return;
        }

        const myIndex = hashToIndex.get(pope.hash) ?? 1;
        if (myIndex > 1) {
          const predecessorHash = sortedPopes[myIndex - 2]?.hash;
          if (predecessorHash) {
            links.push({ source: pope.hash, target: predecessorHash, linkType: 'inferred' });
          }
        }
      });

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
      // ✅ usa posição real do nó após física
      fg.centerAt(target.x ?? 0, target.y ?? (target.sortIndex * NODE_SPACING), 1000);
      fg.zoom(3.5, 1000);
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

        if (chain.length > 0 && chain[0].hash !== startNode.id) {
          newLinks.push({ source: startNode.id, target: chain[0].hash, linkType: 'consecration' });
        }

        return {
          nodes: [...prev.nodes, ...newNodes],
          links: [...prev.links, ...newLinks],
        };
      });
    }

    const chainIds  = chain.map(c => c.hash);
    const fullChain = chainIds[0] === startNode.id
      ? chainIds
      : [startNode.id, ...chainIds];

    fullChain.forEach(id => newHighlightNodes.add(id));

    for (let i = 0; i < fullChain.length - 1; i++) {
      newHighlightLinks.add(`${fullChain[i]}->${fullChain[i + 1]}`);
      newHighlightLinks.add(`${fullChain[i + 1]}->${fullChain[i]}`);
    }

    const lastHash   = fullChain[fullChain.length - 1];
    const lastNode   = chain.find(c => c.hash === lastHash);
    const lastParent = lastNode?.parentHash ?? lastNode?.parent_hash;

    if (!lastParent || lastParent.toLowerCase() === '00x00x00') {
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
            { source: lastHash, target: lostId,     linkType: 'lost' },
            { source: lostId,   target: PEDRO_HASH, linkType: 'lost' },
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
    if (fg) fg.zoomToFit(600, 40);
  }, [cleanTransientNodes]);

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
