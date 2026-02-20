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

  const nodes = [{
    id: 'jesus',
    name: 'Jesus Cristo',
    type: 'root',
    val: 15,
    color: '#fbbf24',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Christ_Pantocrator_mosaic_from_Hagia_Sophia_2744_x_2900_pixels_3.1_MB.jpg/220px-Christ_Pantocrator_mosaic_from_Hagia_Sophia_2744_x_2900_pixels_3.1_MB.jpg',
    parent_hash: null,
    last_hash: null,
    century: 1,
    start_date: 0,
    year: 0,
    sortIndex: 0,
    isCenturyAnchor: true,
  }];

  const links = [];
  const seenCenturies = new Set([1]);

  const sortedPopes = [...popes]
    .filter(p => p.hash !== 'jesus')
    .sort((a, b) => {
      const dateA = a.papacyStartDate ?? a.papacy_start_date ?? a.startDate ?? a.start_date ?? '9999';
      const dateB = b.papacyStartDate ?? b.papacy_start_date ?? b.startDate ?? b.start_date ?? '9999';
      return new Date(dateA) - new Date(dateB);
    });

  // Mapa hash → node para lookup rápido ao criar links
  const hashToIndex = new Map();

  sortedPopes.forEach((pope, i) => {
    const rawDate = pope.papacyStartDate ?? pope.papacy_start_date ?? pope.startDate ?? pope.start_date;
    const year = rawDate ? parseInt(rawDate) : 0;
    const century = Math.floor(year / 100) + 1;
    const isAnchor = !seenCenturies.has(century);
    if (isAnchor) seenCenturies.add(century);

    hashToIndex.set(pope.hash, i + 1);

    nodes.push({
      id: pope.hash,
      name: pope.name,
      type: 'pope',
      val: 6,
      color: '#d4af37',
      imgUrl: pope.imgUrl || null,
      parent_hash: pope.parentHash ?? pope.parent_hash ?? null,
      last_hash: pope.lastHash ?? pope.last_hash ?? null,
      century,
      start_date: year,
      year,
      sortIndex: i + 1,
      isCenturyAnchor: isAnchor,
    });
  });

  // ✅ Constrói todos os links a partir do parent_hash de cada papa
  const allIds = new Set(nodes.map(n => n.id));

  sortedPopes.forEach(pope => {
    const parentHash = pope.parentHash ?? pope.parent_hash;

    if (!parentHash) return;

    // Sentinela = chain quebrada, pula (será tratada ao clicar)
    if (parentHash.toLowerCase() === '00x00x00') return;

    // Parent está no grafo: link direto
    if (allIds.has(parentHash)) {
      links.push({
        source: pope.hash,
        target: parentHash,
        linkType: 'consecration', // consagração episcopal
      });
      return;
    }

    // Parent é São Pedro: conecta a ele
    if (parentHash === PEDRO_HASH) {
      links.push({
        source: pope.hash,
        target: PEDRO_HASH,
        linkType: 'consecration',
      });
      return;
    }

    // Parent não está no grafo (bispo intermediário não carregado):
    // conecta ao papa cronologicamente anterior como fallback visual
    const myIndex = hashToIndex.get(pope.hash) ?? 1;
    const predecessor = sortedPopes.find((_, i) => i + 1 === myIndex - 1);
    if (predecessor) {
      links.push({
        source: pope.hash,
        target: predecessor.hash,
        linkType: 'inferred', // linha inferida (tracejada)
      });
    }
  });

  // ✅ Liga São Pedro a Jesus
  if (allIds.has(PEDRO_HASH)) {
    links.push({
      source: PEDRO_HASH,
      target: 'jesus',
      linkType: 'consecration',
    });
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

  // ✅ Busca a cadeia completa do backend de uma vez
  let chain = [];
  try {
    chain = await HomeService.traceLineage(startNode.id);
  } catch (e) {
    console.warn('traceLineage failed:', e);
  }

  // Adiciona nós da cadeia que ainda não estão no grafo
  if (chain.length > 0) {
    setGraphData(prev => {
      const existingIds = new Set(prev.nodes.map(n => n.id));
      const newNodes = [];
      const newLinks = [];

      chain.forEach((clergy, i) => {
        const rawDate = clergy.papacyStartDate ?? clergy.papacy_start_date ?? clergy.startDate ?? clergy.start_date;
        const year = rawDate ? parseInt(rawDate) : 0;

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

        // Cria link entre nó atual e seu parent (próximo da lista)
        if (i < chain.length - 1) {
          const childHash = clergy.hash;
          const parentHash = chain[i + 1].hash;
          const alreadyExists = prev.links.find(l =>
            (l.source?.id ?? l.source) === childHash &&
            (l.target?.id ?? l.target) === parentHash
          );
          if (!alreadyExists) {
            newLinks.push({ source: childHash, target: parentHash, linkType: 'consecration' });
          }
        }
      });

      // Garante link do startNode ao primeiro da chain (caso não seja ele mesmo)
      if (chain.length > 0 && chain[0].hash !== startNode.id) {
        newLinks.push({ source: startNode.id, target: chain[0].hash, linkType: 'consecration' });
      }

      return {
        nodes: [...prev.nodes, ...newNodes],
        links: [...prev.links, ...newLinks],
      };
    });
  }

  // Monta highlight percorrendo a chain
  const allNodes = [...graphData.nodes]; // snapshot antes do setGraphData async
  const chainIds = chain.map(c => c.hash);

  // Adiciona o startNode se não estiver na chain
  const fullChain = chainIds[0] === startNode.id ? chainIds : [startNode.id, ...chainIds];

  fullChain.forEach(id => newHighlightNodes.add(id));

  for (let i = 0; i < fullChain.length - 1; i++) {
    newHighlightLinks.add(`${fullChain[i]}->${fullChain[i + 1]}`);
    newHighlightLinks.add(`${fullChain[i + 1]}->${fullChain[i]}`);
  }

  // Trata fim da chain
  const lastHash = fullChain[fullChain.length - 1];
  const lastNode = chain.find(c => c.hash === lastHash);
  const lastParent = lastNode?.parentHash ?? lastNode?.parent_hash;

  if (lastParent?.toLowerCase() === '00x00x00' || !lastParent) {
    // Chain quebrada — adiciona nó lost
    const lostId = `lost_${lastHash}`;
    setGraphData(prev => {
      if (prev.nodes.find(n => n.id === lostId)) return prev;
      return {
        nodes: [...prev.nodes, {
          id: lostId, name: 'Dados Perdidos', type: 'lost',
          val: 10, color: '#ef4444', parent_hash: PEDRO_HASH,
          start_date: (lastNode?.start_date ?? 100) - 30,
        }],
        links: [
          ...prev.links,
          { source: lastHash, target: lostId },
          { source: lostId, target: PEDRO_HASH },
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

  setHighlightNodes(newHighlightNodes);
  setHighlightLinks(newHighlightLinks);

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
        prev.nodes.filter(n => n.type === 'lost' || n.type === 'recovered').map(n => n.id)
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
        ? parseInt(clergy.papacyStartDate ?? clergy.papacy_start_date)
        : 0,
      parent_hash: clergy.parentHash ?? clergy.parent_hash ?? null,
      last_hash: clergy.lastHash ?? clergy.last_hash ?? null,
      type: clergy.role?.toLowerCase() ?? 'pope',
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
      const maxIdx = Math.max(...popeNodes.map(n => n.sortIndex ?? 0));
      const totalH = maxIdx * NODE_SPACING;
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