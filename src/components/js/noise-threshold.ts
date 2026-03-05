import type { ComponentEntry } from "../../types.js";

const noiseThreshold: ComponentEntry = {
  name: "noise-threshold",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Place points where noise exceeds a threshold, or along isolines. Organic archipelago/topographic aesthetics.",
  tags: ["distribution", "field", "noise", "threshold", "isoline", "contour", "organic"],
  parameters: [],
  exports: ["noiseRegions", "contourPoints"],
  dependencies: [],
  usage: `var pts = noiseRegions(rng, noiseFn, 400, 400, 0.5);`,
  code: `\
// Sample points where a scalar field exceeds a threshold
// fieldFn(x, y) → number in [0, 1]
function noiseRegions(rng, fieldFn, width, height, threshold, opts) {
  opts = opts || {};
  var n = opts.count || 200;
  var maxAttempts = opts.maxAttempts || n * 20;
  var pts = [];
  for (var attempt = 0; attempt < maxAttempts && pts.length < n; attempt++) {
    var x = rng() * width, y = rng() * height;
    var v = fieldFn(x, y);
    if (v >= threshold) {
      pts.push({ x: x, y: y, size: v, index: pts.length, data: { value: v } });
    }
  }
  return pts;
}

// Trace isoline points at given levels using marching squares sampling
// Returns array of polylines (each is an array of {x,y} points)
function contourPoints(fieldFn, width, height, levels, opts) {
  opts = opts || {};
  var res = opts.resolution || 50; // grid resolution
  var cellW = width / res, cellH = height / res;
  var lines = [];

  for (var li = 0; li < levels.length; li++) {
    var level = levels[li];
    var polylines = [];
    var visited = {};

    for (var row = 0; row < res; row++) {
      for (var col = 0; col < res; col++) {
        var x0 = col * cellW, y0 = row * cellH;
        var x1 = x0 + cellW, y1 = y0 + cellH;
        var v00 = fieldFn(x0, y0), v10 = fieldFn(x1, y0);
        var v01 = fieldFn(x0, y1), v11 = fieldFn(x1, y1);
        var code = ((v00 > level) ? 8 : 0) | ((v10 > level) ? 4 : 0)
                 | ((v11 > level) ? 2 : 0) | ((v01 > level) ? 1 : 0);
        if (code === 0 || code === 15) continue;

        // Interpolate edge crossings
        function lerp(a, b, va, vb) { return a + (b - a) * (level - va) / (vb - va); }
        var pts = [];
        if (code === 1 || code === 14) pts = [{x: x0, y: lerp(y0,y1,v00,v01)}, {x: lerp(x0,x1,v01,v11), y: y1}];
        else if (code === 2 || code === 13) pts = [{x: lerp(x0,x1,v01,v11), y: y1}, {x: x1, y: lerp(y0,y1,v10,v11)}];
        else if (code === 3 || code === 12) pts = [{x: x0, y: lerp(y0,y1,v00,v01)}, {x: x1, y: lerp(y0,y1,v10,v11)}];
        else if (code === 4 || code === 11) pts = [{x: lerp(x0,x1,v00,v10), y: y0}, {x: x1, y: lerp(y0,y1,v10,v11)}];
        else if (code === 6 || code === 9) pts = [{x: lerp(x0,x1,v00,v10), y: y0}, {x: lerp(x0,x1,v01,v11), y: y1}];
        else if (code === 7 || code === 8) pts = [{x: x0, y: lerp(y0,y1,v00,v01)}, {x: lerp(x0,x1,v00,v10), y: y0}];
        else if (code === 5) { pts = [{x: lerp(x0,x1,v00,v10), y: y0}, {x: x1, y: lerp(y0,y1,v10,v11)}, {x: lerp(x0,x1,v01,v11), y: y1}, {x: x0, y: lerp(y0,y1,v00,v01)}]; }
        else if (code === 10) { pts = [{x: x0, y: lerp(y0,y1,v00,v01)}, {x: lerp(x0,x1,v00,v10), y: y0}, {x: x1, y: lerp(y0,y1,v10,v11)}, {x: lerp(x0,x1,v01,v11), y: y1}]; }

        if (pts.length >= 2) polylines.push(pts);
      }
    }
    lines.push({ level: level, polylines: polylines });
  }
  return lines;
}
`,
};

export default noiseThreshold;
