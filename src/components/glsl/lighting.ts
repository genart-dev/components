import type { ComponentEntry } from "../../types.js";

const glslLighting: ComponentEntry = {
  name: "glsl-lighting",
  version: "1.0.0",
  category: "pattern",
  target: "glsl",
  renderers: [],
  code: `\
float lambertian(vec3 normal, vec3 lightDir) {
  return max(dot(normalize(normal), normalize(lightDir)), 0.0);
}

float phong(vec3 normal, vec3 lightDir, vec3 viewDir, float shininess) {
  vec3 n = normalize(normal);
  vec3 l = normalize(lightDir);
  vec3 r = reflect(-l, n);
  float diff = max(dot(n, l), 0.0);
  float spec = pow(max(dot(normalize(viewDir), r), 0.0), shininess);
  return diff + spec;
}

vec3 normalFromHeight(sampler2D tex, vec2 uv, float strength) {
  float eps = 1.0 / 512.0;
  float h = texture2D(tex, uv).r;
  float hx = texture2D(tex, uv + vec2(eps, 0.0)).r;
  float hy = texture2D(tex, uv + vec2(0.0, eps)).r;
  return normalize(vec3((h - hx) * strength, (h - hy) * strength, 1.0));
}

float ambientOcclusion(vec2 uv, float radius, float intensity) {
  float ao = 0.0;
  for (int i = 0; i < 4; i++) {
    float angle = float(i) * 1.5708;
    vec2 offset = vec2(cos(angle), sin(angle)) * radius;
    ao += smoothstep(0.0, 1.0, length(offset));
  }
  return 1.0 - (ao / 4.0) * intensity;
}
`,
  exports: ["phong", "lambertian", "normalFromHeight", "ambientOcclusion"],
  dependencies: [],
  description: "Basic GLSL lighting models (Phong, Lambertian, normal mapping).",
  usage: `\
### glsl-lighting — Lighting

\`\`\`glsl
float diff = lambertian(normal, lightPos - fragPos);
float lit = phong(normal, lightDir, viewDir, 32.0);
vec3 n = normalFromHeight(heightMap, uv, 2.0);
\`\`\`
`,
};

export default glslLighting;
