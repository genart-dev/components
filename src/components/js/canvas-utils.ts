import type { ComponentEntry } from "../../types.js";

const canvasUtils: ComponentEntry = {
  name: "canvas-utils",
  version: "1.0.0",
  category: "imaging",
  target: "js",
  renderers: [],
  code: `\
function pixelAt(imageData, x, y) {
  var i = (y * imageData.width + x) * 4;
  return [imageData.data[i], imageData.data[i+1], imageData.data[i+2], imageData.data[i+3]];
}

function setPixelAt(imageData, x, y, r, g, b, a) {
  var i = (y * imageData.width + x) * 4;
  imageData.data[i] = r; imageData.data[i+1] = g;
  imageData.data[i+2] = b; imageData.data[i+3] = a !== undefined ? a : 255;
}

function forEachPixel(imageData, fn) {
  for (var y = 0; y < imageData.height; y++)
    for (var x = 0; x < imageData.width; x++) {
      var i = (y * imageData.width + x) * 4;
      fn(x, y, imageData.data[i], imageData.data[i+1], imageData.data[i+2], imageData.data[i+3], i);
    }
}

function convolve3x3(imageData, kernel) {
  var w = imageData.width, h = imageData.height;
  var src = new Uint8ClampedArray(imageData.data);
  for (var y = 1; y < h-1; y++)
    for (var x = 1; x < w-1; x++) {
      var r=0,g=0,b=0;
      for (var ky = -1; ky <= 1; ky++)
        for (var kx = -1; kx <= 1; kx++) {
          var i = ((y+ky)*w+(x+kx))*4;
          var k = kernel[(ky+1)*3+(kx+1)];
          r += src[i]*k; g += src[i+1]*k; b += src[i+2]*k;
        }
      var oi = (y*w+x)*4;
      imageData.data[oi] = Math.max(0,Math.min(255,r));
      imageData.data[oi+1] = Math.max(0,Math.min(255,g));
      imageData.data[oi+2] = Math.max(0,Math.min(255,b));
    }
}

function threshold(imageData, level) {
  for (var i = 0; i < imageData.data.length; i += 4) {
    var v = (imageData.data[i]*0.299 + imageData.data[i+1]*0.587 + imageData.data[i+2]*0.114) >= level ? 255 : 0;
    imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = v;
  }
}

function dither(imageData) {
  var w = imageData.width, h = imageData.height;
  var buf = new Float64Array(w * h);
  for (var i = 0; i < buf.length; i++)
    buf[i] = imageData.data[i*4]*0.299 + imageData.data[i*4+1]*0.587 + imageData.data[i*4+2]*0.114;
  for (var y = 0; y < h; y++)
    for (var x = 0; x < w; x++) {
      var old = buf[y*w+x];
      var nw = old < 128 ? 0 : 255;
      buf[y*w+x] = nw;
      var err = old - nw;
      if (x+1<w) buf[y*w+x+1] += err*7/16;
      if (y+1<h) {
        if (x>0) buf[(y+1)*w+x-1] += err*3/16;
        buf[(y+1)*w+x] += err*5/16;
        if (x+1<w) buf[(y+1)*w+x+1] += err/16;
      }
    }
  for (var i = 0; i < buf.length; i++) {
    var v = Math.max(0, Math.min(255, Math.round(buf[i])));
    imageData.data[i*4] = imageData.data[i*4+1] = imageData.data[i*4+2] = v;
  }
}
`,
  exports: ["pixelAt", "setPixelAt", "forEachPixel", "convolve3x3", "threshold", "dither"],
  dependencies: [],
  description: "ImageData pixel manipulation (read, write, convolve, dither).",
  usage: `\
### canvas-utils — Pixel Manipulation

\`\`\`js
var px = pixelAt(imageData, x, y); // [r, g, b, a]
setPixelAt(imageData, x, y, 255, 0, 0);
convolve3x3(imageData, [0,-1,0,-1,5,-1,0,-1,0]); // sharpen
threshold(imageData, 128);
dither(imageData); // Floyd-Steinberg
\`\`\`
`,
};

export default canvasUtils;
