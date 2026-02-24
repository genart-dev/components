import type { ComponentEntry } from "../../types.js";

const physicsRk4: ComponentEntry = {
  name: "physics-rk4",
  version: "1.0.0",
  category: "physics",
  target: "js",
  renderers: [],
  code: `\
function rk4Step(state, derivsFn, dt) {
  var n = state.length;
  var k1 = derivsFn(state);
  var s2 = new Array(n);
  for (var i = 0; i < n; i++) s2[i] = state[i] + k1[i] * dt / 2;
  var k2 = derivsFn(s2);
  var s3 = new Array(n);
  for (var i = 0; i < n; i++) s3[i] = state[i] + k2[i] * dt / 2;
  var k3 = derivsFn(s3);
  var s4 = new Array(n);
  for (var i = 0; i < n; i++) s4[i] = state[i] + k3[i] * dt;
  var k4 = derivsFn(s4);
  var result = new Array(n);
  for (var i = 0; i < n; i++)
    result[i] = state[i] + (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]) * dt / 6;
  return result;
}

function rk4System(initialState, derivsFn, dt, steps) {
  var state = initialState.slice();
  var trajectory = [state.slice()];
  for (var s = 0; s < steps; s++) {
    state = rk4Step(state, derivsFn, dt);
    trajectory.push(state.slice());
  }
  return trajectory;
}

function lorenzAttractor(sigma, rho, beta) {
  sigma = sigma || 10; rho = rho || 28; beta = beta || 8/3;
  return function(state) {
    return [
      sigma * (state[1] - state[0]),
      state[0] * (rho - state[2]) - state[1],
      state[0] * state[1] - beta * state[2]
    ];
  };
}

function phasePortrait(derivsFn, xRange, yRange, gridSize) {
  var arrows = [];
  var dx = (xRange[1] - xRange[0]) / gridSize;
  var dy = (yRange[1] - yRange[0]) / gridSize;
  for (var i = 0; i <= gridSize; i++) {
    for (var j = 0; j <= gridSize; j++) {
      var x = xRange[0] + i * dx, y = yRange[0] + j * dy;
      var d = derivsFn([x, y]);
      arrows.push({ x: x, y: y, dx: d[0], dy: d[1] });
    }
  }
  return arrows;
}
`,
  exports: ["rk4Step", "rk4System", "lorenzAttractor", "phasePortrait"],
  dependencies: ["vector"],
  description: "Runge-Kutta integration and common ODEs (Lorenz attractor).",
  usage: `\
### physics-rk4 — RK4 Integration

\`\`\`js
var lorenz = lorenzAttractor(10, 28, 8/3);
var traj = rk4System([1,1,1], lorenz, 0.01, 5000);
\`\`\`
`,
};

export default physicsRk4;
