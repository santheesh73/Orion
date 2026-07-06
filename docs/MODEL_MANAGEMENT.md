# Model Management Guide

Orion uses WebLLM-compatible local models. Model assets are downloaded by the browser and cached locally.

## Recommended Demo Steps

1. Open Models.
2. Select a small compatible model for the hardware.
3. Start the download and show progress.
4. Load the model.
5. Open Chat and generate a short response.

## Browser Notes

- WebGPU provides the best experience.
- WASM fallback support depends on the model and browser.
- Storage quota is controlled by the browser.
- Large models may fail on low-memory devices.

## Failure Handling

If model loading fails, try a smaller model, clear runtime caches, reload the app, or switch to a WebGPU-capable browser.
