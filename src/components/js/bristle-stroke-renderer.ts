import type { ComponentEntry } from "../../types.js";

const bristleStrokeRenderer: ComponentEntry = {
  name: "bristle-stroke-renderer",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: ["canvas2d"],
  code: `\
function renderBristleStroke(ctx, cfg) {
  var sx = cfg.x, sy = cfg.y;
  var angle = cfg.angle || 0;
  var strokeSteps = cfg.steps || 30;
  var brushW = cfg.width || 25;
  var bristleN = cfg.bristleCount || 8;
  var alpha = cfg.alpha || 0.5;
  var pressAmt = cfg.pressure != null ? cfg.pressure : 0.65;
  var load = cfg.paintLoad != null ? cfg.paintLoad : 0.7;
  var curvature = cfg.curvature || 0;
  var taperStyle = cfg.taper || 0;
  var rng = cfg.rng;

  // Texture params
  var texture = cfg.texture || 'smooth';
  var bristleSkipChance = 0, bristleWidthJitter = 0, bristleGapProb = 0, extraWobble = 0;
  if (texture === 'dry') { bristleSkipChance = 0.3; bristleWidthJitter = 0.6; bristleGapProb = 0.2; }
  else if (texture === 'rough') { extraWobble = 0.5; bristleWidthJitter = 0.4; }
  else if (texture === 'stipple') { bristleGapProb = 0.3; bristleWidthJitter = 0.4; bristleSkipChance = 0.1; }
  else if (texture === 'feathered') { bristleSkipChance = 0.15; extraWobble = 0.3; }
  else if (texture === 'impasto') { bristleWidthJitter = -0.3; extraWobble = 0.1; }

  // Color config
  var colorCfg = cfg.color || {};
  var colorMode = colorCfg.mode || 'single';
  var palette = colorCfg.palette || [[128,128,128]];
  var mixAmount = colorCfg.mixAmount != null ? colorCfg.mixAmount : 0.6;
  var colorJit = colorCfg.jitter || 0;

  // Compositing config
  var comp = cfg.compositing || {};
  var shCfg = comp.shadow || {alpha: 0.25, widthScale: 1.3, offset: [-1, -1]};
  var hiCfg = comp.highlight || {alpha: 0.1, widthScale: 0.5, offset: [0.4, 0.4], blend: 'lighter'};
  var shAlphaScale = shCfg.alpha != null ? shCfg.alpha : 0.25;
  var shWidthScale = shCfg.widthScale != null ? shCfg.widthScale : 1.3;
  var shOx = (shCfg.offset && shCfg.offset[0]) || -1;
  var shOy = (shCfg.offset && shCfg.offset[1]) || -1;
  var hiAlphaScale = hiCfg.alpha != null ? hiCfg.alpha : 0.1;
  var hiWidthScale = hiCfg.widthScale != null ? hiCfg.widthScale : 0.5;
  var hiOx = (hiCfg.offset && hiCfg.offset[0]) || 0.4;
  var hiOy = (hiCfg.offset && hiCfg.offset[1]) || 0.4;
  var hiBlend = hiCfg.blend || 'lighter';

  // Build path
  var path;
  if (cfg.path) {
    path = cfg.path;
    strokeSteps = path.length - 1;
  } else {
    path = [{x: sx, y: sy}];
    var cx = sx, cy = sy;
    var stepSize = cfg.stepSize || 2.5;
    for (var s = 0; s < strokeSteps; s++) {
      var t = s / strokeSteps;
      var curveAngle = angle + curvature * Math.sin(t * Math.PI);
      cx += Math.cos(curveAngle) * stepSize;
      cy += Math.sin(curveAngle) * stepSize;
      path.push({x: cx, y: cy});
    }
  }

  // Perpendiculars
  var perps = computePerpendiculars(path);

  ctx.lineCap = (taperStyle === 1 || taperStyle === 'blunt') ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  var effectiveSteps = Math.max(4, Math.floor(strokeSteps * lerp(0.4, 1.0, load)));

  // Use chunked rendering for textured strokes (to support gaps), continuous for others
  var useChunks = texture !== 'smooth';
  var TAPER_PASSES = strokeSteps < 20 ? 3 : 4;

  for (var bi = 0; bi < bristleN; bi++) {
    if (rng() < bristleSkipChance) continue;

    var lateralBase = gaussianOffset(rng);
    var lateralT = (lateralBase + 1) * 0.5;

    // --- Color selection ---
    var rgb;
    if (colorMode === 'single') {
      rgb = palette[0].slice();
    } else if (colorMode === 'lateral' && palette.length >= 2) {
      rgb = [
        Math.round(lerp(palette[0][0], palette[1][0], lateralT)),
        Math.round(lerp(palette[0][1], palette[1][1], lateralT)),
        Math.round(lerp(palette[0][2], palette[1][2], lateralT))
      ];
    } else if (colorMode === 'split' && palette.length >= 2) {
      var splitIdx = lateralT < 0.5 ? 0 : 1;
      rgb = palette[splitIdx].slice();
    } else if (colorMode === 'streaked' && palette.length >= 2) {
      var streakIdx = bi % 3 === 0 ? 0 : bi % 3 === 1 ? Math.min(1, palette.length - 1) : 0;
      var streakMix = bi % 3 === 2 ? 0.5 : (bi % 3 === 0 ? 0 : 1);
      rgb = [
        Math.round(lerp(palette[0][0], palette[Math.min(1, palette.length-1)][0], streakMix)),
        Math.round(lerp(palette[0][1], palette[Math.min(1, palette.length-1)][1], streakMix)),
        Math.round(lerp(palette[0][2], palette[Math.min(1, palette.length-1)][2], streakMix))
      ];
    } else if (colorMode === 'random' && palette.length >= 2) {
      var rMix = rng();
      rgb = [
        Math.round(lerp(palette[0][0], palette[1][0], rMix)),
        Math.round(lerp(palette[0][1], palette[1][1], rMix)),
        Math.round(lerp(palette[0][2], palette[1][2], rMix))
      ];
    } else if (colorMode === 'rainbow' || colorMode === 'analogous') {
      var cIdx = lateralT * (palette.length - 1);
      var ci0 = Math.floor(cIdx), ci1 = Math.min(ci0 + 1, palette.length - 1);
      var ct = cIdx - ci0;
      rgb = [
        Math.round(lerp(palette[ci0][0], palette[ci1][0], ct)),
        Math.round(lerp(palette[ci0][1], palette[ci1][1], ct)),
        Math.round(lerp(palette[ci0][2], palette[ci1][2], ct))
      ];
    } else if (colorMode === 'complementary' && palette.length >= 2) {
      var splitT2 = smoothstep(0.35, 0.65, lateralT);
      rgb = [
        Math.round(lerp(palette[0][0], palette[1][0], splitT2)),
        Math.round(lerp(palette[0][1], palette[1][1], splitT2)),
        Math.round(lerp(palette[0][2], palette[1][2], splitT2))
      ];
    } else if (colorMode === 'loaded-knife') {
      var bandWidth2 = 1 / palette.length;
      var bandIdx = Math.min(Math.floor(lateralT / bandWidth2), palette.length - 1);
      var bandPos = (lateralT % bandWidth2) / bandWidth2;
      var nextBand = Math.min(bandIdx + 1, palette.length - 1);
      var smear = smoothstep(0.7, 1.0, bandPos);
      rgb = [
        Math.round(lerp(palette[bandIdx][0], palette[nextBand][0], smear * mixAmount)),
        Math.round(lerp(palette[bandIdx][1], palette[nextBand][1], smear * mixAmount)),
        Math.round(lerp(palette[bandIdx][2], palette[nextBand][2], smear * mixAmount))
      ];
    } else if (colorMode === 'temperature') {
      var baseIdx = Math.floor(lateralT * (palette.length - 1));
      rgb = palette[Math.min(baseIdx, palette.length - 1)].slice();
    } else {
      rgb = palette[bi % palette.length].slice();
    }

    // Mix amount blending for 2-color modes
    if ((colorMode === 'lateral' || colorMode === 'random' || colorMode === 'loaded' || colorMode === 'along') && palette.length >= 2) {
      var mixT2 = lateralT;
      if (colorMode === 'random') mixT2 = rng();
      mixT2 = lerp(mixT2, 0.5, 1 - mixAmount);
      rgb = [
        Math.round(lerp(palette[0][0], palette[1][0], mixT2)),
        Math.round(lerp(palette[0][1], palette[1][1], mixT2)),
        Math.round(lerp(palette[0][2], palette[1][2], mixT2))
      ];
    }

    // Per-bristle jitter
    if (colorJit > 0) {
      rgb[0] = clamp(rgb[0] + Math.round((rng() - 0.5) * colorJit * 2), 0, 255);
      rgb[1] = clamp(rgb[1] + Math.round((rng() - 0.5) * colorJit * 2), 0, 255);
      rgb[2] = clamp(rgb[2] + Math.round((rng() - 0.5) * colorJit * 2), 0, 255);
    }

    var wobbleSeed = rng() * 10000;
    var wobbleRng = mulberry32(Math.floor(wobbleSeed));

    var shR = Math.max(0, rgb[0] - 50), shG = Math.max(0, rgb[1] - 45), shB = Math.max(0, rgb[2] - 35);
    var hiR = Math.min(255, rgb[0] + 40), hiG = Math.min(255, rgb[1] + 35), hiB = Math.min(255, rgb[2] + 20);

    // Build bristle waypoints
    var bp = new Array(path.length);
    for (var pi = 0; pi < path.length; pi++) {
      var t2 = pi / (path.length - 1);
      var tap = taperProfile(t2, taperStyle);
      var press = tap * lerp(1 - pressAmt * 0.6, 1, tap);
      var halfW = brushW * 0.5 * press;
      var wobble = (wobbleRng() - 0.5) * (0.15 + extraWobble);
      var lateral = (lateralBase + wobble) * halfW;
      bp[pi] = {
        x: path[pi].x + perps[pi].x * lateral,
        y: path[pi].y + perps[pi].y * lateral
      };
    }

    var edgeDist = 1 - Math.abs(lateralBase);
    var bwBase = brushW / bristleN * lerp(0.9, 2.5, edgeDist * edgeDist);
    if (bristleWidthJitter !== 0) {
      bwBase *= (1 - bristleWidthJitter * (rng() - 0.5) * 2);
      bwBase = Math.max(0.5, bwBase);
    }

    function smoothPath2(startI, endI, offX, offY) {
      ctx.moveTo(bp[startI].x + offX, bp[startI].y + offY);
      for (var si = startI + 1; si < endI; si++) {
        if (si + 1 < path.length) {
          var mx = (bp[si].x + bp[si + 1].x) * 0.5 + offX;
          var my = (bp[si].y + bp[si + 1].y) * 0.5 + offY;
          ctx.quadraticCurveTo(bp[si].x + offX, bp[si].y + offY, mx, my);
        } else {
          ctx.lineTo(bp[si].x + offX, bp[si].y + offY);
        }
      }
      if (endI < path.length) ctx.lineTo(bp[endI].x + offX, bp[endI].y + offY);
    }

    if (useChunks) {
      // Chunked rendering for textured strokes
      var CHUNKS = 20;
      var chunkSize = Math.max(2, Math.ceil(effectiveSteps / CHUNKS));
      for (var ci2 = 0; ci2 < CHUNKS; ci2++) {
        var startPt = ci2 * chunkSize;
        var endPt = Math.min(startPt + chunkSize + 1, effectiveSteps);
        if (startPt >= effectiveSteps || endPt - startPt < 2) break;
        if (rng() < bristleGapProb) continue;

        var chunkT = (startPt + endPt) * 0.5 / effectiveSteps;
        var taperMul = lerp(1.0, 1.0 - pressAmt * 0.7, chunkT * chunkT);
        var bw2 = bwBase * taperMul;
        var loadMul = Math.max(0.2, 1 - chunkT * chunkT * lerp(1.5, 0.15, load));
        var chunkAlpha = alpha * loadMul;
        if (chunkAlpha < 0.005) break;

        var shOff2 = bwBase * 0.7;

        // Shadow
        var sa2 = chunkAlpha * shAlphaScale;
        if (sa2 > 0.003) {
          ctx.lineWidth = bw2 * shWidthScale;
          ctx.beginPath();
          smoothPath2(startPt, endPt, shOx * shOff2, shOy * shOff2);
          ctx.strokeStyle = 'rgba(' + shR + ',' + shG + ',' + shB + ',' + sa2.toFixed(3) + ')';
          ctx.stroke();
        }

        // Base
        ctx.lineWidth = bw2;
        ctx.beginPath();
        smoothPath2(startPt, endPt, 0, 0);
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + chunkAlpha.toFixed(3) + ')';
        ctx.stroke();
      }
    } else {
      // Continuous multi-pass taper rendering
      var shOff3 = bwBase * 0.7;

      for (var tp = TAPER_PASSES - 1; tp >= 0; tp--) {
        var passT = tp / (TAPER_PASSES - 1);
        var passEnd = Math.floor(lerp(effectiveSteps, Math.max(4, effectiveSteps * 0.2), passT));
        if (passEnd < 3) continue;

        var midT3 = (passEnd * 0.5) / effectiveSteps;
        var taperMul3 = lerp(1.0, 1.0 - pressAmt * 0.7, passT * passT);
        var bw3 = bwBase * taperMul3;
        var loadMul3 = Math.max(0.2, 1 - midT3 * midT3 * lerp(1.5, 0.15, load));
        var passAlpha = alpha * loadMul3 * lerp(0.65, 0.3, passT);
        if (passAlpha < 0.003) continue;

        // Per-pass color for along/loaded/temperature modes
        var cR = rgb[0], cG = rgb[1], cB = rgb[2];
        var csR = shR, csG = shG, csB = shB;
        var chR = hiR, chG = hiG, chB = hiB;

        if (colorMode === 'along' && palette.length >= 2) {
          var alongMix = lerp(lateralT, 1 - lateralT, midT3);
          alongMix = lerp(alongMix, 0.5, 1 - mixAmount);
          cR = clamp(Math.round(lerp(palette[0][0], palette[1][0], alongMix)), 0, 255);
          cG = clamp(Math.round(lerp(palette[0][1], palette[1][1], alongMix)), 0, 255);
          cB = clamp(Math.round(lerp(palette[0][2], palette[1][2], alongMix)), 0, 255);
          csR = Math.max(0, cR - 50); csG = Math.max(0, cG - 45); csB = Math.max(0, cB - 35);
          chR = Math.min(255, cR + 40); chG = Math.min(255, cG + 35); chB = Math.min(255, cB + 20);
        } else if (colorMode === 'loaded' && palette.length >= 2) {
          var loadedMix = midT3 * mixAmount;
          cR = clamp(Math.round(lerp(palette[0][0], palette[1][0], loadedMix)), 0, 255);
          cG = clamp(Math.round(lerp(palette[0][1], palette[1][1], loadedMix)), 0, 255);
          cB = clamp(Math.round(lerp(palette[0][2], palette[1][2], loadedMix)), 0, 255);
          csR = Math.max(0, cR - 50); csG = Math.max(0, cG - 45); csB = Math.max(0, cB - 35);
          chR = Math.min(255, cR + 40); chG = Math.min(255, cG + 35); chB = Math.min(255, cB + 20);
        } else if (colorMode === 'temperature' && palette.length >= 2) {
          var tempIdx = midT3 * (palette.length - 1);
          var ti0 = Math.floor(tempIdx), ti1 = Math.min(ti0 + 1, palette.length - 1);
          var tt = tempIdx - ti0;
          cR = Math.round(lerp(palette[ti0][0], palette[ti1][0], tt));
          cG = Math.round(lerp(palette[ti0][1], palette[ti1][1], tt));
          cB = Math.round(lerp(palette[ti0][2], palette[ti1][2], tt));
          csR = Math.max(0, cR - 50); csG = Math.max(0, cG - 45); csB = Math.max(0, cB - 35);
          chR = Math.min(255, cR + 40); chG = Math.min(255, cG + 35); chB = Math.min(255, cB + 20);
        }

        // Shadow
        var sa3 = passAlpha * shAlphaScale;
        if (sa3 > 0.003) {
          ctx.lineWidth = bw3 * shWidthScale;
          ctx.beginPath();
          smoothPath2(0, passEnd, shOx * shOff3, shOy * shOff3);
          ctx.strokeStyle = 'rgba(' + csR + ',' + csG + ',' + csB + ',' + sa3.toFixed(3) + ')';
          ctx.stroke();
        }

        // Base
        ctx.lineWidth = bw3;
        ctx.beginPath();
        smoothPath2(0, passEnd, 0, 0);
        ctx.strokeStyle = 'rgba(' + cR + ',' + cG + ',' + cB + ',' + passAlpha.toFixed(3) + ')';
        ctx.stroke();

        // Highlight
        var ha3 = passAlpha * hiAlphaScale;
        if (ha3 > 0.002) {
          ctx.save();
          ctx.globalCompositeOperation = hiBlend;
          ctx.lineWidth = bw3 * hiWidthScale;
          ctx.beginPath();
          smoothPath2(0, passEnd, hiOx * shOff3, hiOy * shOff3);
          ctx.strokeStyle = 'rgba(' + chR + ',' + chG + ',' + chB + ',' + ha3.toFixed(3) + ')';
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
}
`,
  exports: ["renderBristleStroke"],
  dependencies: ["math", "prng", "brush-stroke-paths"],
  description:
    "Canvas2D bristle stroke renderer with 12 color mixing modes, 6 textures, 3-layer compositing.",
  usage: `\
### bristle-stroke-renderer — Bristle Stroke Rendering (Canvas2D)

\`\`\`js
renderBristleStroke(ctx, {
  x: 100, y: 200,          // start position
  angle: Math.PI / 4,       // stroke direction
  steps: 30,                // path length in steps
  width: 35,                // brush width (px)
  bristleCount: 12,         // sub-paths per stroke
  alpha: 0.5,               // base opacity
  pressure: 0.7,            // width variation amount
  paintLoad: 0.8,           // opacity decay rate
  curvature: 0.2,           // path curvature
  taper: 'pointed',         // 'pointed' | 'blunt' | 'chisel'
  texture: 'smooth',        // 'smooth'|'dry'|'rough'|'stipple'|'feathered'|'impasto'
  color: {
    mode: 'lateral',        // 12 modes: single, lateral, along, loaded, random,
                            // split, streaked, rainbow, complementary, analogous,
                            // temperature, loaded-knife
    palette: [[180,80,60], [60,80,180]],
    mixAmount: 0.6,
    jitter: 15,
  },
  rng: rng,
});

// Or provide a pre-built path (from traceBrushPath / traceDabPath):
renderBristleStroke(ctx, {
  path: traceBrushPath(flowAt, x, y, 40, 2.5),
  width: 25, bristleCount: 8, alpha: 0.5,
  color: { mode: 'single', palette: [[100,150,200]] },
  rng: rng,
});
\`\`\`
`,
};

export default bristleStrokeRenderer;
