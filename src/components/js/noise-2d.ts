import type { ComponentEntry } from "../../types.js";

const noise2d: ComponentEntry = {
  name: "noise-2d",
  version: "1.0.0",
  category: "noise",
  target: "js",
  renderers: [],
  code: `\
function perlin2D(rng) {
  var perm = new Uint8Array(512);
  for (var i = 0; i < 256; i++) perm[i] = i;
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  for (var i = 0; i < 256; i++) perm[256 + i] = perm[i];
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function grad(hash, x, y) {
    var h = hash & 3;
    return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
  }
  return function(x, y) {
    var xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    var xf = x - Math.floor(x), yf = y - Math.floor(y);
    var u = fade(xf), v = fade(yf);
    var a0 = perm[xi] + yi, a1 = perm[xi + 1] + yi;
    var aa = grad(perm[a0], xf, yf), ba = grad(perm[a1], xf - 1, yf);
    var ab = grad(perm[a0 + 1], xf, yf - 1), bb = grad(perm[a1 + 1], xf - 1, yf - 1);
    var x1 = aa + u * (ba - aa), x2 = ab + u * (bb - ab);
    return (x1 + v * (x2 - x1) + 1) / 2;
  };
}

function simplex2D(rng) {
  var perm = new Uint8Array(512);
  for (var i = 0; i < 256; i++) perm[i] = i;
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  for (var i = 0; i < 256; i++) perm[256 + i] = perm[i];
  var grad2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  var F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  return function(x, y) {
    var s = (x + y) * F2;
    var i = Math.floor(x + s), j = Math.floor(y + s);
    var t = (i + j) * G2;
    var x0 = x - (i - t), y0 = y - (j - t);
    var i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    var x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    var ii = i & 255, jj = j & 255;
    function contrib(gx, gy, px, py) {
      var t2 = 0.5 - px * px - py * py;
      if (t2 < 0) return 0;
      t2 *= t2;
      return t2 * t2 * (gx * px + gy * py);
    }
    var g0 = grad2[perm[ii + perm[jj]] & 7];
    var g1 = grad2[perm[ii + i1 + perm[jj + j1]] & 7];
    var g2 = grad2[perm[ii + 1 + perm[jj + 1]] & 7];
    return 0.5 + 35 * (contrib(g0[0], g0[1], x0, y0) + contrib(g1[0], g1[1], x1, y1) + contrib(g2[0], g2[1], x2, y2));
  };
}

function valueNoise2D(rng) {
  var values = new Float64Array(256);
  for (var i = 0; i < 256; i++) values[i] = rng();
  function hash(x, y) {
    return values[((x * 374761393 + y * 668265263) & 0x7fffffff) % 256];
  }
  return function(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y);
    var fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    var a = hash(ix, iy), b = hash(ix + 1, iy);
    var c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + fx * (b - a) + fy * (c - a) + fx * fy * (a - b - c + d);
  };
}

function fbm2D(noiseFn, octaves, lacunarity, gain) {
  octaves = octaves || 6; lacunarity = lacunarity || 2; gain = gain || 0.5;
  return function(x, y) {
    var val = 0, amp = 1, freq = 1, mx = 0;
    for (var o = 0; o < octaves; o++) {
      val += amp * noiseFn(x * freq, y * freq);
      mx += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return val / mx;
  };
}
`,
  exports: ["perlin2D", "simplex2D", "valueNoise2D", "fbm2D"],
  dependencies: ["prng"],
  description: "2D noise functions (Perlin, simplex, value) and fBm.",
  usage: `\
### noise-2d — 2D Noise Functions

\`\`\`js
var rng = mulberry32(state.SEED);
var noise = perlin2D(rng);
noise(x * 0.01, y * 0.01); // → 0.0–1.0

var fbm = fbm2D(noise, 6, 2, 0.5);
fbm(x * 0.01, y * 0.01);   // → fractal noise
\`\`\`
`,
};

export default noise2d;
