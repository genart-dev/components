import type { ComponentEntry } from "../../types.js";

const noise4d: ComponentEntry = {
  name: "noise-4d",
  version: "1.0.0",
  category: "noise",
  target: "js",
  renderers: [],
  code: `\
function simplex4D(rng) {
  var perm = new Uint8Array(512);
  for (var i = 0; i < 256; i++) perm[i] = i;
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
  for (var i = 0; i < 256; i++) perm[256 + i] = perm[i];
  var grad4 = [[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],
               [1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],
               [1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],
               [1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]];
  var F4 = (Math.sqrt(5) - 1) / 4, G4 = (5 - Math.sqrt(5)) / 20;
  return function(x, y, z, w) {
    var s = (x+y+z+w) * F4;
    var i=Math.floor(x+s), j=Math.floor(y+s), k=Math.floor(z+s), l=Math.floor(w+s);
    var t = (i+j+k+l) * G4;
    var x0=x-(i-t), y0=y-(j-t), z0=z-(k-t), w0=w-(l-t);
    var rankx=0,ranky=0,rankz=0,rankw=0;
    if(x0>y0)rankx++;else ranky++;
    if(x0>z0)rankx++;else rankz++;
    if(x0>w0)rankx++;else rankw++;
    if(y0>z0)ranky++;else rankz++;
    if(y0>w0)ranky++;else rankw++;
    if(z0>w0)rankz++;else rankw++;
    var i1=rankx>=3?1:0,j1=ranky>=3?1:0,k1=rankz>=3?1:0,l1=rankw>=3?1:0;
    var i2=rankx>=2?1:0,j2=ranky>=2?1:0,k2=rankz>=2?1:0,l2=rankw>=2?1:0;
    var i3=rankx>=1?1:0,j3=ranky>=1?1:0,k3=rankz>=1?1:0,l3=rankw>=1?1:0;
    var x1=x0-i1+G4,y1=y0-j1+G4,z1=z0-k1+G4,w1=w0-l1+G4;
    var x2=x0-i2+2*G4,y2=y0-j2+2*G4,z2=z0-k2+2*G4,w2=w0-l2+2*G4;
    var x3=x0-i3+3*G4,y3=y0-j3+3*G4,z3=z0-k3+3*G4,w3=w0-l3+3*G4;
    var x4=x0-1+4*G4,y4=y0-1+4*G4,z4=z0-1+4*G4,w4=w0-1+4*G4;
    var ii=i&255,jj=j&255,kk=k&255,ll=l&255;
    function c(g,px,py,pz,pw){var t2=0.6-px*px-py*py-pz*pz-pw*pw;return t2<0?0:(t2*=t2,t2*t2*(g[0]*px+g[1]*py+g[2]*pz+g[3]*pw));}
    var n = c(grad4[perm[ii+perm[jj+perm[kk+perm[ll]]]]&31],x0,y0,z0,w0)
          + c(grad4[perm[ii+i1+perm[jj+j1+perm[kk+k1+perm[ll+l1]]]]&31],x1,y1,z1,w1)
          + c(grad4[perm[ii+i2+perm[jj+j2+perm[kk+k2+perm[ll+l2]]]]&31],x2,y2,z2,w2)
          + c(grad4[perm[ii+i3+perm[jj+j3+perm[kk+k3+perm[ll+l3]]]]&31],x3,y3,z3,w3)
          + c(grad4[perm[ii+1+perm[jj+1+perm[kk+1+perm[ll+1]]]]&31],x4,y4,z4,w4);
    return 0.5 + 13.5 * n;
  };
}
`,
  exports: ["simplex4D"],
  dependencies: ["prng"],
  description: "4D simplex noise for loopable animations.",
  usage: `\
### noise-4d — 4D Simplex Noise

\`\`\`js
var noise = simplex4D(rng);
// Loopable: map time to a circle in 4D
var nx = noise(x, y, Math.cos(t) * r, Math.sin(t) * r);
\`\`\`
`,
};

export default noise4d;
