"use client";

export class TokenStreamMetrics {
  private startedAt = 0;
  private firstTokenAt: number | null = null;
  private tokens = 0;

  start(now = performance.now()) {
    this.startedAt = now;
    this.firstTokenAt = null;
    this.tokens = 0;
  }

  pushToken(content: string, now = performance.now()) {
    if (this.firstTokenAt === null) {
      this.firstTokenAt = now;
    }
    this.tokens += Math.max(1, Math.ceil(content.length / 4));
    const elapsedSeconds = Math.max((now - this.firstTokenAt) / 1000, 0.001);
    return {
      tokenCount: this.tokens,
      tokensPerSecond: this.tokens / elapsedSeconds,
      latencyMs: this.firstTokenAt - this.startedAt,
      firstTokenAt: this.firstTokenAt
    };
  }

  complete(now = performance.now()) {
    const start = this.firstTokenAt ?? this.startedAt;
    const elapsedSeconds = Math.max((now - start) / 1000, 0.001);
    return {
      tokenCount: this.tokens,
      tokensPerSecond: this.tokens / elapsedSeconds,
      latencyMs: this.firstTokenAt === null ? null : this.firstTokenAt - this.startedAt
    };
  }
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) {
    return "Calculating";
  }
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.ceil(seconds % 60);
  return `${minutes}m ${remainder}s`;
}
