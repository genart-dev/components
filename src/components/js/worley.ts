import type { ComponentEntry } from "../../types.js";

const worley: ComponentEntry = {
  name: "worley",
  version: "1.0.0",
  category: "noise",
  target: "js",
  renderers: [],
  code: `\
function worley2D(rng) {
  var cache = {};
  function cellPoint(ix, iy) {
    var key = ix + ',' + iy;
    if (!cache[key]) {
      var a = ix * 374761393 + iy * 668265263;
      a = (a ^ (a >> 13)) * 1274126177;
      var seed = ((a ^ (a >> 16)) >>> 0);
      var r = mulberry32(seed ^ Math.floor(rng() * 0x7fffffff));
      cache[key] = [ix + r(), iy + r()];
    }
    return cache[key];
  }
  return function(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y);
    var minDist = 1e10;
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        var p = cellPoint(ix + dx, iy + dy);
        var d = (x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]);
        if (d < minDist) minDist = d;
      }
    }
    return Math.sqrt(minDist);
  };
}

function worley3D(rng) {
  var cache = {};
  function cellPoint(ix, iy, iz) {
    var key = ix + ',' + iy + ',' + iz;
    if (!cache[key]) {
      var a = ix * 374761393 + iy * 668265263 + iz * 1274126177;
      a = (a ^ (a >> 13)) * 1103515245;
      var seed = ((a ^ (a >> 16)) >>> 0);
      var r = mulberry32(seed ^ Math.floor(rng() * 0x7fffffff));
      cache[key] = [ix + r(), iy + r(), iz + r()];
    }
    return cache[key];
  }
  return function(x, y, z) {
    var ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    var minDist = 1e10;
    for (var dx = -1; dx <= 1; dx++)
      for (var dy = -1; dy <= 1; dy++)
        for (var dz = -1; dz <= 1; dz++) {
          var p = cellPoint(ix + dx, iy + dy, iz + dz);
          var d = (x-p[0])*(x-p[0]) + (y-p[1])*(y-p[1]) + (z-p[2])*(z-p[2]);
          if (d < minDist) minDist = d;
        }
    return Math.sqrt(minDist);
  };
}
`,
  exports: ["worley2D", "worley3D"],
  dependencies: ["prng"],
  description: "Worley/cellular noise (2D and 3D).",
  usage: `\
### worley — Cellular Noise

\`\`\`js
var w = worley2D(rng);
w(x * 5, y * 5); // → distance to nearest cell point
\`\`\`
`,
};

export default worley;
