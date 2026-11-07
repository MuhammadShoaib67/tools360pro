// AI Object Remover worker — MI-GAN inpainting via onnxruntime-web.
// Runs the AI off the main thread so the page never freezes.
importScripts('../vendor/ort.min.js');

ort.env.wasm.wasmPaths = new URL('../vendor/', self.location.href).href;

let session = null;

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
    }
  } catch (err) {
    postMessage({ type: 'error', message: String((err && err.message) || err) });
  }
});
