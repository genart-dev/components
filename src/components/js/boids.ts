import type { ComponentEntry } from "../../types.js";

const boids: ComponentEntry = {
  name: "boids",
  version: "1.0.0",
  category: "particle",
  target: "js",
  renderers: [],
  code: `\
function createBoidSystem(count, rng, width, height) {
  var boids = [];
  for (var i = 0; i < count; i++) {
    var angle = rng() * Math.PI * 2;
    var speed = 1 + rng() * 2;
    boids.push({
      x: rng() * width, y: rng() * height,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed
    });
  }
  return { boids: boids, width: width, height: height };
}

function separationForce(boid, neighbors, sepDist) {
  var sx = 0, sy = 0;
  for (var i = 0; i < neighbors.length; i++) {
    var dx = boid.x - neighbors[i].x, dy = boid.y - neighbors[i].y;
    var d = Math.sqrt(dx*dx + dy*dy);
    if (d > 0 && d < sepDist) { sx += dx / d; sy += dy / d; }
  }
  return [sx, sy];
}

function alignmentForce(boid, neighbors) {
  if (neighbors.length === 0) return [0, 0];
  var ax = 0, ay = 0;
  for (var i = 0; i < neighbors.length; i++) {
    ax += neighbors[i].vx; ay += neighbors[i].vy;
  }
  return [(ax / neighbors.length - boid.vx) * 0.1, (ay / neighbors.length - boid.vy) * 0.1];
}

function cohesionForce(boid, neighbors) {
  if (neighbors.length === 0) return [0, 0];
  var cx = 0, cy = 0;
  for (var i = 0; i < neighbors.length; i++) {
    cx += neighbors[i].x; cy += neighbors[i].y;
  }
  return [(cx / neighbors.length - boid.x) * 0.005, (cy / neighbors.length - boid.y) * 0.005];
}

function updateBoids(system, perception, sepDist, maxSpeed) {
  perception = perception || 50; sepDist = sepDist || 25; maxSpeed = maxSpeed || 4;
  for (var i = 0; i < system.boids.length; i++) {
    var b = system.boids[i];
    var neighbors = [];
    for (var j = 0; j < system.boids.length; j++) {
      if (i === j) continue;
      var dx = system.boids[j].x - b.x, dy = system.boids[j].y - b.y;
      if (dx*dx + dy*dy < perception * perception) neighbors.push(system.boids[j]);
    }
    var sep = separationForce(b, neighbors, sepDist);
    var ali = alignmentForce(b, neighbors);
    var coh = cohesionForce(b, neighbors);
    b.vx += sep[0] * 0.15 + ali[0] + coh[0];
    b.vy += sep[1] * 0.15 + ali[1] + coh[1];
    var spd = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
    if (spd > maxSpeed) { b.vx = b.vx/spd*maxSpeed; b.vy = b.vy/spd*maxSpeed; }
    b.x += b.vx; b.y += b.vy;
    if (b.x < 0) b.x += system.width;
    if (b.x > system.width) b.x -= system.width;
    if (b.y < 0) b.y += system.height;
    if (b.y > system.height) b.y -= system.height;
  }
}
`,
  exports: ["createBoidSystem", "updateBoids", "separationForce", "alignmentForce", "cohesionForce"],
  dependencies: ["vector"],
  description: "Boid flocking algorithm (separation, alignment, cohesion).",
  usage: `\
### boids — Flocking Algorithm

\`\`\`js
var sys = createBoidSystem(200, rng, width, height);
updateBoids(sys, 50, 25, 4);
sys.boids.forEach(function(b) { drawBoid(b); });
\`\`\`
`,
};

export default boids;
