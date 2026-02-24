import type { ComponentEntry } from "../../types.js";

const shapeAdvanced: ComponentEntry = {
  name: "shape-advanced",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function chaikinSmooth(points, iterations) {
  iterations = iterations || 3;
  var pts = points;
  for (var iter = 0; iter < iterations; iter++) {
    var next = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i+1];
      next.push([a[0]*0.75 + b[0]*0.25, a[1]*0.75 + b[1]*0.25]);
      next.push([a[0]*0.25 + b[0]*0.75, a[1]*0.25 + b[1]*0.75]);
    }
    pts = next;
  }
  return pts;
}

function subdivideCurve(points, iterations) {
  iterations = iterations || 1;
  var pts = points;
  for (var iter = 0; iter < iterations; iter++) {
    var next = [pts[0]];
    for (var i = 0; i < pts.length - 1; i++) {
      var mid = [(pts[i][0]+pts[i+1][0])/2, (pts[i][1]+pts[i+1][1])/2];
      next.push(mid);
      next.push(pts[i+1]);
    }
    pts = next;
  }
  return pts;
}

function offsetPath(points, dist) {
  var result = [];
  for (var i = 0; i < points.length; i++) {
    var prev = points[(i-1+points.length)%points.length];
    var curr = points[i];
    var next = points[(i+1)%points.length];
    var dx1 = curr[0]-prev[0], dy1 = curr[1]-prev[1];
    var dx2 = next[0]-curr[0], dy2 = next[1]-curr[1];
    var len1 = Math.sqrt(dx1*dx1+dy1*dy1) || 1;
    var len2 = Math.sqrt(dx2*dx2+dy2*dy2) || 1;
    var nx = (-(dy1/len1 + dy2/len2))/2, ny = ((dx1/len1 + dx2/len2))/2;
    var nl = Math.sqrt(nx*nx+ny*ny) || 1;
    result.push([curr[0]+nx/nl*dist, curr[1]+ny/nl*dist]);
  }
  return result;
}

function convexHull(points) {
  var pts = points.slice().sort(function(a,b) { return a[0]-b[0] || a[1]-b[1]; });
  function cross(O,A,B) { return (A[0]-O[0])*(B[1]-O[1])-(A[1]-O[1])*(B[0]-O[0]); }
  var lower = [];
  for (var i = 0; i < pts.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], pts[i]) <= 0) lower.pop();
    lower.push(pts[i]);
  }
  var upper = [];
  for (var i = pts.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], pts[i]) <= 0) upper.pop();
    upper.push(pts[i]);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function delaunay(points) {
  var n = points.length;
  if (n < 3) return [];
  var ids = new Array(n);
  for (var i = 0; i < n; i++) ids[i] = i;
  ids.sort(function(a,b) { return points[a][0]-points[b][0] || points[a][1]-points[b][1]; });
  var triangles = [];
  function circumscribed(ax,ay,bx,by,cx,cy,px,py) {
    var dx=ax-px,dy=ay-py,ex=bx-px,ey=by-py,fx=cx-px,fy=cy-py;
    var ap=dx*dx+dy*dy,bp=ex*ex+ey*ey,cp=fx*fx+fy*fy;
    return dx*(ey*cp-bp*fy)-dy*(ex*cp-bp*fx)+ap*(ex*fy-ey*fx) > 0;
  }
  var st = [[-1e6,-1e6],[1e6,-1e6],[0,1e6]];
  triangles.push([n,n+1,n+2]);
  var all = points.concat(st);
  for (var i = 0; i < n; i++) {
    var pi = ids[i], px = all[pi][0], py = all[pi][1];
    var edges = [], bad = [];
    for (var j = 0; j < triangles.length; j++) {
      var t = triangles[j];
      if (circumscribed(all[t[0]][0],all[t[0]][1],all[t[1]][0],all[t[1]][1],all[t[2]][0],all[t[2]][1],px,py)) {
        bad.push(j);
        edges.push([t[0],t[1]],[t[1],t[2]],[t[2],t[0]]);
      }
    }
    for (var j = bad.length-1; j >= 0; j--) triangles.splice(bad[j],1);
    var unique = [];
    for (var j = 0; j < edges.length; j++) {
      var dup = false;
      for (var k = 0; k < edges.length; k++) {
        if (j !== k && edges[j][0]===edges[k][1] && edges[j][1]===edges[k][0]) { dup = true; break; }
      }
      if (!dup) unique.push(edges[j]);
    }
    for (var j = 0; j < unique.length; j++) triangles.push([unique[j][0], unique[j][1], pi]);
  }
  return triangles.filter(function(t) { return t[0] < n && t[1] < n && t[2] < n; });
}

function voronoi(points, width, height, resolution) {
  resolution = resolution || 1;
  var cols = Math.ceil(width/resolution), rows = Math.ceil(height/resolution);
  var cells = new Int32Array(cols * rows);
  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      var px = x * resolution, py = y * resolution;
      var minD = Infinity, minI = 0;
      for (var i = 0; i < points.length; i++) {
        var dx = px - points[i][0], dy = py - points[i][1];
        var d = dx*dx + dy*dy;
        if (d < minD) { minD = d; minI = i; }
      }
      cells[y * cols + x] = minI;
    }
  return { cells: cells, cols: cols, rows: rows };
}
`,
  exports: ["chaikinSmooth", "subdivideCurve", "offsetPath", "convexHull", "delaunay", "voronoi"],
  dependencies: ["vector", "shape"],
  description: "Computational geometry (Chaikin, convex hull, Delaunay, Voronoi).",
  usage: `\
### shape-advanced — Computational Geometry

\`\`\`js
var smooth = chaikinSmooth(points, 3);
var hull = convexHull(points);
var tris = delaunay(points);
var v = voronoi(points, 800, 600);
\`\`\`
`,
};

export default shapeAdvanced;
