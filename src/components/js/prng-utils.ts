import type { ComponentEntry } from "../../types.js";

const prngUtils: ComponentEntry = {
  name: "prng-utils",
  version: "1.0.0",
  category: "randomness",
  target: "js",
  renderers: [],
  code: `\
function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFloat(rng, min, max) {
  return rng() * (max - min) + min;
}

function randomGaussian(rng) {
  var u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randomChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle(rng, arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function weightedChoice(rng, items, weights) {
  var total = 0;
  for (var i = 0; i < weights.length; i++) total += weights[i];
  var r = rng() * total;
  for (var i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
`,
  exports: ["randomInt", "randomFloat", "randomGaussian", "randomChoice", "shuffle", "weightedChoice"],
  dependencies: ["prng"],
  description: "RNG convenience wrappers (randomInt, randomFloat, shuffle, etc.).",
  usage: `\
### prng-utils — RNG Convenience Wrappers

\`\`\`js
const rng = mulberry32(state.SEED);
randomInt(rng, 1, 10);       // → integer in [1, 10]
randomFloat(rng, -1, 1);     // → float in [-1, 1)
randomGaussian(rng);          // → normally distributed float
randomChoice(rng, ['a','b']); // → random element
shuffle(rng, [1,2,3,4]);     // → shuffled copy
\`\`\`
`,
};

export default prngUtils;
