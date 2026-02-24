import type { ComponentEntry } from "../../types.js";

const animation: ComponentEntry = {
  name: "animation",
  version: "1.0.0",
  category: "animation",
  target: "js",
  renderers: [],
  code: `\
function pingPong(t) {
  t = t % 2;
  return t <= 1 ? t : 2 - t;
}

function loop(t, duration) {
  return (t % duration) / duration;
}

function oscillate(t, min, max, freq) {
  return min + (max - min) * 0.5 * (1 + Math.sin(2 * Math.PI * (freq || 1) * t));
}

function stagger(index, total, duration, offset) {
  offset = offset || 0.1;
  return Math.max(0, Math.min(1, (duration - index * offset) / (duration - (total-1) * offset)));
}

function timeline(t, keyframes) {
  for (var i = 0; i < keyframes.length - 1; i++) {
    var a = keyframes[i], b = keyframes[i+1];
    if (t >= a.t && t <= b.t) {
      var p = (t - a.t) / (b.t - a.t);
      if (b.ease) p = b.ease(p);
      return a.value + (b.value - a.value) * p;
    }
  }
  return keyframes[keyframes.length - 1].value;
}

function sequence(t, segments) {
  var totalDuration = 0;
  for (var i = 0; i < segments.length; i++) totalDuration += segments[i].duration;
  t = t % totalDuration;
  var elapsed = 0;
  for (var i = 0; i < segments.length; i++) {
    if (t < elapsed + segments[i].duration) {
      var local = (t - elapsed) / segments[i].duration;
      return segments[i].fn(local);
    }
    elapsed += segments[i].duration;
  }
  return segments[segments.length - 1].fn(1);
}
`,
  exports: ["pingPong", "loop", "oscillate", "stagger", "timeline", "sequence"],
  dependencies: ["math", "easing"],
  description: "Animation timing utilities (ping-pong, stagger, timeline, sequence).",
  usage: `\
### animation — Timing Utilities

\`\`\`js
pingPong(t);              // 0→1→0→1...
loop(t, 5);               // repeats every 5 seconds
oscillate(t, 0, 100, 2);  // bounces 0↔100 at 2 Hz
timeline(t, [
  { t: 0, value: 0 },
  { t: 1, value: 100, ease: easeInOutCubic },
  { t: 2, value: 50 }
]);
\`\`\`
`,
};

export default animation;
