import type { ComponentEntry } from "../../types.js";

const glslRay: ComponentEntry = {
  name: "glsl-ray",
  version: "1.0.0",
  category: "sdf",
  target: "glsl",
  renderers: [],
  code: `\
float rayMarch(vec3 ro, vec3 rd, float maxDist, int maxSteps) {
  float t = 0.0;
  for (int i = 0; i < 256; i++) {
    if (i >= maxSteps) break;
    vec3 p = ro + rd * t;
    float d = sdSphere(p, 1.0);
    if (d < 0.001 || t > maxDist) break;
    t += d;
  }
  return t;
}

vec3 estimateNormal(vec3 p) {
  float eps = 0.001;
  return normalize(vec3(
    sdSphere(p + vec3(eps,0,0), 1.0) - sdSphere(p - vec3(eps,0,0), 1.0),
    sdSphere(p + vec3(0,eps,0), 1.0) - sdSphere(p - vec3(0,eps,0), 1.0),
    sdSphere(p + vec3(0,0,eps), 1.0) - sdSphere(p - vec3(0,0,eps), 1.0)
  ));
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 64; i++) {
    float h = sdSphere(ro + rd * t, 1.0);
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.1);
    if (h < 0.001 || t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

float ambientOcclusion3D(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i);
    float d = sdSphere(p + n * h, 1.0);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}
`,
  exports: ["rayMarch", "estimateNormal", "softShadow", "ambientOcclusion3D"],
  dependencies: ["glsl-sdf-3d"],
  description: "Raymarching utilities (march, normals, soft shadows, AO).",
  usage: `\
### glsl-ray — Raymarching

\`\`\`glsl
float t = rayMarch(ro, rd, 100.0, 128);
if (t < 100.0) {
  vec3 p = ro + rd * t;
  vec3 n = estimateNormal(p);
  float shadow = softShadow(p, lightDir, 0.02, 10.0, 8.0);
}
\`\`\`
`,
};

export default glslRay;
