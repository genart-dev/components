import type { ComponentEntry } from "../../types.js";

const svgPath: ComponentEntry = {
  name: "svg-path",
  version: "1.0.0",
  category: "geometry",
  target: "js",
  renderers: [],
  code: `\
function pathFromPoints(points, closed) {
  if (!points.length) return '';
  var d = 'M ' + points[0][0] + ' ' + points[0][1];
  for (var i = 1; i < points.length; i++) {
    if (points[i] === null) {
      if (i + 1 < points.length && points[i + 1]) {
        d += ' M ' + points[i + 1][0] + ' ' + points[i + 1][1];
        i++;
      }
    } else {
      d += ' L ' + points[i][0] + ' ' + points[i][1];
    }
  }
  if (closed) d += ' Z';
  return d;
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  var x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
  var x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
  var largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  return 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2;
}

function bezierPath(points) {
  if (points.length < 4) return pathFromPoints(points);
  var d = 'M ' + points[0][0] + ' ' + points[0][1];
  for (var i = 1; i + 2 < points.length; i += 3) {
    d += ' C ' + points[i][0] + ' ' + points[i][1] + ', ' +
      points[i+1][0] + ' ' + points[i+1][1] + ', ' +
      points[i+2][0] + ' ' + points[i+2][1];
  }
  return d;
}

function closePath(d) { return d + ' Z'; }

function pathToString(segments) {
  return segments.join(' ');
}
`,
  exports: ["pathFromPoints", "arcPath", "bezierPath", "closePath", "pathToString"],
  dependencies: [],
  description: "SVG path string builders (points to path, arcs, bezier curves).",
  usage: `\
### svg-path — SVG Path Builders

\`\`\`js
var d = pathFromPoints(points, true); // closed polygon
var arc = arcPath(100, 100, 50, 0, Math.PI);
var curve = bezierPath(controlPoints);
\`\`\`
`,
};

export default svgPath;
