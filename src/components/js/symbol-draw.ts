import type { ComponentEntry } from "../../types.js";

const symbolDraw: ComponentEntry = {
  name: "symbol-draw",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  dependencies: [],
  exports: ["drawSymbol", "symbolToSVG", "getSymbolNames"],
  description: "Draw registered SVG symbols on canvas or as SVG fragments. Reads symbol data from the __symbols__ constant injected by the renderer adapter.",
  code: `\
function drawSymbol(ctx, name, x, y, w, h, opts) {
  if (typeof __symbols__ === 'undefined' || !__symbols__[name]) return;
  var sym = __symbols__[name];
  var vb = sym.viewBox.split(/\\s+/).map(Number);
  var vbX = vb[0] || 0, vbY = vb[1] || 0, vbW = vb[2] || 100, vbH = vb[3] || 100;
  var scaleX = w / vbW, scaleY = h / vbH;
  var opacity = (opts && opts.opacity !== undefined) ? opts.opacity : 1;
  var overrideFill = opts && opts.fill;
  var overrideStroke = opts && opts.stroke;
  ctx.save();
  ctx.globalAlpha = (ctx.globalAlpha || 1) * opacity;
  ctx.translate(x - vbX * scaleX, y - vbY * scaleY);
  ctx.scale(scaleX, scaleY);
  for (var i = 0; i < sym.paths.length; i++) {
    var p = sym.paths[i];
    var path = new Path2D(p.d);
    if (p.fill !== 'none') {
      ctx.fillStyle = overrideFill || p.fill || '#000000';
      ctx.fill(path);
    }
    if (p.stroke || overrideStroke) {
      ctx.strokeStyle = overrideStroke || p.stroke || '#000000';
      ctx.lineWidth = (p.strokeWidth || 1) / Math.max(scaleX, scaleY);
      ctx.stroke(path);
    }
  }
  ctx.restore();
}

function symbolToSVG(name, x, y, w, h, opts) {
  if (typeof __symbols__ === 'undefined' || !__symbols__[name]) return '';
  var sym = __symbols__[name];
  var overrideFill = opts && opts.fill;
  var overrideStroke = opts && opts.stroke;
  var opacity = (opts && opts.opacity !== undefined) ? opts.opacity : 1;
  var pathStrs = sym.paths.map(function(p) {
    var attrs = 'd="' + p.d + '"';
    if (overrideFill) {
      attrs += ' fill="' + overrideFill + '"';
    } else if (p.fill === 'none') {
      attrs += ' fill="none"';
    } else if (p.fill) {
      attrs += ' fill="' + p.fill + '"';
    }
    if (overrideStroke || p.stroke) {
      attrs += ' stroke="' + (overrideStroke || p.stroke) + '"';
    }
    if (p.strokeWidth) {
      attrs += ' stroke-width="' + p.strokeWidth + '"';
    }
    return '<path ' + attrs + '/>';
  }).join('');
  return '<g transform="translate(' + x + ',' + y + ') scale(' + (w / parseFloat(sym.viewBox.split(/\\s+/)[2] || '100')) + ',' + (h / parseFloat(sym.viewBox.split(/\\s+/)[3] || '100')) + ')" opacity="' + opacity + '">' + pathStrs + '</g>';
}

function getSymbolNames() {
  if (typeof __symbols__ === 'undefined') return [];
  return Object.keys(__symbols__);
}
`,
  usage: `\
### symbol-draw — Draw Registered SVG Symbols

Requires symbols to be added to the sketch via \`add_symbol\`.

\`\`\`js
// Draw a pine tree at (x, y) with width 80, height 120
drawSymbol(ctx, "pine-tree", x, y, 80, 120);

// With overrides
drawSymbol(ctx, "sailboat", 200, 100, 60, 80, { fill: "#336699", opacity: 0.8 });

// Get SVG fragment string (for SVG renderer)
var fragment = symbolToSVG("mountain", 50, 50, 200, 150);

// List all available symbol names
var names = getSymbolNames();
\`\`\`
`,
};

export default symbolDraw;
