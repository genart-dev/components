import type { ComponentEntry } from "../../types.js";

const glslCurl: ComponentEntry = {
  name: "glsl-curl",
  version: "1.0.0",
  category: "noise",
  target: "glsl",
  renderers: [],
  code: `\
vec2 curlNoise(vec2 p) {
  float eps = 0.001;
  float n1 = noise(p + vec2(eps, 0.0));
  float n2 = noise(p - vec2(eps, 0.0));
  float n3 = noise(p + vec2(0.0, eps));
  float n4 = noise(p - vec2(0.0, eps));
  float dndx = (n1 - n2) / (2.0 * eps);
  float dndy = (n3 - n4) / (2.0 * eps);
  return vec2(dndy, -dndx);
}
`,
  exports: ["curlNoise"],
  dependencies: ["glsl-noise"],
  description: "GLSL curl noise for divergence-free flow.",
  usage: `\
### glsl-curl — Curl Noise

\`\`\`glsl
vec2 flow = curlNoise(uv * 5.0);
\`\`\`
`,
};

export default glslCurl;
