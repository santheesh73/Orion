# Deployment Guide

Orion is a static-friendly Next.js app with browser-only local AI execution. Deploy it over HTTPS for full PWA behavior outside `localhost`.

## Build

```bash
npm run build
npm run start
```

## PWA Notes

- Service workers require HTTPS or `localhost`.
- The manifest is served from `/manifest.json`.
- The service worker is served from `/sw.js`.
- The offline page is available at `/offline`.

## Security Headers

Security headers are configured in `next.config.ts`, including CSP, referrer policy, permissions policy, and frame protections.
