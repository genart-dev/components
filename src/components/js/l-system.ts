import type { ComponentEntry } from "../../types.js";

const lSystem: ComponentEntry = {
  name: "l-system",
  version: "1.0.0",
  category: "pattern",
  target: "js",
  renderers: [],
  code: `\
function createLSystem(axiom, rules) {
  return { axiom: axiom, rules: rules, current: axiom };
}

function iterateLSystem(system, iterations) {
  var str = system.current;
  for (var iter = 0; iter < iterations; iter++) {
    var next = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      next += system.rules[ch] !== undefined ? system.rules[ch] : ch;
    }
    str = next;
  }
  system.current = str;
  return str;
}

function turtleInterpret(str, stepLength, angleDeg) {
  var x = 0, y = 0, angle = -90;
  var rad = angleDeg * Math.PI / 180;
  var path = [[x, y]];
  var stack = [];
  for (var i = 0; i < str.length; i++) {
    var ch = str[i];
    if (ch === 'F' || ch === 'G') {
      x += Math.cos(angle * Math.PI / 180) * stepLength;
      y += Math.sin(angle * Math.PI / 180) * stepLength;
      path.push([x, y]);
    } else if (ch === 'f') {
      x += Math.cos(angle * Math.PI / 180) * stepLength;
      y += Math.sin(angle * Math.PI / 180) * stepLength;
      path.push(null);
      path.push([x, y]);
    } else if (ch === '+') { angle += angleDeg; }
    else if (ch === '-') { angle -= angleDeg; }
    else if (ch === '[') { stack.push({ x: x, y: y, angle: angle }); }
    else if (ch === ']') {
      var s = stack.pop();
      x = s.x; y = s.y; angle = s.angle;
      path.push(null);
      path.push([x, y]);
    }
  }
  return path;
}
`,
  exports: ["createLSystem", "iterateLSystem", "turtleInterpret"],
  dependencies: ["math"],
  description: "L-system grammar iteration and turtle graphics interpretation.",
  usage: `\
### l-system — L-Systems

\`\`\`js
var sys = createLSystem('F', { 'F': 'F[+F]F[-F]F' });
var str = iterateLSystem(sys, 4);
var path = turtleInterpret(str, 5, 25.7);
\`\`\`
`,
};

export default lSystem;
