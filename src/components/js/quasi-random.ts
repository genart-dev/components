import type { ComponentEntry } from "../../types.js";

const quasiRandom: ComponentEntry = {
  name: "quasi-random",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Low-discrepancy quasi-random sequences: R2, Halton, Sobol. Better coverage than PRNG with fewer samples.",
  tags: ["distribution", "sampling", "halton", "sobol", "r2", "quasi-random", "blue-noise"],
  exports: ["r2Sequence", "halton", "sobol"],
  dependencies: [],
  usage: `\
### quasi-random — Low-Discrepancy Sequences

\`\`\`js
var pts = r2Sequence(100);      // [[x,y], ...] in [0,1]²
var pts = halton(100);          // Halton base-2/base-3
var pts = sobol(100);           // Sobol-like sequence
\`\`\`
`,
  code: `\
// R2 quasi-random sequence (Martin Roberts) — optimal 2D low-discrepancy sequence
function r2Sequence(n, opts) {
  opts = opts || {};
  var offset = opts.offset || 0;
  var g = 1.32471795724474602596;
  var a1 = 1 / g, a2 = 1 / (g * g);
  var pts = [];
  for (var i = 0; i < n; i++) {
    var idx = i + offset;
    pts.push([(0.5 + a1 * idx) % 1, (0.5 + a2 * idx) % 1]);
  }
  return pts;
}

// Halton sequence using given bases (default base-2, base-3)
function halton(n, bases, opts) {
  bases = bases || [2, 3];
  opts = opts || {};
  var offset = opts.offset || 0;
  function haltonBase(i, base) {
    var f = 1, r = 0;
    while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
    return r;
  }
  var pts = [];
  for (var i = 0; i < n; i++) {
    var idx = i + 1 + offset;
    pts.push([haltonBase(idx, bases[0]), haltonBase(idx, bases[1])]);
  }
  return pts;
}

// Simple Sobol-like progressive sequence (scrambled Van der Corput)
function sobol(n, opts) {
  opts = opts || {};
  var seed = opts.seed || 0;
  // Direction numbers for first 2 dimensions
  function grayCode(i) { return i ^ (i >> 1); }
  function bitReverse(v, bits) {
    var r = 0;
    for (var b = 0; b < bits; b++) { r |= ((v >> b) & 1) << (bits - 1 - b); }
    return r;
  }
  var pts = [];
  var bits = 32;
  for (var i = 0; i < n; i++) {
    var g = grayCode(i + seed);
    var x = 0, y = 0;
    for (var b = 0; b < bits; b++) {
      if ((g >> b) & 1) { x ^= (1 << (bits - 1 - b)); y ^= (1 << b); }
    }
    pts.push([x / Math.pow(2, bits), (y / Math.pow(2, bits) + i / n) % 1]);
  }
  return pts;
}
`,
};

export default quasiRandom;
