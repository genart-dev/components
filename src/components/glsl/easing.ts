import type { ComponentEntry } from "../../types.js";

const glslEasing: ComponentEntry = {
  name: "glsl-easing",
  version: "1.0.0",
  category: "easing",
  target: "glsl",
  renderers: [],
  code: `\
float easeInQuad(float t) { return t * t; }
float easeOutQuad(float t) { return t * (2.0 - t); }
float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}
float easeOutElastic(float t) {
  if (t == 0.0 || t == 1.0) return t;
  return pow(2.0, -10.0 * t) * sin((t * 10.0 - 0.75) * (6.28318 / 3.0)) + 1.0;
}
float easeOutBounce(float t) {
  if (t < 1.0 / 2.75) return 7.5625 * t * t;
  if (t < 2.0 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
  t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
}
`,
  exports: ["easeInQuad", "easeOutQuad", "easeInOutCubic", "easeOutElastic", "easeOutBounce"],
  dependencies: [],
  description: "Easing functions in GLSL.",
  usage: `\
### glsl-easing — GLSL Easing

\`\`\`glsl
float t = easeInOutCubic(progress);
float e = easeOutElastic(progress);
\`\`\`
`,
};

export default glslEasing;
