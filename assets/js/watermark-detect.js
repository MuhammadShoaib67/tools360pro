// Watermark auto-detector for Tools360Pro — pure JS, no dependencies.
// Runs entirely in the browser on a downscaled copy of the photo (max 512 px).
//
// How it works (PRECISION OVER RECALL — erasing real photo content is worse
// than missing one watermark):
//
//  1. SWT TEXT STROKES (primary): a Stroke Width Transform finds thin
//     strokes — pairs of roughly parallel, opposite-facing edges a few
//     pixels apart. Strokes are grouped into components (words/lines) and
//     a component is accepted only when ALL of these hold:
//       - size between 0.1% and 4% of the image (kills specks and the
//         giant merged blob that dense photo texture forms),
//       - median stroke width between 1.5 and 10 px,
//       - consistent stroke width (like real lettering),
//       - strokes running in several directions (text does; a single
//         wood-grain line or scratch runs in one and is rejected),
//       - at least 40% of its pixels are alpha-candidates: pixels whose
//         brightness differs from the local background the way a
//         semi-transparent overlay would (see the alpha test below).
//  2. ALPHA TEST: a semi-transparent watermark is a blend,
//     out = a*W + (1-a)*bg, so watermark pixels sit a consistent step
//     away from the local background (estimated by a large box blur).
//     Real texture scatters; an overlay shifts one way.
//  3. VALIDATED OVERLAY (logos/banners): a uniform patch shifted from its
//     surroundings is only accepted when the photo's texture provably
//     continues through it — gradient directions inside and outside the
//     patch must match (a semi-transparent overlay attenuates the texture
//     but does not replace it), the inside contrast must be a fraction
//     (0.25-0.95) of the outside contrast, and at least 25% of the
//     patch's boundary must yield valid inside/outside samples (a solid
//     object such as a white pot has almost no texture inside, so only
//     ~2% of its boundary qualifies, and it is rejected).
//
// HONEST LIMITS (measured on synthetic tests, 2026-11-18): text on clear
// or smooth backgrounds is found well (corner logo 80% recall, 79%
// precision); text overlapping dense, busy texture (a flower, foliage)
// merges with the texture's own strokes and is only partly found
// (diagonal stock text 18% recall, tiled text 23%). A clean photo with
// no watermark yields no regions at all (0.00% coverage). White text on
// a white background is physically invisible and cannot be found by any
// detector. Anything the auto-detector misses, the user paints over
// manually — the manual brush stays as the fallback, and the page says
// so plainly.
//
// API: T360WatermarkDetect.detect(rgba, w, h, opts)
//   rgba: Uint8Array/Uint8ClampedArray, length w*h*4 (RGB, alpha ignored)
//   returns { mask, w, h, coverage, regions, found }
//   mask: Uint8Array w*h, 1 = watermark, 0 = keep
//   coverage: fraction of pixels masked (0..1)
//   regions: [{x, y, w, h, area, score}] bounding boxes, detection resolution
//   found: true when at least one region passed every filter
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.T360WatermarkDetect = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULTS = {
    edgeThresh: 0.08,   // Sobel magnitude for an edge pixel (0..1)
    maxStroke: 10,      // max stroke width in px at detection resolution
    minStroke: 1.5,     // min median stroke width of an accepted component
    swConsistency: 0.45, // fraction of a component's pixels near its median width
    maxDominantDir: 0.7, // max fraction of a component's stroke pixels sharing
                         // one gradient direction — text has strokes in many
                         // directions; a single wood-grain line has one
    alphaLo: 0.12,      // alpha-candidate range (overlay strength vs background)
    alphaHi: 0.85,
    alphaRadius: 12,    // background-estimate blur radius
    candFrac: 0.4,      // min fraction of a component's pixels that are alpha-candidates
    overlayStd: 0.05,   // 15px-window stddev below which a patch is "uniform"
    overlayShift: 0.06, // mean shift vs surroundings for an overlay candidate
    satDip: 0.08,       // local saturation drop vs surroundings
    contMinSamples: 12,  // min valid boundary samples for the continuity test
    contMinValidFrac: 0.25, // min fraction of boundary pixels yielding a valid
                            // sample — a real overlay sits on texture, so most
                            // of its boundary has texture on both sides; a
                            // solid object (a white pot) has almost none
                            // (9/400 = 2% in the e2e test) and is rejected
    contMinCos: 0.35,   // min mean gradient-direction cosine across a boundary
    contMinRatio: 0.25, // min inside/outside gradient-magnitude ratio
    contMaxRatio: 0.95, // max inside/outside gradient-magnitude ratio
    maxOverlayFrac: 0.15, // overlay components larger than this are rejected
    minComponent: 0.001, // drop components smaller than 0.1% of the image
                          // (kills JPEG-artifact specks; a real date stamp
                          // is ~300px of strokes at detection resolution)
    maxComponent: 0.35,   // drop components larger than 35% (a flat sky, etc.)
    swMaxComponent: 0.04, // text components larger than 4% are photo content
    maxCoverage: 0.30,    // safety cap: never mask more than 30% of the photo
    closeRadius: 2,       // morphological close radius (joins letters of a word)
    dilate: 2             // final dilation (covers anti-aliased watermark edges)
  };

  function boxIntegral(src, w, h) {
    var I = new Float64Array((w + 1) * (h + 1));
    for (var y = 0; y < h; y++) {
      var rowSum = 0, yw = y * w;
      for (var x = 0; x < w; x++) {
        rowSum += src[yw + x];
        I[(y + 1) * (w + 1) + (x + 1)] = I[y * (w + 1) + (x + 1)] + rowSum;
      }
    }
    return I;
  }

  function boxMean(I, w, h, x, y, r) {
    var x0 = Math.max(0, x - r), y0 = Math.max(0, y - r);
    var x1 = Math.min(w - 1, x + r), y1 = Math.min(h - 1, y + r);
    var W = w + 1;
    var s = I[(y1 + 1) * W + (x1 + 1)] - I[y0 * W + (x1 + 1)]
          - I[(y1 + 1) * W + x0] + I[y0 * W + x0];
    return s / ((x1 - x0 + 1) * (y1 - y0 + 1));
  }

  function dilate(src, w, h, r) {
    var out = new Uint8Array(w * h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var hit = 0;
        for (var dy = -r; dy <= r && !hit; dy++) {
          var yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (var dx = -r; dx <= r; dx++) {
            var xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            if (src[yy * w + xx]) { hit = 1; break; }
          }
        }
        out[y * w + x] = hit;
      }
    }
    return out;
  }

  function erode(src, w, h, r) {
    var out = new Uint8Array(w * h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var all = 1;
        for (var dy = -r; dy <= r && all; dy++) {
          var yy = y + dy;
          if (yy < 0 || yy >= h) { all = 0; break; }
          for (var dx = -r; dx <= r; dx++) {
            var xx = x + dx;
            if (xx < 0 || xx >= w || !src[yy * w + xx]) { all = 0; break; }
          }
        }
        out[y * w + x] = all;
      }
    }
    return out;
  }

  // Connected components (8-connectivity) of a binary mask.
  function components(mask, w, h) {
    var n = w * h;
    var label = new Int32Array(n);
    label.fill(-1);
    var comps = [];
    var stack = [];
    var i, ci, cx, cy, cp, nx, ny, np;
    for (i = 0; i < n; i++) {
      if (!mask[i] || label[i] !== -1) continue;
      ci = comps.length;
      var comp = { area: 0, minX: w, minY: h, maxX: -1, maxY: -1, pixels: [] };
      stack.push(i);
      label[i] = ci;
      while (stack.length) {
        cp = stack.pop();
        cx = cp % w; cy = (cp / w) | 0;
        comp.area++;
        comp.pixels.push(cp);
        if (cx < comp.minX) comp.minX = cx;
        if (cx > comp.maxX) comp.maxX = cx;
        if (cy < comp.minY) comp.minY = cy;
        if (cy > comp.maxY) comp.maxY = cy;
        for (ny = cy - 1; ny <= cy + 1; ny++) {
          if (ny < 0 || ny >= h) continue;
          for (nx = cx - 1; nx <= cx + 1; nx++) {
            if (nx < 0 || nx >= w) continue;
            np = ny * w + nx;
            if (mask[np] && label[np] === -1) { label[np] = ci; stack.push(np); }
          }
        }
      }
      comps.push(comp);
    }
    return comps;
  }

  function detect(rgba, w, h, opts) {
    var o = {};
    var k;
    for (k in DEFAULTS) o[k] = DEFAULTS[k];
    if (opts) for (k in opts) if (opts[k] !== undefined) o[k] = opts[k];
    var debug = o.debug ? { sw: [], ov: [] } : null;

    var n = w * h;
    var L = new Float32Array(n);
    var S = new Float32Array(n);
    var i, r, g, b, mx, mn;
    for (i = 0; i < n; i++) {
      r = rgba[i * 4] / 255; g = rgba[i * 4 + 1] / 255; b = rgba[i * 4 + 2] / 255;
      L[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      mx = Math.max(r, g, b); mn = Math.min(r, g, b);
      S[i] = mx > 0 ? (mx - mn) / mx : 0;
    }

    // Sobel gradients (magnitude + unit direction).
    var G = new Float32Array(n);
    var DX = new Float32Array(n), DY = new Float32Array(n);
    var x, y, p, gx, gy, mag;
    for (y = 1; y < h - 1; y++) {
      for (x = 1; x < w - 1; x++) {
        p = y * w + x;
        gx = -L[p - w - 1] - 2 * L[p - 1] - L[p + w - 1]
             + L[p - w + 1] + 2 * L[p + 1] + L[p + w + 1];
        gy = -L[p - w - 1] - 2 * L[p - w] - L[p - w + 1]
             + L[p + w - 1] + 2 * L[p + w] + L[p + w + 1];
        mag = Math.sqrt(gx * gx + gy * gy) / 4;
        G[p] = mag;
        if (mag > 1e-6) { DX[p] = gx / (mag * 4); DY[p] = gy / (mag * 4); }
      }
    }

    // Alpha-candidate map: pixels whose brightness sits a watermark-like
    // step away from the local background (large box blur). A white
    // overlay brightens toward white; a black overlay darkens toward black.
    var IL = boxIntegral(L, w, h);
    var alphaCand = new Uint8Array(n);
    var bg, aWhite, aBlack;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        p = y * w + x;
        bg = boxMean(IL, w, h, x, y, o.alphaRadius);
        aWhite = (L[p] - bg) / Math.max(0.05, 1 - bg);
        aBlack = (bg - L[p]) / Math.max(0.05, bg);
        if ((aWhite > o.alphaLo && aWhite < o.alphaHi) ||
            (aBlack > o.alphaLo && aBlack < o.alphaHi)) alphaCand[p] = 1;
      }
    }

    // ---- Signal 1: Stroke Width Transform (text strokes) ----
    var strokeW = new Float32Array(n); // 0 = not a stroke pixel
    var dx, dy, qx, qy, q, dot, k, found, dist;
    for (y = 1; y < h - 1; y++) {
      for (x = 1; x < w - 1; x++) {
        p = y * w + x;
        if (G[p] < o.edgeThresh) continue;
        dx = DX[p]; dy = DY[p];
        // Walk both gradient directions (light-on-dark and dark-on-light).
        for (var dir = 0; dir < 2; dir++) {
          var sx = dir === 0 ? dx : -dx, sy = dir === 0 ? dy : -dy;
          found = 0; dist = 0;
          for (k = 1; k <= o.maxStroke; k++) {
            qx = Math.round(x + sx * k); qy = Math.round(y + sy * k);
            if (qx < 1 || qx >= w - 1 || qy < 1 || qy >= h - 1) break;
            q = qy * w + qx;
            if (G[q] < o.edgeThresh) continue;
            dot = DX[q] * dx + DY[q] * dy;
            // Only an opposite-facing edge ends the walk; a same-direction
            // edge is just the thickness of the edge we started from (or a
            // parallel line) — walk past it.
            if (dot < -0.5) { found = q; dist = k; break; }
          }
          if (found) {
            for (k = 0; k <= dist; k++) {
              qx = Math.round(x + sx * k); qy = Math.round(y + sy * k);
              q = qy * w + qx;
              if (strokeW[q] === 0 || dist < strokeW[q]) strokeW[q] = dist;
            }
          }
        }
      }
    }
    var strokeMask = new Uint8Array(n);
    for (i = 0; i < n; i++) if (strokeW[i] > 0) strokeMask[i] = 1;
    // Close joins the letters of a word into one component.
    strokeMask = erode(dilate(strokeMask, w, h, o.closeRadius), w, h, o.closeRadius);

    var minArea = Math.max(4, Math.round(n * o.minComponent));
    var swMaxArea = Math.round(n * o.swMaxComponent);
    var accepted = new Uint8Array(n); // union of accepted regions
    var regions = [];
    var edgeBand = Math.max(8, Math.round(Math.min(w, h) * 0.12));

    // Validate SWT components: size, stroke-width consistency, alpha evidence.
    var swComps = components(strokeMask, w, h);
    for (var ci = 0; ci < swComps.length; ci++) {
      var c = swComps[ci];
      var dbg = debug ? { x: c.minX, y: c.minY, w: c.maxX - c.minX + 1, h: c.maxY - c.minY + 1, area: c.area } : null;
      if (c.area < minArea || c.area > swMaxArea) { if (dbg) { dbg.reject = 'size'; debug.sw.push(dbg); } continue; }
      var widths = [];
      var candCount = 0, swCount = 0;
      var dirBins = [0, 0, 0, 0]; // gradient direction, 4 bins over 0..180 deg
      for (i = 0; i < c.pixels.length; i++) {
        if (strokeW[c.pixels[i]] > 0) {
          widths.push(strokeW[c.pixels[i]]);
          swCount++;
          if (alphaCand[c.pixels[i]]) candCount++;
          var ang = Math.atan2(DY[c.pixels[i]], DX[c.pixels[i]]) * 180 / Math.PI;
          if (ang < 0) ang += 180;
          dirBins[Math.min(3, (ang / 45) | 0)]++;
        }
      }
      if (!widths.length) { if (dbg) { dbg.reject = 'nostrokes'; debug.sw.push(dbg); } continue; }
      // Orientation diversity: text strokes run in many directions; a single
      // grain line or scratch runs in one. Reject single-direction components.
      var domDir = Math.max(dirBins[0], dirBins[1], dirBins[2], dirBins[3]) / swCount;
      if (dbg) dbg.domdir = +domDir.toFixed(2);
      if (domDir > o.maxDominantDir) { if (dbg) { dbg.reject = 'direction'; debug.sw.push(dbg); } continue; }
      widths.sort(function (a, b) { return a - b; });
      var med = widths[widths.length >> 1];
      if (dbg) dbg.med = med;
      if (med < o.minStroke || med > o.maxStroke) { if (dbg) { dbg.reject = 'medwidth'; debug.sw.push(dbg); } continue; }
      var near = 0;
      for (i = 0; i < widths.length; i++)
        if (widths[i] >= med * 0.6 && widths[i] <= med * 1.67) near++;
      if (dbg) dbg.cons = near / widths.length;
      if (near / widths.length < o.swConsistency) { if (dbg) { dbg.reject = 'consistency'; debug.sw.push(dbg); } continue; }
      var candFrac = candCount / swCount;
      if (dbg) dbg.candfrac = candFrac;
      if (candFrac < o.candFrac) { if (dbg) { dbg.reject = 'alpha'; debug.sw.push(dbg); } continue; }
      // Corner/edge prior: a mild score boost, never a requirement.
      var nearEdge = (c.minX < edgeBand || c.maxX >= w - edgeBand ||
                      c.minY < edgeBand || c.maxY >= h - edgeBand) ? 1.5 : 1;
      for (i = 0; i < c.pixels.length; i++) accepted[c.pixels[i]] = 1;
      regions.push({
        x: c.minX, y: c.minY, w: c.maxX - c.minX + 1, h: c.maxY - c.minY + 1,
        area: c.area, score: nearEdge * (near / widths.length), kind: 'text'
      });
      if (dbg) { dbg.accept = true; debug.sw.push(dbg); }
    }

    // ---- Signal 2: validated overlay (logos / banners) ----
    var L2 = new Float32Array(n);
    for (i = 0; i < n; i++) L2[i] = L[i] * L[i];
    var IL2 = boxIntegral(L2, w, h), IS = boxIntegral(S, w, h);
    var cand = new Uint8Array(n);
    var mean7, meanSq7, std7, mean30, sat7, sat30;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        p = y * w + x;
        mean7 = boxMean(IL, w, h, x, y, 7);
        meanSq7 = boxMean(IL2, w, h, x, y, 7);
        std7 = Math.sqrt(Math.max(0, meanSq7 - mean7 * mean7));
        mean30 = boxMean(IL, w, h, x, y, 30);
        sat7 = boxMean(IS, w, h, x, y, 7);
        sat30 = boxMean(IS, w, h, x, y, 30);
        if (std7 < o.overlayStd &&
            (Math.abs(mean7 - mean30) > o.overlayShift || sat30 - sat7 > o.satDip)) {
          cand[p] = 1;
        }
      }
    }
    cand = erode(dilate(cand, w, h, o.closeRadius), w, h, o.closeRadius);
    var ovComps = components(cand, w, h);
    var maxOverlay = Math.round(n * o.maxOverlayFrac);
    for (ci = 0; ci < ovComps.length; ci++) {
      c = ovComps[ci];
      var odbg = debug ? { x: c.minX, y: c.minY, w: c.maxX - c.minX + 1, h: c.maxY - c.minY + 1, area: c.area } : null;
      if (c.area < minArea || c.area > maxOverlay) { if (odbg) { odbg.reject = 'size'; debug.ov.push(odbg); } continue; }
      if (accepted[c.pixels[0]]) { if (odbg) { odbg.reject = 'covered'; debug.ov.push(odbg); } continue; }
      // Texture-continuity validation across the component boundary.
      var samples = 0, boundaryCount = 0, cosSum = 0, ratioSum = 0;
      var bx, by, bp, inX, inY, outX, outY, ip, op, gi, go;
      for (i = 0; i < c.pixels.length; i++) {
        bp = c.pixels[i];
        bx = bp % w; by = (bp / w) | 0;
        // Boundary pixels only: at least one 4-neighbour outside the component.
        var isBoundary = false;
        if (bx > 0 && !cand[bp - 1]) isBoundary = true;
        else if (bx < w - 1 && !cand[bp + 1]) isBoundary = true;
        else if (by > 0 && !cand[bp - w]) isBoundary = true;
        else if (by < h - 1 && !cand[bp + w]) isBoundary = true;
        if (!isBoundary) continue;
        boundaryCount++;
        // Sample 3px inside (toward the component centroid) and 3px outside.
        var ccx = (c.minX + c.maxX) / 2, ccy = (c.minY + c.maxY) / 2;
        var vx = ccx - bx, vy = ccy - by;
        var vl = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= vl; vy /= vl;
        inX = Math.round(bx + vx * 3); inY = Math.round(by + vy * 3);
        outX = Math.round(bx - vx * 3); outY = Math.round(by - vy * 3);
        if (inX < 1 || inX >= w - 1 || inY < 1 || inY >= h - 1) continue;
        if (outX < 1 || outX >= w - 1 || outY < 1 || outY >= h - 1) continue;
        ip = inY * w + inX; op = outY * w + outX;
        gi = G[ip]; go = G[op];
        if (gi < 0.03 || go < 0.03) continue; // need real texture on both sides
        cosSum += DX[ip] * DX[op] + DY[ip] * DY[op];
        ratioSum += gi / go;
        samples++;
      }
      if (samples < o.contMinSamples || samples / Math.max(1, boundaryCount) < o.contMinValidFrac) { if (odbg) { odbg.reject = 'samples:' + samples + '/' + boundaryCount; debug.ov.push(odbg); } continue; }
      var meanCos = cosSum / samples, meanRatio = ratioSum / samples;
      if (odbg) { odbg.samples = samples; odbg.cos = +meanCos.toFixed(2); odbg.ratio = +meanRatio.toFixed(2); }
      if (meanCos < o.contMinCos) { if (odbg) { odbg.reject = 'cos'; debug.ov.push(odbg); } continue; }
      if (meanRatio < o.contMinRatio || meanRatio > o.contMaxRatio) { if (odbg) { odbg.reject = 'ratio'; debug.ov.push(odbg); } continue; }
      for (i = 0; i < c.pixels.length; i++) accepted[c.pixels[i]] = 1;
      regions.push({
        x: c.minX, y: c.minY, w: c.maxX - c.minX + 1, h: c.maxY - c.minY + 1,
        area: c.area, score: meanCos, kind: 'overlay'
      });
      if (odbg) { odbg.accept = true; debug.ov.push(odbg); }
    }

    // Close + dilate the union mask, then enforce the coverage cap.
    var mask = erode(dilate(accepted, w, h, o.closeRadius), w, h, o.closeRadius);
    var cap = Math.round(n * o.maxCoverage);
    var cov = 0;
    for (i = 0; i < n; i++) if (mask[i]) cov++;
    if (cov > cap) {
      // Keep the highest-scoring regions up to the cap.
      regions.sort(function (a, b) { return b.score - a.score; });
      mask = new Uint8Array(n);
      var keptRegions = [];
      var used = 0;
      for (ci = 0; ci < regions.length; ci++) {
        if (used + regions[ci].area > cap) continue;
        for (y = regions[ci].y; y < regions[ci].y + regions[ci].h; y++)
          for (x = regions[ci].x; x < regions[ci].x + regions[ci].w; x++)
            if (accepted[y * w + x]) mask[y * w + x] = 1;
        used += regions[ci].area;
        keptRegions.push(regions[ci]);
      }
      regions = keptRegions;
      mask = erode(dilate(mask, w, h, o.closeRadius), w, h, o.closeRadius);
    }
    if (o.dilate > 0) mask = dilate(mask, w, h, o.dilate);

    cov = 0;
    for (i = 0; i < n; i++) if (mask[i]) cov++;
    var result = { mask: mask, w: w, h: h, coverage: cov / n, regions: regions, found: regions.length > 0 };
    if (debug) result.debug = debug;
    return result;
  }

  return { detect: detect, DEFAULTS: DEFAULTS };
});
