import type { ComponentEntry } from "../../types.js";

const branchingPath: ComponentEntry = {
  name: "branching-path",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function createBranchingPath(config, rng) {
  var startX = config.startX !== undefined ? config.startX : 0;
  var startY = config.startY !== undefined ? config.startY : 0;
  var direction = config.direction !== undefined ? config.direction : Math.PI / 2;
  var segmentCount = config.segments || 20;
  var stepMin = config.stepMin || 15;
  var stepMax = config.stepMax || 25;
  var spread = config.spread || 40;
  var branchChance = config.branchChance || 0.4;
  var branchLenMin = config.branchLenMin || 20;
  var branchLenMax = config.branchLenMax || 55;
  var branchSpread = config.branchSpread || 1.5;

  var segments = [];
  var bx = startX, by = startY;

  for (var i = 0; i < segmentCount; i++) {
    var step = stepMin + rng() * (stepMax - stepMin);
    var nx = bx + (rng() - 0.5) * spread;
    var ny = by + Math.cos(direction) * step + Math.sin(direction) * step;

    // Adjust for non-downward directions
    var dx = Math.cos(direction) * step;
    var dy = Math.sin(direction) * step;
    nx = bx + dx + (rng() - 0.5) * spread;
    ny = by + dy + (rng() - 0.5) * spread * 0.3;

    var segAngle = Math.atan2(ny - by, nx - bx);
    segments.push({ x1: bx, y1: by, x2: nx, y2: ny, angle: segAngle });

    // Branch
    if (rng() < branchChance) {
      var brLen = branchLenMin + rng() * (branchLenMax - branchLenMin);
      var brAngle = segAngle + (rng() - 0.5) * branchSpread;
      var ex = bx + Math.cos(brAngle) * brLen;
      var ey = by + Math.sin(brAngle) * brLen;
      segments.push({ x1: bx, y1: by, x2: ex, y2: ey, angle: brAngle });
    }

    bx = nx;
    by = ny;
  }

  return segments;
}
`,
  exports: ["createBranchingPath"],
  dependencies: [],
  description:
    "Procedural branching path generator — lightning bolts, cracks, rivers, root systems with configurable spread and branch probability.",
  usage: `\
### branching-path — Branching Path Generator

Generate an array of line segments forming a branching path. The output is
compatible with \`createForcePath()\` for influence field generation.

\`\`\`js
var rng = mulberry32(7);

// Lightning bolt from top of canvas downward
var boltSegments = createBranchingPath({
  startX: w * 0.4,   // starting X position
  startY: h * 0.05,  // starting Y position
  direction: Math.PI / 2,  // primary direction (PI/2 = downward)
  segments: 22,       // number of main path segments
  stepMin: 15,        // min step length (px)
  stepMax: 25,        // max step length (px)
  spread: 40,         // lateral spread of main path (px)
  branchChance: 0.45, // probability of branch at each node
  branchLenMin: 20,   // min branch length (px)
  branchLenMax: 55,   // max branch length (px)
  branchSpread: 1.5   // angular spread of branches (radians)
}, rng);

// Result: [{x1, y1, x2, y2, angle}, ...] — directly usable with createForcePath()
var bolt = createForcePath(boltSegments, { radius: 50 });
\`\`\`
`,
};

export default branchingPath;
