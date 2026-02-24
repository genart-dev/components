import type { ComponentEntry } from "../../types.js";

const glslPost: ComponentEntry = {
  name: "glsl-post",
  version: "1.0.0",
  category: "imaging",
  target: "glsl",
  renderers: [],
  code: `\
float vignette(vec2 uv, float intensity) {
  vec2 d = uv - 0.5;
  return 1.0 - dot(d, d) * intensity;
}

vec3 chromaticAberration(sampler2D tex, vec2 uv, float offset) {
  float r = texture2D(tex, uv + vec2(offset, 0.0)).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - vec2(offset, 0.0)).b;
  return vec3(r, g, b);
}

float filmGrain(vec2 uv, float time, float intensity) {
  return (hash(uv * 1000.0 + time) - 0.5) * intensity;
}

vec3 bloom(sampler2D tex, vec2 uv, float threshold, float intensity) {
  vec3 col = texture2D(tex, uv).rgb;
  vec3 bright = max(col - vec3(threshold), vec3(0.0));
  vec3 blur = vec3(0.0);
  for (int i = -2; i <= 2; i++)
    for (int j = -2; j <= 2; j++)
      blur += max(texture2D(tex, uv + vec2(float(i), float(j)) * 0.003).rgb - vec3(threshold), vec3(0.0));
  blur /= 25.0;
  return col + blur * intensity;
}

vec3 sharpen(sampler2D tex, vec2 uv, float strength) {
  vec2 px = vec2(1.0) / vec2(textureSize(tex, 0));
  vec3 col = texture2D(tex, uv).rgb * (1.0 + 4.0 * strength);
  col -= texture2D(tex, uv + vec2(px.x, 0.0)).rgb * strength;
  col -= texture2D(tex, uv - vec2(px.x, 0.0)).rgb * strength;
  col -= texture2D(tex, uv + vec2(0.0, px.y)).rgb * strength;
  col -= texture2D(tex, uv - vec2(0.0, px.y)).rgb * strength;
  return col;
}
`,
  exports: ["vignette", "chromaticAberration", "filmGrain", "bloom", "sharpen"],
  dependencies: ["glsl-noise"],
  description: "Post-processing effects (vignette, chromatic aberration, grain, bloom).",
  usage: `\
### glsl-post — Post Processing

\`\`\`glsl
color *= vignette(uv, 2.0);
color += filmGrain(uv, u_time, 0.05);
color = bloom(tex, uv, 0.8, 1.5);
\`\`\`
`,
};

export default glslPost;
