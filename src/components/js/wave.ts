import type { ComponentEntry } from "../../types.js";

const wave: ComponentEntry = {
  name: "wave",
  version: "1.0.0",
  category: "animation",
  target: "js",
  renderers: [],
  code: `\
function sineWave(t, freq, amp, phase) {
  return (amp || 1) * Math.sin(2 * Math.PI * (freq || 1) * t + (phase || 0));
}

function squareWave(t, freq) {
  return Math.sin(2 * Math.PI * (freq || 1) * t) >= 0 ? 1 : -1;
}

function sawtoothWave(t, freq) {
  var p = t * (freq || 1);
  return 2 * (p - Math.floor(p + 0.5));
}

function triangleWave(t, freq) {
  var p = t * (freq || 1);
  return 4 * Math.abs(p - Math.floor(p + 0.75) + 0.25) - 1;
}

function waveSum(waveFns, t) {
  var sum = 0;
  for (var i = 0; i < waveFns.length; i++) sum += waveFns[i](t);
  return sum;
}

function standingWave(x, t, freq, wavelength) {
  return Math.sin(2 * Math.PI * x / (wavelength || 1)) * Math.cos(2 * Math.PI * (freq || 1) * t);
}
`,
  exports: ["sineWave", "squareWave", "sawtoothWave", "triangleWave", "waveSum", "standingWave"],
  dependencies: ["math"],
  description: "Periodic wave functions (sine, square, sawtooth, triangle).",
  usage: `\
### wave — Wave Functions

\`\`\`js
sineWave(t, 2, 1, 0);    // 2 Hz sine
squareWave(t, 1);         // 1 Hz square
triangleWave(t, 0.5);     // 0.5 Hz triangle
standingWave(x, t, 1, 100);
\`\`\`
`,
};

export default wave;
