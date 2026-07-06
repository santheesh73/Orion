declare module "mammoth/mammoth.browser" {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: unknown[] }>;
}

declare module "react-syntax-highlighter" {
  import type { ComponentType, ReactNode } from "react";

  export const Prism: ComponentType<{
    language?: string;
    style?: unknown;
    customStyle?: Record<string, string | number>;
    children?: ReactNode;
  }>;
}

declare module "react-syntax-highlighter/dist/cjs/styles/prism" {
  export const atomDark: unknown;
}

declare module "next-pwa" {
  import type { NextConfig } from "next";

  export default function withPWAInit(options: Record<string, unknown>): (config: NextConfig) => NextConfig;
}
