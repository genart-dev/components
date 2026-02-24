import type { ComponentEntry } from "../../types.js";

const distribution: ComponentEntry = {
  name: "distribution",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  code: `\
function poissonDisk(rng, width, height, minDist, maxAttempts) {
  maxAttempts = maxAttempts || 30;
  var cellSize = minDist / Math.SQRT2;
  var cols = Math.ceil(width / cellSize), rows = Math.ceil(height / cellSize);
  var grid = new Array(cols * rows).fill(-1);
  var points = [], active = [];
  function addPoint(x, y) {
    var i = points.length;
    points.push([x, y]);
    active.push(i);
    var gx = Math.floor(x / cellSize), gy = Math.floor(y / cellSize);
    grid[gy * cols + gx] = i;
  }
  addPoint(rng() * width, rng() * height);
  while (active.length > 0) {
    var ri = Math.floor(rng() * active.length);
    var pi = active[ri], p = points[pi];
    var found = false;
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      var angle = rng() * Math.PI * 2;
      var dist = minDist + rng() * minDist;
      var nx = p[0] + Math.cos(angle) * dist, ny = p[1] + Math.sin(angle) * dist;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      var gx = Math.floor(nx / cellSize), gy = Math.floor(ny / cellSize);
      var ok = true;
      for (var dy = -2; dy <= 2 && ok; dy++)
        for (var dx = -2; dx <= 2 && ok; dx++) {
          var cx = gx + dx, cy = gy + dy;
          if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) continue;
          var ci = grid[cy * cols + cx];
          if (ci >= 0) {
            var cp = points[ci];
            var d2 = (nx-cp[0])*(nx-cp[0]) + (ny-cp[1])*(ny-cp[1]);
            if (d2 < minDist * minDist) ok = false;
          }
        }
      if (ok) { addPoint(nx, ny); found = true; break; }
    }
    if (!found) active.splice(ri, 1);
  }
  return points;
}

function jitteredGrid(rng, width, height, cellSize, jitter) {
  jitter = jitter || 0.5;
  var pts = [];
  for (var y = cellSize/2; y < height; y += cellSize)
    for (var x = cellSize/2; x < width; x += cellSize)
      pts.push([x + (rng()-0.5)*cellSize*jitter, y + (rng()-0.5)*cellSize*jitter]);
  return pts;
}

function haltonSequence(n, base1, base2) {
  base1 = base1 || 2; base2 = base2 || 3;
  function halton(i, base) {
    var f = 1, r = 0;
    while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
    return r;
  }
  var pts = [];
  for (var i = 0; i < n; i++) pts.push([halton(i+1, base1), halton(i+1, base2)]);
  return pts;
}

function uniformOnSphere(rng) {
  var u = rng(), v = rng();
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  return [Math.sin(phi)*Math.cos(theta), Math.sin(phi)*Math.sin(theta), Math.cos(phi)];
}

function gaussianCluster(rng, cx, cy, stddev, count) {
  var pts = [];
  for (var i = 0; i < count; i++) {
    var u1 = rng(), u2 = rng();
    var r = Math.sqrt(-2 * Math.log(u1 || 1e-10));
    var theta = 2 * Math.PI * u2;
    pts.push([cx + r * Math.cos(theta) * stddev, cy + r * Math.sin(theta) * stddev]);
  }
  return pts;
}
`,
  exports: ["poissonDisk", "jitteredGrid", "haltonSequence", "uniformOnSphere", "gaussianCluster"],
  dependencies: ["prng"],
  description: "Point distribution algorithms (Poisson disk, Halton, jittered grid).",
  usage: `\
### distribution — Point Distributions

\`\`\`js
var pts = poissonDisk(rng, 800, 600, 20);
var grid = jitteredGrid(rng, 800, 600, 40, 0.5);
var halton = haltonSequence(100, 2, 3);
var sphere = uniformOnSphere(rng);
\`\`\`
`,
};

export default distribution;
