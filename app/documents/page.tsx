import type { Metadata } from "next";
import { DocumentPanel } from "@/components/documents/document-panel";

export const metadata: Metadata = {
  title: "Documents - Orion",
  description: "Local document intelligence for private browser-native search, preview, and WebLLM chat."
};

export default function DocumentsPage() {
  return <DocumentPanel />;
}
