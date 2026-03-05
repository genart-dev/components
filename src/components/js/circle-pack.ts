import type { ComponentEntry } from "../../types.js";

const circlePack: ComponentEntry = {
  name: "circle-pack",
  version: "1.0.0",
  category: "distribution",
  target: "js",
  renderers: [],
  description: "Circle packing: trial-and-reject packing and growth-based packing for organic bubble layouts.",
  tags: ["distribution", "packing", "circles", "foam", "bubbles", "organic"],
  exports: ["circlePack", "circlePackGrow"],
  dependencies: [],
  usage: `var circles = circlePack(rng, 400, 400);`,
  code: `\
// Trial-and-reject circle packing
function circlePack(rng, width, height, opts) {
  opts = opts || {};
  var minR = opts.minRadius || 5;
  var maxR = opts.maxRadius || 50;
  var maxAttempts = opts.maxAttempts || 500;
  var maxCircles = opts.count || 100;
  var circles = [];
  for (var c = 0; c < maxCircles; c++) {
    for (var a = 0; a < maxAttempts; a++) {
      var r = minR + rng() * (maxR - minR);
      var x = r + rng() * (width - 2 * r);
      var y = r + rng() * (height - 2 * r);
      var ok = true;
      for (var i = 0; i < circles.length; i++) {
        var dx = x - circles[i][0], dy = y - circles[i][1];
        var minD = r + circles[i][2];
        if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
      }
      if (ok) { circles.push([x, y, r]); break; }
    }
  }
  return circles; // [{x, y, r}] as [x, y, r] tuples
}

// Growth-based packing: start tiny circles and grow them until they touch
function circlePackGrow(rng, points, width, height, opts) {
  opts = opts || {};
  var maxRadius = opts.maxRadius || 80;
  var growStep = opts.growStep || 1;
  var circles = points.map(function(p) { return [p[0], p[1], 1]; });
  var growing = circles.map(function(_, i) { return i; });
  while (growing.length > 0) {
    var stillGrowing = [];
    for (var gi = 0; gi < growing.length; gi++) {
      var i = growing[gi], c = circles[i];
      var newR = c[2] + growStep;
      if (newR > maxRadius) continue;
      // Check bounds
      if (c[0] - newR < 0 || c[0] + newR > width || c[1] - newR < 0 || c[1] + newR > height) continue;
      // Check overlap with other circles
      var ok = true;
      for (var j = 0; j < circles.length; j++) {
        if (j === i) continue;
        var dx = c[0] - circles[j][0], dy = c[1] - circles[j][1];
        var minD = newR + circles[j][2];
        if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
      }
      if (ok) { c[2] = newR; stillGrowing.push(i); }
    }
    growing = stillGrowing;
  }
  return circles;
}
`,
};

export default circlePack;
