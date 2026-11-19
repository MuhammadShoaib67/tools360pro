// AI Object Remover / Watermark Remover worker — MI-GAN inpainting and
// DBNet text detection via onnxruntime-web. Runs the AI off the main
// thread so the page never freezes.
importScripts('../vendor/ort.min.js');

ort.env.wasm.wasmPaths = new URL('../vendor/', self.location.href).href;

let session = null;
let detSession = null;

// DBNet text detection (PaddleOCR PP-OCRv4, Apache 2.0 — see
// assets/models/dbnet.NOTES.md). Loaded lazily, only when the Watermark
// Remover runs auto-detection. The AI Object Remover never uses it.
async function loadDet() {
  if (!detSession) {
    detSession = await ort.InferenceSession.create(
      new URL('../models/dbnet.onnx', self.location.href).href,
      { executionProviders: ['wasm'] }
    );
  }
}

async function load() {
  if (!session) {
    session = await ort.InferenceSession.create(
      new URL('../models/migan.onnx', self.location.href).href,
      { executionProviders: ['wasm'] }
    );
  }
}

self.addEventListener('message', async function (e) {
  const d = e.data || {};
  try {
    if (d.type === 'load') {
      await load();
      postMessage({ type: 'loaded' });
    } else if (d.type === 'run') {
      await load();
      const feeds = {
        image: new ort.Tensor('uint8', new Uint8Array(d.img), [1, 3, d.h, d.w]),
        mask: new ort.Tensor('uint8', new Uint8Array(d.mask), [1, 1, d.h, d.w])
      };
      const out = await session.run(feeds);
      const res = out.result;
      const buf = res.data.buffer.slice(res.data.byteOffset, res.data.byteOffset + res.data.byteLength);
      postMessage({ type: 'result', data: buf, w: d.w, h: d.h }, [buf]);
    } else if (d.type === 'detect') {
      // DBNet text detection. d.img is HWC uint8 RGB (no alpha). Normalize
      // to CHW float32 with the ImageNet mean/std the model was trained on,
      // run it, and return the probability map (same resolution as input).
      await loadDet();
      const w = d.w, h = d.h, n = w * h;
      const src = new Uint8Array(d.img);
      const img = new Float32Array(3 * n);
      const mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
      for (let c = 0; c < 3; c++) {
        for (let i = 0; i < n; i++) {
          img[c * n + i] = (src[i * 3 + c] / 255 - mean[c]) / std[c];
        }
      }
      const feeds = { x: new ort.Tensor('float32', img, [1, 3, h, w]) };
      const out = await detSession.run(feeds);
      const res = out['sigmoid_0.tmp_0'] || out[Object.keys(out)[0]];
      const buf = res.data.buffer.slice(res.data.byteOffset, res.data.byteOffset + res.data.byteLength);
      postMessage({ type: 'detected', data: buf, w: w, h: h }, [buf]);
    }
  } catch (err) {
    // Detection errors use their own type so the page's inpainting handlers
    // never mistake them for a load/run failure (and vice versa).
    if (d.type === 'detect') postMessage({ type: 'detect-error', message: String((err && err.message) || err) });
    else postMessage({ type: 'error', message: String((err && err.message) || err) });
  }
});
