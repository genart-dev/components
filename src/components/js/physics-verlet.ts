import type { ComponentEntry } from "../../types.js";

const physicsVerlet: ComponentEntry = {
  name: "physics-verlet",
  version: "1.0.0",
  category: "physics",
  target: "js",
  renderers: [],
  code: `\
function verletSystem(points) {
  return {
    points: points.map(function(p) {
      return { x: p.x, y: p.y, px: p.x, py: p.y, ax: 0, ay: 0, fixed: p.fixed || false };
    }),
    constraints: []
  };
}

function verletStep(system, dt) {
  dt = dt || 1/60;
  var dt2 = dt * dt;
  for (var i = 0; i < system.points.length; i++) {
    var p = system.points[i];
    if (p.fixed) continue;
    var nx = 2 * p.x - p.px + p.ax * dt2;
    var ny = 2 * p.y - p.py + p.ay * dt2;
    p.px = p.x; p.py = p.y;
    p.x = nx; p.y = ny;
    p.ax = 0; p.ay = 0;
  }
  solveConstraints(system, 3);
}

function addConstraint(system, a, b, restLength) {
  system.constraints.push({
    a: a, b: b,
    restLength: restLength !== undefined ? restLength :
      Math.sqrt(Math.pow(system.points[a].x - system.points[b].x, 2) + Math.pow(system.points[a].y - system.points[b].y, 2))
  });
}

function solveConstraints(system, iterations) {
  iterations = iterations || 3;
  for (var iter = 0; iter < iterations; iter++) {
    for (var i = 0; i < system.constraints.length; i++) {
      var c = system.constraints[i];
      var a = system.points[c.a], b = system.points[c.b];
      var dx = b.x - a.x, dy = b.y - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      var diff = (c.restLength - dist) / dist * 0.5;
      var ox = dx * diff, oy = dy * diff;
      if (!a.fixed) { a.x -= ox; a.y -= oy; }
      if (!b.fixed) { b.x += ox; b.y += oy; }
    }
  }
}
`,
  exports: ["verletSystem", "verletStep", "addConstraint", "solveConstraints"],
  dependencies: ["vector"],
  description: "Verlet integration with distance constraints.",
  usage: `\
### physics-verlet — Verlet Integration

\`\`\`js
var sys = verletSystem([{x:0,y:0,fixed:true},{x:50,y:0},{x:100,y:0}]);
addConstraint(sys, 0, 1); addConstraint(sys, 1, 2);
sys.points[2].ay = 98; // gravity
verletStep(sys, 1/60);
\`\`\`
`,
};

export default physicsVerlet;
