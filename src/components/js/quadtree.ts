import type { ComponentEntry } from "../../types.js";

const quadtree: ComponentEntry = {
  name: "quadtree",
  version: "1.0.0",
  category: "data-structure",
  target: "js",
  renderers: [],
  code: `\
function createQuadTree(x, y, w, h, capacity) {
  return { x: x, y: y, w: w, h: h, capacity: capacity || 4, points: [], children: null };
}

function insertPoint(qt, px, py, data) {
  if (px < qt.x || px >= qt.x + qt.w || py < qt.y || py >= qt.y + qt.h) return false;
  if (qt.points.length < qt.capacity && !qt.children) {
    qt.points.push({ x: px, y: py, data: data });
    return true;
  }
  if (!qt.children) {
    var hw = qt.w/2, hh = qt.h/2;
    qt.children = [
      createQuadTree(qt.x, qt.y, hw, hh, qt.capacity),
      createQuadTree(qt.x+hw, qt.y, hw, hh, qt.capacity),
      createQuadTree(qt.x, qt.y+hh, hw, hh, qt.capacity),
      createQuadTree(qt.x+hw, qt.y+hh, hw, hh, qt.capacity)
    ];
    for (var i = 0; i < qt.points.length; i++) {
      var p = qt.points[i];
      for (var c = 0; c < 4; c++) if (insertPoint(qt.children[c], p.x, p.y, p.data)) break;
    }
    qt.points = [];
  }
  for (var c = 0; c < 4; c++) if (insertPoint(qt.children[c], px, py, data)) return true;
  return false;
}

function queryRange(qt, rx, ry, rw, rh) {
  var found = [];
  if (qt.x + qt.w < rx || qt.x > rx + rw || qt.y + qt.h < ry || qt.y > ry + rh) return found;
  for (var i = 0; i < qt.points.length; i++) {
    var p = qt.points[i];
    if (p.x >= rx && p.x <= rx + rw && p.y >= ry && p.y <= ry + rh) found.push(p);
  }
  if (qt.children) {
    for (var c = 0; c < 4; c++) found = found.concat(queryRange(qt.children[c], rx, ry, rw, rh));
  }
  return found;
}

function queryRadius(qt, cx, cy, r) {
  var found = [];
  var r2 = r * r;
  function search(node) {
    if (cx - r > node.x + node.w || cx + r < node.x || cy - r > node.y + node.h || cy + r < node.y) return;
    for (var i = 0; i < node.points.length; i++) {
      var p = node.points[i];
      var dx = p.x - cx, dy = p.y - cy;
      if (dx*dx + dy*dy <= r2) found.push(p);
    }
    if (node.children) for (var c = 0; c < 4; c++) search(node.children[c]);
  }
  search(qt);
  return found;
}
`,
  exports: ["createQuadTree", "insertPoint", "queryRange", "queryRadius"],
  dependencies: [],
  description: "Quadtree spatial index for efficient neighbor queries.",
  usage: `\
### quadtree — Spatial Index

\`\`\`js
var qt = createQuadTree(0, 0, 800, 600, 8);
points.forEach(function(p) { insertPoint(qt, p.x, p.y, p); });
var nearby = queryRadius(qt, mouseX, mouseY, 50);
\`\`\`
`,
};

export default quadtree;
