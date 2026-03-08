import type { ComponentEntry } from "../../types.js";

const gridPlacement: ComponentEntry = {
  name: "grid-placement",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  code: `\
function makeGrid(bounds, spacing, jitter, rng, maxCells) {
  maxCells = maxCells || 5000;
  var left = bounds.left, right = bounds.right;
  var top = bounds.top, bottom = bounds.bottom;
  var w = right - left, h = bottom - top;
  var cols = Math.ceil(w / spacing) + 1;
  var rows = Math.ceil(h / spacing) + 1;
  var total = cols * rows;
  var sk = Math.max(1, Math.ceil(total / maxCells));
  var count = Math.min(total, Math.ceil(total / sk));
  var pos = new Array(count);
  var jitterAmt = jitter * spacing;
  for (var k = 0; k < count; k++) {
    var ci = (k * sk) % total;
    var row = Math.floor(ci / cols), col = ci % cols;
    pos[k] = {
      x: left + col * spacing + (rng() - 0.5) * jitterAmt * 2,
      y: top + row * spacing + (rng() - 0.5) * jitterAmt * 2
    };
  }
  for (var i = count - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = pos[i]; pos[i] = pos[j]; pos[j] = tmp;
  }
  return pos;
}
`,
  exports: ["makeGrid"],
  dependencies: [],
  description:
    "Grid+jitter placement with strided sampling and Fisher-Yates shuffle for uniform canvas coverage.",
  usage: `\
### grid-placement — Grid Placement

\`\`\`js
// Place dabs on a jittered grid covering a region
var positions = makeGrid(
  { left: 0, right: 1200, top: 0, bottom: 1200 },
  30,    // spacing between grid cells (px)
  0.5,   // jitter amount (0 = perfect grid, 1 = max randomization)
  rng,   // PRNG function
  5000   // max cells (strided sampling if grid exceeds this)
);
// positions = [{x, y}, {x, y}, ...] — shuffled for random draw order
\`\`\`
`,
};

export default gridPlacement;
