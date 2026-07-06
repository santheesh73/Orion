# Offline Usage Guide

## What Works Offline

- App shell navigation after caching
- Chat history stored in IndexedDB
- Documents and chunks stored in IndexedDB
- Settings, theme, storage, privacy, and PWA controls
- Downloaded WebLLM model assets managed by browser storage

## Setup

1. Open Orion online.
2. Visit Settings -> PWA and prepare offline mode.
3. Download a local model from Models.
4. Open Chat and verify the model can respond.
5. Disconnect the network and continue from cached routes.

## Recovery

If a cache is stale or corrupted, open Settings -> PWA and use Reset PWA. This clears runtime caches and re-registers the app shell without deleting IndexedDB data.
