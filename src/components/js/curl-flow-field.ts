import type { ComponentEntry } from "../../types.js";

const curlFlowField: ComponentEntry = {
  name: "curl-flow-field",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: [],
  code: `\
function createCurlFlowField(config, context) {
  var seed = context.seed || 1;
  var rand = context.rand || mulberry32(seed);
  var w = context.width || 800;
  var h = context.height || 800;

  var gridN = config.gridSize || 200;
  var wScale = config.waveScale || 4;
  var turb = config.turbulence || 0.6;

  var layers = config.layers || [
    {scale: 1.0, weight: 0.7},
    {scale: 2.8, weight: 0.45},
    {scale: 7.0, weight: 0.12}
  ];
  var waveMod = config.waveModulation || {frequency: 3.5, amplitude: 0.35, noiseScale: 4};
  var regions = config.regionMasks || [];
  var valCfg = config.valueMap || {};

  var noise1 = perlin2D(rand);
  var noise2 = perlin2D(rand);
  var noise3 = perlin2D(rand);
  var fbmFn = fbm2D(noise2, valCfg.octaves || 5);

  var curlFns = [];
  for (var li = 0; li < layers.length; li++) {
    curlFns.push(curlNoise2D(li === 0 ? noise1 : perlin2D(rand)));
  }

  var o1 = rand() * 1000;
  var o2 = rand() * 1000;
  var o3 = rand() * 1000;

  var stride = gridN + 1;
  var flowXArr = new Float32Array(stride * stride);
  var flowYArr = new Float32Array(stride * stride);

  for (var gy = 0; gy <= gridN; gy++) {
    for (var gx = 0; gx <= gridN; gx++) {
      var nx = (gx / gridN) * wScale;
      var ny = (gy / gridN) * wScale;
      var vnx = gx / gridN;
      var vny = gy / gridN;

      var fx = 0, fy = 0;
      for (var ci = 0; ci < layers.length; ci++) {
        var lyr = layers[ci];
        var sc = lyr.scale;
        var wt = lyr.weight;
        if (ci > 0) wt *= turb;
        var cf = curlFns[ci](nx * sc + o1, ny * sc + o1);
        fx += cf[0] * wt;
        fy += cf[1] * wt;
      }
      fx += 0.6;

      if (waveMod.frequency > 0) {
        var waveFreq = waveMod.frequency + turb * 2;
        var waveNoise = noise3(vnx * (waveMod.noiseScale || 4), vny * 2 + o1) * 2.5;
        var waveMd = Math.sin(vny * Math.PI * waveFreq + waveNoise) * (waveMod.amplitude || 0.35);
        fy += waveMd;
      }

      for (var ri = 0; ri < regions.length; ri++) {
        var reg = regions[ri];
        if (reg.type === 'horizontal') {
          var blend = smoothstep(reg.start, reg.end, vny);
          var bTo = reg.blendTo || {};
          fx = lerp(fx, (bTo.fx != null ? bTo.fx : 0.85) + curlFns[0](nx + o1, ny + o1)[0] * 0.15, blend);
          fy = lerp(fy, curlFns[0](nx + o1, ny + o1)[1] * 0.1, blend);
        }
      }

      var flen = Math.sqrt(fx * fx + fy * fy) || 1;
      var idx = gy * stride + gx;
      flowXArr[idx] = fx / flen;
      flowYArr[idx] = fy / flen;
    }
  }

  var bandY = (valCfg.band && valCfg.band.y != null) ? valCfg.band.y : (0.28 + rand() * 0.08);
  var bandW = (valCfg.band && valCfg.band.width != null) ? valCfg.band.width : 0.06;
  var bandDark = (valCfg.band && valCfg.band.darkening != null) ? valCfg.band.darkening : 0.15;
  var depthStart = (valCfg.depthCurve && valCfg.depthCurve.start != null) ? valCfg.depthCurve.start : 0.7;
  var depthEnd = (valCfg.depthCurve && valCfg.depthCurve.end != null) ? valCfg.depthCurve.end : 0.9;
  var depthDarkAmt = (valCfg.depthCurve && valCfg.depthCurve.darkening != null) ? valCfg.depthCurve.darkening : 0.5;
  var crestThresh = (valCfg.crestBoost && valCfg.crestBoost.threshold != null) ? valCfg.crestBoost.threshold : 0.5;
  var crestStr = (valCfg.crestBoost && valCfg.crestBoost.strength != null) ? valCfg.crestBoost.strength : 0.3;
  var valScaleX = valCfg.scaleX || 4;
  var valScaleY = valCfg.scaleY || 6;

  function flowAt(px, py) {
    var gx2 = clamp01(px / w) * gridN;
    var gy2 = clamp01(py / h) * gridN;
    var ix = Math.min(Math.floor(gx2), gridN - 1);
    var iy = Math.min(Math.floor(gy2), gridN - 1);
    var ffx = gx2 - ix, ffy = gy2 - iy;
    var i00 = iy * stride + ix;
    return [
      lerp(lerp(flowXArr[i00], flowXArr[i00+1], ffx), lerp(flowXArr[i00+stride], flowXArr[i00+stride+1], ffx), ffy),
      lerp(lerp(flowYArr[i00], flowYArr[i00+1], ffx), lerp(flowYArr[i00+stride], flowYArr[i00+stride+1], ffx), ffy)
    ];
  }

  function flowAngleAt(px, py) {
    var f = flowAt(px, py);
    return Math.atan2(f[1], f[0]);
  }

  function valueAt(px, py) {
    var vnx = px / w, vny = py / h;
    var v = fbmFn(vnx * valScaleX + o1, vny * valScaleY + o2);
    var bandDist = Math.abs(vny - bandY) / bandW;
    var bandMask = smoothstep(0, 1.2, bandDist);
    v *= lerp(bandDark, 1.0, bandMask);
    var depthDk = smoothstep(depthEnd, depthStart, vny);
    v *= lerp(1.0, depthDarkAmt, depthDk);
    var crestNoise = noise3(vnx * 5 + o3, vny * 8 + o2);
    var crestBoost = smoothstep(crestThresh, crestThresh + 0.2, crestNoise) * crestStr;
    v += crestBoost;
    v = clamp01(v);
    v = v * v * (3 - 2 * v);
    v = lerp(0.08, 1.0, v);
    return clamp01(v);
  }

  function depthAt(py) {
    return clamp01(py / h);
  }

  return {flowAt: flowAt, flowAngleAt: flowAngleAt, valueAt: valueAt, depthAt: depthAt};
}
`,
  exports: ["createCurlFlowField"],
  dependencies: ["math", "prng", "noise-2d", "curl"],
  description:
    "Configurable curl noise flow field with bilinear sampling, value map, and depth function.",
  usage: `\
### curl-flow-field — Flow Field + Value Map

\`\`\`js
var scene = createCurlFlowField({
  gridSize: 200,
  waveScale: 4,
  turbulence: 0.6,
  layers: [
    { scale: 1.0, weight: 0.7 },
    { scale: 2.8, weight: 0.45 },
    { scale: 7.0, weight: 0.12 }
  ],
  waveModulation: { frequency: 3.5, amplitude: 0.35 },
  valueMap: { octaves: 5, band: { y: 0.32, width: 0.06 } }
}, { seed: SEED, rand: rng, width: W, height: H });

var [fx, fy] = scene.flowAt(x, y);      // bilinear-interpolated flow vector
var angle = scene.flowAngleAt(x, y);     // atan2 of flow vector
var brightness = scene.valueAt(x, y);    // 0-1 value map (fbm + modifiers)
var depth = scene.depthAt(y);            // 0-1 normalized vertical position
\`\`\`
`,
};

export default curlFlowField;
