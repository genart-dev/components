import type { ComponentEntry } from "../../types.js";

const glslColor: ComponentEntry = {
  name: "glsl-color",
  version: "1.0.0",
  category: "color",
  target: "glsl",
  renderers: [],
  code: `\
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsl(vec3 c) {
  float maxC = max(c.r, max(c.g, c.b));
  float minC = min(c.r, min(c.g, c.b));
  float l = (maxC + minC) * 0.5;
  if (maxC == minC) return vec3(0.0, 0.0, l);
  float d = maxC - minC;
  float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);
  float h;
  if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
  else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;
  else h = (c.r - c.g) / d + 4.0;
  h /= 6.0;
  return vec3(h, s, l);
}

vec3 hsl2rgb(vec3 c) {
  if (c.y == 0.0) return vec3(c.z);
  float q = c.z < 0.5 ? c.z * (1.0 + c.y) : c.z + c.y - c.z * c.y;
  float p = 2.0 * c.z - q;
  vec3 t = vec3(c.x + 1.0/3.0, c.x, c.x - 1.0/3.0);
  t = fract(t);
  vec3 r;
  for (int i = 0; i < 3; i++) {
    float ti = i == 0 ? t.x : (i == 1 ? t.y : t.z);
    float v;
    if (ti < 1.0/6.0) v = p + (q - p) * 6.0 * ti;
    else if (ti < 0.5) v = q;
    else if (ti < 2.0/3.0) v = p + (q - p) * (2.0/3.0 - ti) * 6.0;
    else v = p;
    if (i == 0) r.x = v;
    else if (i == 1) r.y = v;
    else r.z = v;
  }
  return r;
}

vec3 rgb2oklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(l, 1.0/3.0); m = pow(m, 1.0/3.0); s = pow(s, 1.0/3.0);
  return vec3(
    0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
    1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
    0.0259040371*l + 0.7827717662*m - 0.8086757660*s
  );
}

vec3 oklab2rgb(vec3 lab) {
  float l = lab.x + 0.3963377774*lab.y + 0.2158037573*lab.z;
  float m = lab.x - 0.1055613458*lab.y - 0.0638541728*lab.z;
  float s = lab.x - 0.0894841775*lab.y - 1.2914855480*lab.z;
  l=l*l*l; m=m*m*m; s=s*s*s;
  return vec3(
    4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
    -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
    -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
  );
}

vec3 posterize(vec3 c, float levels) {
  return floor(c * levels + 0.5) / levels;
}

vec3 quantize(vec3 c, float steps) {
  return floor(c * steps) / steps;
}
`,
  exports: ["rgb2hsv", "hsv2rgb", "rgb2hsl", "hsl2rgb", "rgb2oklab", "oklab2rgb", "posterize", "quantize"],
  dependencies: [],
  description: "GLSL color space conversions (HSV, HSL, OKLab) and quantization.",
  usage: `\
### glsl-color — Color Spaces

\`\`\`glsl
vec3 hsv = rgb2hsv(color);
hsv.x += 0.1; // hue shift
color = hsv2rgb(hsv);
color = posterize(color, 4.0);
\`\`\`
`,
};

export default glslColor;
