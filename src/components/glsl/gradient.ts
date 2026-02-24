import type { ComponentEntry } from "../../types.js";

const glslGradient: ComponentEntry = {
  name: "glsl-gradient",
  version: "1.0.0",
  category: "color",
  target: "glsl",
  renderers: [],
  code: `\
vec3 linearGradient(vec2 uv, vec3 c1, vec3 c2, float angle) {
  float c = cos(angle), s = sin(angle);
  float t = clamp(uv.x * c + uv.y * s, 0.0, 1.0);
  return mix(c1, c2, t);
}

vec3 radialGradient(vec2 uv, vec3 c1, vec3 c2, vec2 center, float radius) {
  float t = clamp(length(uv - center) / radius, 0.0, 1.0);
  return mix(c1, c2, t);
}

vec3 angularGradient(vec2 uv, vec3 c1, vec3 c2, vec2 center) {
  float angle = atan(uv.y - center.y, uv.x - center.x);
  float t = (angle + 3.14159) / 6.28318;
  return mix(c1, c2, t);
}

vec3 conicGradient(vec2 uv, vec3 colors[4], vec2 center) {
  float angle = atan(uv.y - center.y, uv.x - center.x);
  float t = (angle + 3.14159) / 6.28318;
  float segment = t * 4.0;
  int i = int(floor(segment));
  float f = fract(segment);
  if (i >= 3) return mix(colors[3], colors[0], f);
  return mix(colors[i], colors[i + 1], f);
}

vec3 paletteGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}
`,
  exports: ["linearGradient", "radialGradient", "angularGradient", "conicGradient", "paletteGradient"],
  dependencies: [],
  description: "Gradient generation (linear, radial, angular, palette).",
  usage: `\
### glsl-gradient — Gradients

\`\`\`glsl
vec3 g = linearGradient(uv, vec3(1,0,0), vec3(0,0,1), 0.0);
vec3 r = radialGradient(uv, vec3(1), vec3(0), vec2(0.5), 0.5);
// Iq-style cosine palette
vec3 p = paletteGradient(t, vec3(0.5), vec3(0.5), vec3(1), vec3(0,0.33,0.67));
\`\`\`
`,
};

export default glslGradient;
