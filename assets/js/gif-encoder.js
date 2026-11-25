/* ============================================================
   GIF89a animated-GIF encoder — vanilla JS, no dependencies.
   Encodes RGBA frames into a GIF89a byte stream with one global
   median-cut palette (<= 256 colours) and GIF LZW compression.
   Browser: window.T360GIFEncoder. Node: module.exports.
   ============================================================ */
(function (root) {
  "use strict";

  /* ---------- Median-cut palette ---------- */
  function buildPalette(samples, maxColors) {
    // samples: array of [r, g, b]; returns array of [r, g, b] (<= maxColors).
    var counts = new Map();
    for (var i = 0; i < samples.length; i++) {
      var p = samples[i];
      var key = (p[0] << 16) | (p[1] << 8) | p[2];
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    var colors = [];
    counts.forEach(function (c, key) {
      colors.push([(key >> 16) & 255, (key >> 8) & 255, key & 255, c]);
    });
    if (colors.length <= maxColors) {
      colors.sort(function (a, b) {
        return b[3] - a[3] || a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      });
      return colors.map(function (c) { return [c[0], c[1], c[2]]; });
    }
    var boxes = [colors];
    while (boxes.length < maxColors) {
      var bi = -1, best = -1, bestCh = 0;
      for (var b = 0; b < boxes.length; b++) {
        var box = boxes[b];
        if (box.length < 2) continue;
        var rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0, tot = 0;
        for (var j = 0; j < box.length; j++) {
          var c = box[j];
          tot += c[3];
          if (c[0] < rMin) rMin = c[0]; if (c[0] > rMax) rMax = c[0];
          if (c[1] < gMin) gMin = c[1]; if (c[1] > gMax) gMax = c[1];
          if (c[2] < bMin) bMin = c[2]; if (c[2] > bMax) bMax = c[2];
        }
        var rR = rMax - rMin, gR = gMax - gMin, bR = bMax - bMin;
        var range = Math.max(rR, gR, bR);
        var ch = range === rR ? 0 : range === gR ? 1 : 2;
        var score = range * tot;
        if (score > best) { best = score; bi = b; bestCh = ch; }
      }
      if (bi < 0) break;
      var box = boxes[bi];
      box.sort(function (a, b) { return a[bestCh] - b[bestCh]; });
      var total = 0;
      for (var k = 0; k < box.length; k++) total += box[k][3];
      var half = total / 2, acc = 0, split = 0;
      for (var m = 0; m < box.length; m++) {
        acc += box[m][3];
        if (acc >= half) { split = m + 1; break; }
      }
      // A single dominant colour can push the count-median to an edge;
      // fall back to splitting the box in half by colour count instead.
      if (split <= 0 || split >= box.length) split = Math.floor(box.length / 2);
      if (split <= 0 || split >= box.length) break;
      boxes.splice(bi, 1, box.slice(0, split), box.slice(split));
    }
    return boxes.map(function (box) {
      var r = 0, g = 0, b = 0, tot = 0;
      for (var i = 0; i < box.length; i++) {
        var c = box[i];
        r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; tot += c[3];
      }
      return [Math.round(r / tot), Math.round(g / tot), Math.round(b / tot)];
    });
  }

  function makeIndexer(palette) {
    var cache = new Map();
    var exact = new Map();
    for (var i = 0; i < palette.length; i++) {
      var c = palette[i];
      exact.set((c[0] << 16) | (c[1] << 8) | c[2], i);
    }
    return function (r, g, b) {
      var key = (r << 16) | (g << 8) | b;
      var hit = cache.get(key);
      if (hit !== undefined) return hit;
      var ex = exact.get(key);
      if (ex !== undefined) { cache.set(key, ex); return ex; }
      var best = 0, bestD = Infinity;
      for (var j = 0; j < palette.length; j++) {
        var c = palette[j];
        var dr = r - c[0], dg = g - c[1], db = b - c[2];
        var d = dr * dr + dg * dg + db * db;
        if (d < bestD) { bestD = d; best = j; }
      }
      cache.set(key, best);
      return best;
    };
  }

  /* ---------- GIF LZW ---------- */
  function lzwEncode(indices, minCodeSize) {
    var clear = 1 << minCodeSize, eoi = clear + 1;
    var out = [];
    var cur = 0, bits = 0;
    function writeCode(code, size) {
      cur |= code << bits;
      bits += size;
      while (bits >= 8) { out.push(cur & 255); cur >>= 8; bits -= 8; }
    }
    var dict = new Map();
    var next = eoi + 1, codeSize = minCodeSize + 1;
    writeCode(clear, codeSize);
    var prefix = indices[0];
    for (var i = 1; i < indices.length; i++) {
      var k = indices[i];
      var key = prefix * 256 + k;
      var code = dict.get(key);
      if (code !== undefined) { prefix = code; continue; }
      writeCode(prefix, codeSize);
      if (next < 4096) {
        dict.set(key, next);
        next++;
        // The decoder bumps its code size one entry later than the
        // encoder adds entries, so grow only once next has passed
        // the largest code the current size can hold.
        if (next > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        writeCode(clear, codeSize);
        dict = new Map();
        next = eoi + 1;
        codeSize = minCodeSize + 1;
      }
      prefix = k;
    }
    writeCode(prefix, codeSize);
    writeCode(eoi, codeSize);
    if (bits > 0) out.push(cur & 255);
    var blocked = [minCodeSize];
    for (var j = 0; j < out.length; j += 255) {
      var chunk = out.slice(j, j + 255);
      blocked.push(chunk.length);
      for (var t = 0; t < chunk.length; t++) blocked.push(chunk[t]);
    }
    blocked.push(0);
    return blocked;
  }

  /* ---------- GIF89a assembly ---------- */
  function u16(n) { return [n & 255, (n >> 8) & 255]; }

  function encodeGIF(frames, opts) {
    opts = opts || {};
    if (!frames || frames.length === 0) throw new Error("GIF encoder: no frames");
    var width = frames[0].width, height = frames[0].height;
    for (var f = 0; f < frames.length; f++) {
      if (frames[f].width !== width || frames[f].height !== height) {
        throw new Error("GIF encoder: all frames must be the same size");
      }
    }
    var delayCs = Math.max(2, Math.round((opts.delayMs == null ? 500 : opts.delayMs) / 10));
    var loop = opts.loop === false ? 1 : 0; // 0 = loop forever, 1 = play once

    // Sample pixels from all frames for the shared palette.
    var samples = [];
    var maxSamples = 200000;
    var totalPx = width * height * frames.length;
    var step = Math.max(1, Math.floor(totalPx / maxSamples));
    for (var s = 0; s < frames.length; s++) {
      var d = frames[s].data;
      for (var p = 0; p < width * height; p += step) {
        var o = p * 4;
        samples.push([d[o], d[o + 1], d[o + 2]]);
      }
    }
    var palette = buildPalette(samples, 256);
    var palSize = 1;
    while (palSize < palette.length) palSize *= 2;
    if (palSize < 2) palSize = 2;
    var minCodeSize = Math.max(2, Math.ceil(Math.log2(palSize)));
    var indexOf = makeIndexer(palette);

    var bytes = [];
    function push() {
      for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        if (typeof a === "number") bytes.push(a & 255);
        else if (typeof a === "string") for (var j = 0; j < a.length; j++) bytes.push(a.charCodeAt(j) & 255);
        else for (var k = 0; k < a.length; k++) bytes.push(a[k] & 255);
      }
    }

    push("GIF89a");
    push(u16(width), u16(height));
    push(0xF0 | (Math.log2(palSize) - 1)); // GCT flag, 8-bit colour res, GCT size
    push(0, 0); // background colour index, pixel aspect ratio
    for (var pi = 0; pi < palSize; pi++) {
      var c = palette[pi] || [0, 0, 0];
      push(c[0], c[1], c[2]);
    }
    // NETSCAPE2.0 looping extension
    push(0x21, 0xFF, 11, "NETSCAPE2.0", 3, 1, u16(loop), 0);
    // Frames
    for (var fi = 0; fi < frames.length; fi++) {
      var fd = frames[fi].data;
      var indices = new Array(width * height);
      for (var px = 0; px < width * height; px++) {
        var o2 = px * 4;
        indices[px] = indexOf(fd[o2], fd[o2 + 1], fd[o2 + 2]);
      }
      push(0x21, 0xF9, 4, 0x04, u16(delayCs), 0, 0); // graphic control: disposal 1
      push(0x2C, u16(0), u16(0), u16(width), u16(height), 0); // image descriptor
      push(lzwEncode(indices, minCodeSize));
    }
    push(0x3B); // trailer
    return new Uint8Array(bytes);
  }

  var api = { encode: encodeGIF, _buildPalette: buildPalette, _lzwEncode: lzwEncode };
  root.T360GIFEncoder = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : (typeof global !== "undefined" ? global : this));
