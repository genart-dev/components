import type { ComponentEntry } from "../../types.js";

const lloydRelax: ComponentEntry = {
  name: "lloyd-relax",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Lloyd relaxation toward centroidal Voronoi. Also exposes raw Voronoi cells for artistic use.",
  tags: ["distribution", "relaxation", "lloyd", "voronoi", "centroidal", "organic"],
  parameters: [],
  exports: ["voronoiCells", "lloydRelax"],
  dependencies: [],
  usage: `var pts = lloydRelax(seeds, 400, 400, 3);`,
  code: `\
// Fortune's sweepline Voronoi — lightweight implementation
// Returns cells: [{site, vertices: [{x,y}], neighbors: [siteIdx]}]
function voronoiCells(points, width, height) {
  var n = points.length;
  if (n === 0) return [];
  // For each point, compute its Voronoi cell by clipping against
  // half-plane bisectors with all other points (O(n^2) — adequate for <=500 pts)
  function clipConvex(poly, ax, ay, bx, by) {
    // Clip convex polygon by half-plane left of line a→b
    var out = [];
    var len = poly.length;
    for (var i = 0; i < len; i++) {
      var p = poly[i], q = poly[(i + 1) % len];
      var dp = (bx - ax) * (p.y - ay) - (by - ay) * (p.x - ax);
      var dq = (bx - ax) * (q.y - ay) - (by - ay) * (q.x - ax);
      if (dp >= 0) out.push(p);
      if ((dp >= 0) !== (dq >= 0)) {
        var t = dp / (dp - dq);
        out.push({ x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) });
      }
    }
    return out;
  }

  var cells = [];
  for (var i = 0; i < n; i++) {
    // Start with bounding box polygon
    var cell = [
      { x: 0, y: 0 }, { x: width, y: 0 },
      { x: width, y: height }, { x: 0, y: height }
    ];
    var neighbors = [];
    for (var j = 0; j < n; j++) {
      if (j === i) continue;
      // Bisector perpendicular to i→j, passing through midpoint
      var mx = (points[i].x + points[j].x) / 2;
      var my = (points[i].y + points[j].y) / 2;
      var dx = points[j].x - points[i].x;
      var dy = points[j].y - points[i].y;
      // Clip: keep side containing points[i]
      // Normal of bisector points from j toward i (−dx, −dy)
      cell = clipConvex(cell, mx, my, mx - dy, my + dx);
      if (cell.length === 0) break;
      neighbors.push(j);
    }
    cells.push({ site: points[i], vertices: cell, neighbors: neighbors });
  }
  return cells;
}

// Lloyd relaxation: move each point to centroid of its Voronoi cell
function lloydRelax(points, width, height, iters, opts) {
  opts = opts || {};
  var pts = points.map(function(p) { return { x: p.x, y: p.y }; });
  for (var iter = 0; iter < (iters || 3); iter++) {
    var cells = voronoiCells(pts, width, height);
    var next = [];
    for (var i = 0; i < cells.length; i++) {
      var verts = cells[i].vertices;
      if (verts.length === 0) { next.push(pts[i]); continue; }
      var cx = 0, cy = 0;
      for (var k = 0; k < verts.length; k++) { cx += verts[k].x; cy += verts[k].y; }
      next.push({ x: cx / verts.length, y: cy / verts.length });
    }
    pts = next;
  }
  return pts.map(function(p, i) {
    return { x: p.x, y: p.y, size: 1, index: i };
  });
}
`,
};

export default lloydRelax;
