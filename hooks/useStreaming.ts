"use client";

import { useMemo } from "react";
import { TokenStreamMetrics } from "@/services/ai/stream";

export function useStreaming() {
  return useMemo(() => new TokenStreamMetrics(), []);
}
