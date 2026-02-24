import type { ComponentEntry } from "../../types.js";

const glslShape: ComponentEntry = {
  name: "glsl-shape",
  version: "1.0.0",
  category: "geometry",
  target: "glsl",
  renderers: [],
  code: `\
float polygon(vec2 p, int sides, float radius) {
  float a = atan(p.y, p.x);
  float seg = 6.28318 / float(sides);
  float d = cos(floor(0.5 + a / seg) * seg - a) * length(p);
  return d - radius;
}

float star(vec2 p, int points, float outer, float inner) {
  float a = atan(p.y, p.x);
  float seg = 3.14159 / float(points);
  a = mod(a, 2.0 * seg) - seg;
  float r = length(p);
  float d1 = r * cos(a) - outer;
  float d2 = r * cos(a - seg) - inner;
  return max(d1, d2);
}

float roundedRect(vec2 p, vec2 size, float radius) {
  vec2 d = abs(p) - size + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

float ring(vec2 p, float radius, float thickness) {
  return abs(length(p) - radius) - thickness;
}

float arc(vec2 p, float radius, float angle, float thickness) {
  float a = atan(p.y, p.x);
  float ha = angle * 0.5;
  float d = abs(length(p) - radius) - thickness;
  float angDist = abs(mod(a + 3.14159, 6.28318) - 3.14159);
  return max(d, angDist - ha);
}

float line(vec2 p, vec2 a, vec2 b, float thickness) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - thickness;
}
`,
  exports: ["polygon", "star", "roundedRect", "ring", "arc", "line"],
  dependencies: ["glsl-sdf"],
  description: "2D shape rendering via SDF (polygon, star, rounded rect, ring).",
  usage: `\
### glsl-shape — 2D Shapes

\`\`\`glsl
float d = polygon(uv - 0.5, 6, 0.3);
d = min(d, star(uv - vec2(0.7, 0.5), 5, 0.2, 0.1));
d = min(d, roundedRect(uv - vec2(0.3, 0.7), vec2(0.1), 0.02));
vec3 col = mix(vec3(1), vec3(0), smoothstep(0.0, 0.01, d));
\`\`\`
`,
};

export default glslShape;
