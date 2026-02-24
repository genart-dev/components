import type { ComponentEntry } from "../../types.js";

const vector: ComponentEntry = {
  name: "vector",
  version: "1.0.0",
  category: "vector",
  target: "js",
  renderers: [],
  code: `\
function vec2(x, y) { return [x, y]; }
function vec3(x, y, z) { return [x, y, z]; }

function add(a, b) {
  var r = new Array(a.length);
  for (var i = 0; i < a.length; i++) r[i] = a[i] + b[i];
  return r;
}

function sub(a, b) {
  var r = new Array(a.length);
  for (var i = 0; i < a.length; i++) r[i] = a[i] - b[i];
  return r;
}

function mul(a, s) {
  var r = new Array(a.length);
  for (var i = 0; i < a.length; i++) r[i] = a[i] * s;
  return r;
}

function div(a, s) {
  var r = new Array(a.length);
  for (var i = 0; i < a.length; i++) r[i] = a[i] / s;
  return r;
}

function dot(a, b) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function length(a) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

function normalize(a) {
  var len = length(a);
  return len === 0 ? a : div(a, len);
}

function distance(a, b) { return length(sub(a, b)); }

function reflect(v, n) {
  var d = 2 * dot(v, n);
  return sub(v, mul(n, d));
}

function rotate2D(v, angle) {
  var c = Math.cos(angle), s = Math.sin(angle);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
}
`,
  exports: ["vec2", "vec3", "add", "sub", "mul", "div", "dot", "cross", "normalize", "length", "distance", "reflect", "rotate2D"],
  dependencies: [],
  description: "Lightweight vector math using plain arrays.",
  usage: `\
### vector — Vector Math

\`\`\`js
var a = vec2(1, 0), b = vec2(0, 1);
add(a, b);        // → [1, 1]
normalize(a);     // → [1, 0]
distance(a, b);   // → 1.414...
rotate2D(a, Math.PI / 2);
\`\`\`
`,
};

export default vector;
