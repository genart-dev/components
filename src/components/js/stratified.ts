import type { ComponentEntry } from "../../types.js";

const stratified: ComponentEntry = {
  name: "stratified",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Stratified sampling: Latin Hypercube and Multi-Jittered. Guaranteed coverage — one point per stratum.",
  tags: ["distribution", "sampling", "stratified", "latin-hypercube", "jitter"],
  parameters: [],
  exports: ["latinHypercube", "multiJittered"],
  dependencies: [],
  usage: `var pts = latinHypercube(rng, 50);`,
  code: `\
// Latin Hypercube Sampling — one point per row and column stripe
function latinHypercube(rng, n, opts) {
  opts = opts || {};
  var w = opts.width || 1;
  var h = opts.height || 1;
  var offX = opts.x || 0;
  var offY = opts.y || 0;
  var cellW = w / n, cellH = h / n;
  var xs = [], ys = [], i;
  for (i = 0; i < n; i++) { xs.push(i); ys.push(i); }
  // Fisher-Yates shuffle
  for (i = n - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var t = xs[i]; xs[i] = xs[j]; xs[j] = t;
    t = ys[i]; ys[i] = ys[j]; ys[j] = t;
  }
  var pts = [];
  for (i = 0; i < n; i++) {
    pts.push({
      x: offX + (xs[i] + rng()) * cellW,
      y: offY + (ys[i] + rng()) * cellH,
      size: 1, index: i
    });
  }
  return pts;
}

// Multi-Jittered Sampling — stratified in both rows and columns
function multiJittered(rng, n, opts) {
  opts = opts || {};
  var w = opts.width || 1;
  var h = opts.height || 1;
  var offX = opts.x || 0;
  var offY = opts.y || 0;
  // n must be a perfect square; we round up
  var sq = Math.ceil(Math.sqrt(n));
  var cellW = w / (sq * sq), cellH = h / (sq * sq);
  var pts = [];
  var r, c, i2;
  for (r = 0; r < sq; r++) {
    for (c = 0; c < sq; c++) {
      // canonical jitter within stratum
      pts.push([
        offX + (r * sq + c + rng()) * cellW,
        offY + (c * sq + r + rng()) * cellH,
        1,
        pts.length
      ]);
    }
  }
  // shuffle x within each column-strata group and y within each row-strata group
  for (r = 0; r < sq; r++) {
    for (c = sq - 1; c > 0; c--) {
      var j2 = Math.floor(rng() * (c + 1));
      var a = r * sq + c, b = r * sq + j2;
      var tx = pts[a][0]; pts[a][0] = pts[b][0]; pts[b][0] = tx;
    }
  }
  for (c = 0; c < sq; c++) {
    for (r = sq - 1; r > 0; r--) {
      var j3 = Math.floor(rng() * (r + 1));
      var a2 = r * sq + c, b2 = j3 * sq + c;
      var ty = pts[a2][1]; pts[a2][1] = pts[b2][1]; pts[b2][1] = ty;
    }
  }
  var result = [];
  for (i2 = 0; i2 < Math.min(n, pts.length); i2++) {
    result.push({ x: pts[i2][0], y: pts[i2][1], size: 1, index: i2 });
  }
  return result;
}
`,
};

export default stratified;
