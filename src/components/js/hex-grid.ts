import type { ComponentEntry } from "../../types.js";

const hexGrid: ComponentEntry = {
  name: "hex-grid",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Regular and semi-regular lattices: hexagonal, triangular, and jittered grids.",
  tags: ["distribution", "grid", "hex", "hexagonal", "triangular", "jitter", "lattice"],
  parameters: [],
  exports: ["hexGrid", "triGrid", "hexJitteredGrid"],
  dependencies: [],
  usage: `var pts = hexGrid(400, 400, 20);`,
  code: `\
// Hexagonal grid — flat-top or pointy-top hex packing
function hexGrid(width, height, size, opts) {
  opts = opts || {};
  var flat = opts.flat !== false; // flat-top by default
  var offX = opts.x || 0;
  var offY = opts.y || 0;
  var pts = [];
  var idx = 0;
  if (flat) {
    var colW = size * 3 / 2;
    var rowH = size * Math.sqrt(3);
    var cols = Math.ceil(width / colW) + 1;
    var rows = Math.ceil(height / rowH) + 1;
    for (var col = 0; col < cols; col++) {
      for (var row = 0; row < rows; row++) {
        var x = offX + col * colW;
        var y = offY + row * rowH + (col % 2 === 1 ? rowH / 2 : 0);
        if (x <= offX + width && y <= offY + height) {
          pts.push({ x: x, y: y, size: size, index: idx++, data: { col: col, row: row } });
        }
      }
    }
  } else {
    // pointy-top
    var rowH2 = size * 3 / 2;
    var colW2 = size * Math.sqrt(3);
    var rows2 = Math.ceil(height / rowH2) + 1;
    var cols2 = Math.ceil(width / colW2) + 1;
    for (var row2 = 0; row2 < rows2; row2++) {
      for (var col2 = 0; col2 < cols2; col2++) {
        var x2 = offX + col2 * colW2 + (row2 % 2 === 1 ? colW2 / 2 : 0);
        var y2 = offY + row2 * rowH2;
        if (x2 <= offX + width && y2 <= offY + height) {
          pts.push({ x: x2, y: y2, size: size, index: idx++, data: { col: col2, row: row2 } });
        }
      }
    }
  }
  return pts;
}

// Triangular grid — densest regular 2D packing
function triGrid(width, height, size, opts) {
  opts = opts || {};
  var offX = opts.x || 0;
  var offY = opts.y || 0;
  var pts = [];
  var idx = 0;
  var rowH = size * Math.sqrt(3) / 2;
  var rows = Math.ceil(height / rowH) + 1;
  for (var row = 0; row < rows; row++) {
    var offset = (row % 2 === 1) ? size / 2 : 0;
    var cols = Math.ceil(width / size) + 1;
    for (var col = 0; col < cols; col++) {
      var x = offX + col * size + offset;
      var y = offY + row * rowH;
      if (x <= offX + width && y <= offY + height) {
        pts.push({ x: x, y: y, size: size, index: idx++, data: { row: row, col: col } });
      }
    }
  }
  return pts;
}

// Jittered grid — regular grid with per-cell random offset
function hexJitteredGrid(rng, width, height, size, opts) {
  opts = opts || {};
  var jitter = opts.jitter !== undefined ? opts.jitter : 0.5;
  var offX = opts.x || 0;
  var offY = opts.y || 0;
  var pts = [];
  var idx = 0;
  var cols = Math.ceil(width / size);
  var rows = Math.ceil(height / size);
  for (var row = 0; row < rows; row++) {
    for (var col = 0; col < cols; col++) {
      var x = offX + (col + 0.5 + (rng() - 0.5) * jitter) * size;
      var y = offY + (row + 0.5 + (rng() - 0.5) * jitter) * size;
      pts.push({ x: x, y: y, size: size, index: idx++ });
    }
  }
  return pts;
}
`,
};

export default hexGrid;
