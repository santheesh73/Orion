import type { ChatUiMessage, Conversation, QuickPrompt } from "@/features/chat/types/chat-ui";

export const conversations: Conversation[] = [];

export const quickPrompts: QuickPrompt[] = [
  { title: "Explain this concept", prompt: "Explain WebGPU inference like I am a product judge.", description: "Turn a technical idea into a crisp answer." },
  { title: "Summarize text", prompt: "Summarize this brief into three decision-ready bullets.", description: "Create a concise private summary." },
  { title: "Write code", prompt: "Draft a typed React component API for a chat sidebar.", description: "Start a useful implementation outline." },
  { title: "Generate ideas", prompt: "Give me five delightful offline AI demo moments.", description: "Brainstorm polished product moments." },
  { title: "Translate", prompt: "Translate this explanation into plain language.", description: "Make complex copy more accessible." },
  { title: "Review document", prompt: "Review this document for clarity, gaps, and risks.", description: "Prepare for local document review." }
];

export const initialMessages: ChatUiMessage[] = [];
