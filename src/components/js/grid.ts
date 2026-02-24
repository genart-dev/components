import type { ComponentEntry } from "../../types.js";

const grid: ComponentEntry = {
  name: "grid",
  version: "1.0.0",
  category: "grid",
  target: "js",
  renderers: [],
  code: `\
function marchingSquares(field, cols, rows, threshold) {
  var segments = [];
  function val(x, y) { return field[y * cols + x] >= threshold ? 1 : 0; }
  function interp(a, b, va, vb) {
    var dv = vb - va;
    return dv === 0 ? 0.5 : (threshold - va) / dv;
  }
  for (var y = 0; y < rows - 1; y++) {
    for (var x = 0; x < cols - 1; x++) {
      var v00 = field[y * cols + x], v10 = field[y * cols + x + 1];
      var v01 = field[(y+1) * cols + x], v11 = field[(y+1) * cols + x + 1];
      var code = val(x,y) | (val(x+1,y)<<1) | (val(x,y+1)<<2) | (val(x+1,y+1)<<3);
      if (code === 0 || code === 15) continue;
      var top = [x + interp(v00, v10, v00, v10), y];
      var bottom = [x + interp(v01, v11, v01, v11), y + 1];
      var left = [x, y + interp(v00, v01, v00, v01)];
      var right = [x + 1, y + interp(v10, v11, v10, v11)];
      if (code===1||code===14) segments.push([top, left]);
      else if (code===2||code===13) segments.push([top, right]);
      else if (code===3||code===12) segments.push([left, right]);
      else if (code===4||code===11) segments.push([left, bottom]);
      else if (code===6||code===9) segments.push([top, bottom]);
      else if (code===7||code===8) segments.push([right, bottom]);
      else if (code===5) { segments.push([top, left]); segments.push([right, bottom]); }
      else if (code===10) { segments.push([top, right]); segments.push([left, bottom]); }
    }
  }
  return segments;
}

function floodFill(grid, cols, rows, startX, startY, fillVal) {
  var target = grid[startY * cols + startX];
  if (target === fillVal) return grid;
  var result = grid.slice();
  var stack = [[startX, startY]];
  while (stack.length > 0) {
    var p = stack.pop();
    var px = p[0], py = p[1];
    if (px < 0 || px >= cols || py < 0 || py >= rows) continue;
    if (result[py * cols + px] !== target) continue;
    result[py * cols + px] = fillVal;
    stack.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);
  }
  return result;
}

function bresenhamLine(x0, y0, x1, y1) {
  var points = [];
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy;
  while (true) {
    points.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    var e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return points;
}

function cellularAutomaton(grid, cols, rows, ruleFn) {
  var next = new Array(cols * rows);
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      var neighbors = 0;
      for (var dy = -1; dy <= 1; dy++)
        for (var dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          var nx = (x + dx + cols) % cols, ny = (y + dy + rows) % rows;
          neighbors += grid[ny * cols + nx] ? 1 : 0;
        }
      next[y * cols + x] = ruleFn(grid[y * cols + x], neighbors);
    }
  }
  return next;
}
`,
  exports: ["marchingSquares", "floodFill", "bresenhamLine", "cellularAutomaton"],
  dependencies: [],
  description: "Grid/heightmap algorithms (marching squares, flood fill, Bresenham).",
  usage: `\
### grid — Grid Algorithms

\`\`\`js
var segs = marchingSquares(heightmap, 100, 100, 0.5);
var filled = floodFill(grid, w, h, 0, 0, 1);
var line = bresenhamLine(0, 0, 10, 7);
var next = cellularAutomaton(grid, w, h, function(cell, n) {
  return n === 3 || (cell && n === 2) ? 1 : 0; // Game of Life
});
\`\`\`
`,
};

export default grid;
