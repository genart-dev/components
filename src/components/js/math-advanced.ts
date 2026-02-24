import type { ComponentEntry } from "../../types.js";

const mathAdvanced: ComponentEntry = {
  name: "math-advanced",
  version: "1.0.0",
  category: "math",
  target: "js",
  renderers: [],
  code: `\
var PHI = (1 + Math.sqrt(5)) / 2;
var goldenRatio = PHI;

function bezierPoint(a, b, c, d, t) {
  var t2 = t * t, t3 = t2 * t;
  var mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt;
  return mt3 * a + 3 * mt2 * t * b + 3 * mt * t2 * c + t3 * d;
}

function catmullRom(p0, p1, p2, p3, t) {
  var t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function springDamper(current, target, velocity, stiffness, damping, dt) {
  var force = -stiffness * (current - target) - damping * velocity;
  velocity += force * dt;
  current += velocity * dt;
  return { value: current, velocity: velocity };
}

function exponentialDecay(value, target, rate, dt) {
  return target + (value - target) * Math.exp(-rate * dt);
}
`,
  exports: ["bezierPoint", "catmullRom", "springDamper", "exponentialDecay", "goldenRatio", "PHI"],
  dependencies: ["math"],
  description: "Advanced interpolation and constants (Bezier, Catmull-Rom, spring, PHI).",
  usage: `\
### math-advanced — Advanced Interpolation

\`\`\`js
bezierPoint(0, 0.5, 0.5, 1, t);    // cubic Bezier
catmullRom(p0, p1, p2, p3, t);     // Catmull-Rom spline
springDamper(pos, target, vel, 100, 10, dt);
exponentialDecay(current, target, 5, dt);
PHI; // → 1.618...
\`\`\`
`,
};

export default mathAdvanced;
