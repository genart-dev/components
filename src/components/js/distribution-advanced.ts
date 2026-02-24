import type { ComponentEntry } from "../../types.js";

const distributionAdvanced: ComponentEntry = {
  name: "distribution-advanced",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  code: `\
function blueNoise(rng, width, height, count) {
  var pts = poissonDisk(rng, width, height, Math.sqrt(width * height / count));
  return pts.slice(0, count);
}

function lloydRelaxation(points, width, height, iterations) {
  var pts = points.map(function(p) { return [p[0], p[1]]; });
  for (var iter = 0; iter < iterations; iter++) {
    var v = voronoi(pts, width, height, 2);
    var sums = new Array(pts.length);
    var counts = new Array(pts.length);
    for (var i = 0; i < pts.length; i++) { sums[i] = [0, 0]; counts[i] = 0; }
    for (var y = 0; y < v.rows; y++)
      for (var x = 0; x < v.cols; x++) {
        var ci = v.cells[y * v.cols + x];
        sums[ci][0] += x * 2; sums[ci][1] += y * 2;
        counts[ci]++;
      }
    for (var i = 0; i < pts.length; i++) {
      if (counts[i] > 0) {
        pts[i] = [sums[i][0] / counts[i], sums[i][1] / counts[i]];
      }
    }
  }
  return pts;
}

function fibonacciSphere(n) {
  var pts = [];
  var goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < n; i++) {
    var y = 1 - (i / (n - 1)) * 2;
    var radius = Math.sqrt(1 - y * y);
    var theta = goldenAngle * i;
    pts.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }
  return pts;
}

function uniformOnDisk(rng, count) {
  var pts = [];
  for (var i = 0; i < count; i++) {
    var r = Math.sqrt(rng());
    var theta = rng() * Math.PI * 2;
    pts.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }
  return pts;
}

function stratifiedSample(rng, width, height, nx, ny) {
  var pts = [];
  var cw = width / nx, ch = height / ny;
  for (var y = 0; y < ny; y++)
    for (var x = 0; x < nx; x++)
      pts.push([x * cw + rng() * cw, y * ch + rng() * ch]);
  return pts;
}
`,
  exports: ["blueNoise", "lloydRelaxation", "fibonacciSphere", "uniformOnDisk", "stratifiedSample"],
  dependencies: ["prng", "distribution"],
  description: "Advanced spatial sampling (blue noise, Lloyd, Fibonacci sphere).",
  usage: `\
### distribution-advanced — Advanced Sampling

\`\`\`js
var pts = blueNoise(rng, 800, 600, 200);
var relaxed = lloydRelaxation(pts, 800, 600, 5);
var sphere = fibonacciSphere(100);
var disk = uniformOnDisk(rng, 50);
\`\`\`
`,
};

export default distributionAdvanced;
