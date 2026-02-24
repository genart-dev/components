import type { ComponentEntry } from "../../types.js";

const matrix: ComponentEntry = {
  name: "matrix",
  version: "1.0.0",
  category: "vector",
  target: "js",
  renderers: [],
  code: `\
function mat2(a, b, c, d) { return [a, b, c, d]; }
function mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  return [m00, m01, m02, m10, m11, m12, m20, m21, m22];
}
function mat4(m00,m01,m02,m03,m10,m11,m12,m13,m20,m21,m22,m23,m30,m31,m32,m33) {
  return [m00,m01,m02,m03,m10,m11,m12,m13,m20,m21,m22,m23,m30,m31,m32,m33];
}

function multiply(a, b, n) {
  var r = new Array(n * n);
  for (var i = 0; i < n; i++)
    for (var j = 0; j < n; j++) {
      var s = 0;
      for (var k = 0; k < n; k++) s += a[i * n + k] * b[k * n + j];
      r[i * n + j] = s;
    }
  return r;
}

function transpose(m, n) {
  var r = new Array(n * n);
  for (var i = 0; i < n; i++)
    for (var j = 0; j < n; j++) r[j * n + i] = m[i * n + j];
  return r;
}

function inverse(m) {
  var a=m[0],b=m[1],c=m[2],d=m[3],e=m[4],f=m[5],g=m[6],h=m[7],i=m[8],j=m[9],k=m[10],l=m[11],n=m[12],o=m[13],p=m[14],q=m[15];
  var kpol=k*q-l*p, jpom=j*q-l*o, jpon=j*p-k*o, ipol=i*q-l*n, ipon=i*p-k*n, iomn=i*o-j*n;
  var det = a*(f*kpol-g*jpom+h*jpon) - b*(e*kpol-g*ipol+h*ipon) + c*(e*jpom-f*ipol+h*iomn) - d*(e*jpon-f*ipon+g*iomn);
  if (det === 0) return null;
  var id = 1/det;
  return [
    (f*kpol-g*jpom+h*jpon)*id, -(b*kpol-c*jpom+d*jpon)*id, (b*(g*q-h*p)-c*(f*q-h*o)+d*(f*p-g*o))*id, -(b*(g*l-h*k)-c*(f*l-h*j)+d*(f*k-g*j))*id,
    -(e*kpol-g*ipol+h*ipon)*id, (a*kpol-c*ipol+d*ipon)*id, -(a*(g*q-h*p)-c*(e*q-h*n)+d*(e*p-g*n))*id, (a*(g*l-h*k)-c*(e*l-h*i)+d*(e*k-g*i))*id,
    (e*jpom-f*ipol+h*iomn)*id, -(a*jpom-b*ipol+d*iomn)*id, (a*(f*q-h*o)-b*(e*q-h*n)+d*(e*o-f*n))*id, -(a*(f*l-h*j)-b*(e*l-h*i)+d*(e*j-f*i))*id,
    -(e*jpon-f*ipon+g*iomn)*id, (a*jpon-b*ipon+c*iomn)*id, -(a*(f*p-g*o)-b*(e*p-g*n)+c*(e*o-f*n))*id, (a*(f*k-g*j)-b*(e*k-g*i)+c*(e*j-f*i))*id
  ];
}

function rotationMatrix(axis, angle) {
  var c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  var x = axis[0], y = axis[1], z = axis[2];
  return [
    t*x*x+c,   t*x*y-s*z, t*x*z+s*y, 0,
    t*x*y+s*z, t*y*y+c,   t*y*z-s*x, 0,
    t*x*z-s*y, t*y*z+s*x, t*z*z+c,   0,
    0, 0, 0, 1
  ];
}

function projectionMatrix(fov, aspect, near, far) {
  var f = 1 / Math.tan(fov / 2);
  var nf = 1 / (near - far);
  return [
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far+near)*nf, -1,
    0, 0, 2*far*near*nf, 0
  ];
}
`,
  exports: ["mat2", "mat3", "mat4", "multiply", "inverse", "transpose", "rotationMatrix", "projectionMatrix"],
  dependencies: ["vector"],
  description: "Matrix math for 2D/3D transforms and projections.",
  usage: `\
### matrix — Matrix Math

\`\`\`js
var rot = rotationMatrix([0,1,0], Math.PI/4);
var proj = projectionMatrix(Math.PI/3, 16/9, 0.1, 100);
var result = multiply(proj, rot, 4);
\`\`\`
`,
};

export default matrix;
