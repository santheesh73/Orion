import type { Route } from "next";

export const siteConfig = {
  name: "Orion",
  tagline: "The Private AI That Lives On Your Device",
  description:
    "A premium, offline-first AI assistant that runs entirely in the browser using WebLLM, WebGPU, Web Workers, and local storage.",
  url: "https://orion.local",
  githubUrl: "https://github.com/orion-ai/orion",
  docsUrl: "/about#documentation" as Route,
  license: "MIT",
  hackathon: "OSDHack 2026"
};

export const marketingNav = [
  { href: "/#features" as Route, label: "Features" },
  { href: "/#technology" as Route, label: "Technology" },
  { href: "/#why-orion" as Route, label: "Why Orion" },
  { href: siteConfig.docsUrl, label: "Documentation" }
];
