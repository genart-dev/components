import type { ComponentEntry } from "../../types.js";

const physicsSpring: ComponentEntry = {
  name: "physics-spring",
  version: "1.0.0",
  category: "physics",
  target: "js",
  renderers: [],
  code: `\
function createSpring(restLength, stiffness, damping) {
  return { restLength: restLength, stiffness: stiffness || 100, damping: damping || 5 };
}

function springSystem(points, springs) {
  return { points: points, springs: springs };
}

function springStep(system, dt) {
  dt = dt || 1/60;
  for (var i = 0; i < system.springs.length; i++) {
    var s = system.springs[i];
    var a = system.points[s.a], b = system.points[s.b];
    var dx = b.x - a.x, dy = b.y - a.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    var force = s.stiffness * (dist - s.restLength);
    var dvx = b.vx - a.vx, dvy = b.vy - a.vy;
    var dampF = s.damping * (dvx * dx + dvy * dy) / dist;
    var fx = (force + dampF) * dx / dist;
    var fy = (force + dampF) * dy / dist;
    a.vx += fx * dt; a.vy += fy * dt;
    b.vx -= fx * dt; b.vy -= fy * dt;
  }
  for (var i = 0; i < system.points.length; i++) {
    var p = system.points[i];
    if (p.fixed) continue;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}

function dampedHarmonic(x, v, target, stiffness, damping, dt) {
  var force = -stiffness * (x - target) - damping * v;
  v += force * dt;
  x += v * dt;
  return { x: x, v: v };
}
`,
  exports: ["springSystem", "springStep", "createSpring", "dampedHarmonic"],
  dependencies: ["vector"],
  description: "Spring-based physics simulation.",
  usage: `\
### physics-spring — Spring Physics

\`\`\`js
var points = [{x:0,y:0,vx:0,vy:0,fixed:true}, {x:100,y:0,vx:0,vy:0}];
var springs = [{a:0, b:1, restLength:50, stiffness:100, damping:5}];
var sys = springSystem(points, springs);
springStep(sys, 1/60);
\`\`\`
`,
};

export default physicsSpring;
