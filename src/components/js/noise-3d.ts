import type { ComponentEntry } from "../../types.js";

const noise3d: ComponentEntry = {
  name: "noise-3d",
  version: "1.0.0",
  category: "noise",
  target: "js",
  renderers: [],
  code: `\
function perlin3D(rng) {
  var perm = new Uint8Array(512);
  for (var i = 0; i < 256; i++) perm[i] = i;
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  for (var i = 0; i < 256; i++) perm[256 + i] = perm[i];
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function grad(hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }
  return function(x, y, z) {
    var xi = Math.floor(x) & 255, yi = Math.floor(y) & 255, zi = Math.floor(z) & 255;
    var xf = x - Math.floor(x), yf = y - Math.floor(y), zf = z - Math.floor(z);
    var u = fade(xf), v = fade(yf), w = fade(zf);
    var a = perm[xi]+yi, aa = perm[a]+zi, ab = perm[a+1]+zi;
    var b = perm[xi+1]+yi, ba = perm[b]+zi, bb = perm[b+1]+zi;
    return (
      lerp(
        lerp(lerp(grad(perm[aa],xf,yf,zf), grad(perm[ba],xf-1,yf,zf),u),
             lerp(grad(perm[ab],xf,yf-1,zf), grad(perm[bb],xf-1,yf-1,zf),u),v),
        lerp(lerp(grad(perm[aa+1],xf,yf,zf-1), grad(perm[ba+1],xf-1,yf,zf-1),u),
             lerp(grad(perm[ab+1],xf,yf-1,zf-1), grad(perm[bb+1],xf-1,yf-1,zf-1),u),v),
        w) + 1) / 2;
  };
  function lerp(a, b, t) { return a + t * (b - a); }
}

function simplex3D(rng) {
  var perm = new Uint8Array(512);
  for (var i = 0; i < 256; i++) perm[i] = i;
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  for (var i = 0; i < 256; i++) perm[256 + i] = perm[i];
  var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  var F3 = 1/3, G3 = 1/6;
  return function(x, y, z) {
    var s = (x+y+z)*F3;
    var i=Math.floor(x+s), j=Math.floor(y+s), k=Math.floor(z+s);
    var t = (i+j+k)*G3;
    var x0=x-(i-t), y0=y-(j-t), z0=z-(k-t);
    var i1,j1,k1,i2,j2,k2;
    if (x0>=y0) { if (y0>=z0) {i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;} else if (x0>=z0) {i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;} else {i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;} }
    else { if (y0<z0) {i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;} else if (x0<z0) {i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;} else {i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;} }
    var x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
    var x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
    var x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
    var ii=i&255, jj=j&255, kk=k&255;
    function c(g, px, py, pz) { var t2=0.6-px*px-py*py-pz*pz; return t2<0?0:(t2*=t2, t2*t2*(g[0]*px+g[1]*py+g[2]*pz)); }
    var n = c(grad3[perm[ii+perm[jj+perm[kk]]]%12], x0,y0,z0) + c(grad3[perm[ii+i1+perm[jj+j1+perm[kk+k1]]]%12], x1,y1,z1) + c(grad3[perm[ii+i2+perm[jj+j2+perm[kk+k2]]]%12], x2,y2,z2) + c(grad3[perm[ii+1+perm[jj+1+perm[kk+1]]]%12], x3,y3,z3);
    return 0.5 + 16 * n;
  };
}

function fbm3D(noiseFn, octaves, lacunarity, gain) {
  octaves = octaves || 6; lacunarity = lacunarity || 2; gain = gain || 0.5;
  return function(x, y, z) {
    var val = 0, amp = 1, freq = 1, mx = 0;
    for (var o = 0; o < octaves; o++) {
      val += amp * noiseFn(x * freq, y * freq, z * freq);
      mx += amp; amp *= gain; freq *= lacunarity;
    }
    return val / mx;
  };
}
`,
  exports: ["perlin3D", "simplex3D", "fbm3D"],
  dependencies: ["prng"],
  description: "3D noise functions (Perlin, simplex) and fBm.",
  usage: `\
### noise-3d — 3D Noise Functions

\`\`\`js
var noise = perlin3D(rng);
noise(x, y, z); // → 0.0–1.0
var fbm = fbm3D(noise, 6);
\`\`\`
`,
};

export default noise3d;
