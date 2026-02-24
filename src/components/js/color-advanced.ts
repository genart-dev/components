import type { ComponentEntry } from "../../types.js";

const colorAdvanced: ComponentEntry = {
  name: "color-advanced",
  version: "1.0.0",
  category: "color",
  target: "js",
  renderers: [],
  code: `\
function rgbToOklab(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var lr = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  var lg = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  var lb = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  var l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  var m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  var s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  ];
}

function oklabToRgb(L, a, b) {
  var l = L + 0.3963377774 * a + 0.2158037573 * b;
  var m = L - 0.1055613458 * a - 0.0638541728 * b;
  var s = L - 0.0894841775 * a - 1.2914855480 * b;
  l = l * l * l; m = m * m * m; s = s * s * s;
  var r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  var g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  var bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  function toSrgb(c) {
    c = c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  }
  return [toSrgb(r), toSrgb(g), toSrgb(bl)];
}

function rgbToOklch(r, g, b) {
  var lab = rgbToOklab(r, g, b);
  var C = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  var h = Math.atan2(lab[2], lab[1]) * 180 / Math.PI;
  if (h < 0) h += 360;
  return [lab[0], C, h];
}

function oklchToRgb(L, C, h) {
  var rad = h * Math.PI / 180;
  return oklabToRgb(L, C * Math.cos(rad), C * Math.sin(rad));
}

function lerpOklab(c1, c2, t) {
  var a = rgbToOklab(c1[0], c1[1], c1[2]);
  var b = rgbToOklab(c2[0], c2[1], c2[2]);
  return oklabToRgb(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  );
}

function palette(colors, t) {
  t = Math.max(0, Math.min(1, t)) * (colors.length - 1);
  var i = Math.floor(t);
  var f = t - i;
  if (i >= colors.length - 1) return colors[colors.length - 1];
  return lerpOklab(colors[i], colors[i + 1], f);
}

function complementary(r, g, b) {
  return [255 - r, 255 - g, 255 - b];
}

function triadic(h, s, l) {
  return [
    [h, s, l],
    [(h + 120) % 360, s, l],
    [(h + 240) % 360, s, l]
  ];
}

function analogous(h, s, l, angle) {
  angle = angle || 30;
  return [
    [(h - angle + 360) % 360, s, l],
    [h, s, l],
    [(h + angle) % 360, s, l]
  ];
}
`,
  exports: ["oklabToRgb", "rgbToOklab", "oklchToRgb", "rgbToOklch", "lerpOklab", "palette", "complementary", "triadic", "analogous"],
  dependencies: ["color"],
  description: "Perceptual color spaces (OKLab, OKLCh) and color harmony.",
  usage: `\
### color-advanced — Perceptual Color & Harmony

\`\`\`js
var lab = rgbToOklab(255, 128, 0);
var rgb = oklabToRgb(lab[0], lab[1], lab[2]);
lerpOklab([255,0,0], [0,0,255], 0.5); // perceptually uniform blend
palette([[255,0,0],[0,255,0],[0,0,255]], 0.5); // palette sampling
triadic(200, 80, 50); // three equidistant hues
\`\`\`
`,
};

export default colorAdvanced;
