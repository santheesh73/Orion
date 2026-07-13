"use client";

import type { MouseEvent } from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/orion-db";
import { ensureChat, addMessage, renameChat, deleteChat, cleanupEmptyChats } from "@/features/chat/chat-service";
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

  const { generate, generation, stopGeneration, model, runtime, modelProgress } = useAI();

  const rawConversations = useLiveQuery(() => db.conversations.filter(c => !c.deleted).sortBy("updatedAt")) || [];
  
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

  const filteredConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    
    // Hide empty placeholder conversations unless it's currently active
    const valid = conversations.filter(c => c.id === activeId || c.messageCount > 0 || c.title !== "New conversation");

    if (!needle) return valid;
    return valid.filter((conversation) => {
      return conversation.title.toLowerCase().includes(needle) || conversation.preview.toLowerCase().includes(needle);
    });
  }, [conversations, search, activeId]);

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
    if (activeId) {
      await renameChat(activeId, title.trim());
    }
    setDialog(null);
  }

  async function deleteConversationAction() {
    if (activeId) {
      await deleteChat(activeId);
      setActiveId("");
    }
    setDialog(null);
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
      setActiveId(contextMenu.conversation.id);
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
      />

      <m.section layout className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          conversation={activeConversation}
          modelName={model.name}
          backend={runtime.backend}
          contextWindow={model.contextWindow}
          tokensPerSecond={generation.tokensPerSecond}
          status={modelProgress.message}
          onRename={() => setDialog("rename")}
          onDelete={() => setDialog("delete")}
          onExport={() => setDialog("export")}
          onInfo={() => setDialog("info")}
          onOpenCommand={() => setCommandOpen(true)}
          onNewChat={newChat}
        />
        <div className={cn("flex min-h-0 flex-1 flex-col", messages.length === 0 ? "justify-center pb-20" : "")}>
          <div className={cn("w-full scroll-smooth scrollbar-subtle", messages.length === 0 ? "" : "min-h-0 flex-1 overflow-y-auto")}>
            <MessageList messages={messages} prompts={quickPrompts} loading={loading} onDeleteMessage={deleteMessageAction} onSelectPrompt={setDraft} />
          </div>

          <div className={cn("w-full shrink-0 transition-all duration-500 ease-in-out", messages.length === 0 ? "mx-auto max-w-4xl" : "")}>
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
        onRename={() => openContextDialog("rename")}
        onDelete={() => openContextDialog("delete")}
        onTogglePin={() => {
          if (contextMenu?.conversation) toggleConversationPin(contextMenu.conversation.id);
        }}
        onToggleFavorite={() => {
          if (contextMenu?.conversation) toggleConversationFavorite(contextMenu.conversation.id);
        }}
      />
      <ChatCommandPalette
        open={commandOpen}
        conversations={conversations}
        onOpenChange={setCommandOpen}
        onSelectConversation={selectConversation}
        onNewChat={newChat}
        onOpenSettings={() => setDialog("settings")}
      />
      <RenameConversationDialog open={dialog === "rename"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "rename" : null)} onRename={renameConversationAction} />
      <DeleteConversationDialog open={dialog === "delete"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "delete" : null)} onDelete={deleteConversationAction} />
      <ExportChatDialog open={dialog === "export"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "export" : null)} />
      <NewFolderDialog open={dialog === "folder"} onOpenChange={(open) => setDialog(open ? "folder" : null)} />
      <ConversationInfoDialog open={dialog === "info"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "info" : null)} />
      <SettingsShortcutDialog open={dialog === "settings"} onOpenChange={(open) => setDialog(open ? "settings" : null)} />
    </div>
  );
}
