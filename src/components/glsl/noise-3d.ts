import type { ComponentEntry } from "../../types.js";

const glslNoise3d: ComponentEntry = {
  name: "glsl-noise-3d",
  version: "1.0.0",
  category: "noise",
  target: "glsl",
  renderers: [],
  code: `\
float hash3(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash3(i);
  float b = hash3(i + vec3(1.0, 0.0, 0.0));
  float c = hash3(i + vec3(0.0, 1.0, 0.0));
  float d = hash3(i + vec3(1.0, 1.0, 0.0));
  float e = hash3(i + vec3(0.0, 0.0, 1.0));
  float f2 = hash3(i + vec3(1.0, 0.0, 1.0));
  float g = hash3(i + vec3(0.0, 1.0, 1.0));
  float h = hash3(i + vec3(1.0, 1.0, 1.0));
  float x1 = mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  float x2 = mix(mix(e, f2, f.x), mix(g, h, f.x), f.y);
  return mix(x1, x2, f.z);
}

float fbm3(vec3 p, int octaves) {
  float val = 0.0, amp = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    val += amp * noise3(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}
`,
  exports: ["hash3", "noise3", "fbm3"],
  dependencies: [],
  description: "3D GLSL noise (hash, value noise, fBm).",
  usage: `\
### glsl-noise-3d — 3D Noise

\`\`\`glsl
float n = noise3(vec3(uv * 5.0, u_time));
float f = fbm3(vec3(uv * 3.0, u_time * 0.5), 6);
\`\`\`
`,
};

export default glslNoise3d;
