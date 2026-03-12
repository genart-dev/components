import type { ComponentEntry } from "../../types.js";

const parametricLSystem: ComponentEntry = {
  name: "parametric-lsystem",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: [],
  description: "Parametric L-system engine with module objects, stochastic productions, and safety limits.",
  exports: [
    "createModule",
    "parseAxiom",
    "iterateParametricLSystem",
    "modulesToString",
  ],
  dependencies: ["math"],
  usage: `\
### parametric-lsystem — Parametric L-Systems

\`\`\`js
// Define modules: each has a symbol and optional numeric params
var axiom = [createModule('A', [10])];
var rules = {
  'A': function(params) {
    var len = params[0];
    if (len > 1) {
      return [
        createModule('F', [len]),
        createModule('['), createModule('+'),
        createModule('A', [len * 0.7]),
        createModule(']'), createModule('-'),
        createModule('A', [len * 0.7])
      ];
    }
    return [createModule('L')]; // leaf
  }
};
var result = iterateParametricLSystem(axiom, rules, 5);
var str = modulesToString(result);
\`\`\`
`,
  code: `\
function createModule(symbol, params) {
  return { symbol: symbol, params: params || null };
}

function parseAxiom(str) {
  var modules = [];
  for (var i = 0; i < str.length; i++) {
    var ch = str[i];
    if (ch === '(' ) {
      var j = str.indexOf(')', i);
      var nums = str.slice(i + 1, j).split(',').map(Number);
      modules[modules.length - 1].params = nums;
      i = j;
    } else {
      modules.push(createModule(ch));
    }
  }
  return modules;
}

function iterateParametricLSystem(axiom, rules, iterations, maxModules) {
  maxModules = maxModules || 500000;
  iterations = Math.min(iterations, 12);
  var current = axiom.slice();
  for (var iter = 0; iter < iterations; iter++) {
    var next = [];
    for (var i = 0; i < current.length; i++) {
      var mod = current[i];
      var rule = rules[mod.symbol];
      if (rule) {
        var replacement = rule(mod.params || [], i, current);
        if (replacement) {
          for (var r = 0; r < replacement.length; r++) next.push(replacement[r]);
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

function modulesToString(modules) {
  var s = '';
  for (var i = 0; i < modules.length; i++) {
    var m = modules[i];
    s += m.symbol;
    if (m.params && m.params.length > 0) {
      s += '(' + m.params.map(function(p) { return p.toFixed(2); }).join(',') + ')';
    }
  }
  return s;
}
`,
};

export default parametricLSystem;
