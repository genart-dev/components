import type { ComponentEntry } from "../../types.js";

const forcePack: ComponentEntry = {
  name: "force-pack",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Repulsion-based force simulation for self-organizing equilibrium. Molecular, graph, bubble layouts.",
  tags: ["distribution", "physics", "force", "repulsion", "pack", "equilibrium", "molecular"],
  parameters: [],
  exports: ["forcePack", "forceRelax"],
  dependencies: [],
  usage: `var pts = forcePack(points, {width:400,height:400});`,
  code: `\
// Force-directed repulsion packing
// points: [{x, y, r?}] — r is collision radius (default 1)
// Returns settled points with same structure
function forcePack(points, opts) {
  opts = opts || {};
  var iters = opts.iterations || 100;
  var strength = opts.strength || 1;
  var damping = opts.damping || 0.8;
  var width = opts.width;
  var height = opts.height;

  var pts = points.map(function(p, i) {
    return { x: p.x, y: p.y, r: p.r || 1, vx: 0, vy: 0, index: i };
  });

  for (var iter = 0; iter < iters; iter++) {
    // Compute repulsion forces
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[j].x - pts[i].x;
        var dy = pts[j].y - pts[i].y;
        var d2 = dx * dx + dy * dy;
        var minD = pts[i].r + pts[j].r;
        if (d2 < minD * minD && d2 > 0) {
          var d = Math.sqrt(d2);
          var overlap = minD - d;
          var fx = dx / d * overlap * strength * 0.5;
          var fy = dy / d * overlap * strength * 0.5;
          pts[i].vx -= fx; pts[i].vy -= fy;
          pts[j].vx += fx; pts[j].vy += fy;
        }
      }
    }
    // Integrate
    for (var i2 = 0; i2 < pts.length; i2++) {
      pts[i2].x += pts[i2].vx;
      pts[i2].y += pts[i2].vy;
      pts[i2].vx *= damping;
      pts[i2].vy *= damping;
      // Clamp to bounds if provided
      if (width !== undefined) {
        var r = pts[i2].r;
        if (pts[i2].x < r) { pts[i2].x = r; pts[i2].vx = Math.abs(pts[i2].vx); }
        if (pts[i2].x > width - r) { pts[i2].x = width - r; pts[i2].vx = -Math.abs(pts[i2].vx); }
      }
      if (height !== undefined) {
        var r2 = pts[i2].r;
        if (pts[i2].y < r2) { pts[i2].y = r2; pts[i2].vy = Math.abs(pts[i2].vy); }
        if (pts[i2].y > height - r2) { pts[i2].y = height - r2; pts[i2].vy = -Math.abs(pts[i2].vy); }
      }
    }
  }
  return pts.map(function(p) {
    return { x: p.x, y: p.y, size: p.r, index: p.index };
  });
}

// Force relaxation — like forcePack but with configurable attraction toward centroid
function forceRelax(points, opts) {
  opts = opts || {};
  var centroidX = 0, centroidY = 0;
  for (var i = 0; i < points.length; i++) { centroidX += points[i].x; centroidY += points[i].y; }
  if (points.length > 0) { centroidX /= points.length; centroidY /= points.length; }
  var attract = opts.attraction || 0.01;
  var augmented = points.map(function(p) { return Object.assign({}, p); });
  for (var iter = 0; iter < (opts.iterations || 100); iter++) {
    for (var i2 = 0; i2 < augmented.length; i2++) {
      augmented[i2].x += (centroidX - augmented[i2].x) * attract;
      augmented[i2].y += (centroidY - augmented[i2].y) * attract;
    }
    augmented = forcePack(augmented, Object.assign({}, opts, { iterations: 1 }));
  }
  return augmented;
}
`,
};

export default forcePack;
