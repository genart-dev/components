import type { ComponentEntry } from "../../types.js";

const easing: ComponentEntry = {
  name: "easing",
  version: "1.0.0",
  category: "easing",
  target: "js",
  renderers: [],
  code: `\
function easeInQuad(t) { return t * t; }
function easeOutQuad(t) { return t * (2 - t); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function easeInCubic(t) { return t * t * t; }
function easeOutCubic(t) { var u = 1 - t; return 1 - u * u * u; }
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
function easeInExpo(t) { return t === 0 ? 0 : Math.pow(2, 10 * t - 10); }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
}
function easeOutBounce(t) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
  t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
}
function spring(t, freq, decay) {
  freq = freq || 4; decay = decay || 4;
  return 1 - Math.exp(-decay * t) * Math.cos(freq * Math.PI * t);
}
`,
  exports: [
    "easeInQuad", "easeOutQuad", "easeInOutQuad",
    "easeInCubic", "easeOutCubic", "easeInOutCubic",
    "easeInOutSine", "easeInExpo", "easeOutExpo",
    "easeOutElastic", "easeOutBounce", "spring",
  ],
  dependencies: [],
  description: "Easing functions for smooth animations (0→1 domain).",
  usage: `\
### easing — Easing Functions

\`\`\`js
easeInOutCubic(t); // smooth S-curve
easeOutElastic(t); // springy overshoot
easeOutBounce(t);  // bouncing effect
spring(t, 4, 4);   // damped spring
\`\`\`
`,
};

export default easing;
