# Security Policy

## Supported Version

The current hackathon version is `0.1.x`.

## Reporting Issues

Please report security concerns privately to the project maintainers. Include:

- Affected route, service, worker, or storage layer
- Reproduction steps
- Browser and operating system
- Whether local data exposure is possible

## Security Boundary

Orion is designed with no cloud AI inference, no telemetry, no analytics, and no authentication backend. Prompts, documents, settings, history, and model metadata are stored locally in browser-managed storage.

## Safe Handling Expectations

- Do not add remote prompt transmission.
- Do not add tracking scripts.
- Do not weaken the Content Security Policy without a documented reason.
- Sanitize and constrain user-provided files before rendering.
- Prefer worker isolation for expensive parsing and model operations.
