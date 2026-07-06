# Hackathon Submission

## Project Description

Orion is a desktop-grade private AI assistant that runs entirely in the browser. It combines local LLM inference, document intelligence, PWA installation, offline support, and browser-native persistence without cloud AI dependencies.

## Problem

AI assistants are powerful, but many require users to send prompts and documents to remote inference systems. That creates privacy, connectivity, and trust barriers.

## Solution

Orion keeps inference, documents, history, settings, and cache state on the device using WebLLM, WebGPU, Web Workers, IndexedDB, and Service Workers.

## Innovation Highlights

- Local LLM runtime in a browser worker
- Offline-first PWA experience
- Local document intelligence with IndexedDB persistence
- Browser capability and performance dashboards
- Explicit zero-cloud privacy boundary

## Architecture Summary

React routes call services and hooks. Heavy AI and document work moves to workers. IndexedDB stores durable local data. The service worker caches app routes and static assets. No backend inference path exists.

## Judge Talking Points

- Privacy is a product architecture, not a slogan.
- Offline AI is possible in a polished browser app.
- The browser is the deployment platform, storage engine, runtime, and installation target.
- Orion handles real product surfaces: chat, documents, models, settings, PWA, performance, and privacy.

## Demo Script

1. Landing page: state the promise.
2. Install PWA: show native app feel.
3. Models: explain local model download.
4. Chat: generate locally.
5. Documents: upload and inspect a file.
6. Document chat: ask about local content.
7. Settings: show storage, privacy, accessibility, and PWA controls.
8. Offline: disconnect and continue.
9. Performance: show cache, storage, memory, FPS, and browser capabilities.
10. Close with: Private AI. Zero Cloud. Infinite Possibilities.

## Future Roadmap

- More model families and quantization guidance
- Richer document retrieval ranking
- Optional local export bundles
- Automated browser testing matrix
- Desktop packaging experiments while preserving the browser-native core
