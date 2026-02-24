import type { ComponentEntry } from "../../types.js";

const dla: ComponentEntry = {
  name: "dla",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: [],
  code: `\
function diffusionLimitedAggregation(rng, width, height, seedCount, walkerCount, stickiness) {
  stickiness = stickiness || 1;
  var grid = new Uint8Array(width * height);
  for (var i = 0; i < seedCount; i++) {
    var sx = Math.floor(width / 2 + (rng() - 0.5) * 10);
    var sy = Math.floor(height / 2 + (rng() - 0.5) * 10);
    if (sx >= 0 && sx < width && sy >= 0 && sy < height) grid[sy * width + sx] = 1;
  }
  var attached = [];
  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++)
      if (grid[y * width + x]) attached.push([x, y]);

  for (var w = 0; w < walkerCount; w++) {
    var wx = Math.floor(rng() * width), wy = Math.floor(rng() * height);
    var stuck = false;
    for (var step = 0; step < 10000 && !stuck; step++) {
      wx += Math.round(rng() * 2 - 1);
      wy += Math.round(rng() * 2 - 1);
      if (wx < 0 || wx >= width || wy < 0 || wy >= height) {
        wx = Math.floor(rng() * width);
        wy = Math.floor(rng() * height);
        continue;
      }
      for (var dx = -1; dx <= 1 && !stuck; dx++)
        for (var dy = -1; dy <= 1 && !stuck; dy++) {
          var nx = wx + dx, ny = wy + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny * width + nx]) {
            if (rng() < stickiness) {
              grid[wy * width + wx] = 1;
              attached.push([wx, wy]);
              stuck = true;
            }
          }
        }
    }
  }
  return { grid: grid, points: attached, width: width, height: height };
}

function dlaStep(state, rng, walkers, stickiness) {
  walkers = walkers || 100;
  stickiness = stickiness || 1;
  var w = state.width, h = state.height, grid = state.grid;
  for (var i = 0; i < walkers; i++) {
    var wx = Math.floor(rng() * w), wy = Math.floor(rng() * h);
    for (var step = 0; step < 500; step++) {
      wx += Math.round(rng() * 2 - 1);
      wy += Math.round(rng() * 2 - 1);
      if (wx < 0 || wx >= w || wy < 0 || wy >= h) break;
      var hasN = false;
      for (var dx = -1; dx <= 1 && !hasN; dx++)
        for (var dy = -1; dy <= 1 && !hasN; dy++) {
          var nx = wx + dx, ny = wy + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny * w + nx]) hasN = true;
        }
      if (hasN && rng() < stickiness) {
        grid[wy * w + wx] = 1;
        state.points.push([wx, wy]);
        break;
      }
    }
  }
  return state;
}
`,
  exports: ["diffusionLimitedAggregation", "dlaStep"],
  dependencies: ["prng"],
  description: "Diffusion-limited aggregation (DLA) pattern generation.",
  usage: `\
### dla — Diffusion-Limited Aggregation

\`\`\`js
var state = diffusionLimitedAggregation(rng, 400, 400, 1, 5000, 0.8);
// state.grid — occupancy grid
// state.points — attached point coordinates
\`\`\`
`,
};

export default dla;
