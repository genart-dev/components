import type { ComponentEntry } from "../../types.js";

const glslTransform: ComponentEntry = {
  name: "glsl-transform",
  version: "1.0.0",
  category: "transform",
  target: "glsl",
  renderers: [],
  code: `\
vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle), s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

vec2 scale2D(vec2 p, vec2 s) { return p / s; }
vec2 translate2D(vec2 p, vec2 t) { return p - t; }

vec2 kaleidoscope(vec2 p, float segments) {
  float angle = atan(p.y, p.x);
  float r = length(p);
  float seg = 6.28318 / segments;
  angle = mod(angle, seg);
  if (angle > seg * 0.5) angle = seg - angle;
  return vec2(cos(angle), sin(angle)) * r;
}

vec2 polarCoords(vec2 p) {
  return vec2(length(p), atan(p.y, p.x));
}

vec2 fishEye(vec2 uv, float strength) {
  vec2 c = uv - 0.5;
  float r = length(c);
  float bind = sqrt(dot(vec2(0.5), vec2(0.5)));
  vec2 nuv = c / bind;
  nuv *= 1.0 - strength + strength * r;
  return nuv * bind + 0.5;
}

vec2 ripple(vec2 uv, vec2 center, float freq, float amp, float time) {
  vec2 d = uv - center;
  float r = length(d);
  float offset = sin(r * freq - time) * amp;
  return uv + normalize(d) * offset;
}
`,
  exports: ["rotate2D", "scale2D", "translate2D", "kaleidoscope", "polarCoords", "fishEye", "ripple"],
  dependencies: [],
  description: "UV coordinate transformations (rotate, kaleidoscope, fisheye, ripple).",
  usage: `\
### glsl-transform — UV Transforms

\`\`\`glsl
vec2 p = rotate2D(uv - 0.5, u_time) + 0.5;
p = kaleidoscope(p - 0.5, 6.0);
p = fishEye(uv, 0.5);
\`\`\`
`,
};

export default glslTransform;
