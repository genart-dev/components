import type { ComponentEntry } from "../../types.js";

const particleForces: ComponentEntry = {
  name: "particle-forces",
  version: "1.0.0",
  category: "particle",
  target: "js",
  renderers: [],
  code: `\
function gravityForce(p, gx, gy) {
  p.ax += gx || 0;
  p.ay += gy || 9.8;
}

function attractorForce(p, ax, ay, strength) {
  var dx = ax - p.x, dy = ay - p.y;
  var d = Math.sqrt(dx * dx + dy * dy) + 0.01;
  var f = strength / (d * d);
  p.ax += dx / d * f;
  p.ay += dy / d * f;
}

function vortexForce(p, cx, cy, strength) {
  var dx = p.x - cx, dy = p.y - cy;
  var d = Math.sqrt(dx * dx + dy * dy) + 0.01;
  var f = strength / d;
  p.ax += -dy / d * f;
  p.ay += dx / d * f;
}

function dragForce(p, coefficient) {
  coefficient = coefficient || 0.01;
  var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  if (speed > 0) {
    var drag = coefficient * speed;
    p.ax -= p.vx / speed * drag;
    p.ay -= p.vy / speed * drag;
  }
}

function turbulenceForce(p, noiseFn, scale, strength) {
  var angle = noiseFn(p.x * scale, p.y * scale) * Math.PI * 4;
  p.ax += Math.cos(angle) * strength;
  p.ay += Math.sin(angle) * strength;
}

function boundaryForce(p, minX, minY, maxX, maxY, strength) {
  strength = strength || 10;
  var margin = 20;
  if (p.x < minX + margin) p.ax += strength * (1 - (p.x - minX) / margin);
  if (p.x > maxX - margin) p.ax -= strength * (1 - (maxX - p.x) / margin);
  if (p.y < minY + margin) p.ay += strength * (1 - (p.y - minY) / margin);
  if (p.y > maxY - margin) p.ay -= strength * (1 - (maxY - p.y) / margin);
}
`,
  exports: ["gravityForce", "attractorForce", "vortexForce", "dragForce", "turbulenceForce", "boundaryForce"],
  dependencies: ["particle", "vector"],
  description: "Common particle force functions (gravity, attractor, vortex, drag).",
  usage: `\
### particle-forces — Force Functions

\`\`\`js
sys.particles.forEach(function(p) {
  gravityForce(p, 0, 9.8);
  attractorForce(p, cx, cy, 100);
  dragForce(p, 0.02);
  boundaryForce(p, 0, 0, width, height);
});
\`\`\`
`,
};

export default particleForces;
