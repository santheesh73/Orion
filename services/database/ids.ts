"use client";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function now() {
  return Date.now();
}
