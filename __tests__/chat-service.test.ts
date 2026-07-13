import { describe, it, expect, vi } from "vitest";
import { createId } from "../features/chat/chat-service";

describe("chat-service", () => {
  it("generates an id with the prefix", () => {
    const id = createId("test");
    expect(id).toMatch(/^test_/);
  });
});