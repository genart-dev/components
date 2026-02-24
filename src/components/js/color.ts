import type { ComponentEntry } from "../../types.js";

const color: ComponentEntry = {
  name: "color",
  version: "1.0.0",
  category: "color",
  target: "js",
  renderers: [],
  code: `\
function hexToRgb(hex) {
  var n = parseInt(hex.charAt(0) === '#' ? hex.slice(1) : hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hslToRgb(h, s, l) {
  h = h / 360; s = s / 100; l = l / 100;
  if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; }
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function lerpColor(c1, c2, t) {
  var a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex(
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  );
}

function contrastRatio(hex1, hex2) {
  function luminance(hex) {
    var rgb = hexToRgb(hex).map(function(c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  var l1 = luminance(hex1), l2 = luminance(hex2);
  var lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
`,
  exports: ["hexToRgb", "rgbToHex", "hslToRgb", "rgbToHsl", "lerpColor", "contrastRatio"],
  dependencies: [],
  description: "Color space conversion (hex, RGB, HSL) and utilities.",
  usage: `\
### color — Color Space Conversion

\`\`\`js
hexToRgb('#ff0000');       // → [255, 0, 0]
rgbToHex(255, 128, 0);    // → '#ff8000'
hslToRgb(200, 80, 50);    // → [r, g, b]
lerpColor('#000', '#fff', 0.5);
contrastRatio('#000', '#fff'); // → 21
\`\`\`
`,
};

export default color;
