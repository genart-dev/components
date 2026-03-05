import type { ComponentEntry } from "../../types.js";

const spaceFill: ComponentEntry = {
  name: "space-fill",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Space-filling curves: Hilbert, Z-order (Morton), and Gosper. Fractal paths through a region. Plotter-friendly.",
  tags: ["distribution", "curve", "hilbert", "z-order", "morton", "gosper", "space-filling", "fractal", "plotter"],
  parameters: [],
  exports: ["hilbert", "zorder", "gosper"],
  dependencies: [],
  usage: `var pts = hilbert(4); // 256 points`,
  code: `\
// Hilbert curve — order n produces 4^n points
// Returns [{x, y}] normalized to [0, 1]
function hilbert(order) {
  var n = 1 << order; // 2^order
  var pts = [];
  for (var i = 0; i < n * n; i++) {
    var rx, ry, s, t = i, x = 0, y = 0;
    for (s = 1; s < n; s *= 2) {
      rx = 1 & (t / 2);
      ry = 1 & (t ^ rx);
      // Rotate
      if (ry === 0) {
        if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
        var tmp = x; x = y; y = tmp;
      }
      x += s * rx;
      y += s * ry;
      t = Math.floor(t / 4);
    }
    pts.push({ x: (x + 0.5) / n, y: (y + 0.5) / n, index: i });
  }
  return pts;
}

// Z-order (Morton) curve — bit-interleaving, cache-friendly traversal
function zorder(order) {
  var n = 1 << order;
  var pts = [];
  for (var i = 0; i < n * n; i++) {
    // De-interleave bits: even bits → x, odd bits → y
    var x = 0, y = 0;
    for (var bit = 0; bit < order; bit++) {
      x |= ((i >> (2 * bit)) & 1) << bit;
      y |= ((i >> (2 * bit + 1)) & 1) << bit;
    }
    pts.push({ x: (x + 0.5) / n, y: (y + 0.5) / n, index: i });
  }
  return pts;
}

// Gosper (flowsnake) curve — L-system based space-filling curve
// Returns array of {x, y} points; order determines detail level
function gosper(order) {
  // L-system: A → A-B--B+A++AA+B-, B → +A-BB--B-A++A+B
  var state = 'A';
  for (var iter = 0; iter < order; iter++) {
    var next = '';
    for (var ci = 0; ci < state.length; ci++) {
      var ch = state[ci];
      if (ch === 'A') next += 'A-B--B+A++AA+B-';
      else if (ch === 'B') next += '+A-BB--B-A++A+B';
      else next += ch;
    }
    state = next;
  }
  // Turtle interpretation
  var x = 0, y = 0, angle = 0;
  var step = 1 / Math.pow(Math.sqrt(7), order);
  var pts = [{ x: x, y: y, index: 0 }];
  var idx = 1;
  for (var i = 0; i < state.length; i++) {
    var c = state[i];
    if (c === 'A' || c === 'B') {
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      pts.push({ x: x, y: y, index: idx++ });
    } else if (c === '+') {
      angle += Math.PI / 3;
    } else if (c === '-') {
      angle -= Math.PI / 3;
    }
  }
  // Normalize to [0, 1]
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (var pi = 0; pi < pts.length; pi++) {
    if (pts[pi].x < minX) minX = pts[pi].x;
    if (pts[pi].x > maxX) maxX = pts[pi].x;
    if (pts[pi].y < minY) minY = pts[pi].y;
    if (pts[pi].y > maxY) maxY = pts[pi].y;
  }
  var rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
  var scale = Math.min(1 / rangeX, 1 / rangeY);
  for (var pi2 = 0; pi2 < pts.length; pi2++) {
    pts[pi2].x = (pts[pi2].x - minX) * scale;
    pts[pi2].y = (pts[pi2].y - minY) * scale;
  }
  return pts;
}
`,
};

export default spaceFill;
