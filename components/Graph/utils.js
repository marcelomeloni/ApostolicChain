export const toRoman = (num) => {
  if (!num) return '';
  const lookup = { M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1 };
  let roman = '';
  let n = num;
  for (const i in lookup) {
    while (n >= lookup[i]) {
      roman += i;
      n -= lookup[i];
    }
  }
  return roman;
};

export const drawLabel = (ctx, text, x, y, fontSize, color, bold = false) => {
  ctx.font = `${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
  const metrics = ctx.measureText(text);
  const pad = fontSize * 0.3;
  
  // Fundo semitransparente
  ctx.fillStyle = 'rgba(250,250,249,0.82)';
  ctx.fillRect(x - metrics.width / 2 - pad, y - pad * 0.5, metrics.width + pad * 2, fontSize + pad);
  
  // Texto
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
};