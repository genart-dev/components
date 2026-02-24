import type { ComponentEntry } from "../../types.js";

const flowField: ComponentEntry = {
  name: "flow-field",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: [],
  code: `\
function createFlowField(cols, rows, angleFn) {
  var field = new Float64Array(cols * rows);
  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++)
      field[y * cols + x] = angleFn(x, y);
  return { field: field, cols: cols, rows: rows };
}

function flowFromNoise(noiseFn, cols, rows, scale) {
  return createFlowField(cols, rows, function(x, y) {
    return noiseFn(x * scale, y * scale) * Math.PI * 4;
  });
}

function flowFromFunction(fn, cols, rows) {
  return createFlowField(cols, rows, fn);
}

function traceStreamline(field, startX, startY, cellSize, steps, stepSize) {
  stepSize = stepSize || 1;
  var pts = [[startX, startY]];
  var x = startX, y = startY;
  for (var i = 0; i < steps; i++) {
    var gx = Math.floor(x / cellSize), gy = Math.floor(y / cellSize);
    if (gx < 0 || gx >= field.cols || gy < 0 || gy >= field.rows) break;
    var angle = field.field[gy * field.cols + gx];
    x += Math.cos(angle) * stepSize;
    y += Math.sin(angle) * stepSize;
    pts.push([x, y]);
  }
  return pts;
}
`,
  exports: ["createFlowField", "traceStreamline", "flowFromNoise", "flowFromFunction"],
  dependencies: ["noise-2d", "vector"],
  description: "Flow field generation and streamline tracing.",
  usage: `\
### flow-field — Flow Fields

\`\`\`js
var field = flowFromNoise(perlin2D(rng), 80, 60, 0.03);
var line = traceStreamline(field, startX, startY, 10, 200, 1);
\`\`\`
`,
};

export default flowField;
