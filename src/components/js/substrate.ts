import type { ComponentEntry } from "../../types.js";

const substrate: ComponentEntry = {
  name: "substrate",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Jared Tarbell's Substrate: crystal-growth crack lines with perpendicular branching at intersections.",
  tags: ["distribution", "growth", "substrate", "cracks", "crystal", "tarbell", "lines"],
  parameters: [],
  exports: ["substrate", "crackPropagate"],
  dependencies: [],
  usage: `var segs = substrate(rng, 400, 400);`,
  code: `\
// Substrate — crystal crack growth simulation
// Each crack propagates in a direction; hits another crack → branch perpendicularly
function substrate(rng, width, height, opts) {
  opts = opts || {};
  var maxCracks = opts.maxCracks || 200;
  var initialSeeds = opts.seeds || 3;
  var maxIter = opts.iterations || 5000;
  var speed = opts.speed || 1;

  // Grid stores the angle of the crack that owns each pixel (NaN = empty)
  var grid = new Float32Array(width * height);
  for (var i = 0; i < grid.length; i++) grid[i] = NaN;

  function setGrid(x, y, angle) {
    var xi = Math.round(x), yi = Math.round(y);
    if (xi >= 0 && xi < width && yi >= 0 && yi < height) {
      grid[yi * width + xi] = angle;
    }
  }
  function getGrid(x, y) {
    var xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || xi >= width || yi < 0 || yi >= height) return NaN;
    return grid[yi * width + xi];
  }

  // Cracks: {x, y, angle}
  var cracks = [];
  var segments = []; // completed line segments [{x1,y1,x2,y2,angle}]

  function addCrack(x, y, angle) {
    if (cracks.length >= maxCracks) return;
    cracks.push({ x: x, y: y, angle: angle, px: x, py: y });
  }

  // Plant initial seeds on random existing grid points (or center)
  for (var s = 0; s < initialSeeds; s++) {
    var sx = rng() * width, sy = rng() * height;
    var angle = rng() * Math.PI * 2;
    setGrid(sx, sy, angle);
    addCrack(sx, sy, angle);
  }

  for (var iter = 0; iter < maxIter && cracks.length > 0; iter++) {
    // Advance each active crack
    var stillActive = [];
    for (var ci = 0; ci < cracks.length; ci++) {
      var c = cracks[ci];
      c.px = c.x; c.py = c.y;
      c.x += Math.cos(c.angle) * speed;
      c.y += Math.sin(c.angle) * speed;

      // Out of bounds → die
      if (c.x < 0 || c.x >= width || c.y < 0 || c.y >= height) {
        segments.push({ x1: c.px, y1: c.py, x2: c.x, y2: c.y, angle: c.angle });
        continue;
      }

      var existing = getGrid(c.x, c.y);
      if (!isNaN(existing)) {
        // Hit another crack — spawn perpendicular branch
        segments.push({ x1: c.px, y1: c.py, x2: c.x, y2: c.y, angle: c.angle });
        addCrack(c.x, c.y, existing + Math.PI / 2 * (rng() > 0.5 ? 1 : -1));
        continue; // this crack dies
      }

      setGrid(c.x, c.y, c.angle);
      stillActive.push(c);
    }
    cracks = stillActive;
  }

  return segments; // array of line segments forming the crack network
}

// Simpler crack propagator from explicit seed points
function crackPropagate(rng, seeds, width, height, opts) {
  opts = opts || {};
  var seededOpts = Object.assign({}, opts, { seeds: 0 });
  // Place provided seed points into a fresh substrate run
  var grid = new Float32Array(width * height);
  for (var i = 0; i < grid.length; i++) grid[i] = NaN;
  var cracks = [];
  var segments = [];
  var maxCracks = opts.maxCracks || 200;
  var speed = opts.speed || 1;

  function setGrid(x, y, angle) {
    var xi = Math.round(x), yi = Math.round(y);
    if (xi >= 0 && xi < width && yi >= 0 && yi < height) grid[yi * width + xi] = angle;
  }
  function getGrid(x, y) {
    var xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || xi >= width || yi < 0 || yi >= height) return NaN;
    return grid[yi * width + xi];
  }

  for (var s = 0; s < seeds.length; s++) {
    var angle = seeds[s].angle !== undefined ? seeds[s].angle : rng() * Math.PI * 2;
    setGrid(seeds[s].x, seeds[s].y, angle);
    if (cracks.length < maxCracks) cracks.push({ x: seeds[s].x, y: seeds[s].y, angle: angle, px: seeds[s].x, py: seeds[s].y });
  }

  for (var iter = 0; iter < (opts.iterations || 5000) && cracks.length > 0; iter++) {
    var stillActive = [];
    for (var ci = 0; ci < cracks.length; ci++) {
      var c = cracks[ci];
      c.px = c.x; c.py = c.y;
      c.x += Math.cos(c.angle) * speed;
      c.y += Math.sin(c.angle) * speed;
      if (c.x < 0 || c.x >= width || c.y < 0 || c.y >= height) {
        segments.push({ x1: c.px, y1: c.py, x2: c.x, y2: c.y, angle: c.angle });
        continue;
      }
      var ex = getGrid(c.x, c.y);
      if (!isNaN(ex)) {
        segments.push({ x1: c.px, y1: c.py, x2: c.x, y2: c.y, angle: c.angle });
        if (cracks.length < maxCracks)
          cracks.push({ x: c.x, y: c.y, angle: ex + Math.PI / 2 * (rng() > 0.5 ? 1 : -1), px: c.x, py: c.y });
        continue;
      }
      setGrid(c.x, c.y, c.angle);
      stillActive.push(c);
    }
    cracks = stillActive;
  }
  return segments;
}
`,
};

export default substrate;
