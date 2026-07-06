# FAQ

## Does Orion send prompts to a cloud AI provider?

No. Orion is designed around local WebLLM inference inside the browser.

## Does Orion require an account?

No. Phase 10 does not add authentication, cloud sync, telemetry, or analytics.

## Can Orion work offline?

Yes, after the app shell and selected model assets are available in browser storage.

## Where are documents stored?

Documents, chunks, and metadata are stored locally in IndexedDB.

## Which browsers work best?

Chromium-based browsers with WebGPU support provide the best local model performance. Firefox and Safari should degrade gracefully where APIs are unavailable.

## Is Orion production-ready?

The app passes strict TypeScript, lint, and production build checks. Browser model performance still depends on device hardware, model size, storage quota, and WebGPU support.
