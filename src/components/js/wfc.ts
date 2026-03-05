import type { ComponentEntry } from "../../types.js";

const wfc: ComponentEntry = {
  name: "wfc",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Wave Function Collapse: constraint-based tile placement. Procedural levels, textiles, pixel art.",
  tags: ["distribution", "constraint", "wfc", "wave-function-collapse", "tiling", "procedural"],
  parameters: [],
  exports: ["waveFunctionCollapse"],
  dependencies: [],
  usage: `var grid = waveFunctionCollapse(rng, tileSet, 10, 10);`,
  code: `\
// Wave Function Collapse — simplified overlap model
// tileSet: {
//   tiles: [{id, weight?}],        // tile definitions
//   adjacency: {[id]: {up:[], down:[], left:[], right:[]}}  // allowed neighbors
// }
// Returns 2D grid: tiles[row][col] = tileId | null (collapsed fail)
function waveFunctionCollapse(rng, tileSet, cols, rows, opts) {
  opts = opts || {};
  var tiles = tileSet.tiles;
  var adj = tileSet.adjacency;
  var tileIds = tiles.map(function(t) { return t.id; });
  var weights = {};
  tiles.forEach(function(t) { weights[t.id] = t.weight || 1; });

  // Each cell: Set of possible tile IDs
  var wave = [];
  for (var r = 0; r < rows; r++) {
    wave.push([]);
    for (var c = 0; c < cols; c++) {
      wave[r].push(tileIds.slice());
    }
  }

  function entropy(cell) {
    if (cell.length === 1) return 0;
    var wSum = 0, wLogSum = 0;
    for (var i = 0; i < cell.length; i++) {
      var w = weights[cell[i]];
      wSum += w;
      wLogSum += w * Math.log(w);
    }
    return Math.log(wSum) - wLogSum / wSum;
  }

  function observe() {
    // Find cell with min non-zero entropy
    var minE = Infinity, minR = -1, minC = -1;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (wave[r][c].length === 0) return false; // contradiction
        if (wave[r][c].length === 1) continue;
        var e = entropy(wave[r][c]) + rng() * 0.001; // break ties
        if (e < minE) { minE = e; minR = r; minC = c; }
      }
    }
    if (minR === -1) return true; // all collapsed
    // Collapse chosen cell by weighted random
    var cell = wave[minR][minC];
    var wSum = 0;
    for (var i = 0; i < cell.length; i++) wSum += weights[cell[i]];
    var pick = rng() * wSum, acc = 0, chosen = cell[0];
    for (var i2 = 0; i2 < cell.length; i2++) {
      acc += weights[cell[i2]];
      if (acc >= pick) { chosen = cell[i2]; break; }
    }
    wave[minR][minC] = [chosen];
    return null; // continue
  }

  function propagate() {
    var stack = [];
    // Push all cells for initial propagation
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++)
        stack.push([r, c]);

    while (stack.length > 0) {
      var rc = stack.pop(), r = rc[0], c = rc[1];
      var dirs = [[-1,0,'up'],[1,0,'down'],[0,-1,'left'],[0,1,'right']];
      for (var di = 0; di < dirs.length; di++) {
        var nr = r + dirs[di][0], nc = c + dirs[di][1], dir = dirs[di][2];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        var allowed = {};
        for (var i = 0; i < wave[r][c].length; i++) {
          var ns = (adj[wave[r][c][i]] || {})[dir] || [];
          for (var j = 0; j < ns.length; j++) allowed[ns[j]] = true;
        }
        var before = wave[nr][nc].length;
        wave[nr][nc] = wave[nr][nc].filter(function(id) { return allowed[id]; });
        if (wave[nr][nc].length === 0) return false; // contradiction
        if (wave[nr][nc].length < before) stack.push([nr, nc]);
      }
    }
    return true;
  }

  // Run until fully collapsed or contradiction
  var maxRetries = opts.retries || 5;
  for (var attempt = 0; attempt < maxRetries; attempt++) {
    // Reset
    for (var r2 = 0; r2 < rows; r2++)
      for (var c2 = 0; c2 < cols; c2++)
        wave[r2][c2] = tileIds.slice();

    if (!propagate()) continue;
    var ok = true;
    for (var step = 0; step < rows * cols; step++) {
      var result = observe();
      if (result === false) { ok = false; break; }
      if (result === true) break;
      if (!propagate()) { ok = false; break; }
    }
    if (ok) break;
  }

  // Extract grid
  var grid = [];
  for (var r3 = 0; r3 < rows; r3++) {
    grid.push([]);
    for (var c3 = 0; c3 < cols; c3++) {
      grid[r3].push(wave[r3][c3].length === 1 ? wave[r3][c3][0] : null);
    }
  }
  return grid;
}
`,
};

export default wfc;
