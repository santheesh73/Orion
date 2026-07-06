"use client";

import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChatHeader } from "@/features/chat/components/chat-header";
import { ChatCommandPalette } from "@/features/chat/components/command-palette";
import { ConversationContextMenu } from "@/features/chat/components/context-menu";
import { conversations as seedConversations, initialMessages, quickPrompts } from "@/features/chat/components/chat-data";
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
import type { PromptMessage } from "@/types/orion";

type DialogName = "rename" | "delete" | "export" | "folder" | "info" | "settings" | null;

export function ChatLayout() {
  const router = useRouter();
  const [conversations, setConversations] = useState(seedConversations);
  const [activeId, setActiveId] = useState(seedConversations[0]?.id ?? "");
  const [messages, setMessages] = useState<ChatUiMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ conversation: Conversation; x: number; y: number } | null>(null);
  const { generate, generation, stopGeneration, model, runtime, modelProgress } = useAI();

  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const loading = generation.status === "validating" || generation.status === "streaming" || generation.status === "stopping";
  const modelReady = runtime.loadedModelId === model.id && modelProgress.status === "ready";

  const filteredConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return conversations;
    }
    return conversations.filter((conversation) => {
      return conversation.title.toLowerCase().includes(needle) || conversation.preview.toLowerCase().includes(needle);
    });
  }, [conversations, search]);

  function newChat() {
    const now = new Date();
    const conversation: Conversation = {
      id: `conv-${now.getTime()}`,
      title: "Untitled conversation",
      preview: "Ready for local AI",
      updatedAt: "Now",
      group: "Today",
      messageCount: 0
    };
    setConversations((current) => [conversation, ...current]);
    setActiveId(conversation.id);
    setMessages([]);
    setDraft("");
    setMobileOpen(false);
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setMobileOpen(false);
    setMessages(id === seedConversations[0]?.id ? initialMessages : []);
  }

  function messageHistory(source: ChatUiMessage[]) {
    return source
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map<PromptMessage>((message) => ({ role: message.role as "user" | "assistant", content: message.content }));
  }

  function appendAssistantStream(assistantId: string, token: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              content: `${message.content}${token}`
            }
          : message
      )
    );
  }

  function completeAssistantStream(assistantId: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              content: message.content.trim() || "Generation stopped before Orion produced a response."
            }
          : message
      )
    );
  }

  function showAssistantError(assistantId: string, message: string) {
    setMessages((current) =>
      current.map((item) =>
        item.id === assistantId
          ? {
              ...item,
              role: "error",
              author: "Runtime",
              content: message
            }
          : item
      )
    );
  }

  function runLocalGeneration(content: string, sourceMessages: ChatUiMessage[]) {
    const assistantId = `msg-${Date.now()}-assistant`;
    const assistantMessage: ChatUiMessage = {
      id: assistantId,
      role: "assistant",
      author: "Orion",
      createdAt: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()),
      content: ""
    };
    setMessages((current) => [...current, assistantMessage]);
    generate({
      history: messageHistory(sourceMessages),
      prompt: content,
      onToken: (token) => appendAssistantStream(assistantId, token),
      onDone: () => completeAssistantStream(assistantId),
      onError: (message) => showAssistantError(assistantId, message)
    });
  }

  function sendMessage(overridePrompt?: string) {
    const content = (overridePrompt ?? draft).trim();
    if (!content) {
      return;
    }

    if (!modelReady) {
      toast.error("Please load a model.");
      router.push("/models");
      return;
    }

    const message: ChatUiMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      author: "You",
      createdAt: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()),
      content
    };

    const nextMessages = [...messages, message];
    setMessages(nextMessages);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeId
          ? { ...conversation, preview: content, updatedAt: "Now", messageCount: conversation.messageCount + 1 }
          : conversation
      )
    );
    setDraft("");
    runLocalGeneration(content, nextMessages);
  }

  function regenerateResponse() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser || loading) {
      return;
    }
    let lastAssistantIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "assistant" || messages[index].role === "error") {
        lastAssistantIndex = index;
        break;
      }
    }
    const source = lastAssistantIndex >= 0 ? messages.slice(0, lastAssistantIndex) : messages;
    setMessages(source);
    runLocalGeneration(lastUser.content, source);
  }

  function continueResponse() {
    if (loading) {
      return;
    }
    const hasAssistant = messages.some((message) => message.role === "assistant");
    if (!hasAssistant) {
      toast.info("Start a conversation before continuing a response.");
      return;
    }
    runLocalGeneration("Continue the previous response without repeating it.", messages);
  }

  function renameConversation(title: string) {
    setConversations((current) => current.map((conversation) => (conversation.id === activeId ? { ...conversation, title: title.trim() } : conversation)));
    setDialog(null);
  }

  function deleteConversation() {
    setConversations((current) => current.filter((conversation) => conversation.id !== activeId));
    const next = conversations.find((conversation) => conversation.id !== activeId);
    setActiveId(next?.id ?? "");
    setMessages(next?.id === seedConversations[0]?.id ? initialMessages : []);
    setDialog(null);
  }

  function deleteMessage(id: string) {
    setMessages((current) => current.filter((message) => message.id !== id));
  }

  function toggleConversationPin(id: string) {
    setConversations((current) => current.map((conversation) => (conversation.id === id ? { ...conversation, pinned: !conversation.pinned } : conversation)));
    setContextMenu(null);
  }

  function toggleConversationFavorite(id: string) {
    setConversations((current) => current.map((conversation) => (conversation.id === id ? { ...conversation, favorite: !conversation.favorite } : conversation)));
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

      <motion.section layout className="flex min-w-0 flex-1 flex-col">
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
        <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth scrollbar-subtle">
          <MessageList messages={messages} prompts={quickPrompts} loading={loading} onDeleteMessage={deleteMessage} onSelectPrompt={setDraft} />
        </div>

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
      </motion.section>

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
      <RenameConversationDialog open={dialog === "rename"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "rename" : null)} onRename={renameConversation} />
      <DeleteConversationDialog open={dialog === "delete"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "delete" : null)} onDelete={deleteConversation} />
      <ExportChatDialog open={dialog === "export"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "export" : null)} />
      <NewFolderDialog open={dialog === "folder"} onOpenChange={(open) => setDialog(open ? "folder" : null)} />
      <ConversationInfoDialog open={dialog === "info"} conversation={activeConversation} onOpenChange={(open) => setDialog(open ? "info" : null)} />
      <SettingsShortcutDialog open={dialog === "settings"} onOpenChange={(open) => setDialog(open ? "settings" : null)} />
    </div>
  );
}
