"use client";

import type { MouseEvent } from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/orion-db";
import { ensureChat, addMessage, renameChat, deleteChat, cleanupEmptyChats, duplicateChat } from "@/features/chat/chat-service";
import { ChatHeader } from "@/features/chat/components/chat-header";
import { ChatCommandPalette } from "@/features/chat/components/command-palette";
import { ConversationContextMenu } from "@/features/chat/components/context-menu";
import { quickPrompts } from "@/features/chat/components/chat-data";
import {
  ConversationInfoDialog,
  DeleteConversationDialog,
  ExportChatDialog,
  NewFolderDialog,
  RenameConversationDialog,
  SettingsShortcutDialog
} from "@/features/chat/components/dialogs";
import { MessageList } from "@/features/chat/components/message-list";
import { PromptInput } from "@/features/chat/components/prompt-input";
import { ChatSidebar } from "@/features/chat/components/sidebar";

import type { ChatUiMessage, Conversation } from "@/features/chat/types/chat-ui";
import { useAI } from "@/hooks/useAI";
import { useOrionStore } from "@/store/orion-store";
import { cn } from "@/lib/utils/cn";

type DialogName = "rename" | "delete" | "export" | "folder" | "info" | "settings" | null;

export function ChatLayout() {
  const router = useRouter();
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ conversation: Conversation; x: number; y: number } | null>(null);
  const [actionTarget, setActionTarget] = useState<Conversation | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const displayName = useOrionStore((state) => state.appSettings.personalization.displayName);
  const { generate, generation, stopGeneration, model, runtime, modelProgress } = useAI();

  const rawConversations = useLiveQuery(() => db.conversations.orderBy("updatedAt").reverse().toArray()) || [];
  
  const conversations = useMemo(() => {
    return rawConversations.map(c => ({
      id: c.id,
      title: c.title,
      preview: c.lastMessagePreview || "Ready for local AI",
      updatedAt: new Intl.DateTimeFormat("en", { dateStyle: "short" }).format(new Date(c.updatedAt)),
      group: "Today" as const, 
      messageCount: c.messageCount ?? 0,
      pinned: c.pinned,
      favorite: c.favorite
    })).reverse();
  }, [rawConversations]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    } else if (!activeId && rawConversations.length === 0 && rawConversations !== undefined) {
      ensureChat().then(chat => setActiveId(chat.id));
    }
  }, [conversations, activeId, rawConversations]);

  useEffect(() => {
    if (activeId) {
      cleanupEmptyChats(activeId).catch(console.error);
    }
  }, [activeId]);



  const rawMessages = useLiveQuery(async () => {
    if (!activeId) return [];
    return await db.messages.where("chatId").equals(activeId).sortBy("createdAt");
  }, [activeId]) || [];

  const [activeStreamMessage, setActiveStreamMessage] = useState<ChatUiMessage | null>(null);
  const streamContentRef = useRef("");

  const messages = useMemo(() => {
    const list = rawMessages.map(m => ({
      id: m.id,
      role: m.role === "error" ? "error" : (m.role as "user" | "assistant"),
      author: m.role === "user" ? "You" : "Orion",
      createdAt: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(m.createdAt)),
      content: m.content
    } as ChatUiMessage));
    
    if (activeStreamMessage) {
      list.push(activeStreamMessage);
    }
    return list;
  }, [rawMessages, activeStreamMessage]);

  const matchingChatIdsFromMessages = useLiveQuery(async () => {
    const needle = search.trim().toLowerCase();
    if (!needle) return [];
    const matching = await db.messages
      .filter(m => m.content.toLowerCase().includes(needle))
      .toArray();
    return Array.from(new Set(matching.map(m => m.chatId)));
  }, [search]) || [];

  const filteredConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    
    // Hide empty placeholder conversations from the sidebar completely until they have messages
    const valid = conversations.filter(c => c.messageCount > 0 || (c.title !== "New conversation" && c.title !== "Ready for local AI"));

    if (!needle) return valid;
    return valid.filter((conversation) => {
      return conversation.title.toLowerCase().includes(needle) || 
             conversation.preview.toLowerCase().includes(needle) ||
             matchingChatIdsFromMessages.includes(conversation.id);
    });
  }, [conversations, search, activeId, matchingChatIdsFromMessages]);

  // Synchronize IndexedDB conversations with Zustand store
  useEffect(() => {
    if (rawConversations) {
      useOrionStore.getState().setChats(rawConversations);
    }
  }, [rawConversations]);

  // Synchronize IndexedDB activeChatId with Zustand store
  useEffect(() => {
    useOrionStore.getState().setActiveChatId(activeId || null);
  }, [activeId]);

  // Synchronize IndexedDB messages with Zustand store
  useEffect(() => {
    if (rawMessages) {
      useOrionStore.getState().setMessages(rawMessages);
    }
  }, [rawMessages]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true");

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newChat();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        triggerImport();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (isInput) return;

      if (e.key === "F2") {
        e.preventDefault();
        if (activeId) {
          setEditingChatId(activeId);
        }
        return;
      }

      if (e.key === "Delete") {
        e.preventDefault();
        if (activeConversation) {
          setActionTarget(activeConversation);
          setDialog("delete");
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (activeId) {
          duplicateConversationAction(activeId);
        }
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = filteredConversations.findIndex(c => c.id === activeId);
        let nextIndex = currentIndex;
        if (e.key === "ArrowUp") {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredConversations.length - 1;
        } else {
          nextIndex = currentIndex < filteredConversations.length - 1 ? currentIndex + 1 : 0;
        }
        if (filteredConversations[nextIndex]) {
          selectConversation(filteredConversations[nextIndex].id);
        }
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, activeConversation, filteredConversations, conversations]);

  const loading = generation.status === "validating" || generation.status === "streaming" || generation.status === "stopping";
  const modelReady = runtime.loadedModelId === model.id && modelProgress.status === "ready";

  async function newChat() {
    const chat = await ensureChat();
    setActiveId(chat.id);
    setDraft("");
    setMobileOpen(false);
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setMobileOpen(false);
  }

  function runLocalGeneration(content: string, sourceMessages: ChatUiMessage[], chatId: string) {
    const assistantId = `msg-${Date.now()}-assistant`;
    streamContentRef.current = "";
    
    setActiveStreamMessage({
      id: assistantId,
      role: "assistant",
      author: "Orion",
      createdAt: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()),
      content: ""
    });

    generate({
      history: sourceMessages.filter(m => m.role === "user" || m.role === "assistant").map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      prompt: content,
      onToken: (token) => {
        streamContentRef.current += token;
        setActiveStreamMessage(prev => prev ? { ...prev, content: streamContentRef.current } : null);
      },
      onDone: () => {
        const finalContent = streamContentRef.current;
        addMessage(chatId, "assistant", finalContent.trim() || "Generation stopped before Orion produced a response.").catch(console.error);
        setActiveStreamMessage(null);
      },
      onError: (message) => {
        addMessage(chatId, "error", message).catch(console.error);
        setActiveStreamMessage(null);
      }
    });
  }

  const isSendingRef = useRef(false);

  async function sendMessage(overridePrompt?: string) {
    if (isSendingRef.current) return;
    
    const content = (overridePrompt ?? draft).trim();
    if (!content || !activeId) return;

    if (!modelReady) {
      toast.error("Please load a model.");
      router.push("/models");
      return;
    }

    isSendingRef.current = true;
    try {
      setDraft("");
      await addMessage(activeId, "user", content);

      const nextMessages = [...messages, {
        id: "temp", role: "user", author: "You", content, createdAt: "" 
      } as ChatUiMessage];

      runLocalGeneration(content, nextMessages, activeId);
    } finally {
      isSendingRef.current = false;
    }
  }

  function regenerateResponse() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser || loading || !activeId) return;
    
    let lastAssistantIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "assistant" || messages[index].role === "error") {
        lastAssistantIndex = index;
        break;
      }
    }
    const source = lastAssistantIndex >= 0 ? messages.slice(0, lastAssistantIndex) : messages;
    
    if (lastAssistantIndex >= 0) {
      db.messages.delete(messages[lastAssistantIndex].id).catch(console.error);
    }

    runLocalGeneration(lastUser.content, source, activeId);
  }

  function continueResponse() {
    if (loading || !activeId) return;
    const hasAssistant = messages.some((message) => message.role === "assistant");
    if (!hasAssistant) {
      toast.info("Start a conversation before continuing a response.");
      return;
    }
    runLocalGeneration("Continue the previous response without repeating it.", messages, activeId);
  }

  async function renameConversationAction(title: string) {
    const targetId = actionTarget?.id ?? activeId;
    if (targetId) {
      await renameChat(targetId, title.trim());
      toast.success("Conversation renamed");
    }
    setDialog(null);
    setActionTarget(null);
  }

  async function deleteConversationAction() {
    try {
      const targetId = actionTarget?.id ?? activeId;
      if (targetId) {
        await deleteChat(targetId);
        toast.success("Conversation deleted");
        if (targetId === activeId) {
          const chat = await ensureChat();
          setActiveId(chat.id);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete conversation");
    } finally {
      setDialog(null);
      setActionTarget(null);
    }
  }

  async function duplicateConversationAction(id: string) {
    try {
      const duplicated = await duplicateChat(id);
      setActiveId(duplicated.id);
      toast.success("Conversation duplicated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate conversation");
    }
    setContextMenu(null);
  }

  function downloadText(name: string, content: string, type = "application/json") {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function exportConversationAction(format: "markdown" | "json" | "txt" | "pdf") {
    const target = actionTarget ?? activeConversation;
    if (!target) return;

    // Open window synchronously to avoid popup blockers
    let pdfWindow: Window | null = null;
    if (format === "pdf") {
      pdfWindow = window.open("", "_blank");
      if (!pdfWindow) {
        toast.error("Popup blocked! Please allow popups to export as PDF.");
        return;
      }
    }

    try {
      const fullConv = await db.conversations.get(target.id);
      const modelUsed = fullConv?.modelUsed ?? null;
      const messages = await db.messages.where("chatId").equals(target.id).sortBy("createdAt");
      
      const authorName = (role: string) => {
        switch (role) {
          case "user": return "You";
          case "assistant": return "Orion";
          case "system": return "System";
          default: return role.toUpperCase();
        }
      };

      if (format === "json") {
        const data = {
          title: target.title,
          exportedAt: new Date().toISOString(),
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            createdAt: m.createdAt
          }))
        };
        const content = JSON.stringify(data, null, 2);
        downloadText(`${target.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-export.json`, content, "application/json");
        toast.success("Chat exported as JSON");
      } else if (format === "markdown") {
        const content = `# ${target.title}\n\n*Exported on ${new Date().toLocaleString()}*\n\n${messages.map(m => `**${authorName(m.role)}**:\n${m.content}`).join("\n\n---\n\n")}\n`;
        downloadText(`${target.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-export.md`, content, "text/markdown");
        toast.success("Chat exported as Markdown");
      } else if (format === "txt") {
        const content = `${target.title}\nExported on ${new Date().toLocaleString()}\n${modelUsed ? `Model: ${modelUsed}` : ""}\n\n${messages.map(m => `[${authorName(m.role)}]:\n${m.content}`).join("\n\n----------------------------------------\n\n")}\n`;
        downloadText(`${target.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-export.txt`, content, "text/plain");
        toast.success("Chat exported as TXT");
      } else if (format === "pdf" && pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>${target.title} - Orion Export</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; }
                h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 10px; margin-bottom: 30px; }
                .message { margin-bottom: 24px; padding: 16px; border-radius: 8px; background: #f9f9f9; }
                .role { font-weight: bold; margin-bottom: 8px; color: #555; }
                .content { white-space: pre-wrap; }
                .meta { color: #666; font-size: 0.9em; margin-bottom: 40px; }
              </style>
            </head>
            <body>
              <h1>${target.title}</h1>
              <div class="meta">
                <p>Exported on ${new Date().toLocaleString()}</p>
                ${modelUsed ? `<p>Model: ${modelUsed}</p>` : ""}
              </div>
              ${messages.map(m => `
                <div class="message">
                  <div class="role">${authorName(m.role)}</div>
                  <div class="content">${m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                </div>
              `).join("")}
              <script>
                window.onload = () => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                };
              </script>
            </body>
          </html>
        `);
        pdfWindow.document.close();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to export conversation");
      if (pdfWindow) pdfWindow.close();
    }
    setActionTarget(null);
  }

  function triggerImport() {
    importInputRef.current?.click();
  }

  async function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let imported: { title: string; messages: { role: "user" | "assistant"; content: string }[] };

      if (file.name.endsWith(".json")) {
        const data = JSON.parse(text);
        if (typeof data.title !== "string") {
          throw new Error("Invalid file format: title string is required.");
        }
        const msgs: { role: "user" | "assistant"; content: string }[] = [];
        if (Array.isArray(data.messages)) {
          for (const m of data.messages) {
            if (typeof m.role === "string" && typeof m.content === "string") {
              msgs.push({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content
              });
            }
          }
        }
        imported = { title: data.title, messages: msgs };
      } else {
        imported = parseMarkdownChat(text, file.name);
      }

      const existing = conversations.find(c => c.title === imported.title);
      let finalTitle = imported.title;
      if (existing) {
        finalTitle = `${imported.title} (Imported)`;
      }

      const chat = await ensureChat(finalTitle);
      for (const m of imported.messages) {
        await addMessage(chat.id, m.role, m.content);
      }

      setActiveId(chat.id);
      toast.success(`Imported "${finalTitle}" successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to import chat file.");
    } finally {
      e.target.value = "";
    }
  }

  function parseMarkdownChat(text: string, filename: string) {
    const lines = text.split("\n");
    let title = filename.replace(/\.[^/.]+$/, "");
    if (lines[0] && lines[0].startsWith("# ")) {
      title = lines[0].slice(2).trim();
    }

    const parsedMessages: { role: "user" | "assistant"; content: string }[] = [];
    let currentRole: "user" | "assistant" | null = null;
    let currentContent: string[] = [];

    const flush = () => {
      if (currentRole && currentContent.length > 0) {
        parsedMessages.push({ role: currentRole, content: currentContent.join("\n").trim() });
      }
      currentContent = [];
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const userMatch = line.match(/^\*\*(You|User)\*\*:\s*(.*)$/i);
      const assistantMatch = line.match(/^\*\*(Orion|Assistant)\*\*:\s*(.*)$/i);

      if (userMatch) {
        flush();
        currentRole = "user";
        if (userMatch[2]) currentContent.push(userMatch[2]);
      } else if (assistantMatch) {
        flush();
        currentRole = "assistant";
        if (assistantMatch[2]) currentContent.push(assistantMatch[2]);
      } else {
        if (currentRole) {
          currentContent.push(line);
        }
      }
    }
    flush();

    if (parsedMessages.length === 0) {
      parsedMessages.push({ role: "user", content: text.trim() });
    }

    return { title, messages: parsedMessages };
  }

  async function deleteMessageAction(id: string) {
    await db.messages.delete(id);
  }

  async function toggleConversationPin(id: string) {
    const conv = rawConversations.find(c => c.id === id);
    if (conv) {
      await db.conversations.update(id, { pinned: !conv.pinned, updatedAt: Date.now() });
    }
    setContextMenu(null);
  }

  async function toggleConversationFavorite(id: string) {
    const conv = rawConversations.find(c => c.id === id);
    if (conv) {
      await db.conversations.update(id, { favorite: !conv.favorite, updatedAt: Date.now() });
    }
    setContextMenu(null);
  }

  function openContextMenu(event: MouseEvent<HTMLButtonElement>, conversation: Conversation) {
    event.preventDefault();
    setContextMenu({ conversation, x: event.clientX, y: event.clientY });
  }

  function openContextDialog(name: Exclude<DialogName, null>) {
    if (contextMenu?.conversation) {
      setActionTarget(contextMenu.conversation);
    }
    setContextMenu(null);
    setDialog(name);
  }


  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen overflow-hidden bg-background">
      <ChatSidebar
        conversations={filteredConversations}
        activeId={activeId}
        search={search}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onSearchChange={setSearch}
        onSelectConversation={selectConversation}
        onNewChat={newChat}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onMobileOpenChange={setMobileOpen}
        onContextMenu={openContextMenu}
        editingId={editingChatId}
        onRenameSave={async (id, title) => {
          await renameChat(id, title.trim());
          setEditingChatId(null);
          toast.success("Conversation renamed");
        }}
        onRenameCancel={() => setEditingChatId(null)}
        onStartEdit={(id) => setEditingChatId(id)}
      />

      <m.section layout className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          conversation={activeConversation}
          modelName={model.name}
          backend={runtime.backend}
          contextWindow={model.contextWindow}
          tokensPerSecond={generation.tokensPerSecond}
          status={modelProgress.message}
          onRename={() => {
            if (activeId) setEditingChatId(activeId);
          }}
          onDelete={() => {
            setActionTarget(activeConversation ?? null);
            setDialog("delete");
          }}
          onExport={() => {
            setActionTarget(activeConversation ?? null);
            setDialog("export");
          }}
          onImport={() => triggerImport()}
          onInfo={() => setDialog("info")}
          onOpenCommand={() => setCommandOpen(true)}
          onNewChat={newChat}
        />
        <div className={cn("flex min-h-0 flex-1 flex-col", messages.length === 0 ? "justify-center pb-20" : "")}>
          <div className={cn("w-full scroll-smooth scrollbar-subtle", messages.length === 0 ? "" : "min-h-0 flex-1 overflow-y-auto")}>
            <MessageList messages={messages} prompts={quickPrompts} loading={loading} onDeleteMessage={deleteMessageAction} onSelectPrompt={setDraft} />
          </div>

          <div className={cn("w-full shrink-0 transition-all duration-500 ease-in-out", messages.length === 0 ? "mx-auto max-w-4xl" : "")}>
            {messages.length === 0 && (
              <h1 className="mb-8 text-center text-3xl font-medium tracking-tight text-foreground">
                {displayName ? `How can I help, ${displayName}?` : "How can I help you?"}
              </h1>
            )}
            <PromptInput
              value={draft}
              loading={loading}
              canRegenerate={messages.some((message) => message.role === "user")}
              canContinue={messages.some((message) => message.role === "assistant")}
              canSubmit={modelReady}
              guidance={modelReady ? undefined : "Please load a model."}
              onChange={setDraft}
              onSubmit={() => sendMessage()}
              onClear={() => setDraft("")}
              onStop={stopGeneration}
              onRegenerate={regenerateResponse}
              onContinue={continueResponse}
            />
          </div>
        </div>
      </m.section>

      <ConversationContextMenu
        conversation={contextMenu?.conversation ?? null}
        x={contextMenu?.x ?? 0}
        y={contextMenu?.y ?? 0}
        onClose={() => setContextMenu(null)}
        onRename={() => {
          if (contextMenu?.conversation) {
            setEditingChatId(contextMenu.conversation.id);
          }
          setContextMenu(null);
        }}
        onDelete={() => openContextDialog("delete")}
        onTogglePin={() => {
          if (contextMenu?.conversation) toggleConversationPin(contextMenu.conversation.id);
        }}
        onToggleFavorite={() => {
          if (contextMenu?.conversation) toggleConversationFavorite(contextMenu.conversation.id);
        }}
        onDuplicate={() => {
          if (contextMenu?.conversation) duplicateConversationAction(contextMenu.conversation.id);
        }}
        onExport={() => openContextDialog("export")}
      />
      <ChatCommandPalette
        open={commandOpen}
        conversations={conversations}
        onOpenChange={setCommandOpen}
        onSelectConversation={selectConversation}
        onNewChat={newChat}
        onOpenSettings={() => setDialog("settings")}
      />
      <RenameConversationDialog 
        open={dialog === "rename"} 
        conversation={actionTarget ?? activeConversation} 
        onOpenChange={(open) => {
          setDialog(open ? "rename" : null);
          if (!open) setActionTarget(null);
        }} 
        onRename={renameConversationAction} 
      />
      <DeleteConversationDialog 
        open={dialog === "delete"} 
        conversation={actionTarget ?? activeConversation} 
        onOpenChange={(open) => {
          setDialog(open ? "delete" : null);
          if (!open) setActionTarget(null);
        }} 
        onDelete={deleteConversationAction} 
      />
      <ExportChatDialog 
        open={dialog === "export"} 
        conversation={actionTarget ?? activeConversation} 
        onOpenChange={(open) => {
          setDialog(open ? "export" : null);
          if (!open) setActionTarget(null);
        }} 
        onExport={exportConversationAction}
      />
      <NewFolderDialog open={dialog === "folder"} onOpenChange={(open) => setDialog(open ? "folder" : null)} />
      <ConversationInfoDialog open={dialog === "info"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "info" : null)} />
      <SettingsShortcutDialog open={dialog === "settings"} onOpenChange={(open) => setDialog(open ? "settings" : null)} />
      <input
        type="file"
        ref={importInputRef}
        className="hidden"
        accept=".json,.md,.markdown"
        onChange={handleImportFileChange}
      />
    </div>
  );
}

export default ChatLayout;
