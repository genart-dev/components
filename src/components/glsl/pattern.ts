import type { ComponentEntry } from "../../types.js";

const glslPattern: ComponentEntry = {
  name: "glsl-pattern",
  version: "1.0.0",
  category: "pattern",
  target: "glsl",
  renderers: [],
  code: `\
float truchet(vec2 uv, float scale) {
  vec2 id = floor(uv * scale);
  vec2 f = fract(uv * scale);
  float r = hash(id);
  if (r > 0.5) f.x = 1.0 - f.x;
  float d1 = length(f) - 0.5;
  float d2 = length(f - 1.0) - 0.5;
  return min(abs(d1), abs(d2));
}

float checkerboard(vec2 uv, float scale) {
  vec2 c = floor(uv * scale);
  return mod(c.x + c.y, 2.0);
}

vec2 hexGrid(vec2 uv) {
  vec2 s = vec2(1.0, 1.7320508);
  vec2 a = mod(uv, s) - s * 0.5;
  vec2 b = mod(uv - s * 0.5, s) - s * 0.5;
  return dot(a, a) < dot(b, b) ? a : b;
}

float voronoiEdges(vec2 uv, float scale) {
  vec2 p = uv * scale;
  vec2 n = floor(p);
  vec2 f = fract(p);
  float md = 8.0;
  for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash(n + g), hash(n + g + vec2(37.0)));
      vec2 r = g + o - f;
      md = min(md, dot(r, r));
    }
  return sqrt(md);
}

float stripes(vec2 uv, float freq, float angle) {
  float c = cos(angle), s = sin(angle);
  float t = uv.x * c + uv.y * s;
  return 0.5 + 0.5 * sin(t * freq * 6.28318);
}

float dots(vec2 uv, float scale, float radius) {
  vec2 f = fract(uv * scale) - 0.5;
  return smoothstep(radius, radius - 0.01, length(f));
}
`,
  exports: ["truchet", "checkerboard", "hexGrid", "voronoiEdges", "stripes", "dots"],
  dependencies: ["glsl-noise"],
  description: "Tiling and pattern functions (truchet, hex grid, stripes, dots).",
  usage: `\
### glsl-pattern — Patterns

\`\`\`glsl
float t = truchet(uv, 10.0);
float c = checkerboard(uv, 8.0);
float s = stripes(uv, 20.0, 0.785);
\`\`\`
`,
};

export default glslPattern;
