import type { ComponentEntry } from "../../types.js";

const gridAdvanced: ComponentEntry = {
  name: "grid-advanced",
  version: "1.0.0",
  category: "grid",
  target: "js",
  renderers: [],
  code: `\
function marchingCubes(field, nx, ny, nz, threshold) {
  var vertices = [];
  function val(x, y, z) { return field[z * ny * nx + y * nx + x]; }
  function interp3(p1, p2, v1, v2) {
    if (Math.abs(v1 - v2) < 1e-6) return p1;
    var t = (threshold - v1) / (v2 - v1);
    return [p1[0]+(p2[0]-p1[0])*t, p1[1]+(p2[1]-p1[1])*t, p1[2]+(p2[2]-p1[2])*t];
  }
  for (var z = 0; z < nz-1; z++)
    for (var y = 0; y < ny-1; y++)
      for (var x = 0; x < nx-1; x++) {
        var v = [val(x,y,z),val(x+1,y,z),val(x+1,y+1,z),val(x,y+1,z),
                 val(x,y,z+1),val(x+1,y,z+1),val(x+1,y+1,z+1),val(x,y+1,z+1)];
        var code = 0;
        for (var i = 0; i < 8; i++) if (v[i] >= threshold) code |= (1 << i);
        if (code === 0 || code === 255) continue;
        var corners = [[x,y,z],[x+1,y,z],[x+1,y+1,z],[x,y+1,z],[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]];
        var edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
        for (var i = 0; i < edges.length; i++) {
          var e = edges[i];
          if ((code & (1<<e[0])) !== (code & (1<<e[1])))
            vertices.push(interp3(corners[e[0]], corners[e[1]], v[e[0]], v[e[1]]));
        }
      }
  return vertices;
}

function diamondSquare(size, rng, roughness) {
  var n = size;
  var grid = new Float64Array(n * n);
  grid[0] = rng(); grid[n-1] = rng(); grid[(n-1)*n] = rng(); grid[(n-1)*n+n-1] = rng();
  var step = n - 1, scale = roughness;
  while (step > 1) {
    var half = step / 2;
    for (var y = 0; y < n-1; y += step)
      for (var x = 0; x < n-1; x += step) {
        var avg = (grid[y*n+x]+grid[y*n+x+step]+grid[(y+step)*n+x]+grid[(y+step)*n+x+step])/4;
        grid[(y+half)*n+x+half] = avg + (rng()-0.5)*scale;
      }
    for (var y = 0; y < n; y += half)
      for (var x = (y % step === 0 ? half : 0); x < n; x += step) {
        var sum = 0, cnt = 0;
        if (y-half>=0){sum+=grid[(y-half)*n+x];cnt++;}
        if (y+half<n){sum+=grid[(y+half)*n+x];cnt++;}
        if (x-half>=0){sum+=grid[y*n+x-half];cnt++;}
        if (x+half<n){sum+=grid[y*n+x+half];cnt++;}
        grid[y*n+x] = sum/cnt + (rng()-0.5)*scale;
      }
    step = half; scale *= 0.5;
  }
  return grid;
}

function waveCollapse(tileCount, cols, rows, adjacency, rng) {
  var grid = new Array(cols * rows);
  for (var i = 0; i < grid.length; i++) {
    grid[i] = new Array(tileCount);
    for (var t = 0; t < tileCount; t++) grid[i][t] = true;
  }
  function entropy(cell) {
    var c = 0;
    for (var t = 0; t < tileCount; t++) if (cell[t]) c++;
    return c;
  }
  function collapse() {
    var minE = tileCount + 1, idx = -1;
    for (var i = 0; i < grid.length; i++) {
      var e = entropy(grid[i]);
      if (e > 1 && e < minE) { minE = e; idx = i; }
    }
    if (idx === -1) return false;
    var options = [];
    for (var t = 0; t < tileCount; t++) if (grid[idx][t]) options.push(t);
    var pick = options[Math.floor(rng() * options.length)];
    for (var t = 0; t < tileCount; t++) grid[idx][t] = (t === pick);
    propagate(idx);
    return true;
  }
  function propagate(idx) {
    var stack = [idx];
    while (stack.length > 0) {
      var ci = stack.pop();
      var cx = ci % cols, cy = Math.floor(ci / cols);
      var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (var d = 0; d < 4; d++) {
        var nx = cx+dirs[d][0], ny = cy+dirs[d][1];
        if (nx<0||nx>=cols||ny<0||ny>=rows) continue;
        var ni = ny*cols+nx;
        var changed = false;
        for (var t = 0; t < tileCount; t++) {
          if (!grid[ni][t]) continue;
          var valid = false;
          for (var s = 0; s < tileCount; s++) {
            if (grid[ci][s] && adjacency[s] && adjacency[s][d] && adjacency[s][d].indexOf(t) >= 0) { valid = true; break; }
          }
          if (!valid) { grid[ni][t] = false; changed = true; }
        }
        if (changed) stack.push(ni);
      }
    }
  }
  while (collapse()) {}
  var result = new Array(cols * rows);
  for (var i = 0; i < grid.length; i++) {
    for (var t = 0; t < tileCount; t++) if (grid[i][t]) { result[i] = t; break; }
  }
  return result;
}
`,
  exports: ["marchingCubes", "diamondSquare", "waveCollapse"],
  dependencies: ["prng", "grid"],
  description: "Advanced grid generation (marching cubes, diamond-square, WFC).",
  usage: `\
### grid-advanced — Advanced Grid Generation

\`\`\`js
var terrain = diamondSquare(129, rng, 1.0);
var verts = marchingCubes(field, 32, 32, 32, 0.5);
var tiles = waveCollapse(4, 20, 20, adjacencyRules, rng);
\`\`\`
`,
};

export default gridAdvanced;
