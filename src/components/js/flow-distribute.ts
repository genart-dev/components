import type { ComponentEntry } from "../../types.js";

const flowDistribute: ComponentEntry = {
  name: "flow-distribute",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Distribute points along vector/noise fields: streamlines and curl-noise lines. Tyler Hobbs flow-field aesthetic.",
  tags: ["distribution", "field", "flow-field", "streamlines", "curl-noise", "vector"],
  parameters: [],
  exports: ["streamlines", "curlNoiseLines"],
  dependencies: [],
  usage: `var lines = streamlines(fieldFn, 400, 400);`,
  code: `\
// Integrate a streamline from a seed point through a vector field
// fieldFn(x, y) → {x, y} — normalized direction vector
function streamlines(fieldFn, width, height, opts) {
  opts = opts || {};
  var stepLen = opts.stepLen || 5;
  var maxSteps = opts.maxSteps || 200;
  var numSeeds = opts.seeds || 20;
  var minSep = opts.minSep || 10;
  var rng = opts.rng || Math.random;
  var lines = [];
  var allPts = [];

  function tooClose(x, y) {
    for (var i = 0; i < allPts.length; i++) {
      var dx = allPts[i][0] - x, dy = allPts[i][1] - y;
      if (dx * dx + dy * dy < minSep * minSep) return true;
    }
    return false;
  }

  function integrate(sx, sy) {
    var pts = [[sx, sy]], x = sx, y = sy;
    allPts.push([sx, sy]);
    for (var s = 0; s < maxSteps; s++) {
      var v = fieldFn(x, y);
      var len = Math.sqrt(v.x * v.x + v.y * v.y) || 1;
      var nx = x + v.x / len * stepLen;
      var ny = y + v.y / len * stepLen;
      if (nx < 0 || nx > width || ny < 0 || ny > height) break;
      if (tooClose(nx, ny)) break;
      pts.push([nx, ny]);
      allPts.push([nx, ny]);
      x = nx; y = ny;
    }
    return pts;
  }

  for (var i = 0; i < numSeeds; i++) {
    var sx = rng() * width, sy = rng() * height;
    if (!tooClose(sx, sy)) {
      var line = integrate(sx, sy);
      if (line.length > 1) lines.push(line);
    }
  }
  return lines;
}

// Curl noise streamlines — 2D curl of Perlin/value noise gives divergence-free flow
// Requires an underlying scalar noise function noiseF(x,y)
function curlNoiseLines(noiseF, width, height, opts) {
  opts = opts || {};
  var eps = opts.eps || 1;
  // Derive curl: ∂N/∂y, −∂N/∂x
  function curlField(x, y) {
    var n1 = noiseF(x, y + eps), n2 = noiseF(x, y - eps);
    var n3 = noiseF(x + eps, y), n4 = noiseF(x - eps, y);
    return { x: (n1 - n2) / (2 * eps), y: -(n3 - n4) / (2 * eps) };
  }
  return streamlines(curlField, width, height, opts);
}
`,
};

export default flowDistribute;
