import type { ComponentEntry } from "../../types.js";

const forcePath: ComponentEntry = {
  name: "force-path",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function createForcePath(segments, config) {
  config = config || {};
  var radius = config.radius || 50;
  var falloff = config.falloff || "quadratic";

  function falloffFn(t) {
    if (falloff === "linear") return 1 - t;
    if (falloff === "cubic") return (1 - t) * (1 - t) * (1 - t);
    return (1 - t) * (1 - t);
  }

  function nearestSegment(px, py) {
    var bestDist = Infinity;
    var bestT = 0;
    var bestIdx = 0;
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i];
      var dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      var len2 = dx * dx + dy * dy;
      var t = len2 > 0 ? Math.max(0, Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / len2)) : 0;
      var cx = s.x1 + t * dx, cy = s.y1 + t * dy;
      var ddx = px - cx, ddy = py - cy;
      var d = Math.sqrt(ddx * ddx + ddy * ddy);
      if (d < bestDist) {
        bestDist = d;
        bestT = t;
        bestIdx = i;
      }
    }
    return { dist: bestDist, t: bestT, index: bestIdx };
  }

  return {
    segments: segments,
    radius: radius,

    distAt: function(px, py) {
      return nearestSegment(px, py).dist;
    },

    influenceAt: function(px, py) {
      var d = nearestSegment(px, py).dist;
      if (d >= radius) return 0;
      return falloffFn(d / radius);
    },

    angleAt: function(px, py, baseAngle) {
      var n = nearestSegment(px, py);
      if (n.dist >= radius) return baseAngle;
      var seg = segments[n.index];
      var segAngle = seg.angle !== undefined ? seg.angle : Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
      var inf = falloffFn(n.dist / radius);
      return baseAngle + (segAngle - baseAngle) * inf;
    },

    excludes: function(px, py, exclusionRadius) {
      var r = exclusionRadius !== undefined ? exclusionRadius : radius;
      return nearestSegment(px, py).dist < r;
    },

    proximityAt: function(px, py) {
      var d = nearestSegment(px, py).dist;
      if (d >= radius) return 0;
      return 1 - d / radius;
    }
  };
}
`,
  exports: ["createForcePath"],
  dependencies: [],
  description:
    "Force-path influence field from line segments — distance, angle blending, exclusion zones, and falloff-weighted proximity.",
  usage: `\
### force-path — Force Path Influence Field

Create an influence field from an array of line segments. Useful for lightning bolts,
rivers, cracks, or any path that should pull nearby brush strokes or particles.

\`\`\`js
// segments: [{x1, y1, x2, y2, angle?}, ...]
var bolt = createForcePath(boltSegments, {
  radius: 50,        // max influence radius (px)
  falloff: "quadratic" // "linear" | "quadratic" | "cubic"
});

// Distance to nearest segment
var d = bolt.distAt(px, py);

// Influence factor (0 outside radius, 1 at path center)
var inf = bolt.influenceAt(px, py);

// Blend base angle toward nearest segment angle
var angle = bolt.angleAt(px, py, baseAngle);

// Check exclusion zone (skip dabs too close)
if (bolt.excludes(px, py, 30)) continue;

// Raw proximity (0 outside, 1 on path) — no falloff curve
var prox = bolt.proximityAt(px, py);
\`\`\`
`,
};

export default forcePath;
