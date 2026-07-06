# Installation Guide

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A modern browser
- WebGPU-capable Chromium browser for best local inference performance

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Smoke Test

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

Open the started local URL and visit `/performance`, `/models`, `/chat`, `/documents`, and `/settings`.
