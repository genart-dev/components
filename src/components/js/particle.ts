import type { ComponentEntry } from "../../types.js";

const particle: ComponentEntry = {
  name: "particle",
  version: "1.0.0",
  category: "particle",
  target: "js",
  renderers: [],
  code: `\
function createParticleSystem(maxParticles) {
  return {
    particles: [],
    maxParticles: maxParticles || 1000,
    time: 0
  };
}

function emitParticle(system, x, y, vx, vy, life) {
  if (system.particles.length >= system.maxParticles) return null;
  var p = { x: x, y: y, vx: vx || 0, vy: vy || 0, ax: 0, ay: 0, life: life || 1, maxLife: life || 1, age: 0 };
  system.particles.push(p);
  return p;
}

function updateParticles(system, dt) {
  dt = dt || 1/60;
  system.time += dt;
  for (var i = system.particles.length - 1; i >= 0; i--) {
    var p = system.particles[i];
    p.vx += p.ax * dt; p.vy += p.ay * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.ax = 0; p.ay = 0;
    p.age += dt; p.life -= dt;
    if (p.life <= 0) system.particles.splice(i, 1);
  }
  return system;
}

function applyForce(particle, fx, fy) {
  particle.ax += fx;
  particle.ay += fy;
}

function particleAge(particle) {
  return particle.age / particle.maxLife;
}
`,
  exports: ["createParticleSystem", "updateParticles", "emitParticle", "applyForce", "particleAge"],
  dependencies: ["vector"],
  description: "Renderer-agnostic particle system state management.",
  usage: `\
### particle — Particle System

\`\`\`js
var sys = createParticleSystem(500);
emitParticle(sys, x, y, vx, vy, 2.0);
updateParticles(sys, dt);
sys.particles.forEach(function(p) {
  applyForce(p, 0, 9.8); // gravity
  var t = particleAge(p); // 0→1 normalized age
});
\`\`\`
`,
};

export default particle;
