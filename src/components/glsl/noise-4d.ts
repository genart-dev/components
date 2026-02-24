import type { ComponentEntry } from "../../types.js";

const glslNoise4d: ComponentEntry = {
  name: "glsl-noise-4d",
  version: "1.0.0",
  category: "noise",
  target: "glsl",
  renderers: [],
  code: `\
float noise4(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float h1 = fract(sin(dot(i, vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h2 = fract(sin(dot(i + vec4(1,0,0,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h3 = fract(sin(dot(i + vec4(0,1,0,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h4 = fract(sin(dot(i + vec4(1,1,0,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h5 = fract(sin(dot(i + vec4(0,0,1,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h6 = fract(sin(dot(i + vec4(1,0,1,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h7 = fract(sin(dot(i + vec4(0,1,1,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h8 = fract(sin(dot(i + vec4(1,1,1,0), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h9 = fract(sin(dot(i + vec4(0,0,0,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h10 = fract(sin(dot(i + vec4(1,0,0,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h11 = fract(sin(dot(i + vec4(0,1,0,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h12 = fract(sin(dot(i + vec4(1,1,0,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h13 = fract(sin(dot(i + vec4(0,0,1,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h14 = fract(sin(dot(i + vec4(1,0,1,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h15 = fract(sin(dot(i + vec4(0,1,1,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float h16 = fract(sin(dot(i + vec4(1,1,1,1), vec4(127.1,311.7,269.5,183.3))) * 43758.5453);
  float x1 = mix(mix(h1,h2,f.x), mix(h3,h4,f.x), f.y);
  float x2 = mix(mix(h5,h6,f.x), mix(h7,h8,f.x), f.y);
  float x3 = mix(mix(h9,h10,f.x), mix(h11,h12,f.x), f.y);
  float x4 = mix(mix(h13,h14,f.x), mix(h15,h16,f.x), f.y);
  return mix(mix(x1,x2,f.z), mix(x3,x4,f.z), f.w);
}

float fbm4(vec4 p, int octaves) {
  float val = 0.0, amp = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    val += amp * noise4(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}
`,
  exports: ["noise4", "fbm4"],
  dependencies: [],
  description: "4D GLSL noise for loopable animations.",
  usage: `\
### glsl-noise-4d — 4D Noise

\`\`\`glsl
float n = noise4(vec4(uv * 5.0, cos(t) * r, sin(t) * r));
\`\`\`
`,
};

export default glslNoise4d;
