import type { ComponentEntry } from "../../types.js";

const glslSdf3d: ComponentEntry = {
  name: "glsl-sdf-3d",
  version: "1.0.0",
  category: "sdf",
  target: "glsl",
  renderers: [],
  code: `\
float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdBox3(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

float sdCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float opUnion3(float d1, float d2) { return min(d1, d2); }
float opSmooth3(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

vec3 opRepeat(vec3 p, vec3 c) {
  return mod(p + 0.5 * c, c) - 0.5 * c;
}
`,
  exports: ["sdSphere", "sdBox3", "sdCylinder", "sdTorus", "opUnion3", "opSmooth3", "opRepeat"],
  dependencies: [],
  description: "3D SDF primitives (sphere, box, cylinder, torus) and operations.",
  usage: `\
### glsl-sdf-3d — 3D SDF

\`\`\`glsl
float d = sdSphere(p, 1.0);
d = opSmooth3(d, sdBox3(p - vec3(1.5, 0, 0), vec3(0.5)), 0.2);
\`\`\`
`,
};

export default glslSdf3d;
