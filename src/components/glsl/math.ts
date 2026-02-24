import type { ComponentEntry } from "../../types.js";

const glslMath: ComponentEntry = {
  name: "glsl-math",
  version: "1.0.0",
  category: "math",
  target: "glsl",
  renderers: [],
  code: `\
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (value - inMin) / (inMax - inMin) * (outMax - outMin);
}

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

float inverseLerp(float a, float b, float v) { return (v - a) / (b - a); }

float smoothmin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

float bias(float x, float b) {
  return x / ((1.0 / b - 2.0) * (1.0 - x) + 1.0);
}

float gain(float x, float g) {
  if (x < 0.5) return bias(x * 2.0, g) * 0.5;
  return bias(x * 2.0 - 1.0, 1.0 - g) * 0.5 + 0.5;
}
`,
  exports: ["remap", "mod289", "inverseLerp", "smoothmin", "bias", "gain"],
  dependencies: [],
  description: "GLSL math utilities (remap, smoothmin, bias, gain).",
  usage: `\
### glsl-math — GLSL Math

\`\`\`glsl
float v = remap(x, 0.0, 1.0, -1.0, 1.0);
float s = smoothmin(d1, d2, 0.1);
float b = bias(x, 0.3);
\`\`\`
`,
};

export default glslMath;
