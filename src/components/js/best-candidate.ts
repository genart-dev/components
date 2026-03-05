import type { ComponentEntry } from "../../types.js";

const bestCandidate: ComponentEntry = {
  name: "best-candidate",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Mitchell's Best Candidate algorithm: blue-noise approximation via rejection sampling. Simpler than Poisson disk.",
  tags: ["distribution", "sampling", "blue-noise", "mitchell", "best-candidate"],
  parameters: [],
  exports: ["bestCandidate"],
  dependencies: [],
  usage: `var pts = bestCandidate(rng, 100);`,
  code: `\
// Mitchell's Best Candidate — for each new point, generate k candidates
// and pick the one farthest from existing points
function bestCandidate(rng, n, opts) {
  opts = opts || {};
  var w = opts.width || 1;
  var h = opts.height || 1;
  var offX = opts.x || 0;
  var offY = opts.y || 0;
  var k = opts.candidates || 10;
  var pts = [];
  for (var i = 0; i < n; i++) {
    var bestX = 0, bestY = 0, bestDist = -1;
    for (var c = 0; c < k; c++) {
      var cx = offX + rng() * w;
      var cy = offY + rng() * h;
      var minD = Infinity;
      for (var j = 0; j < pts.length; j++) {
        var dx = cx - pts[j].x, dy = cy - pts[j].y;
        var d = dx * dx + dy * dy;
        if (d < minD) minD = d;
      }
      if (pts.length === 0) minD = Infinity;
      if (minD > bestDist) { bestDist = minD; bestX = cx; bestY = cy; }
    }
    pts.push({ x: bestX, y: bestY, size: 1, index: i });
  }
  return pts;
}
`,
};

export default bestCandidate;
