import type { ComponentEntry } from "../../types.js";

const glslBlend: ComponentEntry = {
  name: "glsl-blend",
  version: "1.0.0",
  category: "color",
  target: "glsl",
  renderers: [],
  code: `\
vec3 blendMultiply(vec3 base, vec3 blend) { return base * blend; }
vec3 blendScreen(vec3 base, vec3 blend) { return 1.0 - (1.0 - base) * (1.0 - blend); }
vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(
    base.r < 0.5 ? 2.0 * base.r * blend.r : 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r),
    base.g < 0.5 ? 2.0 * base.g * blend.g : 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g),
    base.b < 0.5 ? 2.0 * base.b * blend.b : 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b)
  );
}
vec3 blendSoftLight(vec3 base, vec3 blend) {
  return mix(
    sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
    2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
    step(vec3(0.5), blend)
  );
}
vec3 blendAdd(vec3 base, vec3 blend) { return min(base + blend, vec3(1.0)); }
`,
  exports: ["blendMultiply", "blendScreen", "blendOverlay", "blendSoftLight", "blendAdd"],
  dependencies: [],
  description: "Photoshop-style blend modes in GLSL.",
  usage: `\
### glsl-blend — Blend Modes

\`\`\`glsl
vec3 result = blendOverlay(base, overlay);
result = blendScreen(result, glow);
\`\`\`
`,
};

export default glslBlend;
