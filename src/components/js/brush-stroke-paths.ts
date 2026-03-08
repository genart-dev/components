import type { ComponentEntry } from "../../types.js";

const brushStrokePaths: ComponentEntry = {
  name: "brush-stroke-paths",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function gaussianOffset(rng, sigma) {
  sigma = sigma || 0.33;
  var u1 = rng() || 0.001;
  var g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * rng()) * sigma;
  return g < -1 ? -1 : g > 1 ? 1 : g;
}

function taperProfile(t, style) {
  if (style === 1 || style === 'blunt') return smoothstep(0, 0.05, t) * smoothstep(1, 0.95, t);
  if (style === 2 || style === 'chisel') return smoothstep(0, 0.08, t) * smoothstep(1, 0.92, t);
  return smoothstep(0, 0.2, t) * smoothstep(1, 0.7, t);
}

function pressureCurve(t) {
  var attack = smoothstep(0, 0.15, t);
  var release = smoothstep(1, 0.8, t);
  return attack * release;
}

function traceBrushPath(flowFn, x, y, steps, stepSize) {
  stepSize = stepSize || 2.5;
  var path = [{x: x, y: y}];
  var cx = x, cy = y;
  for (var s = 0; s < steps; s++) {
    var fl = flowFn(cx, cy);
    cx += fl[0] * stepSize;
    cy += fl[1] * stepSize;
    path.push({x: cx, y: cy});
  }
  return path;
}

function traceDabPath(x, y, angle, length, stepSize) {
  stepSize = stepSize || 4;
  var steps = Math.max(4, Math.ceil(length / stepSize));
  var actualStep = length / steps;
  var path = [{x: x, y: y}];
  var cx = x, cy = y;
  var cosA = Math.cos(angle), sinA = Math.sin(angle);
  for (var s = 1; s <= steps; s++) {
    cx += cosA * actualStep;
    cy += sinA * actualStep;
    path.push({x: cx, y: cy});
  }
  return path;
}

function computePerpendiculars(path) {
  var perps = new Array(path.length);
  for (var i = 0; i < path.length; i++) {
    var ni = i < path.length - 1 ? i + 1 : i;
    var pi2 = i > 0 ? i - 1 : i;
    var dx = path[ni].x - path[pi2].x;
    var dy = path[ni].y - path[pi2].y;
    var rl = Math.sqrt(dx * dx + dy * dy) || 1;
    perps[i] = {x: -dy / rl, y: dx / rl};
  }
  return perps;
}

function buildBristlePaths(path, perps, count, brushWidth, pressureAmt, taperStyle, rng) {
  var bristles = [];
  for (var bi = 0; bi < count; bi++) {
    var lat = gaussianOffset(rng);
    var wobbleSeed = rng() * 10000;
    var wobbleRng = mulberry32(Math.floor(wobbleSeed));
    var bp = new Array(path.length);
    for (var pi = 0; pi < path.length; pi++) {
      var t = pi / (path.length - 1);
      var tap = taperProfile(t, taperStyle);
      var press = tap * lerp(1 - pressureAmt * 0.5, 1, tap);
      var halfW = brushWidth * 0.5 * press;
      var wobble = (wobbleRng() - 0.5) * 0.15;
      var lateral = (lat + wobble) * halfW;
      bp[pi] = {
        x: path[pi].x + perps[pi].x * lateral,
        y: path[pi].y + perps[pi].y * lateral
      };
    }
    var edgeDist = 1 - Math.abs(lat);
    var bw = brushWidth / count * lerp(0.9, 2.5, edgeDist * edgeDist);
    bristles.push({points: bp, lateral: lat, baseWidth: bw});
  }
  return bristles;
}
`,
  exports: [
    "gaussianOffset",
    "taperProfile",
    "pressureCurve",
    "traceBrushPath",
    "traceDabPath",
    "computePerpendiculars",
    "buildBristlePaths",
  ],
  dependencies: ["math", "prng"],
  description:
    "Pure math for brush stroke paths: tracing, bristle offsets, taper profiles, pressure curves.",
  usage: `\
### brush-stroke-paths — Brush Stroke Math

\`\`\`js
// Trace a path following a flow field
var path = traceBrushPath(flowAt, startX, startY, 40, 2.5);

// Trace a short directional dab
var dabPath = traceDabPath(x, y, angle, 50, 4);

// Compute perpendicular vectors for bristle placement
var perps = computePerpendiculars(path);

// Build bristle sub-paths with gaussian scatter
var bristles = buildBristlePaths(path, perps, 12, 35, 0.7, 'pointed', rng);
// bristles[i] = { points: [{x,y}...], lateral: -1..1, baseWidth: number }

// Taper profiles: 'pointed' (0), 'blunt' (1), 'chisel' (2)
var w = taperProfile(0.5, 'pointed'); // 1.0 at midpoint

// Pressure curve: smoothstep attack/release envelope
var p = pressureCurve(0.5); // ~1.0 at midpoint

// Gaussian offset: Box-Muller, clamped to [-1, 1]
var g = gaussianOffset(rng); // centered distribution
\`\`\`
`,
};

export default brushStrokePaths;
