import type { ComponentEntry } from "../../types.js";

const shape: ComponentEntry = {
  name: "shape",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function regularPolygon(cx, cy, radius, sides) {
  var pts = [];
  for (var i = 0; i < sides; i++) {
    var a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
  }
  return pts;
}

function star(cx, cy, outerR, innerR, points) {
  var pts = [];
  for (var i = 0; i < points * 2; i++) {
    var a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    var r = i % 2 === 0 ? outerR : innerR;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function spiral(cx, cy, startR, endR, turns, segments) {
  var pts = [];
  for (var i = 0; i <= segments; i++) {
    var t = i / segments;
    var angle = t * turns * Math.PI * 2;
    var r = startR + (endR - startR) * t;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  return pts;
}

function lissajous(cx, cy, a, b, kx, ky, delta, segments) {
  var pts = [];
  for (var i = 0; i <= segments; i++) {
    var t = (i / segments) * Math.PI * 2;
    pts.push([cx + a * Math.sin(kx * t + delta), cy + b * Math.sin(ky * t)]);
  }
  return pts;
}

function superellipse(cx, cy, rx, ry, n, segments) {
  var pts = [];
  for (var i = 0; i <= segments; i++) {
    var a = (i / segments) * Math.PI * 2;
    var ca = Math.cos(a), sa = Math.sin(a);
    var x = Math.pow(Math.abs(ca), 2/n) * rx * (ca >= 0 ? 1 : -1);
    var y = Math.pow(Math.abs(sa), 2/n) * ry * (sa >= 0 ? 1 : -1);
    pts.push([cx + x, cy + y]);
  }
  return pts;
}

function heart(cx, cy, size, segments) {
  var pts = [];
  for (var i = 0; i <= segments; i++) {
    var t = (i / segments) * Math.PI * 2;
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    pts.push([cx + x * size / 16, cy + y * size / 16]);
  }
  return pts;
}
`,
  exports: ["regularPolygon", "star", "spiral", "lissajous", "superellipse", "heart"],
  dependencies: ["math"],
  description: "Parametric shape generators returning point arrays.",
  usage: `\
### shape — Parametric Shapes

\`\`\`js
regularPolygon(cx, cy, 50, 6);  // hexagon
star(cx, cy, 50, 25, 5);        // 5-point star
spiral(cx, cy, 10, 100, 5, 200);
heart(cx, cy, 40, 100);
\`\`\`
`,
};

export default shape;
