import type { ComponentEntry } from "../../types.js";

const spiral: ComponentEntry = {
  name: "spiral",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Spiral distributions: phyllotaxis (golden-angle sunflower), Archimedean, logarithmic, Fermat.",
  tags: ["distribution", "spiral", "phyllotaxis", "fibonacci", "golden-angle", "sunflower"],
  exports: ["phyllotaxis", "archimedean", "logarithmic", "fermat"],
  dependencies: [],
  usage: `var pts = phyllotaxis(100, 200);`,
  code: `\
// Golden-angle phyllotaxis — Fibonacci sunflower pattern
function phyllotaxis(n, scale, angleOffset) {
  scale = scale || 1;
  angleOffset = angleOffset || 0;
  var PHI = Math.PI * (3 - Math.sqrt(5)); // golden angle ≈ 137.5°
  var pts = [];
  for (var i = 0; i < n; i++) {
    var r = Math.sqrt(i / n) * scale;
    var theta = i * PHI + angleOffset;
    pts.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }
  return pts;
}

// Archimedean spiral: r = a + b*theta
function archimedean(opts) {
  opts = opts || {};
  var turns = opts.turns || 3;
  var count = opts.count || 200;
  var a = opts.a || 0, b = opts.b || 1;
  var pts = [];
  for (var i = 0; i < count; i++) {
    var theta = (i / count) * turns * Math.PI * 2;
    var r = a + b * theta;
    pts.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }
  return pts;
}

// Logarithmic (equiangular) spiral: r = a * e^(b*theta)
function logarithmic(opts) {
  opts = opts || {};
  var turns = opts.turns || 3;
  var count = opts.count || 200;
  var a = opts.a || 0.1, b = opts.b || 0.2;
  var pts = [];
  for (var i = 0; i < count; i++) {
    var theta = (i / count) * turns * Math.PI * 2;
    var r = a * Math.exp(b * theta);
    pts.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }
  return pts;
}

// Fermat's spiral: r² = a²*theta (two branches)
function fermat(n, scale) {
  scale = scale || 1;
  var pts = [];
  for (var i = 0; i < n; i++) {
    var theta = i * 0.1;
    var r = scale * Math.sqrt(theta);
    pts.push([r * Math.cos(theta), r * Math.sin(theta)]);
    pts.push([-r * Math.cos(theta), -r * Math.sin(theta)]);
    if (pts.length >= n * 2) break;
  }
  return pts.slice(0, n);
}
`,
};

export default spiral;
