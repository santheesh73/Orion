# Development Guide

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Development Rules

- Keep new logic typed.
- Reuse existing UI primitives and services.
- Put expensive model or document work in workers.
- Do not transmit prompts, documents, or conversation history to external services.
- Keep routes responsive on mobile and desktop.

## Quality Checklist

- Loading states are meaningful.
- Empty states explain the next action.
- Buttons and dialogs are keyboard reachable.
- Unsupported browser APIs degrade with a clear status message.
- Settings and storage operations recover from failures.
