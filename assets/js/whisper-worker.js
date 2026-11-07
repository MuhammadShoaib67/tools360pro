// AI Transcriber worker — Whisper (Xenova/whisper-tiny) via @huggingface/transformers.
// Runs entirely on the visitor's device; the audio never leaves the browser.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';

env.allowLocalModels = false;

let transcriber = null;

async function load() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      dtype: 'q8',
      progress_callback: function (p) {
        if (p && p.status === 'progress' && typeof p.progress === 'number') {
          postMessage({ type: 'progress', progress: p.progress });
        }
      }
    });
  }
}

self.addEventListener('message', async function (e) {
  const data = e.data || {};
  if (data.type === 'load') {
    try { await load(); postMessage({ type: 'loaded' }); }
    catch (err) { postMessage({ type: 'error', message: String((err && err.message) || err) }); }
    return;
  }
  if (data.type !== 'transcribe') return;
  try {
    await load();
    postMessage({ type: 'status', text: 'Transcribing… this can take a while for long recordings' });
    const opts = { task: 'transcribe', chunk_length_s: 30, stride_length_s: 5, return_timestamps: true };
    if (data.language && data.language !== 'auto') opts.language = data.language;
    const out = await transcriber(data.audio, opts);
    postMessage({
      type: 'result',
      text: (out && out.text ? out.text : '').trim(),
      chunks: (out && out.chunks) ? out.chunks.map(function (c) {
        return { start: c.timestamp[0], end: c.timestamp[1], text: c.text };
      }) : []
    });
  } catch (err) {
    postMessage({ type: 'error', message: String((err && err.message) || err) });
  }
});
