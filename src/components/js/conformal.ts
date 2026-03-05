import type { ComponentEntry } from "../../types.js";

const conformal: ComponentEntry = {
  name: "conformal",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Conformal mappings: Möbius transforms and circle inversion. Hyperbolic geometry, Escher-style patterns.",
  tags: ["distribution", "transform", "conformal", "mobius", "inversion", "hyperbolic", "escher"],
  parameters: [],
  exports: ["mobiusTransform", "circleInversion", "joukowski", "poincareReflect"],
  dependencies: [],
  usage: `var pts2 = circleInversion(pts, 200, 200, 100);`,
  code: `\
// Möbius transform: f(z) = (az + b) / (cz + d)
// Parameters a, b, c, d are complex numbers {re, im}
// points: [{x, y}] as real+imaginary parts of z
function mobiusTransform(points, a, b, c, d) {
  // Complex multiply: (p+qi)(r+si) = pr-qs + (ps+qr)i
  function cmul(p, q, r, s) { return [p * r - q * s, p * s + q * r]; }
  function cadd(p, q, r, s) { return [p + r, q + s]; }
  function cdiv(p, q, r, s) {
    var denom = r * r + s * s;
    if (denom === 0) return [Infinity, Infinity];
    return [(p * r + q * s) / denom, (q * r - p * s) / denom];
  }
  return points.map(function(pt, i) {
    var zr = pt.x, zi = pt.y;
    // numerator = a*z + b
    var num = cmul(a.re, a.im, zr, zi);
    num = cadd(num[0], num[1], b.re, b.im);
    // denominator = c*z + d
    var den = cmul(c.re, c.im, zr, zi);
    den = cadd(den[0], den[1], d.re, d.im);
    var res = cdiv(num[0], num[1], den[0], den[1]);
    return { x: res[0], y: res[1], size: pt.size || 1, index: i, data: pt.data };
  });
}

// Circle inversion: reflect each point through a circle (cx, cy, r)
// P' = C + r² / |P-C|² * (P-C)
function circleInversion(points, cx, cy, r) {
  var r2 = r * r;
  return points.map(function(pt, i) {
    var dx = pt.x - cx, dy = pt.y - cy;
    var d2 = dx * dx + dy * dy;
    if (d2 === 0) return { x: cx, y: cy, size: pt.size || 1, index: i };
    var scale = r2 / d2;
    return { x: cx + dx * scale, y: cy + dy * scale, size: pt.size || 1, index: i, data: pt.data };
  });
}

// Joukowski transform: z → z + 1/z  (airfoil/wing shape from circle)
function joukowski(points, a) {
  var aa = (a || 1);
  var a2 = aa * aa;
  return points.map(function(pt, i) {
    var zr = pt.x, zi = pt.y;
    var d2 = zr * zr + zi * zi;
    if (d2 === 0) return { x: pt.x, y: pt.y, size: pt.size || 1, index: i };
    return {
      x: zr + a2 * zr / d2,
      y: zi - a2 * zi / d2,
      size: pt.size || 1, index: i, data: pt.data
    };
  });
}

// Hyperbolic (Poincaré disk) reflection through a geodesic
// Reflects points within unit disk through a geodesic defined by two boundary points p1, p2
function poincareReflect(points, p1, p2) {
  // Compute center and radius of the geodesic circle (orthogonal to unit circle)
  var ax = p1.x, ay = p1.y, bx = p2.x, by = p2.y;
  var a2 = ax * ax + ay * ay, b2 = bx * bx + by * by;
  var denom = 2 * (ax * by - ay * bx);
  if (Math.abs(denom) < 1e-10) {
    // Geodesic is a diameter — ordinary reflection across line
    return points.map(function(pt, i) {
      var dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      var t = ((pt.x - ax) * dx + (pt.y - ay) * dy) / len2;
      return { x: 2 * (ax + t * dx) - pt.x, y: 2 * (ay + t * dy) - pt.y, size: pt.size || 1, index: i };
    });
  }
  var cx = (b2 * ay - a2 * by) / denom;
  var cy = (a2 * bx - b2 * ax) / denom;
  var r = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy));
  return circleInversion(points, cx, cy, r);
}
`,
};

export default conformal;
