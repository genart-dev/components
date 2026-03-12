import type { ComponentEntry } from "../../types.js";

const tropism: ComponentEntry = {
  name: "tropism",
  version: "1.0.0",
  category: "physics",
  target: "js",
  renderers: [],
  description: "Environmental forces for plant growth — gravity, light, wind with gusts and spatial turbulence.",
  exports: [
    "applyTropism",
    "applyDynamicWind",
    "computeWindStrength",
    "createTropismConfig",
  ],
  dependencies: ["math"],
  usage: `\
### tropism — Plant Growth Forces

\`\`\`js
// Simple gravity droop
var angle = -Math.PI / 2; // growing upward
var config = createTropismConfig(0.3, { windAngle: 0, windStrength: 0.2 });
var bent = applyTropism(angle, config);

// Dynamic wind with gusts
var windCfg = { direction: 45, strength: 0.3, gustFrequency: 1, gustVariance: 0.3, turbulence: 0.2 };
var bent2 = applyDynamicWind(angle, config, windCfg, 0.5, px, py);
\`\`\`
`,
  code: `\
function _tropismAngleDiff(from, to) {
  var d = to - from;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

function createTropismConfig(gravity, opts) {
  opts = opts || {};
  return {
    gravity: gravity,
    lightAngle: opts.lightAngle,
    lightStrength: opts.lightStrength || 0,
    windAngle: opts.windAngle,
    windStrength: opts.windStrength || 0,
    susceptibility: opts.susceptibility !== undefined ? opts.susceptibility : 0.5
  };
}

function applyTropism(currentAngle, config) {
  var sus = config.susceptibility !== undefined ? config.susceptibility : 0.5;
  var adj = 0;
  if (config.gravity !== 0) {
    var gravTarget = config.gravity > 0 ? -Math.PI / 2 : Math.PI / 2;
    adj += _tropismAngleDiff(currentAngle, gravTarget) * Math.abs(config.gravity) * sus;
  }
  if (config.lightStrength > 0) {
    var lDir = config.lightAngle !== undefined ? config.lightAngle : -Math.PI / 2;
    adj += _tropismAngleDiff(currentAngle, lDir) * config.lightStrength * sus;
  }
  if (config.windStrength > 0 && config.windAngle !== undefined) {
    adj += _tropismAngleDiff(currentAngle, config.windAngle) * config.windStrength * sus;
  }
  return currentAngle + adj;
}

function applyDynamicWind(currentAngle, config, wind, time, px, py, noiseFn) {
  var angle = applyTropism(currentAngle, config);
  if (!wind || wind.strength <= 0) return angle;
  var sus = config.susceptibility !== undefined ? config.susceptibility : 0.5;
  var windRad = wind.direction * Math.PI / 180;
  var gustBase = Math.sin((time || 0) * wind.gustFrequency * Math.PI * 2);
  var gustAmp = 1 + gustBase * wind.gustVariance;
  var eff = wind.strength * Math.max(0, gustAmp);
  if (wind.turbulence > 0 && noiseFn) {
    eff *= 1 + noiseFn(px * 0.01, py * 0.01) * wind.turbulence;
  }
  eff = Math.max(0, eff);
  angle += _tropismAngleDiff(angle, windRad) * eff * sus;
  return angle;
}

function computeWindStrength(wind, time, px, py, noiseFn) {
  var gustBase = Math.sin(time * wind.gustFrequency * Math.PI * 2);
  var gustAmp = 1 + gustBase * wind.gustVariance;
  var s = wind.strength * Math.max(0, gustAmp);
  if (wind.turbulence > 0 && noiseFn) {
    s *= 1 + noiseFn(px * 0.01, py * 0.01) * wind.turbulence;
  }
  return Math.max(0, s);
}
`,
};

export default tropism;
