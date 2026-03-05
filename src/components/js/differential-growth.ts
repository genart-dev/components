import type { ComponentEntry } from "../../types.js";

const differentialGrowth: ComponentEntry = {
  name: "differential-growth",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Differential growth curves via edge-splitting. Produces organic wrinkling (coral, brain folds, Nervous System aesthetic).",
  tags: ["distribution", "growth", "organic", "differential-growth", "coral", "nervous-system"],
  exports: ["diffGrow"],
  dependencies: [],
  usage: `var pts = diffGrow([[0,0],[100,0],[100,100],[0,100]], {iterations:50});`,
  code: `\
// Differential growth: a closed or open curve that grows by splitting edges
// and applies repulsion + alignment forces
function diffGrow(initialPath, opts) {
  opts = opts || {};
  var maxNodes = opts.maxNodes || 300;
  var repulsion = opts.repulsion || 5;
  var attraction = opts.attraction || 0.3;
  var alignment = opts.alignment || 0.5;
  var splitDist = opts.splitDist || 15;
  var closed = opts.closed !== false;
  var pts = initialPath.map(function(p) { return [p[0], p[1]]; });
  var iterations = opts.iterations || 100;

  function dist2(a, b) { var dx = b[0]-a[0], dy = b[1]-a[1]; return dx*dx+dy*dy; }
  function len(a) { return Math.sqrt(a[0]*a[0]+a[1]*a[1]); }

  for (var iter = 0; iter < iterations; iter++) {
    // Apply forces
    var forces = pts.map(function() { return [0, 0]; });
    var n = pts.length;

    // Repulsion: every pair within range
    for (var i = 0; i < n; i++) {
      for (var j = i + 2; j < n; j++) {
        if (closed && i === 0 && j === n - 1) continue;
        var d2 = dist2(pts[i], pts[j]);
        if (d2 < repulsion * repulsion * 4 && d2 > 0) {
          var d = Math.sqrt(d2);
          var fx = (pts[i][0] - pts[j][0]) / d * repulsion / d;
          var fy = (pts[i][1] - pts[j][1]) / d * repulsion / d;
          forces[i][0] += fx; forces[i][1] += fy;
          forces[j][0] -= fx; forces[j][1] -= fy;
        }
      }
    }

    // Attraction + alignment: pull toward midpoint of neighbors
    for (var i = 0; i < n; i++) {
      var prev = (i - 1 + n) % n, next = (i + 1) % n;
      if (!closed && (i === 0 || i === n - 1)) continue;
      var midX = (pts[prev][0] + pts[next][0]) / 2;
      var midY = (pts[prev][1] + pts[next][1]) / 2;
      forces[i][0] += (midX - pts[i][0]) * attraction;
      forces[i][1] += (midY - pts[i][1]) * attraction;
    }

    // Apply
    for (var i = 0; i < n; i++) {
      pts[i][0] += forces[i][0];
      pts[i][1] += forces[i][1];
    }

    // Split long edges
    var newPts = [];
    for (var i = 0; i < n; i++) {
      newPts.push(pts[i]);
      var next = (i + 1) % n;
      if (!closed && next === 0) continue;
      if (pts.length < maxNodes && dist2(pts[i], pts[next]) > splitDist * splitDist) {
        newPts.push([(pts[i][0] + pts[next][0]) / 2, (pts[i][1] + pts[next][1]) / 2]);
      }
    }
    pts = newPts;
  }
  return pts;
}
`,
};

export default differentialGrowth;
