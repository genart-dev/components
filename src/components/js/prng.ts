import type { ComponentEntry } from "../../types.js";

const prng: ComponentEntry = {
  name: "prng",
  version: "1.0.0",
  category: "randomness",
  target: "js",
  renderers: [],
  code: `\
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = (a + b | 0) + d | 0;
    d = d + 1 | 0; a = b ^ (b >>> 9);
    b = c + (c << 3) | 0; c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
`,
  exports: ["mulberry32", "sfc32"],
  dependencies: [],
  description: "Seeded pseudo-random number generators (mulberry32, sfc32).",
  usage: `\
### prng — Seeded PRNGs

\`\`\`js
const rng = mulberry32(state.SEED);
rng(); // → 0.0–1.0
\`\`\`

- **mulberry32(seed)** — fast 32-bit PRNG, good for most use cases
- **sfc32(a, b, c, d)** — higher quality, 4 seeds, passes PractRand
`,
};

export default prng;
