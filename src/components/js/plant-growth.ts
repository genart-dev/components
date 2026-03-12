import type { ComponentEntry } from "../../types.js";

const plantGrowth: ComponentEntry = {
  name: "plant-growth",
  version: "1.0.0",
  category: "animation",
  target: "js",
  renderers: [],
  description: "Growth animation via tDOL-system — tagged L-system iteration with continuous time interpolation and 3 easing curves.",
  exports: [
    "taggedIterate",
    "filterByGrowthTime",
    "applyGrowthCurve",
    "getGrowthScale",
  ],
  dependencies: ["parametric-lsystem"],
  usage: `\
### plant-growth — Growth Animation

\`\`\`js
// Create tagged modules (each tracks its birth iteration)
var axiom = [createModule('F'), createModule('['), createModule('+'),
             createModule('F'), createModule(']'), createModule('F')];
var rules = { 'F': function() { return [createModule('F'), createModule('F')]; } };
var tagged = taggedIterate(axiom, rules, 4);

// Filter by growth time (0 = seed, 1 = full maturity)
var partial = filterByGrowthTime(tagged, 4, 0.5, 'sigmoid');
// Frontier segments have a growth scale < 1
var scale = getGrowthScale(partial[partial.length - 1]);
\`\`\`
`,
  code: `\
function taggedIterate(axiom, rules, iterations, maxModules) {
  maxModules = maxModules || 500000;
  iterations = Math.min(iterations, 12);
  var current = [];
  for (var a = 0; a < axiom.length; a++) {
    var copy = { symbol: axiom[a].symbol, params: axiom[a].params, birthStep: 0 };
    current.push(copy);
  }
  for (var iter = 0; iter < iterations; iter++) {
    var next = [];
    for (var i = 0; i < current.length; i++) {
      var mod = current[i];
      var rule = rules[mod.symbol];
      if (rule) {
        var repl = rule(mod.params || [], i, current);
        if (repl) {
          for (var r = 0; r < repl.length; r++) {
            next.push({ symbol: repl[r].symbol, params: repl[r].params, birthStep: iter + 1 });
          }
        } else {
          next.push(mod);
        }
      } else {
        next.push(mod);
      }
      if (next.length > maxModules) return next.slice(0, maxModules);
    }
    current = next;
  }
  return current;
}

function applyGrowthCurve(t, curve) {
  t = Math.max(0, Math.min(1, t));
  if (curve === 'sigmoid') return 1 / (1 + Math.exp(-12 * (t - 0.5)));
  if (curve === 'spring') {
    if (t < 0.8) return (t / 0.8) * 1.08;
    return 1.08 - 0.08 * ((t - 0.8) / 0.2);
  }
  return t; // linear
}

function filterByGrowthTime(taggedModules, totalIterations, growthTime, growthCurve) {
  if (growthTime >= 1) return taggedModules;
  if (growthTime <= 0) {
    return taggedModules.filter(function(m) { return m.birthStep === 0; });
  }
  var eased = applyGrowthCurve(growthTime, growthCurve || 'linear');
  var fractional = eased * totalIterations;
  var maxStep = Math.floor(fractional);
  var frac = fractional - maxStep;
  var result = [];
  for (var i = 0; i < taggedModules.length; i++) {
    var m = taggedModules[i];
    if (m.birthStep <= maxStep) {
      result.push(m);
    } else if (m.birthStep === maxStep + 1 && (m.symbol === 'F' || m.symbol === 'G') && frac > 0.01) {
      var copy = { symbol: m.symbol, params: m.params ? m.params.slice() : null, _growthScale: frac };
      result.push(copy);
    }
  }
  return result;
}

function getGrowthScale(mod) {
  return mod && mod._growthScale !== undefined ? mod._growthScale : 1.0;
}
`,
};

export default plantGrowth;
