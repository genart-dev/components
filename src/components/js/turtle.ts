import type { ComponentEntry } from "../../types.js";

const turtle: ComponentEntry = {
  name: "turtle",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function createTurtle(x, y, angle) {
  return { x: x || 0, y: y || 0, angle: angle || 0, pen: true, path: [[x || 0, y || 0]] };
}

function forward(t, dist) {
  var rad = t.angle * Math.PI / 180;
  t.x += Math.cos(rad) * dist;
  t.y += Math.sin(rad) * dist;
  if (t.pen) t.path.push([t.x, t.y]);
  return t;
}

function turn(t, degrees) {
  t.angle += degrees;
  return t;
}

function penUp(t) {
  t.pen = false;
  return t;
}

function penDown(t) {
  t.pen = true;
  t.path.push(null);
  t.path.push([t.x, t.y]);
  return t;
}

function getPath(t) {
  return t.path;
}
`,
  exports: ["createTurtle", "forward", "turn", "penUp", "penDown", "getPath"],
  dependencies: ["vector"],
  description: "Turtle graphics state machine for path generation.",
  usage: `\
### turtle — Turtle Graphics

\`\`\`js
var t = createTurtle(400, 300, 0);
for (var i = 0; i < 360; i++) { forward(t, 2); turn(t, 1); }
var path = getPath(t); // circle-like path
\`\`\`
`,
};

export default turtle;
