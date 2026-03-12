import type { ComponentEntry } from "../../types.js";

const phyllotaxisEngine: ComponentEntry = {
  name: "phyllotaxis-engine",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Phyllotaxis engine — Vogel spiral with planar, cylindrical, and conical models plus parastichy analysis.",
  exports: [
    "GOLDEN_ANGLE",
    "generatePhyllotaxisPoints",
    "generateCylindricalPhyllotaxis",
    "generateConicalPhyllotaxis",
    "calculateParastichies",
  ],
  dependencies: ["math"],
  usage: `\
### phyllotaxis-engine — Botanical Phyllotaxis

\`\`\`js
// Sunflower / rosette pattern
var pts = generatePhyllotaxisPoints(200, 8, GOLDEN_ANGLE);
// pts[i] = { x, y, angle, scale, index }

// Pinecone / pineapple spirals
var cone = generateConicalPhyllotaxis(100, 8, GOLDEN_ANGLE);

// Analyze Fibonacci spiral counts
var p = calculateParastichies(200, GOLDEN_ANGLE);
// p = { clockwise: 13, counterClockwise: 21 }
\`\`\`
`,
  code: `\
var GOLDEN_ANGLE = 137.50776405003785;

function generatePhyllotaxisPoints(count, scaleFactor, divergenceAngle, startAngle) {
  divergenceAngle = divergenceAngle || GOLDEN_ANGLE;
  scaleFactor = scaleFactor || 1;
  startAngle = startAngle || 0;
  var divRad = divergenceAngle * Math.PI / 180;
  var startRad = startAngle * Math.PI / 180;
  var pts = [];
  for (var n = 0; n < count; n++) {
    var r = scaleFactor * Math.sqrt(n);
    var theta = n * divRad + startRad;
    pts.push({
      index: n, x: r * Math.cos(theta), y: r * Math.sin(theta),
      angle: theta, scale: 1 - n / count
    });
  }
  return pts;
}

function generateCylindricalPhyllotaxis(count, scaleFactor, divergenceAngle, startAngle) {
  divergenceAngle = divergenceAngle || GOLDEN_ANGLE;
  scaleFactor = scaleFactor || 1;
  startAngle = startAngle || 0;
  var divRad = divergenceAngle * Math.PI / 180;
  var startRad = startAngle * Math.PI / 180;
  var radius = scaleFactor * 5;
  var heightStep = scaleFactor * 0.8;
  var pts = [];
  for (var n = 0; n < count; n++) {
    var theta = n * divRad + startRad;
    pts.push({
      index: n, x: radius * Math.cos(theta), y: n * heightStep,
      angle: theta, scale: 1 - n / count * 0.3
    });
  }
  return pts;
}

function generateConicalPhyllotaxis(count, scaleFactor, divergenceAngle, startAngle) {
  divergenceAngle = divergenceAngle || GOLDEN_ANGLE;
  scaleFactor = scaleFactor || 1;
  startAngle = startAngle || 0;
  var divRad = divergenceAngle * Math.PI / 180;
  var startRad = startAngle * Math.PI / 180;
  var baseRadius = scaleFactor * 5;
  var heightStep = scaleFactor * 0.6;
  var pts = [];
  for (var n = 0; n < count; n++) {
    var t = n / count;
    var radius = baseRadius * (1 - t * 0.8);
    var theta = n * divRad + startRad;
    pts.push({
      index: n, x: radius * Math.cos(theta), y: n * heightStep,
      angle: theta, scale: 1 - t * 0.6
    });
  }
  return pts;
}

function calculateParastichies(count, divergenceAngle) {
  divergenceAngle = divergenceAngle || GOLDEN_ANGLE;
  var divRad = divergenceAngle * Math.PI / 180;
  var freq = {};
  for (var n = 1; n < Math.min(count, 100); n++) {
    var theta1 = n * divRad, r1 = Math.sqrt(n);
    var minDist = Infinity, minDiff = 0;
    for (var m = Math.max(0, n - 50); m < n; m++) {
      var theta2 = m * divRad, r2 = Math.sqrt(m);
      var dx = r1 * Math.cos(theta1) - r2 * Math.cos(theta2);
      var dy = r1 * Math.sin(theta1) - r2 * Math.sin(theta2);
      var dist = dx * dx + dy * dy;
      if (dist < minDist) { minDist = dist; minDiff = n - m; }
    }
    freq[minDiff] = (freq[minDiff] || 0) + 1;
  }
  var sorted = Object.keys(freq).sort(function(a, b) { return freq[b] - freq[a]; });
  var cw = parseInt(sorted[0]) || 1;
  var ccw = parseInt(sorted[1]) || 1;
  return { clockwise: Math.min(cw, ccw), counterClockwise: Math.max(cw, ccw) };
}
`,
};

export default phyllotaxisEngine;
