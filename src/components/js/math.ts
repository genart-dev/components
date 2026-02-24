import type { ComponentEntry } from "../../types.js";

const math: ComponentEntry = {
  name: "math",
  version: "1.0.0",
  category: "math",
  target: "js",
  renderers: [],
  code: `\
function lerp(a, b, t) { return a + t * (b - a); }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function remap(v, inLo, inHi, outLo, outHi) {
  return outLo + (v - inLo) / (inHi - inLo) * (outHi - outLo);
}
function smoothstep(edge0, edge1, x) {
  var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function inverseLerp(a, b, v) { return (v - a) / (b - a); }
function mod(a, n) { return ((a % n) + n) % n; }
function fract(x) { return x - Math.floor(x); }
function sign0(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
function step(edge, x) { return x < edge ? 0 : 1; }
`,
  exports: ["lerp", "clamp", "clamp01", "remap", "smoothstep", "inverseLerp", "mod", "fract", "sign0", "step"],
  dependencies: [],
  description: "Core math utilities (lerp, clamp, smoothstep, remap, etc.).",
  usage: `\
### math — Core Math Utilities

\`\`\`js
lerp(0, 100, 0.5);          // → 50
clamp(1.5, 0, 1);           // → 1
smoothstep(0, 1, 0.5);      // → 0.5 (S-curve)
remap(0.5, 0, 1, -10, 10);  // → 0
\`\`\`
`,
};

export default math;
