import type { ComponentEntry } from "../../types.js";

const spatialHash: ComponentEntry = {
  name: "spatial-hash",
  version: "1.0.0",
  category: "data-structure",
  target: "js",
  renderers: [],
  code: `\
function createSpatialHash(cellSize) {
  return { cellSize: cellSize, cells: {} };
}

function insertCell(hash, x, y, data) {
  var cx = Math.floor(x / hash.cellSize);
  var cy = Math.floor(y / hash.cellSize);
  var key = cx + ',' + cy;
  if (!hash.cells[key]) hash.cells[key] = [];
  hash.cells[key].push({ x: x, y: y, data: data });
}

function queryNearby(hash, x, y, radius) {
  var cs = hash.cellSize;
  var minCx = Math.floor((x - radius) / cs);
  var maxCx = Math.floor((x + radius) / cs);
  var minCy = Math.floor((y - radius) / cs);
  var maxCy = Math.floor((y + radius) / cs);
  var r2 = radius * radius;
  var results = [];
  for (var cy = minCy; cy <= maxCy; cy++) {
    for (var cx = minCx; cx <= maxCx; cx++) {
      var cell = hash.cells[cx + ',' + cy];
      if (!cell) continue;
      for (var i = 0; i < cell.length; i++) {
        var p = cell[i];
        var dx = p.x - x, dy = p.y - y;
        if (dx * dx + dy * dy <= r2) results.push(p);
      }
    }
  }
  return results;
}
`,
  exports: ["createSpatialHash", "insertCell", "queryNearby"],
  dependencies: [],
  description: "Grid-based spatial hashing for fast neighbor lookups.",
  usage: `\
### spatial-hash — Spatial Hashing

\`\`\`js
var hash = createSpatialHash(50);
points.forEach(function(p) { insertCell(hash, p.x, p.y, p); });
var nearby = queryNearby(hash, x, y, 100);
\`\`\`
`,
};

export default spatialHash;
