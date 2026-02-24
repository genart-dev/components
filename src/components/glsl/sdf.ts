import type { ComponentEntry } from "../../types.js";

const glslSdf: ComponentEntry = {
  name: "glsl-sdf",
  version: "1.0.0",
  category: "sdf",
  target: "glsl",
  renderers: [],
  code: `\
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float sdPolygon(vec2 p, vec2 v[8], int n) {
  float d = dot(p - v[0], p - v[0]);
  float s = 1.0;
  for (int i = 0, j = n - 1; i < 8; j = i, i++) {
    if (i >= n) break;
    vec2 e = v[j] - v[i];
    vec2 w = p - v[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 cond = bvec3(p.y >= v[i].y, p.y < v[j].y, e.x * w.y > e.y * w.x);
    if (all(cond) || all(not(cond))) s *= -1.0;
  }
  return s * sqrt(d);
}

float sdRing(vec2 p, float r, float thickness) {
  return abs(length(p) - r) - thickness;
}

float opUnion(float d1, float d2) { return min(d1, d2); }
float opSubtract(float d1, float d2) { return max(-d1, d2); }
float opIntersect(float d1, float d2) { return max(d1, d2); }
float opSmooth(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}
`,
  exports: ["sdCircle", "sdBox", "sdLine", "sdPolygon", "sdRing", "opUnion", "opSubtract", "opIntersect", "opSmooth"],
  dependencies: [],
  description: "2D signed distance functions and CSG operations.",
  usage: `\
### glsl-sdf — 2D SDF

\`\`\`glsl
float d = sdCircle(uv - 0.5, 0.2);
d = opSmooth(d, sdBox(uv - vec2(0.7), vec2(0.1)), 0.05);
vec3 col = mix(vec3(1), vec3(0), smoothstep(0.0, 0.01, d));
\`\`\`
`,
};

export default glslSdf;
