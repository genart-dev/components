import type { ComponentEntry } from "../../types.js";

const rectPack: ComponentEntry = {
  name: "rect-pack",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "MaxRects rectangle packing algorithm. Magazine/mosaic/collage layouts.",
  tags: ["distribution", "packing", "rectangles", "maxrects", "mosaic", "layout"],
  parameters: [],
  exports: ["rectPack"],
  dependencies: [],
  usage: `var placed = rectPack([{w:100,h:50},{w:80,h:80}], 400, 400);`,
  code: `\
// MaxRects rectangle packing (simplified GUILLOTINE variant)
// rects: array of {w, h, id?} objects
// Returns: array of {x, y, w, h, id, rotated}
function rectPack(rects, binW, binH, opts) {
  opts = opts || {};
  var padding = opts.padding || 0;
  var allowRotation = opts.allowRotation || false;
  var sorted = rects.slice().sort(function(a, b) {
    return (b.h * b.w) - (a.h * a.w); // largest first
  });
  // Free rectangles list (guillotine split)
  var free = [{ x: 0, y: 0, w: binW, h: binH }];
  var placements = [];

  for (var ri = 0; ri < sorted.length; ri++) {
    var rect = sorted[ri];
    var rw = rect.w + padding, rh = rect.h + padding;
    var placed = false;

    // Try to place in each free rectangle — best short-side fit
    var bestScore = Infinity, bestFi = -1, bestRot = false;
    for (var fi = 0; fi < free.length; fi++) {
      var f = free[fi];
      if (f.w >= rw && f.h >= rh) {
        var score = Math.min(f.w - rw, f.h - rh);
        if (score < bestScore) { bestScore = score; bestFi = fi; bestRot = false; }
      }
      if (allowRotation && f.w >= rh && f.h >= rw) {
        var score2 = Math.min(f.w - rh, f.h - rw);
        if (score2 < bestScore) { bestScore = score2; bestFi = fi; bestRot = true; }
      }
    }

    if (bestFi >= 0) {
      var f2 = free[bestFi];
      var pw = bestRot ? rh : rw, ph = bestRot ? rw : rh;
      placements.push({
        x: f2.x, y: f2.y,
        w: rect.w, h: rect.h,
        id: rect.id,
        rotated: bestRot
      });
      // Guillotine split: add two new free rectangles
      var rightW = f2.w - pw, rightH = ph;
      var topW = f2.w, topH = f2.h - ph;
      free.splice(bestFi, 1);
      if (rightW > 0 && rightH > 0) free.push({ x: f2.x + pw, y: f2.y, w: rightW, h: rightH });
      if (topW > 0 && topH > 0) free.push({ x: f2.x, y: f2.y + ph, w: topW, h: topH });
      placed = true;
    }
    if (!placed) placements.push(null); // couldn't fit
  }

  // Re-map to original order
  var result = new Array(rects.length).fill(null);
  for (var i = 0; i < sorted.length; i++) {
    var origIdx = rects.indexOf(sorted[i]);
    result[origIdx] = placements[i];
  }
  return result;
}
`,
};

export default rectPack;
