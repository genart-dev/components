import type { ComponentEntry } from "../../types.js";

const reactionDiffusion: ComponentEntry = {
  name: "reaction-diffusion",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: [],
  code: `\
function createGrayScottGrid(cols, rows) {
  var a = new Float64Array(cols * rows).fill(1);
  var b = new Float64Array(cols * rows).fill(0);
  return { a: a, b: b, cols: cols, rows: rows };
}

function grayScottStep(grid, feed, kill, dA, dB, dt) {
  feed = feed || 0.037; kill = kill || 0.06;
  dA = dA || 1.0; dB = dB || 0.5; dt = dt || 1.0;
  var cols = grid.cols, rows = grid.rows;
  var a = grid.a, b = grid.b;
  var na = new Float64Array(cols * rows);
  var nb = new Float64Array(cols * rows);
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      var i = y * cols + x;
      var up = ((y-1+rows)%rows)*cols+x, dn = ((y+1)%rows)*cols+x;
      var lt = y*cols+(x-1+cols)%cols, rt = y*cols+(x+1)%cols;
      var lapA = a[up]+a[dn]+a[lt]+a[rt]-4*a[i];
      var lapB = b[up]+b[dn]+b[lt]+b[rt]-4*b[i];
      var abb = a[i] * b[i] * b[i];
      na[i] = a[i] + (dA * lapA - abb + feed * (1 - a[i])) * dt;
      nb[i] = b[i] + (dB * lapB + abb - (kill + feed) * b[i]) * dt;
    }
  }
  grid.a = na; grid.b = nb;
  return grid;
}

function turingPattern(cols, rows, steps, feed, kill, rng) {
  var grid = createGrayScottGrid(cols, rows);
  var cx = cols/2, cy = rows/2, r = Math.min(cols, rows)/6;
  for (var y = Math.floor(cy-r); y <= Math.ceil(cy+r); y++)
    for (var x = Math.floor(cx-r); x <= Math.ceil(cx+r); x++)
      if ((x-cx)*(x-cx)+(y-cy)*(y-cy) < r*r) {
        var i = y * cols + x;
        grid.b[i] = 1;
        if (rng) { grid.a[i] += (rng()-0.5)*0.01; grid.b[i] += (rng()-0.5)*0.01; }
      }
  for (var s = 0; s < steps; s++) grayScottStep(grid, feed, kill);
  return grid;
}
`,
  exports: ["grayScottStep", "createGrayScottGrid", "turingPattern"],
  dependencies: [],
  description: "Reaction-diffusion simulation (Gray-Scott model).",
  usage: `\
### reaction-diffusion — Gray-Scott

\`\`\`js
var grid = createGrayScottGrid(200, 200);
// seed center region with chemical B
for (var s = 0; s < 5000; s++) grayScottStep(grid, 0.037, 0.06);
// grid.b contains the pattern
\`\`\`
`,
};

export default reactionDiffusion;
