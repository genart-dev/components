import type { ComponentEntry } from "../../types.js";

const curl: ComponentEntry = {
  name: "curl",
  version: "1.0.0",
  category: "noise",
  target: "js",
  renderers: [],
  code: `\
function curlNoise2D(noiseFn, eps) {
  eps = eps || 0.001;
  return function(x, y) {
    var dndx = (noiseFn(x + eps, y) - noiseFn(x - eps, y)) / (2 * eps);
    var dndy = (noiseFn(x, y + eps) - noiseFn(x, y - eps)) / (2 * eps);
    return [dndy, -dndx];
  };
}

function curlNoise3D(noiseFnX, noiseFnY, noiseFnZ, eps) {
  eps = eps || 0.001;
  return function(x, y, z) {
    var dzdy = (noiseFnZ(x, y + eps, z) - noiseFnZ(x, y - eps, z)) / (2 * eps);
    var dydz = (noiseFnY(x, y, z + eps) - noiseFnY(x, y, z - eps)) / (2 * eps);
    var dxdz = (noiseFnX(x, y, z + eps) - noiseFnX(x, y, z - eps)) / (2 * eps);
    var dzdx = (noiseFnZ(x + eps, y, z) - noiseFnZ(x - eps, y, z)) / (2 * eps);
    var dydx = (noiseFnY(x + eps, y, z) - noiseFnY(x - eps, y, z)) / (2 * eps);
    var dxdy = (noiseFnX(x, y + eps, z) - noiseFnX(x, y - eps, z)) / (2 * eps);
    return [dzdy - dydz, dxdz - dzdx, dydx - dxdy];
  };
}
`,
  exports: ["curlNoise2D", "curlNoise3D"],
  dependencies: ["noise-2d", "noise-3d"],
  description: "Curl noise for divergence-free flow fields.",
  usage: `\
### curl — Curl Noise

\`\`\`js
var noise = perlin2D(rng);
var curl = curlNoise2D(noise);
var [vx, vy] = curl(x, y); // divergence-free velocity
\`\`\`
`,
};

export default curl;
