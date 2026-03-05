import type { ComponentEntry } from "../../types.js";

const gravitySettle: ComponentEntry = {
  name: "gravity-settle",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Simple rigid-body gravity simulation. Objects fall and stack. Cairns, debris, settled particles.",
  tags: ["distribution", "physics", "gravity", "settle", "stack", "rigid-body"],
  parameters: [],
  exports: ["gravitySettle"],
  dependencies: [],
  usage: `var settled = gravitySettle(objects, 400, 400);`,
  code: `\
// Gravity settle — circles fall under gravity and stack on floor/each other
// objects: [{x, y, r}] — initial positions with radii
// Returns settled positions [{x, y, r, index}]
function gravitySettle(objects, width, height, opts) {
  opts = opts || {};
  var gravity = opts.gravity || 0.5;
  var bounce = opts.bounce || 0;
  var iters = opts.iterations || 500;
  var floor = opts.floor !== undefined ? opts.floor : height;
  var friction = opts.friction !== undefined ? opts.friction : 0.98;

  var objs = objects.map(function(o, i) {
    return { x: o.x, y: o.y, r: o.r || 5, vx: 0, vy: 0, index: i, settled: false };
  });

  for (var iter = 0; iter < iters; iter++) {
    var anyMoving = false;
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i];
      if (o.settled) continue;

      // Apply gravity
      o.vy += gravity;
      o.vx *= friction;

      // Move
      o.x += o.vx;
      o.y += o.vy;

      // Floor collision
      if (o.y + o.r >= floor) {
        o.y = floor - o.r;
        o.vy = -o.vy * bounce;
        o.vx *= friction;
        if (Math.abs(o.vy) < 0.1) { o.vy = 0; }
      }

      // Wall collisions
      if (o.x - o.r < 0) { o.x = o.r; o.vx = Math.abs(o.vx) * bounce; }
      if (o.x + o.r > width) { o.x = width - o.r; o.vx = -Math.abs(o.vx) * bounce; }

      // Circle-circle collisions (with already-settled objects)
      for (var j = 0; j < i; j++) {
        var o2 = objs[j];
        var dx = o.x - o2.x, dy = o.y - o2.y;
        var d2 = dx * dx + dy * dy;
        var minD = o.r + o2.r;
        if (d2 < minD * minD && d2 > 0) {
          var d = Math.sqrt(d2);
          var overlap = minD - d;
          var nx = dx / d, ny = dy / d;
          o.x += nx * overlap;
          o.y += ny * overlap;
          // Reflect velocity component along normal
          var dot = o.vx * nx + o.vy * ny;
          if (dot < 0) {
            o.vx -= (1 + bounce) * dot * nx;
            o.vy -= (1 + bounce) * dot * ny;
          }
        }
      }

      if (Math.abs(o.vx) > 0.01 || Math.abs(o.vy) > 0.01) anyMoving = true;
      else o.settled = true;
    }
    if (!anyMoving) break;
  }

  return objs.map(function(o) {
    return { x: o.x, y: o.y, size: o.r, index: o.index };
  });
}
`,
};

export default gravitySettle;
