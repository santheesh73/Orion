# Contributing

Thanks for helping Orion stay private, local, and polished.

## Local Setup

```bash
npm install
npm run dev
```

Before opening a change, run:

```bash
npm run typecheck
npm run lint
npm run build
```

## Principles

- Keep inference local and browser-native.
- Do not add telemetry, analytics, tracking, cloud sync, or remote AI execution.
- Prefer existing services, hooks, repositories, and UI primitives.
- Keep UI accessible by keyboard and readable with reduced motion or high contrast.
- Handle unsupported browser capabilities gracefully.

## Pull Request Checklist

- The change is scoped and documented.
- TypeScript, lint, and production build pass.
- Offline behavior is not degraded.
- User data remains local.
- New UI has clear loading, empty, error, hover, and focus states.
