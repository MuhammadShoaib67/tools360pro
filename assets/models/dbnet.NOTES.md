# dbnet.onnx — text-detection model for the Watermark Remover

- **What:** PaddleOCR PP-OCRv4 mobile text detector (DBNet architecture).
  Finds text regions in a photo; the Watermark Remover uses it only to
  LOCATE candidate watermark text — every region still passes the
  overlay/semi-transparency precision gate in `assets/js/watermark-detect.js`
  before anything is removed.
- **Source:** ONNX export of PaddleOCR `ch_PP-OCRv4_det_infer`, as
  redistributed in the `rapidocr_onnxruntime` 1.4.4 wheel (PyPI) and at
  https://huggingface.co/SWHL/RapidOCR (PP-OCRv4/ch_PP-OCRv4_det_infer.onnx).
- **License:** Apache License, Version 2.0 (PaddleOCR + RapidOCR).
  Copyright (c) 2016 PaddlePaddle Authors. Redistribution with attribution
  is permitted; see https://github.com/PaddlePaddle/PaddleOCR/blob/main/LICENSE
  (verified 2026-11-19). No changes made to the model file.
- **SHA-256:** d2a7720d45a54257208b1e13e36a8479894cb74155a5efe29462512d42f49da9
  (verified against two independent published fingerprints on 2026-11-19).
- **Size:** 4,745,517 bytes (~4.5 MB).
- **Input:** float32 RGB, normalized (ImageNet mean/std), [1, 3, H, W],
  H/W multiples of 32. **Output:** `sigmoid_0.tmp_0`, float32 probability
  map [1, 1, H, W] (same resolution as the input).
- **Used by:** `assets/js/inpaint-worker.js` (`detect` message — lazy load,
  only when the user presses Auto-detect) and `tools/watermark-remover.html`.
