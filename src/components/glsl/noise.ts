import type { ComponentEntry } from "../../types.js";

const glslNoise: ComponentEntry = {
  name: "glsl-noise",
  version: "1.0.0",
  category: "noise",
  target: "glsl",
  renderers: [],
  code: `\
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float val = 0.0, amp = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    val += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}

float voronoi(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float minDist = 1.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash(n + g), hash(n + g + vec2(37.0, 17.0)));
      vec2 diff = g + o - f;
      minDist = min(minDist, dot(diff, diff));
    }
  }
  return sqrt(minDist);
}
`,
  exports: ["hash", "noise", "fbm", "voronoi"],
  dependencies: [],
  description: "Standard GLSL noise stack (hash, value noise, fBm, Voronoi).",
  usage: `\
### glsl-noise — GLSL Noise

\`\`\`glsl
float n = noise(uv * 10.0);
float f = fbm(uv * 5.0, 6);
float v = voronoi(uv * 8.0);
\`\`\`
`,
};

export default glslNoise;
