import { ZOOM_CLUSTER, RADII, COLORS } from './constants';
import { toRoman, drawLabel } from './utils';

// --- CACHE DE IMAGENS ---------------------------------------
const imgCache = new Map();

function getImage(url) {
  if (!url) return null;
  if (imgCache.has(url)) return imgCache.get(url);
  const img = new Image();
  img.src = url;
  imgCache.set(url, img);
  return img;
}

// ✅ Interpola cor: dourado (início) → azul-ardósia (raiz)
function getTraceColor(depth, maxDepth) {
  if (depth == null || !maxDepth) return '#f59e0b';
  const t = Math.min(depth / maxDepth, 1);
  const r = Math.round(245 + (100 - 245) * t);
  const g = Math.round(158 + (149 - 158) * t);
  const b = Math.round(11  + (237 - 11)  * t);
  return `rgb(${r},${g},${b})`;
}

function hexToRgba(color, alpha) {
  // Aceita rgb(...) direto
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  return color;
}
// ------------------------------------------------------------

export const paintNode = ({ node, ctx, globalScale, effectiveZoom, highlightNodes }) => {
  if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

  const isCluster   = effectiveZoom < ZOOM_CLUSTER;
  const isRoot      = node.type === 'root';
  const isPope      = node.type === 'pope';
  const isLost      = node.type === 'lost';
  const isRecovered = node.type === 'recovered';
  const isHighlit   = highlightNodes.has(node.id);
  const isAnchor    = node.isCenturyAnchor;

  // ── MODO CLUSTER ─────────────────────────────────────────
  if (isCluster) {
    if (!isRoot && !isAnchor) return;
    const r = isRoot ? 28 : 20;
    ctx.shadowBlur  = isRoot ? 25 : 0;
    ctx.shadowColor = isRoot ? '#fbbf24' : 'transparent';
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = isRoot ? '#fffbeb' : '#e7e5e4';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isRoot ? '#d97706' : '#78716c';
    ctx.lineWidth   = isRoot ? 2 : 1;
    ctx.stroke();
    ctx.font         = isRoot ? 'bold 14px "Cinzel", serif' : '10px "Lato", sans-serif';
    ctx.fillStyle    = '#44403c';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isRoot ? '✝' : toRoman(node.century), node.x, node.y + 1);
    return;
  }

  // ── MODO DETALHADO ────────────────────────────────────────
  const radius  = isRoot ? RADII.ROOT + 6 : (isPope ? RADII.POPE + 2 : RADII.BISHOP);
  const opacity = highlightNodes.size > 0 ? (isHighlit ? 1 : 0.12) : 1;
  ctx.globalAlpha = opacity;

  // ✅ Cor progressiva baseada na profundidade do nó na cadeia
  const traceColor = isHighlit
    ? getTraceColor(node.traceDepth, node.traceMaxDepth)
    : '#fbbf24';

  // A. HALO
  if (isHighlit || isRoot) {
    const haloColor = isRoot
      ? 'rgba(251,191,36,0.3)'
      : hexToRgba(traceColor, 0.22);

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + (isRoot ? 8 : 5), 0, 2 * Math.PI);
    ctx.fillStyle   = haloColor;
    ctx.shadowBlur  = isRoot ? 24 : 18;
    ctx.shadowColor = isRoot ? '#fbbf24' : traceColor;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // B. CÍRCULO PRINCIPAL
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

  const img = getImage(node.imgUrl);
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.clip();
    try { ctx.drawImage(img, node.x - radius, node.y - radius, radius * 2, radius * 2); }
    catch (e) {}
    ctx.restore();
  } else {
    const grad = ctx.createRadialGradient(
      node.x - radius / 3, node.y - radius / 3, radius * 0.2,
      node.x, node.y, radius
    );

    if (isRoot) {
      grad.addColorStop(0, '#fffbeb');
      grad.addColorStop(1, '#f59e0b');
    } else if (isLost) {
      grad.addColorStop(0, '#fee2e2');
      grad.addColorStop(1, '#ef4444');
    } else if (isRecovered && isHighlit) {
      // ✅ Recovered destacado: gradiente na cor da profundidade
      grad.addColorStop(0, '#fffdf5');
      grad.addColorStop(1, traceColor);
    } else if (isPope) {
      grad.addColorStop(0, '#fafaf9');
      grad.addColorStop(1, '#d6d3d1');
    } else {
      grad.addColorStop(0, '#f5f5f4');
      grad.addColorStop(1, '#a8a29e');
    }

    ctx.fillStyle = grad;
    ctx.fill();

    if (isLost) {
      ctx.fillStyle    = '#fff';
      ctx.font         = `bold ${radius}px sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', node.x, node.y);
    }
  }

  // C. BORDA
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = isHighlit
    ? traceColor
    : (isRoot ? '#d97706' : '#ffffff88');
  ctx.lineWidth = (isHighlit ? 2.5 : 1.5) / globalScale;
  ctx.stroke();

  // D. LABEL
  const showName = isRoot || isPope || isHighlit || isLost || globalScale > 2.2;
  if (showName) {
    const fontSize = Math.min(14 / globalScale, 14);
    ctx.font = `${isRoot || isHighlit ? '700' : '400'} ${fontSize}px "Cinzel", serif`;
    const labelY    = node.y + radius + 4 / globalScale;
    const nameColor = isLost
      ? COLORS.TEXT_LOST
      : (isRoot || isHighlit ? '#292524' : '#57534e');

    drawLabel(ctx, node.name, node.x, labelY, fontSize, nameColor, isRoot || isHighlit);

    if (node.start_date && globalScale > 2.0 && (isPope || isRoot || (isRecovered && isHighlit))) {
      ctx.font      = `400 ${fontSize * 0.8}px "Lato", sans-serif`;
      ctx.fillStyle = isHighlit ? hexToRgba(traceColor, 0.8) : '#78716c';
      ctx.fillText(`${node.start_date} d.C.`, node.x, labelY + fontSize + 2 / globalScale);
    }
  }

  ctx.globalAlpha = 1;
};

// --- ESTILO DOS LINKS ---------------------------------------
export const getLinkStyle = (link, effectiveZoom, highlightLinks) => {
  const isCluster = effectiveZoom < ZOOM_CLUSTER;

  const srcId = link.source?.id ?? link.source;
  const tgtId = link.target?.id ?? link.target;
  const id    = `${srcId}->${tgtId}`;
  const rev   = `${tgtId}->${srcId}`;
  const isHighlighted = highlightLinks.has(id) || highlightLinks.has(rev);

  const linkType = link.linkType ?? 'consecration';
  const isLost   =
    linkType === 'lost' ||
    tgtId === 'lost_link' || srcId === 'lost_link' ||
    (tgtId && tgtId.startsWith('lost_')) ||
    (srcId && srcId.startsWith('lost_'));

  if (isCluster) return { color: 'transparent', width: 0, curvature: 0 };

  let color, width;

  if (isHighlighted) {
    // ✅ Cor do link baseada na profundidade da fonte (se disponível)
    const srcNode  = link.source;
    const depth    = srcNode?.traceDepth ?? null;
    const maxDepth = srcNode?.traceMaxDepth ?? null;
    color = getTraceColor(depth, maxDepth);
    width = 3;
  } else if (isLost) {
    color = 'rgba(239,68,68,0.45)';
    width = 1.2;
  } else if (highlightLinks.size > 0) {
    // Tudo fora do caminho some
    color = 'rgba(200,200,200,0.03)';
    width = 0.3;
  } else if (linkType === 'succession') {
    color = 'rgba(212,175,55,0.7)';
    width = 2;
  } else if (linkType === 'inferred') {
    color = 'rgba(148,163,184,0.22)';
    width = 0.5;
  } else {
    color = 'rgba(168,162,158,0.32)';
    width = 1;
  }

  const curvature = linkType === 'inferred' ? 0.3 : 0;
  return { color, width, curvature };
};