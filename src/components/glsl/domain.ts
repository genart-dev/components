import type { ComponentEntry } from "../../types.js";

const glslDomain: ComponentEntry = {
  name: "glsl-domain",
  version: "1.0.0",
  category: "transform",
  target: "glsl",
  renderers: [],
  code: `\
vec2 domainWarp(vec2 p, float strength) {
  float n1 = noise(p);
  float n2 = noise(p + vec2(5.2, 1.3));
  return p + vec2(n1, n2) * strength;
}

vec2 domainRepeat(vec2 p, vec2 period) {
  return mod(p + period * 0.5, period) - period * 0.5;
}

vec2 domainTwist(vec2 p, float amount) {
  float angle = p.y * amount;
  float c = cos(angle), s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

vec2 domainFold(vec2 p, vec2 axis) {
  float d = dot(p, normalize(axis));
  if (d < 0.0) p -= 2.0 * d * normalize(axis);
  return p;
}
`,
  exports: ["domainWarp", "domainRepeat", "domainTwist", "domainFold"],
  dependencies: ["glsl-noise"],
  description: "Domain manipulation (warp, repeat, twist, fold).",
  usage: `\
### glsl-domain — Domain Manipulation

\`\`\`glsl
vec2 p = domainWarp(uv * 5.0, 0.3);
p = domainRepeat(p, vec2(2.0));
p = domainTwist(p, 1.5);
\`\`\`
`,
};

export default glslDomain;
